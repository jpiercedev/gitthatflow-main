import { RouteData } from './supabase'

export interface MermaidConfig {
  direction: 'TD' | 'LR' | 'RL' | 'BT'
  theme: 'default' | 'dark' | 'forest' | 'neutral'
  showFilePaths: boolean
  nodeShape: 'rect' | 'round' | 'circle' | 'rhombus'
  diagramType: 'flowchart' | 'graph' | 'mindmap'
}

export class MermaidConverter {
  private config: MermaidConfig

  constructor(config: Partial<MermaidConfig> = {}) {
    this.config = {
      direction: 'TD',
      theme: 'default',
      showFilePaths: true,
      nodeShape: 'rect',
      diagramType: 'flowchart',
      ...config
    }
  }

  /**
   * Convert route data to Mermaid flowchart syntax
   */
  convertToMermaid(routeData: RouteData[], framework?: string): string {
    if (routeData.length === 0) {
      return this.generateEmptyDiagram()
    }

    const lines: string[] = []
    
    // Add diagram header
    lines.push(`flowchart ${this.config.direction}`)
    lines.push('')

    // Add framework info as a comment
    if (framework) {
      lines.push(`    %% Framework: ${this.getFrameworkDisplayName(framework)}`)
      lines.push('')
    }

    // Generate nodes and connections
    const { nodes, connections } = this.generateNodesAndConnections(routeData)
    
    // Add nodes
    lines.push('    %% Route Nodes')
    lines.push(...nodes)
    lines.push('')

    // Add connections if any
    if (connections.length > 0) {
      lines.push('    %% Route Connections')
      lines.push(...connections)
      lines.push('')
    }

    // Add styling
    lines.push(...this.generateStyling())

    return lines.join('\n')
  }

  /**
   * Generate nodes and their connections
   */
  private generateNodesAndConnections(routeData: RouteData[]): {
    nodes: string[]
    connections: string[]
  } {
    const nodes: string[] = []
    const connections: string[] = []
    const nodeIds = new Map<string, string>()

    // Sort routes for better hierarchy
    const sortedRoutes = [...routeData].sort((a, b) => {
      const aDepth = a.path.split('/').length
      const bDepth = b.path.split('/').length
      if (aDepth !== bDepth) return aDepth - bDepth
      return a.path.localeCompare(b.path)
    })

    sortedRoutes.forEach((route, index) => {
      const nodeId = `route${index + 1}`
      nodeIds.set(route.path, nodeId)

      // Generate node content
      const nodeContent = this.generateNodeContent(route)
      const nodeDefinition = this.formatNode(nodeId, nodeContent)
      
      nodes.push(`    ${nodeDefinition}`)

      // Generate connections based on route hierarchy
      const parentPath = this.getParentPath(route.path)
      if (parentPath && nodeIds.has(parentPath)) {
        const parentId = nodeIds.get(parentPath)!
        connections.push(`    ${parentId} --> ${nodeId}`)
      }

      // Handle children if they exist
      if (route.children) {
        route.children.forEach((child, childIndex) => {
          const childNodeId = `${nodeId}_child${childIndex + 1}`
          const childContent = this.generateNodeContent(child)
          const childDefinition = this.formatNode(childNodeId, childContent)
          
          nodes.push(`    ${childDefinition}`)
          connections.push(`    ${nodeId} --> ${childNodeId}`)
        })
      }
    })

    return { nodes, connections }
  }

  /**
   * Generate content for a single node
   */
  private generateNodeContent(route: RouteData): string {
    const parts: string[] = []
    
    // Add route path
    parts.push(route.path === '/' ? 'Home' : route.path)
    
    // Add component name
    if (route.component && route.component !== 'Page') {
      parts.push(`[${route.component}]`)
    }
    
    // Add file path if enabled
    if (this.config.showFilePaths && route.file_path) {
      const fileName = route.file_path.split('/').pop() || route.file_path
      parts.push(`<br/><small>${fileName}</small>`)
    }

    return parts.join('<br/>')
  }

  /**
   * Format a node with the specified shape
   */
  private formatNode(nodeId: string, content: string): string {
    const escapedContent = content.replace(/"/g, '#quot;')
    
    switch (this.config.nodeShape) {
      case 'round':
        return `${nodeId}("${escapedContent}")`
      case 'circle':
        return `${nodeId}(("${escapedContent}"))`
      case 'rhombus':
        return `${nodeId}{"${escapedContent}"}`
      case 'rect':
      default:
        return `${nodeId}["${escapedContent}"]`
    }
  }

  /**
   * Get parent path for hierarchy
   */
  private getParentPath(path: string): string | null {
    if (path === '/' || path === '') return null
    
    const segments = path.split('/').filter(Boolean)
    if (segments.length <= 1) return '/'
    
    return '/' + segments.slice(0, -1).join('/')
  }

  /**
   * Generate styling for the diagram
   */
  private generateStyling(): string[] {
    const styles: string[] = []
    
    styles.push('    %% Styling')
    styles.push('    classDef routeNode fill:#e1f5fe,stroke:#01579b,stroke-width:2px,color:#000')
    styles.push('    classDef homeNode fill:#f3e5f5,stroke:#4a148c,stroke-width:3px,color:#000')
    styles.push('    classDef apiNode fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px,color:#000')
    styles.push('')
    styles.push('    %% Apply classes')
    styles.push('    class route1 homeNode')
    
    return styles
  }

  /**
   * Generate empty diagram
   */
  private generateEmptyDiagram(): string {
    return `flowchart ${this.config.direction}
    empty["No routes found"]
    
    classDef emptyNode fill:#ffebee,stroke:#c62828,stroke-width:2px,color:#000
    class empty emptyNode`
  }

  /**
   * Get framework display name
   */
  private getFrameworkDisplayName(framework: string): string {
    switch (framework) {
      case 'nextjs-app': return 'Next.js App Router'
      case 'nextjs-pages': return 'Next.js Pages Router'
      case 'react-router': return 'React Router'
      default: return 'Unknown Framework'
    }
  }

  /**
   * Generate Mermaid configuration
   */
  generateMermaidConfig(): string {
    return `{
  "theme": "${this.config.theme}",
  "flowchart": {
    "curve": "basis",
    "padding": 20
  },
  "themeVariables": {
    "primaryColor": "#e1f5fe",
    "primaryTextColor": "#000",
    "primaryBorderColor": "#01579b",
    "lineColor": "#01579b",
    "secondaryColor": "#f3e5f5",
    "tertiaryColor": "#e8f5e8"
  }
}`
  }
}

/**
 * Utility function to create a Mermaid converter with default settings
 */
export function createMermaidConverter(config?: Partial<MermaidConfig>): MermaidConverter {
  return new MermaidConverter(config)
}

/**
 * Quick conversion function
 */
export function convertRoutesToMermaid(
  routeData: RouteData[], 
  framework?: string, 
  config?: Partial<MermaidConfig>
): string {
  const converter = createMermaidConverter(config)
  return converter.convertToMermaid(routeData, framework)
}
