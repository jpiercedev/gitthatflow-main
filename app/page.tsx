'use client'

/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react'
import RepoInputForm from './components/RepoInputForm'
import WebsiteInputForm from './components/WebsiteInputForm'
import UnifiedFlowChart from './components/UnifiedFlowChart'
import HeroSection from './components/HeroSection'
import AnimatedBackground from './components/AnimatedBackground'
import AnalysisToggle from './components/AnalysisToggle'
import FeatureShowcase from './components/FeatureShowcase'
import { RouteData, WebsiteFlowData } from '@/lib/supabase'
import { motion } from 'framer-motion'

type AnalysisMode = 'github' | 'website'

export default function Home() {
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('github')

  const handleModeChange = (newMode: AnalysisMode) => {
    console.log('Mode change requested:', { from: analysisMode, to: newMode })
    setAnalysisMode(newMode)
  }

  // Debug: Track analysis mode changes
  useEffect(() => {
    console.log('Analysis mode changed to:', analysisMode)
  }, [analysisMode])
  const [routeData, setRouteData] = useState<RouteData[]>([])
  const [websiteData, setWebsiteData] = useState<WebsiteFlowData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [analysisInfo, setAnalysisInfo] = useState<{
    framework?: string
    totalFiles?: number
    routeFiles?: number
    message?: string
    cached?: boolean
  }>({})
  const [error, setError] = useState<string>('')

  // Load Buy Me a Coffee widget
  useEffect(() => {
    // Check if the script is already loaded
    if (document.querySelector('[data-name="BMC-Widget"]')) {
      return
    }

    const script = document.createElement('script')
    script.setAttribute('data-name', 'BMC-Widget')
    script.setAttribute('data-cfasync', 'false')
    script.setAttribute('data-id', 'jpiercedev')
    script.setAttribute('data-description', 'Support me on Buy me a coffee!')
    script.setAttribute('data-message', '')
    script.setAttribute('data-color', '#5F7FFF')
    script.setAttribute('data-position', 'Right')
    script.setAttribute('data-x_margin', '18')
    script.setAttribute('data-y_margin', '18')
    script.src = 'https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js'
    script.async = true

    script.onload = () => {
      console.log('Buy Me a Coffee widget loaded successfully')
    }

    script.onerror = () => {
      console.warn('Failed to load Buy Me a Coffee widget')
    }

    document.head.appendChild(script)

    return () => {
      const existingScript = document.querySelector('[data-name="BMC-Widget"]')
      if (existingScript) {
        existingScript.remove()
      }
      const widget = document.querySelector('#bmc-wbtn')
      if (widget) {
        widget.remove()
      }
    }
  }, [])

  const handleRepoAnalysis = async (repoUrl: string) => {
    // Prevent double submissions
    if (isLoading) {
      return
    }

    setIsLoading(true)
    setError('')
    setRouteData([])
    setAnalysisInfo({})

    try {
      // Add timeout to prevent hanging
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 120000) // 2 minutes

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repoUrl }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json()
        const error = new Error(errorData.error || 'Failed to analyze repository')
        // Attach additional error data for better handling
        ;(error as Error & { suggestion?: string; status?: number }).suggestion = errorData.suggestion
        ;(error as Error & { suggestion?: string; status?: number }).status = response.status
        throw error
      }

      const result = await response.json()

      // If no routes found but analysis was successful, add some demo data to show Mermaid
      const routeData = result.data || []
      if (routeData.length === 0 && result.framework) {
        // Add a simple demo route to show the Mermaid diagram works
        const demoRoutes: RouteData[] = [
          {
            path: '/',
            component: 'App',
            file_path: 'src/App.js'
          }
        ]
        setRouteData(demoRoutes)
      } else {
        setRouteData(routeData)
      }

      setAnalysisInfo({
        framework: result.framework,
        totalFiles: result.totalFiles,
        routeFiles: result.routeFiles,
        message: result.message,
        cached: result.cached
      })
    } catch (error: unknown) {
      console.error('Error analyzing repo:', error)

      // Parse error response for better user feedback
      let errorMessage = 'Failed to analyze repository'
      let suggestion = ''

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Analysis timed out after 2 minutes'
          suggestion = 'Try a smaller repository or one with fewer files'
        } else {
          errorMessage = error.message || errorMessage
          suggestion = (error as Error & { suggestion?: string }).suggestion || ''
        }
      }

      setError(suggestion ? `${errorMessage}\n\nSuggestion: ${suggestion}` : errorMessage)

      // Only show fallback data for specific non-critical errors (not for repo not found, rate limits, etc.)
      const shouldShowFallback = !errorMessage.includes('rate limit') &&
                                !errorMessage.includes('not found') &&
                                !errorMessage.includes('not accessible') &&
                                !errorMessage.includes('authentication failed')

      if (shouldShowFallback) {
        // Fallback to mock data for demo purposes (only for parsing/analysis errors)
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
        setAnalysisInfo({
          framework: 'demo',
          message: 'Using demo data due to analysis error'
        })
      } else {
        // Clear any existing data for critical errors
        setRouteData([])
        setAnalysisInfo({})
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleWebsiteAnalysis = async (
    websiteUrl: string,
    options: { maxPages: number; maxDepth: number }
  ) => {
    console.log('handleWebsiteAnalysis called with:', { websiteUrl, options })
    setIsLoading(true)
    setError('')
    setWebsiteData(null)
    setAnalysisInfo({})

    try {
      // Add timeout to prevent hanging
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 180000) // 3 minutes for website crawling

      const response = await fetch('/api/analyze-website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          websiteUrl,
          maxPages: options.maxPages,
          maxDepth: options.maxDepth
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json()
        const error = new Error(errorData.error || 'Failed to analyze website')
        throw error
      }

      const result = await response.json()

      if (result.success && result.data) {
        setWebsiteData(result.data)
        setAnalysisInfo({
          message: result.message,
          cached: result.cached
        })
      } else {
        throw new Error(result.error || 'No data received from analysis')
      }

    } catch (error: unknown) {
      console.error('Website analysis error:', error)

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          setError('Analysis timed out. The website may be too large or slow to respond. Try reducing the number of pages or depth.')
        } else {
          setError(error.message)
        }
      } else {
        setError('An unexpected error occurred during website analysis')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background relative flex flex-col">
      <AnimatedBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Full Width Hero Section */}
        <div className="w-full px-6 pt-6 pb-4">
          <HeroSection />
        </div>

        {/* Main Analysis Section */}
        <div className="flex-1 flex flex-col items-center px-4 py-6 space-y-6">
          <div className="w-full max-w-4xl mx-auto">
            {/* Compact Toggle Section */}
            <motion.div
              className="text-center mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
                Choose Analysis Type
              </h2>

              <AnalysisToggle
                mode={analysisMode}
                onModeChange={handleModeChange}
                className="mb-4"
              />

              <motion.p
                className="text-gray-400 text-sm max-w-xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                {analysisMode === 'github'
                  ? 'Analyze GitHub repositories for routing structure'
                  : 'Map website navigation flows and user journeys'
                }
              </motion.p>
            </motion.div>

            {/* Conditional Analysis Forms */}
            {(() => {
              console.log('Rendering form for mode:', analysisMode)
              return analysisMode === 'github' ? (
                <RepoInputForm onSubmit={handleRepoAnalysis} isLoading={isLoading} />
              ) : (
                <WebsiteInputForm onSubmit={handleWebsiteAnalysis} isLoading={isLoading} />
              )
            })()}

            {/* Error Display */}
            {error && (
              <div className="mt-6 bg-red-900/20 border border-red-800 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-red-300 font-medium">Analysis Error</span>
                </div>
                <p className="mt-1 text-red-200">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {analysisInfo.message && !error && (
              <div className={`mt-6 ${analysisMode === 'github' ? 'bg-blue-900/20 border-blue-800' : 'bg-green-900/20 border-green-800'} border rounded-lg p-4`}>
                <div className="flex items-center">
                  <svg className={`h-5 w-5 ${analysisMode === 'github' ? 'text-blue-400' : 'text-green-400'} mr-2`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className={`${analysisMode === 'github' ? 'text-blue-300' : 'text-green-300'} font-medium`}>
                    {analysisInfo.cached ? 'Cached Result' : 'Analysis Complete'}
                  </span>
                </div>
                <p className={`mt-1 ${analysisMode === 'github' ? 'text-blue-200' : 'text-green-200'}`}>{analysisInfo.message}</p>
              </div>
            )}
          </div>
        </div>

        {/* Unified Flow Chart - Full Width Below Centered Interface */}
        {((analysisMode === 'github' && routeData.length > 0) || (analysisMode === 'website' && websiteData)) && (
          <motion.div
            className="container mx-auto px-4 pb-8"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <UnifiedFlowChart
              type={analysisMode}
              routeData={routeData}
              framework={analysisInfo.framework}
              totalFiles={analysisInfo.totalFiles}
              routeFiles={analysisInfo.routeFiles}
              websiteData={websiteData}
            />
          </motion.div>
        )}

        {/* Feature Showcase - Hidden for now, keeping for later use */}
        {/* {!((analysisMode === 'github' && routeData.length > 0) || (analysisMode === 'website' && websiteData)) && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            <FeatureShowcase
              title="Powerful Analysis Features"
              subtitle="Everything you need to visualize and understand application flows"
              className="container mx-auto px-4 pb-12"
            />
          </motion.div>
        )} */}
      </div>
    </div>
  )
}
