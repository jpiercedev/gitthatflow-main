import { chromium, Browser, Page } from 'playwright'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from './supabase'

export interface ScreenshotOptions {
  websiteUrl: string
  sessionId?: string
  viewports?: Array<{
    name: string
    width: number
    height: number
  }>
  pages?: string[]
  maxPages?: number
}

export interface ScreenshotResult {
  sessionId: string
  screenshots: Array<{
    id: string
    filename: string
    viewport: string
    url: string
    title: string
    base64Data?: string
    downloadUrl?: string
  }>
  metadata: {
    totalScreenshots: number
    captureTime: number
    websiteUrl: string
  }
}

export class ScreenshotService {
  private browser: Browser | null = null
  private readonly defaultViewports = [
    { name: 'desktop', width: 1366, height: 768 },
    { name: 'mobile', width: 375, height: 812 }
  ]

  async initialize(): Promise<void> {
    if (!this.browser) {
      this.browser = await chromium.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // For production environments
      })
    }
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }

  async captureWebsiteScreenshots(options: ScreenshotOptions): Promise<ScreenshotResult> {
    const startTime = Date.now()
    const sessionId = options.sessionId || uuidv4()
    const viewports = options.viewports || this.defaultViewports
    const maxPages = options.maxPages || 5
    
    await this.initialize()
    
    if (!this.browser) {
      throw new Error('Failed to initialize browser')
    }

    const screenshots: ScreenshotResult['screenshots'] = []
    
    try {
      // Get pages to screenshot
      const pagesToCapture = await this.getPageUrls(options.websiteUrl, options.pages, maxPages)
      
      for (const viewport of viewports) {
        const context = await this.browser.newContext({
          viewport: { width: viewport.width, height: viewport.height },
          deviceScaleFactor: 2, // High DPI for crisp screenshots
          userAgent: viewport.name === 'mobile'
            ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
            : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        })

        const page = await context.newPage()

        for (const pageUrl of pagesToCapture) {
          try {
            await page.goto(pageUrl, { waitUntil: 'networkidle', timeout: 15000 })
            
            // Get page title for filename
            const title = await page.title()
            const cleanTitle = this.cleanFilename(title || 'page')
            const timestamp = new Date().toISOString().split('T')[0]
            const filename = `${timestamp}-${cleanTitle}-${viewport.name}-${sessionId}.png`
            
            // Take screenshot
            const screenshotBuffer = await page.screenshot({
              fullPage: true,
              type: 'png',
              animations: 'disabled'
            })

            // Convert to base64 for direct download
            const base64Data = screenshotBuffer.toString('base64')

            screenshots.push({
              id: uuidv4(),
              filename,
              viewport: viewport.name,
              url: pageUrl,
              title: title || 'Untitled Page',
              base64Data
            })

            // Small delay between screenshots
            await page.waitForTimeout(1000)
            
          } catch (error) {
            console.warn(`Failed to capture screenshot for ${pageUrl}:`, error)
          }
        }

        await context.close()
      }

      const captureTime = Date.now() - startTime

      // Store screenshot metadata in database (optional - just for analytics)
      await this.storeScreenshotMetadata(sessionId, options.websiteUrl, screenshots.length, captureTime)

      return {
        sessionId,
        screenshots,
        metadata: {
          totalScreenshots: screenshots.length,
          captureTime,
          websiteUrl: options.websiteUrl
        }
      }

    } catch (error) {
      console.error('Screenshot capture failed:', error)
      throw new Error(`Failed to capture screenshots: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async getPageUrls(baseUrl: string, customPages?: string[], maxPages: number = 5): Promise<string[]> {
    if (customPages && customPages.length > 0) {
      return customPages.slice(0, maxPages)
    }

    // Get pages from existing website analysis if available
    try {
      const { data: existingProject } = await supabase
        .from('website_projects')
        .select('flow_data')
        .eq('website_url', baseUrl)
        .single()

      if (existingProject?.flow_data?.pages) {
        const pages = existingProject.flow_data.pages
          .slice(0, maxPages)
          .map((page: any) => page.url)
        
        return pages.length > 0 ? pages : [baseUrl]
      }
    } catch (error) {
      console.warn('Could not fetch existing website analysis:', error)
    }

    // Fallback to just the base URL
    return [baseUrl]
  }

  private async storeScreenshotMetadata(
    sessionId: string,
    websiteUrl: string,
    totalScreenshots: number,
    captureTime: number
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('website_screenshots')
        .insert({
          session_id: sessionId,
          website_url: websiteUrl,
          screenshots_data: { count: totalScreenshots }, // Just store count, not the actual data
          capture_time: captureTime,
          total_screenshots: totalScreenshots
        })

      if (error) {
        console.warn('Failed to store screenshot metadata:', error)
      }
    } catch (error) {
      console.warn('Database error storing screenshot metadata:', error)
    }
  }

  private cleanFilename(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .substring(0, 50) // Limit length
  }
}

// Singleton instance for reuse
let screenshotService: ScreenshotService | null = null

export async function getScreenshotService(): Promise<ScreenshotService> {
  if (!screenshotService) {
    screenshotService = new ScreenshotService()
  }
  return screenshotService
}

export async function cleanupScreenshotService(): Promise<void> {
  if (screenshotService) {
    await screenshotService.cleanup()
    screenshotService = null
  }
}
