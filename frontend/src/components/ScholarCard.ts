/**
 * Scholar Card & Detail Modal
 */

import type { Scholar } from '../scholars'
import { renderScholarAvatar } from '../utils/avatars'

function escapeHtml(s: string): string {
  const div = document.createElement('div')
  div.textContent = s
  return div.innerHTML
}

// Render Scholar Header (für Brief-View)
export function renderScholarHeader(scholar: Scholar): string {
  const avatar = renderScholarAvatar(scholar.id, scholar.name, 'medium')
  
  return `
    <div class="scholar-header">
      <div data-scholar-id="${scholar.id}">
        ${avatar}
      </div>
      <div class="scholar-info" data-scholar-id="${scholar.id}">
        <h3 class="scholar-name">${escapeHtml(scholar.name)}</h3>
        <p class="scholar-field">${escapeHtml(scholar.fieldOfStudy)}</p>
        <p class="scholar-era">${escapeHtml(scholar.era)}</p>
      </div>
      <div class="scholar-badge">Aus dem Jenseits</div>
    </div>
  `
}

// Render Scholar Detail Modal
export function renderScholarModal(scholar: Scholar): string {
  const avatarLarge = renderScholarAvatar(scholar.id, scholar.name, 'large')
  
  return `
    <div class="modal-overlay" id="scholar-modal">
      <div class="modal-content scholar-modal">
        <button type="button" class="modal-close" aria-label="Schließen">×</button>
        
        <div class="scholar-modal-header">
          ${avatarLarge}
          <div>
            <h2 class="scholar-modal-name">${escapeHtml(scholar.name)}</h2>
            <p class="scholar-modal-era">${escapeHtml(scholar.era)}</p>
          </div>
        </div>
        
        <div class="scholar-modal-body">
          <div class="scholar-detail-section">
            <h3>Fachgebiet</h3>
            <p><strong>${escapeHtml(scholar.fieldOfStudy)}</strong></p>
            <p class="scholar-category">${escapeHtml(scholar.category)}</p>
          </div>
          
          <div class="scholar-detail-section">
            <h3>Expertise</h3>
            <ul class="scholar-expertise-list">
              ${scholar.expertise.map(e => `<li>${escapeHtml(e)}</li>`).join('')}
            </ul>
          </div>
          
          <div class="scholar-detail-section">
            <h3>Über ${escapeHtml(scholar.name)}</h3>
            <p class="scholar-bio">${escapeHtml(scholar.bio)}</p>
          </div>
        </div>
      </div>
    </div>
  `
}

// Show Scholar Modal
export function showScholarModal(scholar: Scholar): void {
  const existing = document.getElementById('scholar-modal')
  if (existing) existing.remove()
  
  const modalHtml = renderScholarModal(scholar)
  document.body.insertAdjacentHTML('beforeend', modalHtml)
  
  const modal = document.getElementById('scholar-modal')!
  const closeBtn = modal.querySelector('.modal-close')!
  const overlay = modal
  
  // Close handlers
  closeBtn.addEventListener('click', () => modal.remove())
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) modal.remove()
  })
  
  // ESC key
  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      modal.remove()
      document.removeEventListener('keydown', handleEsc)
    }
  }
  document.addEventListener('keydown', handleEsc)
}

// Bind Scholar Click Events
export function bindScholarClicks(container: HTMLElement, scholar: Scholar): void {
  const clickables = container.querySelectorAll('[data-scholar-id]')
  clickables.forEach(el => {
    el.addEventListener('click', () => showScholarModal(scholar))
  })
}
