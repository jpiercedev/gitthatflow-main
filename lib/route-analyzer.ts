// Removed Babel AST parsing for now to avoid build issues
// Can be re-added later with proper TypeScript configuration
import { GitHubService, GitHubFile } from './github'
import { RouteData } from './supabase'

export interface AnalysisResult {
  routes: RouteData[]
  framework: 'nextjs-app' | 'nextjs-pages' | 'react-router' | 'unknown'
  totalFiles: number
  routeFiles: number
}

export class RouteAnalyzer {
  private githubService: GitHubService

  constructor(githubToken?: string) {
    this.githubService = new GitHubService(githubToken)
  }

  /**
   * Analyze a GitHub repository for routing structure
   */
  async analyzeRepository(repoUrl: string): Promise<AnalysisResult> {
    const repoInfo = this.githubService.parseRepoUrl(repoUrl)

    // Validate repository exists
    const isValid = await this.githubService.validateRepo(repoInfo.owner, repoInfo.repo)
    if (!isValid) {
      throw new Error('Repository not found or not accessible')
    }

    // Get repository info to determine default branch
    const info = await this.githubService.getRepoInfo(repoInfo.owner, repoInfo.repo)
    const branch = info.defaultBranch

    // Get all files in the repository with timeout protection
    console.log(`Starting analysis of ${repoInfo.owner}/${repoInfo.repo}...`)
    const startTime = Date.now()

    const files = await Promise.race([
      this.githubService.getRepoContents(repoInfo.owner, repoInfo.repo, '', branch),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Repository analysis timed out after 90 seconds')), 90000)
      )
    ])

    const analysisTime = Date.now() - startTime
    console.log(`Found ${files.length} files in repository (took ${analysisTime}ms)`)

    // Determine framework type
    const framework = this.detectFramework(files)

    // Analyze routes based on framework
    let routes: RouteData[] = []
    let routeFiles = 0

    switch (framework) {
      case 'nextjs-app':
        ({ routes, routeFiles } = await this.analyzeNextJSAppRouter(
          repoInfo.owner, 
          repoInfo.repo, 
          files, 
          branch
        ))
        break
      case 'nextjs-pages':
        ({ routes, routeFiles } = await this.analyzeNextJSPagesRouter(
          repoInfo.owner, 
          repoInfo.repo, 
          files, 
          branch
        ))
        break
      case 'react-router':
        ({ routes, routeFiles } = await this.analyzeReactRouter(
          repoInfo.owner, 
          repoInfo.repo, 
          files, 
          branch
        ))
        break
      default:
        routes = []
        routeFiles = 0
    }

    return {
      routes,
      framework,
      totalFiles: files.filter(f => f.type === 'file').length,
      routeFiles,
    }
  }

  /**
   * Detect the framework type based on file structure
   */
  private detectFramework(files: GitHubFile[]): AnalysisResult['framework'] {
    const filePaths = files.map(f => f.path)

    // Check for Next.js app directory
    if (filePaths.some(path => path.startsWith('app/') && path.includes('page.'))) {
      return 'nextjs-app'
    }

    // Check for Next.js pages directory
    if (filePaths.some(path => path.startsWith('pages/') || path.startsWith('src/pages/'))) {
      return 'nextjs-pages'
    }

    // Check for React Router patterns (more comprehensive)
    const hasReactRouter = filePaths.some(path =>
      path.includes('router') ||
      path.includes('routes') ||
      path.includes('Route') ||
      path.includes('App.js') ||
      path.includes('App.jsx') ||
      path.includes('App.ts') ||
      path.includes('App.tsx') ||
      path.includes('index.js') ||
      path.includes('index.jsx') ||
      path.includes('index.ts') ||
      path.includes('index.tsx')
    )

    if (hasReactRouter) {
      return 'react-router'
    }

    return 'unknown'
  }

  /**
   * Analyze Next.js App Router structure
   */
  private async analyzeNextJSAppRouter(
    owner: string,
    repo: string,
    files: GitHubFile[],
    branch: string
  ): Promise<{ routes: RouteData[], routeFiles: number }> {
    const routes: RouteData[] = []
    const routeFiles = files.filter(f => 
      f.path.startsWith('app/') && 
      (f.name === 'page.tsx' || f.name === 'page.ts' || f.name === 'page.jsx' || f.name === 'page.js')
    )

    for (const file of routeFiles) {
      const routePath = this.convertAppRouterPathToRoute(file.path)
      const componentName = await this.extractComponentName(owner, repo, file.path, branch)
      
      routes.push({
        path: routePath,
        component: componentName || 'Page',
        file_path: file.path,
      })
    }

    // Sort routes by path for better organization
    routes.sort((a, b) => a.path.localeCompare(b.path))

    return { routes, routeFiles: routeFiles.length }
  }

  /**
   * Analyze Next.js Pages Router structure
   */
  private async analyzeNextJSPagesRouter(
    owner: string,
    repo: string,
    files: GitHubFile[],
    branch: string
  ): Promise<{ routes: RouteData[], routeFiles: number }> {
    const routes: RouteData[] = []
    const pagesDir = files.find(f => f.path === 'pages' || f.path === 'src/pages')?.path || 'pages'
    
    const routeFiles = files.filter(f => 
      f.path.startsWith(pagesDir + '/') && 
      f.type === 'file' &&
      /\.(tsx?|jsx?)$/.test(f.name) &&
      !f.name.startsWith('_') // Exclude _app.js, _document.js, etc.
    )

    for (const file of routeFiles) {
      const routePath = this.convertPagesRouterPathToRoute(file.path, pagesDir)
      const componentName = await this.extractComponentName(owner, repo, file.path, branch)
      
      routes.push({
        path: routePath,
        component: componentName || 'Page',
        file_path: file.path,
      })
    }

    routes.sort((a, b) => a.path.localeCompare(b.path))
    return { routes, routeFiles: routeFiles.length }
  }

  /**
   * Analyze React Router structure (basic implementation)
   */
  private async analyzeReactRouter(
    owner: string,
    repo: string,
    files: GitHubFile[],
    branch: string
  ): Promise<{ routes: RouteData[], routeFiles: number }> {
    const routes: RouteData[] = []

    // Look for common React Router files
    const routerFiles = files.filter(f =>
      f.type === 'file' &&
      /\.(tsx?|jsx?)$/.test(f.name) &&
      (f.path.includes('router') || f.path.includes('routes') || f.path.includes('App'))
    )



    let routeFiles = 0
    for (const file of routerFiles) {
      try {
        const content = await this.githubService.getFileContent(owner, repo, file.path, branch)
        const extractedRoutes = await this.extractReactRouterRoutes(content, file.path)
        routes.push(...extractedRoutes)
        if (extractedRoutes.length > 0) routeFiles++
      } catch (error) {
        console.warn(`Failed to analyze ${file.path}:`, error)
      }
    }

    return { routes, routeFiles }
  }

  /**
   * Convert App Router file path to route path
   */
  private convertAppRouterPathToRoute(filePath: string): string {
    // Remove 'app/' prefix and '/page.tsx' suffix
    let route = filePath.replace(/^app\//, '').replace(/\/page\.(tsx?|jsx?)$/, '')
    
    // Handle root route
    if (!route) return '/'
    
    // Handle dynamic routes [param] -> :param
    route = route.replace(/\[([^\]]+)\]/g, ':$1')
    
    // Handle catch-all routes [...param] -> :param*
    route = route.replace(/\[\.\.\.([^\]]+)\]/g, ':$1*')
    
    return '/' + route
  }

  /**
   * Convert Pages Router file path to route path
   */
  private convertPagesRouterPathToRoute(filePath: string, pagesDir: string): string {
    // Remove pages directory and file extension
    let route = filePath
      .replace(new RegExp(`^${pagesDir}/`), '')
      .replace(/\.(tsx?|jsx?)$/, '')
    
    // Handle index files
    if (route === 'index' || route.endsWith('/index')) {
      route = route.replace(/\/index$/, '') || '/'
    }
    
    // Handle dynamic routes [param] -> :param
    route = route.replace(/\[([^\]]+)\]/g, ':$1')
    
    // Handle catch-all routes [...param] -> :param*
    route = route.replace(/\[\.\.\.([^\]]+)\]/g, ':$1*')
    
    return route.startsWith('/') ? route : '/' + route
  }

  /**
   * Extract component name from file content
   */
  private async extractComponentName(
    owner: string,
    repo: string,
    filePath: string,
    branch: string
  ): Promise<string | null> {
    try {
      const content = await this.githubService.getFileContent(owner, repo, filePath, branch)
      return this.parseComponentName(content)
    } catch {
      return null
    }
  }

  /**
   * Parse component name from file content using simple regex
   */
  private parseComponentName(content: string): string | null {
    try {
      // Look for export default function ComponentName
      const functionMatch = content.match(/export\s+default\s+function\s+(\w+)/);
      if (functionMatch) {
        return functionMatch[1];
      }

      // Look for const ComponentName = () =>
      const arrowMatch = content.match(/(?:export\s+default\s+)?const\s+(\w+)\s*=\s*\(/);
      if (arrowMatch) {
        return arrowMatch[1];
      }

      // Look for function ComponentName()
      const namedFunctionMatch = content.match(/function\s+(\w+)\s*\(/);
      if (namedFunctionMatch) {
        return namedFunctionMatch[1];
      }

      // Default fallback
      return 'Component';
    } catch {
      return null
    }
  }

  /**
   * Extract React Router routes from file content using regex
   */
  private async extractReactRouterRoutes(content: string, filePath: string): Promise<RouteData[]> {
    const routes: RouteData[] = []

    try {
      // Look for <Route path="..." component={...} />
      const routeMatches = content.matchAll(/<Route[^>]*path=["']([^"']+)["'][^>]*component=\{?(\w+)\}?[^>]*\/?>/g);

      for (const match of routeMatches) {
        const routePath = match[1];
        const componentName = match[2];

        routes.push({
          path: routePath,
          component: componentName,
          file_path: filePath,
        });
      }

      // Also look for <Route path="..." element={<Component />} />
      const elementMatches = content.matchAll(/<Route[^>]*path=["']([^"']+)["'][^>]*element=\{<(\w+)[^>]*\/?>?\}[^>]*\/?>/g);

      for (const match of elementMatches) {
        const routePath = match[1];
        const componentName = match[2];

        routes.push({
          path: routePath,
          component: componentName,
          file_path: filePath,
        });
      }

      // Look for React Router v6 patterns with Routes wrapper
      const routesMatches = content.matchAll(/<Route[^>]*path=["']([^"']+)["'][^>]*>/g);
      for (const match of routesMatches) {
        const routePath = match[1];
        // Try to extract component name from the surrounding context
        const componentMatch = content.match(new RegExp(`<Route[^>]*path=["']${routePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*element=\\{<(\\w+)`));
        const componentName = componentMatch ? componentMatch[1] : 'Component';

        routes.push({
          path: routePath,
          component: componentName,
          file_path: filePath,
        });
      }

      // If no routes found but this looks like a main app file, create a default route
      if (routes.length === 0 && (filePath.includes('App.') || filePath.includes('index.'))) {
        const componentName = this.parseComponentName(content) || 'App';
        routes.push({
          path: '/',
          component: componentName,
          file_path: filePath,
        });
      }
    } catch (error) {
      console.warn(`Failed to parse ${filePath}:`, error)
    }

    return routes
  }
}
