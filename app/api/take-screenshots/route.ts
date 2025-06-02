import { NextRequest, NextResponse } from 'next/server'
import { getScreenshotService, cleanupScreenshotService } from '@/lib/screenshot-service'

export async function POST(request: NextRequest) {
  try {
    const { 
      websiteUrl, 
      sessionId,
      viewports,
      pages,
      maxPages = 5 
    } = await request.json()

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

    // Validate limits
    const validatedMaxPages = Math.min(Math.max(maxPages, 1), 10) // Limit to 10 pages max

    const screenshotService = await getScreenshotService()
    
    const result = await screenshotService.captureWebsiteScreenshots({
      websiteUrl: normalizedUrl,
      sessionId,
      viewports,
      pages,
      maxPages: validatedMaxPages
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: `Successfully captured ${result.screenshots.length} screenshots`
    })

  } catch (error: unknown) {
    console.error('Screenshot API error:', error)

    const errorMessage = (error as Error).message

    // Handle specific error types
    if (errorMessage?.includes('timeout') || errorMessage?.includes('TIMEOUT')) {
      return NextResponse.json(
        { error: 'Screenshot capture timed out. The website may be slow to respond.' },
        { status: 408 }
      )
    }

    if (errorMessage?.includes('ENOTFOUND') || errorMessage?.includes('not found')) {
      return NextResponse.json(
        { error: 'Website not found or not accessible. Please check the URL and try again.' },
        { status: 404 }
      )
    }

    if (errorMessage?.includes('navigation') || errorMessage?.includes('Navigation')) {
      return NextResponse.json(
        { error: 'Failed to navigate to website. The site may be blocking automated access.' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to capture screenshots. Please try again later.' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve screenshot history (optional - just for analytics)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const websiteUrl = searchParams.get('websiteUrl')

    if (!websiteUrl) {
      return NextResponse.json(
        { error: 'websiteUrl parameter is required' },
        { status: 400 }
      )
    }

    // Import supabase here to avoid circular dependencies
    const { supabase } = await import('@/lib/supabase')

    // Normalize URL for lookup
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

    const { data: screenshots, error } = await supabase
      .from('website_screenshots')
      .select('session_id, total_screenshots, capture_time, created_at')
      .eq('website_url', normalizedUrl)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Database error occurred' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: screenshots || [],
      message: screenshots?.length ? `Found ${screenshots.length} screenshot session(s)` : 'No previous screenshots found'
    })

  } catch (error) {
    console.error('GET screenshots error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve screenshot history' },
      { status: 500 }
    )
  }
}

// Cleanup function for graceful shutdown
export async function DELETE(request: NextRequest) {
  try {
    await cleanupScreenshotService()
    return NextResponse.json({ success: true, message: 'Screenshot service cleaned up' })
  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json(
      { error: 'Failed to cleanup screenshot service' },
      { status: 500 }
    )
  }
}
