import * as cheerio from 'cheerio'
import { WebsitePageData, WebsiteFlowData } from './supabase'

export interface CrawlOptions {
  maxPages?: number
  maxDepth?: number
  respectRobots?: boolean
  delay?: number
  timeout?: number
  userAgent?: string
}

export class WebsiteCrawler {
  private baseUrl: string
  private visitedUrls = new Set<string>()
  private pages: WebsitePageData[] = []
  private options: Required<CrawlOptions>

  constructor(baseUrl: string, options: CrawlOptions = {}) {
    this.baseUrl = this.normalizeUrl(baseUrl)
    this.options = {
      maxPages: options.maxPages || 30,
      maxDepth: options.maxDepth || 3,
      respectRobots: options.respectRobots ?? true,
      delay: options.delay || 1000,
      timeout: options.timeout || 10000,
      userAgent: options.userAgent || 'GitThatFlow Website Analyzer 1.0'
    }
  }

  async crawl(): Promise<WebsiteFlowData> {
    const startTime = Date.now()
    
    try {
      // Start crawling from the base URL
      await this.crawlPage(this.baseUrl, 0, true)
      
      // Generate connections between pages
      const connections = this.generateConnections()
      
      const crawlTime = Date.now() - startTime
      
      return {
        pages: this.pages,
        connections,
        metadata: {
          baseUrl: this.baseUrl,
          totalPages: this.pages.length,
          maxDepth: Math.max(...this.pages.map(p => p.depth), 0),
          crawlTime
        }
      }
    } catch (error) {
      console.error('Crawling failed:', error)
      throw new Error(`Failed to crawl website: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async crawlPage(url: string, depth: number, isEntryPoint = false): Promise<void> {
    // Check limits
    if (this.pages.length >= this.options.maxPages) return
    if (depth > this.options.maxDepth) return
    if (this.visitedUrls.has(url)) return

    // Mark as visited
    this.visitedUrls.add(url)

    try {
      // Add delay to be respectful
      if (this.pages.length > 0) {
        await this.delay(this.options.delay)
      }

      // Fetch the page
      const response = await fetch(url, {
        headers: {
          'User-Agent': this.options.userAgent,
        },
        signal: AbortSignal.timeout(this.options.timeout)
      })

      if (!response.ok) {
        console.warn(`Failed to fetch ${url}: ${response.status}`)
        return
      }

      const contentType = response.headers.get('content-type') || ''
      if (!contentType.includes('text/html')) {
        console.warn(`Skipping non-HTML content: ${url}`)
        return
      }

      const html = await response.text()
      const $ = cheerio.load(html)

      // Extract page information
      const title = $('title').text().trim() || this.getPathFromUrl(url)
      const links = this.extractLinks($, url)

      // Create page data
      const pageData: WebsitePageData = {
        id: this.generatePageId(url),
        url,
        title,
        path: this.getPathFromUrl(url),
        links,
        isEntryPoint,
        depth
      }

      this.pages.push(pageData)

      // Crawl linked pages (breadth-first approach)
      const internalLinks = links.filter(link => this.isInternalLink(link))
      for (const link of internalLinks.slice(0, 5)) { // Limit links per page
        if (this.pages.length < this.options.maxPages) {
          await this.crawlPage(link, depth + 1)
        }
      }

    } catch (error) {
      console.warn(`Error crawling ${url}:`, error)
    }
  }

  private extractLinks($: cheerio.CheerioAPI, currentUrl: string): string[] {
    const links: string[] = []
    const seenLinks = new Set<string>()

    // Extract navigation links
    $('a[href]').each((_, element) => {
      const href = $(element).attr('href')
      if (href) {
        const absoluteUrl = this.resolveUrl(href, currentUrl)
        if (absoluteUrl && !seenLinks.has(absoluteUrl)) {
          seenLinks.add(absoluteUrl)
          links.push(absoluteUrl)
        }
      }
    })

    // Extract form actions
    $('form[action]').each((_, element) => {
      const action = $(element).attr('action')
      if (action) {
        const absoluteUrl = this.resolveUrl(action, currentUrl)
        if (absoluteUrl && !seenLinks.has(absoluteUrl)) {
          seenLinks.add(absoluteUrl)
          links.push(absoluteUrl)
        }
      }
    })

    return links
  }

  private generateConnections() {
    const connections: Array<{
      source: string
      target: string
      type: 'navigation' | 'form' | 'button' | 'link'
    }> = []

    for (const page of this.pages) {
      for (const link of page.links) {
        const targetPage = this.pages.find(p => p.url === link)
        if (targetPage) {
          connections.push({
            source: page.id,
            target: targetPage.id,
            type: 'navigation'
          })
        }
      }
    }

    return connections
  }

  private normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url)
      return `${urlObj.protocol}//${urlObj.host}`
    } catch {
      throw new Error('Invalid URL provided')
    }
  }

  private resolveUrl(href: string, baseUrl: string): string | null {
    try {
      const url = new URL(href, baseUrl)
      return url.href
    } catch {
      return null
    }
  }

  private isInternalLink(url: string): boolean {
    try {
      const urlObj = new URL(url)
      const baseUrlObj = new URL(this.baseUrl)
      return urlObj.host === baseUrlObj.host
    } catch {
      return false
    }
  }

  private getPathFromUrl(url: string): string {
    try {
      const urlObj = new URL(url)
      return urlObj.pathname || '/'
    } catch {
      return '/'
    }
  }

  private generatePageId(url: string): string {
    const path = this.getPathFromUrl(url)
    return path.replace(/[^a-zA-Z0-9]/g, '_').replace(/^_+|_+$/g, '') || 'home'
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export async function crawlWebsite(url: string, options?: CrawlOptions): Promise<WebsiteFlowData> {
  const crawler = new WebsiteCrawler(url, options)
  return await crawler.crawl()
}
