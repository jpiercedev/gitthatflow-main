import { Octokit } from '@octokit/rest'

export interface GitHubFile {
  name: string
  path: string
  type: 'file' | 'dir'
  content?: string
  sha: string
}

export interface RepoInfo {
  owner: string
  repo: string
  branch?: string
}

interface RateLimitInfo {
  limit: number
  remaining: number
  reset: number
  used: number
}

export class GitHubService {
  private octokit: Octokit
  private rateLimitInfo: RateLimitInfo | null = null

  constructor(token?: string) {
    this.octokit = new Octokit({
      auth: token || process.env.GITHUB_TOKEN,
    })
  }

  /**
   * Check current rate limit status
   */
  async checkRateLimit(): Promise<RateLimitInfo> {
    try {
      const response = await this.octokit.rest.rateLimit.get()
      this.rateLimitInfo = response.data.rate
      return this.rateLimitInfo
    } catch (error) {
      console.warn('Failed to check rate limit:', error)
      return { limit: 60, remaining: 0, reset: Date.now() + 3600000, used: 60 }
    }
  }

  /**
   * Wait for rate limit reset if needed
   */
  private async waitForRateLimit(): Promise<void> {
    if (!this.rateLimitInfo || this.rateLimitInfo.remaining > 5) {
      return
    }

    const resetTime = this.rateLimitInfo.reset * 1000
    const waitTime = resetTime - Date.now()

    if (waitTime > 0) {
      console.log(`Rate limit exceeded. Waiting ${Math.ceil(waitTime / 1000)} seconds...`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }

  /**
   * Make API request with rate limiting protection
   */
  private async makeRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    // Check rate limit before making request
    await this.checkRateLimit()
    await this.waitForRateLimit()

    try {
      const result = await requestFn()
      // Log remaining requests periodically
      if (this.rateLimitInfo && this.rateLimitInfo.remaining % 100 === 0) {
        console.log(`GitHub API requests remaining: ${this.rateLimitInfo.remaining}`)
      }
      return result
    } catch (error: unknown) {
      // Handle rate limit errors
      if ((error as { status?: number; message?: string }).status === 403 && (error as { message?: string }).message?.includes('rate limit')) {
        console.log('Rate limit hit, checking status and retrying...')
        await this.checkRateLimit()
        await this.waitForRateLimit()
        return await requestFn()
      }
      throw error
    }
  }

  /**
   * Parse GitHub URL to extract owner and repo
   */
  parseRepoUrl(url: string): RepoInfo {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/)
    if (!match) {
      throw new Error('Invalid GitHub URL')
    }
    
    return {
      owner: match[1],
      repo: match[2].replace(/\.git$/, ''),
      branch: 'main' // Default to main, will be updated if needed
    }
  }

  /**
   * Get repository contents using smart targeting (much more efficient)
   */
  async getRepoContentsEfficient(
    owner: string,
    repo: string,
    branch: string = 'main'
  ): Promise<GitHubFile[]> {
    const files: GitHubFile[] = []

    // Define target paths that are likely to contain routing
    const targetPaths = [
      'app',           // Next.js App Router
      'pages',         // Next.js Pages Router
      'src/app',       // Next.js App Router in src
      'src/pages',     // Next.js Pages Router in src
      'src/components', // React components
      'components',    // React components
      'src',           // General src directory
      'routes',        // Generic routes
      'router',        // Router files
    ]

    // Check each target path
    for (const targetPath of targetPaths) {
      try {
        const pathFiles = await this.getDirectoryContents(owner, repo, targetPath, branch, 3) // Max 3 levels deep
        files.push(...pathFiles)
      } catch {
        // Path doesn't exist, continue to next
        console.log(`Path ${targetPath} not found, skipping...`)
      }
    }

    // Also get root level files for framework detection
    try {
      const rootFiles = await this.getDirectoryContents(owner, repo, '', branch, 1) // Only root level
      files.push(...rootFiles.filter(f => f.type === 'file'))
    } catch (error) {
      console.warn('Could not fetch root files:', error)
    }

    return files
  }

  /**
   * Get directory contents with limited depth (replaces the recursive method)
   */
  private async getDirectoryContents(
    owner: string,
    repo: string,
    path: string,
    branch: string,
    maxDepth: number,
    currentDepth: number = 0
  ): Promise<GitHubFile[]> {
    return this.makeRequest(async () => {
      try {
        const response = await this.octokit.rest.repos.getContent({
          owner,
          repo,
          path,
          ref: branch,
        })

        const contents = Array.isArray(response.data) ? response.data : [response.data]
        const files: GitHubFile[] = []

        for (const item of contents) {
          if (item.type === 'file') {
            // Only include relevant file types
            if (this.isRelevantFile(item.name)) {
              files.push({
                name: item.name,
                path: item.path,
                type: 'file',
                sha: item.sha,
              })
            }
          } else if (item.type === 'dir') {
            files.push({
              name: item.name,
              path: item.path,
              type: 'dir',
              sha: item.sha,
            })

            // Recursively get directory contents with depth limiting
            if (currentDepth < maxDepth) {
              const subFiles = await this.getDirectoryContents(
                owner,
                repo,
                item.path,
                branch,
                maxDepth,
                currentDepth + 1
              )
              files.push(...subFiles)
            }
          }
        }

        return files
      } catch (error: unknown) {
        if ((error as { status?: number }).status === 404) {
          throw new Error(`Path not found: ${path}`)
        }
        throw error
      }
    })
  }

  /**
   * Check if a file is relevant for routing analysis
   */
  private isRelevantFile(filename: string): boolean {
    const relevantExtensions = ['.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte']
    const relevantFiles = ['package.json', 'next.config.js', 'next.config.ts', 'app.js', 'app.ts']

    return relevantExtensions.some(ext => filename.endsWith(ext)) ||
           relevantFiles.includes(filename)
  }

  /**
   * Use GitHub Search API to find route files efficiently (uses only 1-3 API calls!)
   */
  async searchRouteFiles(owner: string, repo: string): Promise<GitHubFile[]> {
    const files: GitHubFile[] = []

    // Search queries for different routing patterns
    const searchQueries = [
      `repo:${owner}/${repo} filename:page.tsx OR filename:page.ts OR filename:page.jsx OR filename:page.js`,
      `repo:${owner}/${repo} path:pages/ extension:tsx OR extension:ts OR extension:jsx OR extension:js`,
      `repo:${owner}/${repo} path:app/ extension:tsx OR extension:ts OR extension:jsx OR extension:js`,
      `repo:${owner}/${repo} filename:route.tsx OR filename:route.ts OR filename:route.jsx OR filename:route.js`,
      `repo:${owner}/${repo} "Route" OR "Router" extension:tsx OR extension:ts OR extension:jsx OR extension:js`
    ]

    for (const query of searchQueries) {
      try {
        const searchResult = await this.makeRequest(async () => {
          return await this.octokit.rest.search.code({ q: query, per_page: 50 })
        })

        for (const item of searchResult.data.items) {
          files.push({
            name: item.name,
            path: item.path,
            type: 'file',
            sha: item.sha,
          })
        }
      } catch (error) {
        console.warn(`Search query failed: ${query}`, error)
      }
    }

    // Remove duplicates
    const uniqueFiles = files.filter((file, index, self) =>
      index === self.findIndex(f => f.path === file.path)
    )

    return uniqueFiles
  }

  /**
   * Legacy method - kept for backward compatibility but now uses efficient approach
   */
  async getRepoContents(
    owner: string,
    repo: string,
    branch: string = 'main'
  ): Promise<GitHubFile[]> {
    // Try search API first (much more efficient)
    try {
      console.log('🔍 Using GitHub Search API for efficient analysis...')
      const searchFiles = await this.searchRouteFiles(owner, repo)

      if (searchFiles.length > 0) {
        console.log(`✅ Found ${searchFiles.length} potential route files via search`)
        return searchFiles
      }
    } catch (error) {
      console.warn('Search API failed, falling back to directory traversal:', error)
    }

    // Fallback to efficient directory traversal
    console.log('📁 Using targeted directory traversal...')
    return this.getRepoContentsEfficient(owner, repo, branch)
  }

  /**
   * Get file content
   */
  async getFileContent(
    owner: string,
    repo: string,
    path: string,
    branch: string = 'main'
  ): Promise<string> {
    return this.makeRequest(async () => {
      try {
        const response = await this.octokit.rest.repos.getContent({
          owner,
          repo,
          path,
          ref: branch,
        })

        if (Array.isArray(response.data) || response.data.type !== 'file') {
          throw new Error('Path is not a file')
        }

        return Buffer.from(response.data.content, 'base64').toString('utf-8')
      } catch (error: unknown) {
        if ((error as { status?: number }).status === 404 && branch === 'main') {
          return this.getFileContent(owner, repo, path, 'master')
        }
        throw error
      }
    })
  }

  /**
   * Check if repository exists and is accessible
   */
  async validateRepo(owner: string, repo: string): Promise<boolean> {
    return this.makeRequest(async () => {
      try {
        await this.octokit.rest.repos.get({ owner, repo })
        return true
      } catch {
        return false
      }
    })
  }

  /**
   * Get repository information
   */
  async getRepoInfo(owner: string, repo: string) {
    return this.makeRequest(async () => {
      const response = await this.octokit.rest.repos.get({ owner, repo })
      return {
        name: response.data.name,
        fullName: response.data.full_name,
        description: response.data.description,
        language: response.data.language,
        defaultBranch: response.data.default_branch,
        isPrivate: response.data.private,
      }
    })
  }
}
