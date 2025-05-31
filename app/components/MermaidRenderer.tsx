'use client'

import { useEffect, useState } from 'react'
import mermaid from 'mermaid'

interface MermaidRendererProps {
  chart: string
  config?: Record<string, unknown>
  className?: string
  onError?: (error: Error) => void
}

export default function MermaidRenderer({
  chart,
  config,
  className = '',
  onError
}: MermaidRendererProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [svgContent, setSvgContent] = useState<string>('')

  useEffect(() => {
    const renderChart = async () => {
      if (!chart.trim()) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // Initialize Mermaid with configuration
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 14,
          ...config,
        })

        // Generate unique ID for this chart
        const chartId = `mermaid-chart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        // Render the chart
        const { svg } = await mermaid.render(chartId, chart)
        
        // Set the SVG content
        setSvgContent(svg)
        setIsLoading(false)

      } catch (err) {
        console.error('Mermaid rendering error:', err)
        const errorMessage = err instanceof Error ? err.message : 'Failed to render diagram'
        setError(errorMessage)
        setIsLoading(false)
        
        if (onError && err instanceof Error) {
          onError(err)
        }
      }
    }

    renderChart()
  }, [chart, config, onError])

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Rendering diagram...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center space-x-2 text-red-800">
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Diagram Error</span>
        </div>
        <p className="mt-2 text-sm text-red-700">{error}</p>
        <details className="mt-3">
          <summary className="text-sm text-red-600 cursor-pointer hover:text-red-800">
            Show diagram source
          </summary>
          <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-x-auto">
            {chart}
          </pre>
        </details>
      </div>
    )
  }

  if (!svgContent) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 text-center ${className}`}>
        <p className="text-gray-500">No diagram to display</p>
      </div>
    )
  }

  return (
    <div className={`mermaid-container ${className}`}>
      <div 
        className="mermaid-svg-container"
        dangerouslySetInnerHTML={{ __html: svgContent }}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px'
        }}
      />
    </div>
  )
}

// Export utility function for downloading SVG
export function downloadMermaidSVG(svgElement: SVGElement, filename: string = 'diagram.svg') {
  try {
    const svgData = new XMLSerializer().serializeToString(svgElement)
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const svgUrl = URL.createObjectURL(svgBlob)
    
    const downloadLink = document.createElement('a')
    downloadLink.href = svgUrl
    downloadLink.download = filename
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
    URL.revokeObjectURL(svgUrl)
  } catch (error) {
    console.error('Failed to download SVG:', error)
  }
}
