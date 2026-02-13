/**
 * Scholars View: Übersicht aller Gelehrten
 */

import { getAllScholars, type Scholar } from '../scholars'
import { showScholarModal } from '../components/ScholarCard'
import { renderScholarAvatar } from '../utils/avatars'

function escapeHtml(s: string): string {
  const div = document.createElement('div')
  div.textContent = s
  return div.innerHTML
}

function renderScholarCard(scholar: Scholar): string {
  const avatar = renderScholarAvatar(scholar.id, scholar.name, 'medium')

  return `
    <div class="scholar-grid-card" data-scholar-id="${scholar.id}">
      ${avatar}
      <h3 class="scholar-grid-name">${escapeHtml(scholar.name)}</h3>
      <p class="scholar-grid-field">${escapeHtml(scholar.fieldOfStudy)}</p>
      <p class="scholar-grid-era">${escapeHtml(scholar.era)}</p>
      <p class="scholar-grid-category">${escapeHtml(scholar.category)}</p>
    </div>
  `
}

export function renderScholars(): string {
  const scholars = getAllScholars()
  
  // Gruppiere nach Kategorie
  const categories: Record<string, Scholar[]> = {}
  scholars.forEach(s => {
    if (!categories[s.category]) categories[s.category] = []
    categories[s.category].push(s)
  })

  const categoriesHtml = Object.entries(categories)
    .map(([category, scholars]) => `
      <div class="scholar-category-section">
        <h3 class="scholar-category-title">${escapeHtml(category)}</h3>
        <div class="scholar-grid">
          ${scholars.map(s => renderScholarCard(s)).join('')}
        </div>
      </div>
    `)
    .join('')

  return `
    <div class="scholars-view">
      <h2>Die Gelehrten</h2>
      <p class="scholars-intro">
        ${scholars.length} weise Köpfe der Antike schreiben dir aus dem Jenseits. 
        Klicke auf einen Gelehrten um mehr zu erfahren.
      </p>
      ${categoriesHtml}
    </div>
  `
}

export function showScholars(container: HTMLElement): void {
  container.innerHTML = renderScholars()
  
  const scholars = getAllScholars()
  
  // Bind clicks
  container.querySelectorAll('[data-scholar-id]').forEach(card => {
    const scholarId = (card as HTMLElement).getAttribute('data-scholar-id')
    const scholar = scholars.find(s => s.id === scholarId)
    
    if (scholar) {
      card.addEventListener('click', () => showScholarModal(scholar))
    }
  })
}
