import { NextRequest, NextResponse } from 'next/server'
import { crawlWebsite } from '@/lib/website-crawler'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { websiteUrl, maxPages = 30, maxDepth = 3 } = await request.json()

    if (!websiteUrl) {
      return NextResponse.json(
        { error: 'Website URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    let normalizedUrl: string
    try {
      const urlObj = new URL(websiteUrl)
      normalizedUrl = `${urlObj.protocol}//${urlObj.host}`
    } catch {
      return NextResponse.json(
        { error: 'Invalid website URL format' },
        { status: 400 }
      )
    }

    // Check if we have cached results in Supabase
    const { data: existingProject } = await supabase
      .from('website_projects')
      .select('*')
      .eq('website_url', normalizedUrl)
      .single()

    if (existingProject && existingProject.flow_data) {
      return NextResponse.json({
        success: true,
        data: existingProject.flow_data,
        message: `Retrieved cached analysis for ${normalizedUrl}`,
        cached: true
      })
    }

    // Validate crawling limits
    const validatedMaxPages = Math.min(Math.max(maxPages, 1), 30)
    const validatedMaxDepth = Math.min(Math.max(maxDepth, 1), 5)

    // Crawl the website
    const flowData = await crawlWebsite(normalizedUrl, {
      maxPages: validatedMaxPages,
      maxDepth: validatedMaxDepth,
      delay: 1000, // 1 second delay between requests
      timeout: 10000, // 10 second timeout per request
      respectRobots: true
    })

    // Store results in Supabase
    const { error: insertError } = await supabase
      .from('website_projects')
      .upsert({
        website_url: normalizedUrl,
        flow_data: flowData,
      })

    if (insertError) {
      console.warn('Failed to cache website analysis results:', insertError)
    }

    return NextResponse.json({
      success: true,
      data: flowData,
      message: `Successfully analyzed ${normalizedUrl}`,
      cached: false
    })

  } catch (error: unknown) {
    console.error('Website analysis API error:', error)

    const errorMessage = (error as Error).message

    // Handle specific error types
    if (errorMessage?.includes('timeout') || errorMessage?.includes('TIMEOUT')) {
      return NextResponse.json(
        { error: 'Website analysis timed out. The website may be slow to respond or have too many pages.' },
        { status: 408 }
      )
    }

    if (errorMessage?.includes('ENOTFOUND') || errorMessage?.includes('not found')) {
      return NextResponse.json(
        { error: 'Website not found or not accessible. Please check the URL and try again.' },
        { status: 404 }
      )
    }

    if (errorMessage?.includes('ECONNREFUSED') || errorMessage?.includes('connection refused')) {
      return NextResponse.json(
        { error: 'Connection refused by the website. The site may be blocking automated requests.' },
        { status: 403 }
      )
    }

    if (errorMessage?.includes('Invalid URL')) {
      return NextResponse.json(
        { error: 'Invalid website URL provided. Please enter a valid URL (e.g., https://example.com).' },
        { status: 400 }
      )
    }

    // Rate limiting or too many requests
    if (errorMessage?.includes('rate limit') || errorMessage?.includes('429')) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a moment before analyzing another website.' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to analyze website. Please try again with a different URL.' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve analysis status or cached results
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const websiteUrl = searchParams.get('url')

    if (!websiteUrl) {
      return NextResponse.json(
        { error: 'Website URL parameter is required' },
        { status: 400 }
      )
    }

    // Normalize URL
    let normalizedUrl: string
    try {
      const urlObj = new URL(websiteUrl)
      normalizedUrl = `${urlObj.protocol}//${urlObj.host}`
    } catch {
      return NextResponse.json(
        { error: 'Invalid website URL format' },
        { status: 400 }
      )
    }

    // Check for cached results
    const { data: existingProject, error } = await supabase
      .from('website_projects')
      .select('*')
      .eq('website_url', normalizedUrl)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Database error occurred' },
        { status: 500 }
      )
    }

    if (existingProject && existingProject.flow_data) {
      return NextResponse.json({
        success: true,
        data: existingProject.flow_data,
        cached: true,
        createdAt: existingProject.created_at
      })
    }

    return NextResponse.json({
      success: false,
      message: 'No cached analysis found for this website',
      cached: false
    })

  } catch (error) {
    console.error('GET website analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve website analysis' },
      { status: 500 }
    )
  }
}
