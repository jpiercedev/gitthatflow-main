'use client'

import { useState } from 'react'
import RepoInputForm from './components/RepoInputForm'
import FlowChart from './components/FlowChart'
import { RouteData } from '@/lib/supabase'

export default function Home() {
  const [routeData, setRouteData] = useState<RouteData[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleRepoAnalysis = async (repoUrl: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repoUrl }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze repository')
      }

      const result = await response.json()
      setRouteData(result.data)
    } catch (error) {
      console.error('Error analyzing repo:', error)
      // Fallback to mock data for now
      const mockData: RouteData[] = [
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
      setRouteData(mockData)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">GitThatFlow</h1>
          <p className="text-lg text-gray-600">
            Visualize your React app's routing structure from any GitHub repository
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
          <RepoInputForm onSubmit={handleRepoAnalysis} isLoading={isLoading} />

          {routeData.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Route Flow Chart</h2>
              <FlowChart routeData={routeData} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
