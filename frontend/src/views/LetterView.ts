/**
 * LetterView: Brief anzeigen, Antworten, Warte-Animation, nächster Brief
 */
import type { Letter } from '../letters'
import type { Scholar } from '../scholars'
import { renderScholarHeader, bindScholarClicks } from '../components/ScholarCard'

const TYPEWRITER_MS = 25

function escapeHtml(s: string): string {
  const div = document.createElement('div')
  div.textContent = s
  return div.innerHTML
}

// Extended Letter Type mit Scholar
export interface LetterWithScholar extends Letter {
  scholar?: Scholar
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

export function renderLetter(letter: Letter | LetterWithScholar): string {
  const answersHtml = letter.antworten
    .map((a, i) => `
      <li>
        <button type="button" class="answer-btn-suggestion" data-answer="${i}">
          ${escapeHtml(a)}
        </button>
      </li>
    `)
    .join('')

  const scholarHeader = ('scholar' in letter && letter.scholar)
    ? renderScholarHeader(letter.scholar)
    : '<div class="letter-meta">Ein Brief aus dem Jenseits</div>'

  return `
    <div class="letter-view">
      ${scholarHeader}
      <div class="letter-body"></div>
      <div class="answer-section" style="visibility:hidden">
        <p class="letter-prompt">Wie möchtest du antworten?</p>
        
        <div class="answer-input-wrap">
          <textarea 
            id="custom-answer" 
            class="answer-input" 
            placeholder="Schreibe deine eigene Antwort..."
            rows="3"
            maxlength="500"></textarea>
          <button type="button" class="btn-send-answer">Antwort senden</button>
        </div>
        
        <details class="answer-suggestions">
          <summary>Oder wähle eine Antwort-Idee:</summary>
          <ul class="answers">${answersHtml}</ul>
        </details>
      </div>
    </div>
  `
}

export function renderWaiting(): string {
  return `
    <div class="waiting-view">
      <div class="waiting-icon">✍️</div>
      <p class="waiting-text">Ein Gelehrter liest deinen Brief und wird dir bald einen neuen schreiben…</p>
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
  letter: Letter | LetterWithScholar,
  onAnswerSubmit: (answerText: string) => void
): void {
  container.innerHTML = renderLetter(letter)
  
  const bodyEl = container.querySelector('.letter-body') as HTMLElement
  const answerSection = container.querySelector('.answer-section') as HTMLElement
  const customInput = container.querySelector('#custom-answer') as HTMLTextAreaElement
  const sendBtn = container.querySelector('.btn-send-answer') as HTMLButtonElement
  
  if (!bodyEl) return
  
  // Bind scholar click (if present)
  if ('scholar' in letter && letter.scholar) {
    bindScholarClicks(container, letter.scholar)
  }
  
  // TEMPORÄR: Typewriter deaktiviert, direkt anzeigen
  bodyEl.textContent = letter.text
  if (answerSection) answerSection.style.visibility = ''
  
  // Bind custom answer submit
  const submitCustomAnswer = () => {
    const text = customInput.value.trim()
    if (text.length === 0) return
    
    customInput.disabled = true
    sendBtn.disabled = true
    sendBtn.textContent = 'Wird gesendet...'
    
    onAnswerSubmit(text)
  }
  
  sendBtn.addEventListener('click', submitCustomAnswer)
  customInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      submitCustomAnswer()
    }
  })
  
  // Bind suggestion buttons (fill textarea)
  container.querySelectorAll('.answer-btn-suggestion').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt((btn as HTMLElement).getAttribute('data-answer') || '-1', 10)
      if (idx >= 0 && idx < letter.antworten.length) {
        customInput.value = letter.antworten[idx]
        customInput.focus()
        
        // Auto-scroll to input
        customInput.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
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
