'use client'

import { useState, useMemo } from 'react'
import { RouteData } from '@/lib/supabase'
import { convertRoutesToMermaid, MermaidConfig } from '@/lib/mermaid-converter'
import MermaidRenderer, { downloadMermaidSVG } from './MermaidRenderer'

interface MermaidFlowChartProps {
  routeData: RouteData[]
  framework?: string
  totalFiles?: number
  routeFiles?: number
}

export default function MermaidFlowChart({ 
  routeData, 
  framework, 
  totalFiles, 
  routeFiles 
}: MermaidFlowChartProps) {
  const [config, setConfig] = useState<Partial<MermaidConfig>>({
    direction: 'TD',
    theme: 'default',
    showFilePaths: true,
    nodeShape: 'rect',
    diagramType: 'flowchart'
  })
  const [showSource, setShowSource] = useState(false)

  // Generate Mermaid diagram
  const mermaidChart = useMemo(() => {
    return convertRoutesToMermaid(routeData, framework, config)
  }, [routeData, framework, config])

  const handleDownloadSVG = () => {
    const svgElement = document.querySelector('.mermaid-svg-container svg') as SVGElement
    if (svgElement) {
      const repoName = 'route-diagram'
      downloadMermaidSVG(svgElement, `${repoName}-${Date.now()}.svg`)
    }
  }

  const handleCopySource = async () => {
    try {
      await navigator.clipboard.writeText(mermaidChart)
      // You could add a toast notification here
      console.log('Mermaid source copied to clipboard')
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  const getFrameworkDisplayName = (fw?: string) => {
    switch (fw) {
      case 'nextjs-app': return 'Next.js App Router'
      case 'nextjs-pages': return 'Next.js Pages Router'
      case 'react-router': return 'React Router'
      default: return 'Unknown Framework'
    }
  }

  if (routeData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500">No route data to display</p>
      </div>
    )
  }

  return (
    <div className="bg-card border border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 px-6 py-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Route Flow Diagram</h3>
            <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Framework: {getFrameworkDisplayName(framework)}
              </span>
              {totalFiles && (
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Total Files: {totalFiles}
                </span>
              )}
              {routeFiles && (
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Route Files: {routeFiles}
                </span>
              )}
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSource(!showSource)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
            >
              {showSource ? 'Hide' : 'Show'} Source
            </button>
            <button
              onClick={handleCopySource}
              className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
            >
              Copy Source
            </button>
            <button
              onClick={handleDownloadSVG}
              className="px-3 py-1 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded-md transition-colors"
            >
              Download SVG
            </button>
          </div>
        </div>

        {/* Configuration Controls */}
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Type:</label>
            <select
              value={config.diagramType}
              onChange={(e) => setConfig(prev => ({ ...prev, diagramType: e.target.value as any }))}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="flowchart">Flowchart</option>
              <option value="graph">Graph</option>
              <option value="mindmap">Mindmap</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Direction:</label>
            <select
              value={config.direction}
              onChange={(e) => setConfig(prev => ({ ...prev, direction: e.target.value as any }))}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="TD">Top Down</option>
              <option value="LR">Left Right</option>
              <option value="RL">Right Left</option>
              <option value="BT">Bottom Top</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Theme:</label>
            <select
              value={config.theme}
              onChange={(e) => setConfig(prev => ({ ...prev, theme: e.target.value as any }))}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="default">Default</option>
              <option value="dark">Dark</option>
              <option value="forest">Forest</option>
              <option value="neutral">Neutral</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Shape:</label>
            <select
              value={config.nodeShape}
              onChange={(e) => setConfig(prev => ({ ...prev, nodeShape: e.target.value as any }))}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="rect">Rectangle</option>
              <option value="round">Rounded</option>
              <option value="circle">Circle</option>
              <option value="rhombus">Diamond</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={config.showFilePaths}
                onChange={(e) => setConfig(prev => ({ ...prev, showFilePaths: e.target.checked }))}
                className="mr-2"
              />
              Show File Paths
            </label>
          </div>
        </div>
      </div>

      {/* Source Code Display */}
      {showSource && (
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="px-6 py-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Mermaid Source Code</h4>
            <pre className="text-xs bg-white border rounded p-3 overflow-x-auto max-h-64">
              <code>{mermaidChart}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Mermaid Diagram */}
      <div className="p-6">
        <MermaidRenderer
          chart={mermaidChart}
          config={{
            theme: config.theme,
            fontFamily: 'Inter, system-ui, sans-serif'
          }}
          className="min-h-[400px] border border-gray-700 rounded-lg bg-background"
          onError={(error) => {
            console.error('Mermaid rendering failed:', error)
          }}
        />
      </div>

      {/* Footer Info */}
      <div className="bg-muted/20 px-6 py-3 border-t border-gray-700">
        <p className="text-xs text-muted-foreground text-center">
          Powered by Mermaid.js • Interactive diagrams for modern web applications
        </p>
      </div>
    </div>
  )
}
