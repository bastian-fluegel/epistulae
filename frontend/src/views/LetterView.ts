/**
 * LetterView: Brief anzeigen, Antworten, Warte-Animation, nächster Brief
 */
import type { Letter } from '../letters'

const TYPEWRITER_MS = 25

function escapeHtml(s: string): string {
  const div = document.createElement('div')
  div.textContent = s
  return div.innerHTML
}

function typewriter(el: HTMLElement, text: string, onDone: () => void): void {
  el.textContent = ''
  el.classList.add('typewriter-cursor')
  let i = 0
  const run = (): void => {
    if (i < text.length) {
      el.appendChild(document.createTextNode(text[i]))
      i += 1
      setTimeout(run, TYPEWRITER_MS)
    } else {
      el.classList.remove('typewriter-cursor')
      onDone()
    }
  }
  run()
}

export function renderLetter(letter: Letter): string {
  const answersHtml = letter.antworten
    .map((a, i) => `
      <li>
        <button type="button" class="answer-btn" data-answer="${i}">
          ${escapeHtml(a)}
        </button>
      </li>
    `)
    .join('')

  return `
    <div class="letter-view">
      <div class="letter-meta">Ein Brief von Sokrates</div>
      <div class="letter-body"></div>
      <p class="letter-prompt" style="visibility:hidden">Wie möchtest du antworten?</p>
      <ul class="answers" style="visibility:hidden">${answersHtml}</ul>
    </div>
  `
}

export function renderWaiting(): string {
  return `
    <div class="waiting-view">
      <div class="waiting-icon">✍️</div>
      <p class="waiting-text">Sokrates liest deinen Brief und wird dir bald einen neuen schreiben…</p>
      <div class="waiting-dots">
        <span></span><span></span><span></span>
      </div>
    </div>
  `
}

export function renderEnd(): string {
  return `
    <div class="end-view">
      <h3 class="end-title">Bis hierher</h3>
      <p class="end-text">Für diesmal reicht es. Du hast einen Weg beschritten – den nächsten Brief findest du, wenn du bereit bist.</p>
      <p class="end-hint">Schau dir deinen Fortschritt im Baum an oder besuche dein Profil.</p>
    </div>
  `
}

export function showLetter(
  container: HTMLElement,
  letter: Letter,
  onAnswerClick: (index: number) => void
): void {
  container.innerHTML = renderLetter(letter)
  
  const bodyEl = container.querySelector('.letter-body') as HTMLElement
  const promptEl = container.querySelector('.letter-prompt') as HTMLElement
  const answersEl = container.querySelector('.answers') as HTMLElement
  
  if (!bodyEl) return
  
  typewriter(bodyEl, letter.text, () => {
    if (promptEl) promptEl.style.visibility = ''
    if (answersEl) answersEl.style.visibility = ''
    
    // Bind answer buttons
    container.querySelectorAll('.answer-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt((btn as HTMLElement).getAttribute('data-answer') || '-1', 10)
        if (idx >= 0) {
          // Mark selected
          ;(btn as HTMLButtonElement).style.borderColor = 'var(--accent)'
          ;(btn as HTMLButtonElement).setAttribute('aria-pressed', 'true')
          
          // Disable all buttons
          container.querySelectorAll('.answer-btn').forEach(b => {
            ;(b as HTMLButtonElement).disabled = true
          })
          
          onAnswerClick(idx)
        }
      })
    })
  })
}

export function showWaiting(container: HTMLElement, onComplete: () => void): void {
  container.innerHTML = renderWaiting()
  setTimeout(onComplete, 2500)
}

export function showEnd(container: HTMLElement): void {
  container.innerHTML = renderEnd()
}
