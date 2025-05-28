import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface Project {
  id: string
  repo_url: string
  parsed_data: any
  created_at: string
}

export interface RouteData {
  path: string
  component: string
  file_path?: string
  children?: RouteData[]
}
