'use client'

import { useCallback, useMemo } from 'react'
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { RouteData } from '@/lib/supabase'

interface FlowChartProps {
  routeData: RouteData[]
}

export default function FlowChart({ routeData }: FlowChartProps) {
  // Convert route data to React Flow nodes and edges
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = []
    const edges: Edge[] = []
    let nodeId = 0

    const createNode = (route: RouteData, x: number, y: number, parentId?: string): string => {
      const currentNodeId = `node-${nodeId++}`
      
      nodes.push({
        id: currentNodeId,
        type: 'default',
        position: { x, y },
        data: {
          label: (
            <div className="text-center">
              <div className="font-semibold text-blue-600">{route.path}</div>
              <div className="text-sm text-gray-600">{route.component}</div>
              {route.file_path && (
                <div className="text-xs text-gray-400 mt-1">{route.file_path}</div>
              )}
            </div>
          ),
        },
        style: {
          background: '#ffffff',
          border: '2px solid #3b82f6',
          borderRadius: '8px',
          padding: '10px',
          minWidth: '200px',
        },
      })

      // Create edge from parent if exists
      if (parentId) {
        edges.push({
          id: `edge-${parentId}-${currentNodeId}`,
          source: parentId,
          target: currentNodeId,
          type: 'smoothstep',
          style: { stroke: '#3b82f6', strokeWidth: 2 },
        })
      }

      return currentNodeId
    }

    // Create nodes for main routes
    routeData.forEach((route, index) => {
      const x = (index % 3) * 300
      const y = Math.floor(index / 3) * 200
      const nodeId = createNode(route, x, y)

      // Create child nodes if they exist
      if (route.children) {
        route.children.forEach((child, childIndex) => {
          const childX = x + (childIndex + 1) * 100
          const childY = y + 150
          createNode(child, childX, childY, nodeId)
        })
      }
    })

    return { initialNodes: nodes, initialEdges: edges }
  }, [routeData])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  if (routeData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500">No route data to display</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ height: '600px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        attributionPosition="bottom-left"
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  )
}
