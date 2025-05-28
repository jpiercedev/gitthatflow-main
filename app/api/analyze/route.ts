import { NextRequest, NextResponse } from 'next/server'

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
    const githubPattern = /^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+\/?$/
    if (!githubPattern.test(repoUrl)) {
      return NextResponse.json(
        { error: 'Invalid GitHub repository URL' },
        { status: 400 }
      )
    }

    // For now, return mock data since Supabase Edge Function isn't deployed yet
    // TODO: Replace with actual Supabase Edge Function call
    const mockData = [
      {
        path: '/',
        component: 'HomePage',
        file_path: 'src/pages/index.tsx'
      },
      {
        path: '/about',
        component: 'AboutPage',
        file_path: 'src/pages/about.tsx'
      },
      {
        path: '/dashboard',
        component: 'DashboardPage',
        file_path: 'src/pages/dashboard.tsx',
        children: [
          {
            path: '/dashboard/settings',
            component: 'SettingsPage',
            file_path: 'src/pages/dashboard/settings.tsx'
          }
        ]
      }
    ]

    return NextResponse.json({
      success: true,
      data: mockData,
      message: `Successfully analyzed ${repoUrl} (using mock data for demo)`
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
