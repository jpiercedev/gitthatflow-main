'use client'

import { useCallback, useMemo, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  Panel,
  Position
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { RouteData, WebsiteFlowData } from '@/lib/supabase'
import { convertWebsiteToFlow, FlowNode, FlowEdge, applyAutoLayout } from '@/lib/flow-converter'
import ScreenshotPanel from './ScreenshotPanel'

// Convert GitHub route data to React Flow format
function convertRoutesToFlow(routeData: RouteData[]): { nodes: FlowNode[], edges: FlowEdge[] } {
  const nodes: FlowNode[] = []
  const edges: FlowEdge[] = []
  const nodeMap = new Map<string, string>()

  // Sort routes by depth for better layout
  const sortedRoutes = [...routeData].sort((a, b) => {
    const aDepth = a.path.split('/').filter(Boolean).length
    const bDepth = b.path.split('/').filter(Boolean).length
    if (aDepth !== bDepth) return aDepth - bDepth
    return a.path.localeCompare(b.path)
  })

  sortedRoutes.forEach((route, index) => {
    const nodeId = `route-${index}`
    const depth = route.path.split('/').filter(Boolean).length
    
    nodeMap.set(route.path, nodeId)

    // Create node
    const node: FlowNode = {
      id: nodeId,
      type: 'githubNode',
      position: { x: 0, y: depth * 150 }, // Will be repositioned by layout
      data: {
        label: route.path === '/' ? 'Home' : route.path,
        title: route.component || 'Component',
        url: route.file_path || '',
        path: route.path,
        isEntryPoint: route.path === '/',
        depth
      },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top
    }

    nodes.push(node)

    // Create edges based on route hierarchy
    const pathSegments = route.path.split('/').filter(Boolean)
    if (pathSegments.length > 0) {
      const parentPath = pathSegments.length === 1 ? '/' : '/' + pathSegments.slice(0, -1).join('/')
      const parentNodeId = nodeMap.get(parentPath)
      
      if (parentNodeId) {
        edges.push({
          id: `edge-${parentNodeId}-${nodeId}`,
          source: parentNodeId,
          target: nodeId,
          type: 'smoothstep',
          animated: false,
          style: { strokeWidth: 2, stroke: '#2196f3' }
        })
      }
    }

    // Handle children routes
    if (route.children) {
      route.children.forEach((child, childIndex) => {
        const childNodeId = `${nodeId}-child-${childIndex}`
        const childNode: FlowNode = {
          id: childNodeId,
          type: 'githubNode',
          position: { x: 0, y: (depth + 1) * 150 },
          data: {
            label: child.path,
            title: child.component || 'Component',
            url: child.file_path || '',
            path: child.path,
            isEntryPoint: false,
            depth: depth + 1
          },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top
        }

        nodes.push(childNode)
        edges.push({
          id: `edge-${nodeId}-${childNodeId}`,
          source: nodeId,
          target: childNodeId,
          type: 'smoothstep',
          animated: false,
          style: { strokeWidth: 2, stroke: '#2196f3' }
        })
      })
    }
  })

  return { nodes: applyAutoLayout(nodes), edges }
}

interface UnifiedFlowChartProps {
  // GitHub repository data
  routeData?: RouteData[]
  framework?: string
  totalFiles?: number
  routeFiles?: number

  // Website flow data
  websiteData?: WebsiteFlowData | null

  // Chart type
  type: 'github' | 'website'
}

// Custom node components
const GitHubNode = ({ data }: { data: FlowNode['data'] }) => (
  <div className="px-4 py-3 shadow-lg rounded-lg bg-white border-2 border-blue-300 min-w-[180px] max-w-[220px]">
    <div className="text-sm font-semibold text-gray-800 truncate mb-1">
      {data.label}
    </div>
    <div className="text-xs text-blue-600 truncate mb-1">
      {data.title}
    </div>
    {data.url && (
      <div className="text-xs text-gray-500 truncate">
        {data.url.split('/').pop()}
      </div>
    )}
    {data.isEntryPoint && (
      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium mt-1 inline-block">
        Entry
      </span>
    )}
  </div>
)

const WebsiteNode = ({ data }: { data: FlowNode['data'] }) => (
  <div className="px-4 py-3 shadow-lg rounded-lg bg-white border-2 border-green-300 min-w-[180px] max-w-[220px]">
    <div className="text-sm font-semibold text-gray-800 truncate mb-1">
      {data.title}
    </div>
    <div className="text-xs text-gray-500 truncate mb-1">
      {data.path}
    </div>
    <div className="flex items-center justify-between">
      {data.isEntryPoint && (
        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
          Entry
        </span>
      )}
      <span className="text-xs text-gray-400">
        Depth: {data.depth}
      </span>
    </div>
  </div>
)

const nodeTypes = {
  githubNode: GitHubNode,
  websiteNode: WebsiteNode,
}

export default function UnifiedFlowChart({
  routeData = [],
  framework,
  totalFiles,
  routeFiles,
  websiteData,
  type
}: UnifiedFlowChartProps) {
  const [fitViewOnChange] = useState(true)
  const [showScreenshotPanel, setShowScreenshotPanel] = useState(false)

  // Convert data to React Flow format based on type
  const { initialNodes, initialEdges } = useMemo(() => {
    if (type === 'website' && websiteData) {
      const { nodes, edges } = convertWebsiteToFlow(websiteData)
      return {
        initialNodes: nodes.map(node => ({ ...node, type: 'websiteNode' })),
        initialEdges: edges
      }
    } else if (type === 'github' && routeData.length > 0) {
      const { nodes, edges } = convertRoutesToFlow(routeData)
      return {
        initialNodes: nodes,
        initialEdges: edges
      }
    }
    return { initialNodes: [], initialEdges: [] }
  }, [type, routeData, websiteData])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const downloadFlow = useCallback(() => {
    const flowData = {
      nodes,
      edges,
      metadata: type === 'website' ? websiteData?.metadata : { framework, totalFiles, routeFiles }
    }
    
    const dataStr = JSON.stringify(flowData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `${type}-flow-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [nodes, edges, type, websiteData, framework, totalFiles, routeFiles])

  const resetLayout = useCallback(() => {
    if (type === 'website' && websiteData) {
      const { nodes: resetNodes, edges: resetEdges } = convertWebsiteToFlow(websiteData)
      const layoutNodes = applyAutoLayout(resetNodes)
      setNodes(layoutNodes.map(node => ({ ...node, type: 'websiteNode' })))
      setEdges(resetEdges)
    } else if (type === 'github' && routeData.length > 0) {
      const { nodes: resetNodes, edges: resetEdges } = convertRoutesToFlow(routeData)
      setNodes(resetNodes)
      setEdges(resetEdges)
    }
  }, [type, websiteData, routeData, setNodes, setEdges])

  if (initialNodes.length === 0) {
    return (
      <div className="bg-card border border-gray-700 rounded-lg p-8 text-center">
        <p className="text-gray-500">No flow data to display</p>
      </div>
    )
  }

  const getHeaderInfo = () => {
    if (type === 'website' && websiteData) {
      return {
        title: 'Website Flow Diagram',
        gradient: 'from-green-900/20 to-teal-900/20',
        items: [
          { label: 'Website', value: new URL(websiteData.metadata.baseUrl).hostname, color: 'green' },
          { label: 'Pages', value: websiteData.metadata.totalPages, color: 'blue' },
          { label: 'Max Depth', value: websiteData.metadata.maxDepth, color: 'purple' }
        ]
      }
    } else {
      return {
        title: 'Route Flow Diagram',
        gradient: 'from-blue-900/20 to-purple-900/20',
        items: [
          { label: 'Framework', value: framework?.replace('nextjs-', 'Next.js ').replace('react-router', 'React Router') || 'Unknown', color: 'blue' },
          ...(totalFiles ? [{ label: 'Total Files', value: totalFiles, color: 'green' }] : []),
          ...(routeFiles ? [{ label: 'Route Files', value: routeFiles, color: 'purple' }] : [])
        ]
      }
    }
  }

  const headerInfo = getHeaderInfo()

  return (
    <div className="bg-card border border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className={`bg-gradient-to-r ${headerInfo.gradient} px-6 py-4 border-b border-gray-700`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{headerInfo.title}</h3>
            <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
              {headerInfo.items.map((item, index) => (
                <span key={index} className="flex items-center">
                  <span className={`w-2 h-2 bg-${item.color}-500 rounded-full mr-2`}></span>
                  {item.label}: {item.value}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={resetLayout}
              className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
            >
              Reset Layout
            </button>
            <button
              onClick={downloadFlow}
              className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
            >
              Download Flow
            </button>
          </div>
        </div>
      </div>

      {/* React Flow */}
      <div className="h-[600px] bg-gray-50">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView={fitViewOnChange}
          fitViewOptions={{
            padding: 0.2,
            includeHiddenNodes: false,
          }}
          minZoom={0.1}
          maxZoom={2}
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: false,
            style: { strokeWidth: 2, stroke: type === 'website' ? '#10b981' : '#2196f3' }
          }}
        >
          <Background color="#aaa" gap={16} />
          <Controls />
          <MiniMap 
            nodeColor={(node: Node) => {
              if (node.data?.isEntryPoint) return type === 'website' ? '#059669' : '#1976d2'
              return '#666'
            }}
            nodeStrokeWidth={3}
            zoomable
            pannable
          />
          
          <Panel position="top-left" className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <div className="text-sm space-y-1">
              <div className="font-semibold text-gray-800">Legend</div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 ${type === 'website' ? 'bg-green-100 border-2 border-green-700' : 'bg-blue-100 border-2 border-blue-700'} rounded`}></div>
                <span className="text-xs text-gray-600">Entry Point</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 ${type === 'website' ? 'bg-gray-100 border-2 border-green-300' : 'bg-gray-100 border-2 border-blue-300'} rounded`}></div>
                <span className="text-xs text-gray-600">{type === 'website' ? 'Page' : 'Route'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-6 h-0.5 ${type === 'website' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                <span className="text-xs text-gray-600">{type === 'website' ? 'Navigation' : 'Route Hierarchy'}</span>
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Footer Info */}
      <div className="bg-muted/20 px-6 py-3 border-t border-gray-700">
        <p className="text-xs text-muted-foreground text-center">
          Powered by React Flow • Interactive {type === 'website' ? 'website navigation' : 'route structure'} visualization
          {type === 'website' && websiteData && ` • Crawl time: ${(websiteData.metadata.crawlTime / 1000).toFixed(1)}s`}
        </p>
      </div>

      {/* Screenshot Panel - Only for website analysis */}
      {type === 'website' && websiteData && (
        <div className="mt-6">
          <ScreenshotPanel
            websiteUrl={websiteData.metadata.baseUrl}
            isVisible={showScreenshotPanel}
            onToggle={() => setShowScreenshotPanel(!showScreenshotPanel)}
          />
        </div>
      )}
    </div>
  )
}
