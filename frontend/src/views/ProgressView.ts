/**
 * ProgressView: Fortschrittsbaum mit besuchten Briefen/Pfad
 */
import { buildProgressTree, isOnPath, type ProgressTreeNode } from '../letters'

function escapeHtml(s: string): string {
  const div = document.createElement('div')
  div.textContent = s
  return div.innerHTML
}

function renderTreeNode(
  node: ProgressTreeNode,
  letterHistory: { letterId: string; chosenIndex: number }[]
): string {
  const visited = isOnPath(letterHistory, node.letterId)
  const chosen = letterHistory.find(h => h.letterId === node.letterId)?.chosenIndex ?? -1
  const nodeClass = visited ? 'progress-node progress-node--visited' : 'progress-node'
  
  let html = `
    <div class="${nodeClass}">
      <span class="progress-node__topic">${escapeHtml(node.topic)}</span>
  `
  
  const hasChildren = node.children.some(c => c.child !== null)
  if (hasChildren) {
    html += '<div class="progress-node__children">'
    for (const { answerIndex, answerSnippet, child } of node.children) {
      if (!child) continue
      const edgeTaken = chosen === answerIndex
      html += `
        <div class="progress-edge${edgeTaken ? ' progress-edge--taken' : ''}">
          <span class="progress-edge__snippet">${escapeHtml(answerSnippet)}</span>
          ${renderTreeNode(child, letterHistory)}
        </div>
      `
    }
    html += '</div>'
  }
  
  html += '</div>'
  return html
}

export function renderProgress(letterHistory: { letterId: string; chosenIndex: number }[]): string {
  const tree = buildProgressTree()
  const treeHtml = tree
    ? renderTreeNode(tree, letterHistory)
    : '<p class="empty-state">Noch kein Fortschritt.</p>'
  
  return `
    <div class="progress-view">
      <h2 class="view-title">Dein Fortschrittsbaum</h2>
      <p class="view-intro">Jeder Brief behandelt ein anderes Thema. Jede Antwort, die du absendest, lenkt deinen Pfad.</p>
      <div class="progress-tree">${treeHtml}</div>
    </div>
  `
}

export function showProgress(
  container: HTMLElement,
  letterHistory: { letterId: string; chosenIndex: number }[]
): void {
  container.innerHTML = renderProgress(letterHistory)
}
