/**
 * Shared graph helpers for knowledge, lineage, and workflow canvases.
 */

export interface GraphPoint {
  x: number
  y: number
}

export interface GraphNodeBase {
  id: string
  label: string
  x: number
  y: number
}

export interface GraphEdgeBase {
  id: string
  from: string
  to: string
  label?: string
}

export function clampZoom(zoom: number, min = 0.55, max = 1.8): number {
  return Math.min(max, Math.max(min, Number(zoom.toFixed(2))))
}

export function radarPoint(index: number, total: number, radius: number, cx: number, cy: number, value = 1): GraphPoint {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / total
  return {
    x: cx + Math.cos(angle) * radius * value,
    y: cy + Math.sin(angle) * radius * value,
  }
}

export function edgePath(
  from: GraphPoint,
  to: GraphPoint,
  curved = false,
): string {
  if (!curved) return `M ${from.x} ${from.y} L ${to.x} ${to.y}`
  const mx = (from.x + to.x) / 2
  const my = (from.y + to.y) / 2 - 24
  return `M ${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}`
}

export function filterGraph<TNode extends GraphNodeBase, TEdge extends GraphEdgeBase>(
  nodes: TNode[],
  edges: TEdge[],
  predicate: (node: TNode) => boolean,
): { nodes: TNode[]; edges: TEdge[] } {
  const filteredNodes = nodes.filter(predicate)
  const ids = new Set(filteredNodes.map((node) => node.id))
  return {
    nodes: filteredNodes,
    edges: edges.filter((edge) => ids.has(edge.from) && ids.has(edge.to)),
  }
}

export function relatedEdges<TEdge extends GraphEdgeBase>(edges: TEdge[], nodeId: string): TEdge[] {
  return edges.filter((edge) => edge.from === nodeId || edge.to === nodeId)
}

export function impactClosure<TEdge extends GraphEdgeBase>(
  edges: TEdge[],
  startId: string,
  direction: 'downstream' | 'upstream' | 'both' = 'downstream',
): string[] {
  const result = new Set<string>([startId])
  const queue = [startId]
  while (queue.length > 0) {
    const current = queue.shift()!
    for (const edge of edges) {
      let next: string | null = null
      if ((direction === 'downstream' || direction === 'both') && edge.from === current) next = edge.to
      if ((direction === 'upstream' || direction === 'both') && edge.to === current) next = edge.from
      if (next && !result.has(next)) {
        result.add(next)
        queue.push(next)
      }
    }
  }
  return [...result]
}
