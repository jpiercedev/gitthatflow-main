import { NextRequest, NextResponse } from 'next/server'
import { RouteAnalyzer } from '@/lib/route-analyzer'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { repoUrl } = await request.json()

    if (!repoUrl) {
      return NextResponse.json(
        { error: 'Repository URL is required' },
        { status: 400 }
      )
    }

    // Validate GitHub URL
    const githubPattern = /^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+(?:\.git)?\/?$/
    if (!githubPattern.test(repoUrl)) {
      return NextResponse.json(
        { error: 'Invalid GitHub repository URL' },
        { status: 400 }
      )
    }

    // Check if we have cached results in Supabase
    const { data: existingProject } = await supabase
      .from('projects')
      .select('*')
      .eq('repo_url', repoUrl)
      .single()

    if (existingProject && existingProject.parsed_data) {
      return NextResponse.json({
        success: true,
        data: existingProject.parsed_data.routes,
        framework: existingProject.parsed_data.framework,
        totalFiles: existingProject.parsed_data.totalFiles,
        routeFiles: existingProject.parsed_data.routeFiles,
        message: `Retrieved cached analysis for ${repoUrl}`,
        cached: true
      })
    }

    // Analyze the repository
    const analyzer = new RouteAnalyzer(process.env.GITHUB_TOKEN)
    const analysisResult = await analyzer.analyzeRepository(repoUrl)

    // Store results in Supabase
    const { error: insertError } = await supabase
      .from('projects')
      .upsert({
        repo_url: repoUrl,
        parsed_data: analysisResult,
      })

    if (insertError) {
      console.warn('Failed to cache results:', insertError)
    }

    return NextResponse.json({
      success: true,
      data: analysisResult.routes,
      framework: analysisResult.framework,
      totalFiles: analysisResult.totalFiles,
      routeFiles: analysisResult.routeFiles,
      message: `Successfully analyzed ${repoUrl}`,
      cached: false
    })

  } catch (error: unknown) {
    console.error('API error:', error)

    // Return more specific error messages
    const errorMessage = (error as Error).message
    const errorStatus = (error as any).status

    if (errorMessage?.includes('not found') || errorMessage?.includes('not accessible')) {
      return NextResponse.json(
        { error: 'Repository not found or not accessible. Please check the URL and ensure the repository is public.' },
        { status: 404 }
      )
    }

    if (errorMessage?.includes('rate limit') || errorStatus === 403) {
      return NextResponse.json(
        {
          error: 'GitHub API rate limit exceeded. Please add a GitHub token to your environment variables or try again later.',
          suggestion: 'Add GITHUB_TOKEN to your .env.local file. Get a token from https://github.com/settings/tokens'
        },
        { status: 429 }
      )
    }

    if (errorStatus === 401) {
      return NextResponse.json(
        {
          error: 'GitHub authentication failed. Please check your GitHub token.',
          suggestion: 'Verify your GITHUB_TOKEN in .env.local is valid'
        },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to analyze repository. Please try again.' },
      { status: 500 }
    )
  }
}
