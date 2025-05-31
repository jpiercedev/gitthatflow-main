import { Node, Edge, Position } from '@xyflow/react'
import { WebsiteFlowData, WebsitePageData } from './supabase'

export interface FlowNode extends Node {
  data: {
    label: string
    title: string
    url: string
    path: string
    isEntryPoint?: boolean
    depth: number
  }
}

export interface FlowEdge extends Edge {
  data?: {
    type: 'navigation' | 'form' | 'button' | 'link'
  }
}

export class FlowConverter {
  private nodeWidth = 200
  private nodeHeight = 80
  private levelSpacing = 250
  private nodeSpacing = 120

  convertToReactFlow(websiteData: WebsiteFlowData): { nodes: FlowNode[], edges: FlowEdge[] } {
    const nodes = this.generateNodes(websiteData.pages)
    const edges = this.generateEdges(websiteData.connections)
    
    return { nodes, edges }
  }

  private generateNodes(pages: WebsitePageData[]): FlowNode[] {
    // Group pages by depth for better layout
    const pagesByDepth = this.groupPagesByDepth(pages)
    const nodes: FlowNode[] = []

    Object.entries(pagesByDepth).forEach(([depth, depthPages]) => {
      const depthNum = parseInt(depth)
      const yPosition = depthNum * this.levelSpacing

      depthPages.forEach((page, index) => {
        const xPosition = this.calculateXPosition(index, depthPages.length)
        
        const node: FlowNode = {
          id: page.id,
          type: this.getNodeType(page),
          position: { x: xPosition, y: yPosition },
          data: {
            label: this.formatNodeLabel(page),
            title: page.title,
            url: page.url,
            path: page.path,
            isEntryPoint: page.isEntryPoint,
            depth: page.depth
          },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
          style: this.getNodeStyle(page)
        }

        nodes.push(node)
      })
    })

    return nodes
  }

  private generateEdges(connections: WebsiteFlowData['connections']): FlowEdge[] {
    return connections.map((connection, index) => ({
      id: `edge-${index}`,
      source: connection.source,
      target: connection.target,
      type: 'smoothstep',
      animated: false,
      style: this.getEdgeStyle(connection.type),
      data: {
        type: connection.type
      }
    }))
  }

  private groupPagesByDepth(pages: WebsitePageData[]): Record<number, WebsitePageData[]> {
    return pages.reduce((acc, page) => {
      if (!acc[page.depth]) {
        acc[page.depth] = []
      }
      acc[page.depth].push(page)
      return acc
    }, {} as Record<number, WebsitePageData[]>)
  }

  private calculateXPosition(index: number, totalNodes: number): number {
    if (totalNodes === 1) return 0
    
    const totalWidth = (totalNodes - 1) * this.nodeSpacing
    const startX = -totalWidth / 2
    return startX + (index * this.nodeSpacing)
  }

  private getNodeType(page: WebsitePageData): string {
    if (page.isEntryPoint) return 'input'
    if (page.links.length === 0) return 'output'
    return 'default'
  }

  private formatNodeLabel(page: WebsitePageData): string {
    const maxLength = 25
    let label = page.title || page.path
    
    if (label.length > maxLength) {
      label = label.substring(0, maxLength - 3) + '...'
    }
    
    return label
  }

  private getNodeStyle(page: WebsitePageData) {
    const baseStyle = {
      width: this.nodeWidth,
      height: this.nodeHeight,
      border: '2px solid',
      borderRadius: '8px',
      fontSize: '12px',
      fontWeight: '500'
    }

    if (page.isEntryPoint) {
      return {
        ...baseStyle,
        backgroundColor: '#f3e5f5',
        borderColor: '#4a148c',
        color: '#000'
      }
    }

    if (page.depth === 0) {
      return {
        ...baseStyle,
        backgroundColor: '#e1f5fe',
        borderColor: '#01579b',
        color: '#000'
      }
    }

    return {
      ...baseStyle,
      backgroundColor: '#f5f5f5',
      borderColor: '#666',
      color: '#000'
    }
  }

  private getEdgeStyle(type: string) {
    const baseStyle = {
      strokeWidth: 2
    }

    switch (type) {
      case 'form':
        return { ...baseStyle, stroke: '#ff9800', strokeDasharray: '5,5' }
      case 'button':
        return { ...baseStyle, stroke: '#4caf50' }
      case 'navigation':
      case 'link':
      default:
        return { ...baseStyle, stroke: '#2196f3' }
    }
  }
}

export function convertWebsiteToFlow(websiteData: WebsiteFlowData): { nodes: FlowNode[], edges: FlowEdge[] } {
  const converter = new FlowConverter()
  return converter.convertToReactFlow(websiteData)
}

// Node styling configuration for React Flow
export const getNodeStyles = (isEntryPoint?: boolean) => ({
  width: 200,
  height: 80,
  border: '2px solid',
  borderRadius: '8px',
  fontSize: '12px',
  fontWeight: '500',
  backgroundColor: isEntryPoint ? '#f3e5f5' : '#f5f5f5',
  borderColor: isEntryPoint ? '#4a148c' : '#666',
  color: '#000'
})

// Layout algorithms for better positioning
export function applyAutoLayout(nodes: FlowNode[]): FlowNode[] {
  // Simple hierarchical layout based on depth
  const nodesByDepth = nodes.reduce((acc, node) => {
    const depth = node.data.depth
    if (!acc[depth]) acc[depth] = []
    acc[depth].push(node)
    return acc
  }, {} as Record<number, FlowNode[]>)

  const layoutNodes: FlowNode[] = []
  const levelSpacing = 200
  const nodeSpacing = 150

  Object.entries(nodesByDepth).forEach(([depth, depthNodes]) => {
    const depthNum = parseInt(depth)
    const yPosition = depthNum * levelSpacing

    depthNodes.forEach((node, index) => {
      const totalWidth = (depthNodes.length - 1) * nodeSpacing
      const startX = -totalWidth / 2
      const xPosition = startX + (index * nodeSpacing)

      layoutNodes.push({
        ...node,
        position: { x: xPosition, y: yPosition }
      })
    })
  })

  return layoutNodes
}
