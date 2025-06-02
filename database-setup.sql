-- GitThatFlow Database Setup
-- Run this SQL in your Supabase SQL editor

-- Existing projects table for GitHub repository analysis
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  repo_url TEXT NOT NULL UNIQUE,
  parsed_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_projects_repo_url ON projects(repo_url);

-- New website_projects table for website flow analysis
CREATE TABLE IF NOT EXISTS website_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  website_url TEXT NOT NULL UNIQUE,
  flow_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_website_projects_url ON website_projects(website_url);

-- Optional: website_screenshots table for storing screenshot analytics (not required for functionality)
CREATE TABLE IF NOT EXISTS website_screenshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  website_url TEXT NOT NULL,
  screenshots_data JSONB,
  capture_time INTEGER,
  total_screenshots INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups on website_screenshots
CREATE INDEX IF NOT EXISTS idx_website_screenshots_session ON website_screenshots(session_id);
CREATE INDEX IF NOT EXISTS idx_website_screenshots_url ON website_screenshots(website_url);

-- Optional: Add RLS (Row Level Security) policies if needed
-- ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE website_projects ENABLE ROW LEVEL SECURITY;

-- Example policy to allow public read access (adjust as needed)
-- CREATE POLICY "Allow public read access" ON projects FOR SELECT USING (true);
-- CREATE POLICY "Allow public read access" ON website_projects FOR SELECT USING (true);
