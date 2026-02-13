/**
 * Progress View: Zeigt beantwortete Briefe
 */

import type { AnsweredLetter } from '../App'

function escapeHtml(s: string): string {
  const div = document.createElement('div')
  div.textContent = s
  return div.innerHTML
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'Gerade eben'
  if (diffMins < 60) return `Vor ${diffMins} Min`
  
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `Vor ${diffHours}h`
  
  const diffDays = Math.floor(diffHours / 24)
  return `Vor ${diffDays} Tag${diffDays > 1 ? 'en' : ''}`
}

export function renderProgress(letters: AnsweredLetter[]): string {
  if (letters.length === 0) {
    return `
      <div class="progress-view">
        <h2>Dein Fortschritt</h2>
        <div class="empty-state">
          <p>Du hast noch keine Briefe beantwortet.</p>
          <p style="margin-top:0.5rem;">Deine Konversation mit den Gelehrten beginnt hier.</p>
        </div>
      </div>
    `
  }

  const lettersHtml = letters
    .map((letter, i) => {
      const number = i + 1
      return `
        <div class="progress-letter-card">
          <div class="progress-letter-header">
            <span class="progress-letter-number">#${number}</span>
            <span class="progress-letter-scholar">${escapeHtml(letter.scholarName)}</span>
            <span class="progress-letter-time">${formatDate(letter.answeredAt)}</span>
          </div>
          <div class="progress-letter-excerpt">
            ${escapeHtml(letter.text.substring(0, 150))}${letter.text.length > 150 ? '…' : ''}
          </div>
          <div class="progress-letter-answer">
            <strong>Deine Antwort:</strong><br>
            ${escapeHtml(letter.answer)}
          </div>
        </div>
      `
    })
    .reverse() // Neueste zuerst
    .join('')

  return `
    <div class="progress-view">
      <h2>Dein Fortschritt</h2>
      <p class="progress-subtitle">${letters.length} Brief${letters.length !== 1 ? 'e' : ''} beantwortet</p>
      <div class="progress-letters">
        ${lettersHtml}
      </div>
    </div>
  `
}

export function showProgress(container: HTMLElement, letters: AnsweredLetter[]): void {
  container.innerHTML = renderProgress(letters)
}
