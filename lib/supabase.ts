import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface Project {
  id: string
  repo_url: string
  parsed_data: {
    routes: RouteData[]
    framework: string
    totalFiles: number
    routeFiles: number
  } | null
  created_at: string
}

export interface RouteData {
  path: string
  component: string
  file_path?: string
  children?: RouteData[]
}

// Website Flow Analysis Types
export interface WebsitePageData {
  id: string
  url: string
  title: string
  path: string
  links: string[]
  isEntryPoint?: boolean
  depth: number
}

export interface WebsiteFlowData {
  pages: WebsitePageData[]
  connections: Array<{
    source: string
    target: string
    type: 'navigation' | 'form' | 'button' | 'link'
  }>
  metadata: {
    baseUrl: string
    totalPages: number
    maxDepth: number
    crawlTime: number
  }
}

export interface WebsiteProject {
  id: string
  website_url: string
  flow_data: WebsiteFlowData | null
  created_at: string
}

// Website Screenshots Types
export interface WebsiteScreenshot {
  id: string
  filename: string
  viewport: string
  url: string
  title: string
  base64Data?: string
  downloadUrl?: string
}

export interface WebsiteScreenshotSession {
  id: string
  session_id: string
  website_url: string
  screenshots_data: WebsiteScreenshot[]
  capture_time: number
  total_screenshots: number
  created_at: string
}
