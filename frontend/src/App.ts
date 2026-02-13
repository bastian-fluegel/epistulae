/**
 * App-Einstieg: Brief-UI + Auth + Offline-Sync.
 *
 * Python-Vergleich: Das wäre in Python typischerweise ein Template (Jinja)
 * plus API-Routen. Hier rendern wir alles im Client (statischer Export,
 * keine Server-Routes) – gleiche UI-Logik, nur in TS statt in Python.
 */
import {
  getFirebaseAuth,
  onAuthChange,
  signInWithGoogle,
  signOut,
  setUserProgress,
  getUserProgress,
  type UserProgress,
} from './firebase'
import { getOfflineProgress, setOfflineProgress } from './sync'

// Statischer erster Brief (später aus Firestore oder lokalem Content)
const ERSTER_BRIEF = {
  id: 'brief-1',
  text: `Grüße, Freund! Ich bin durch eine mir unerklärliche Laune der Götter
in eure Zeit geworfen worden. Alles hier verwirrt mich: die leuchtenden
Schachteln, in die die Menschen starr blicken; die Wagen ohne Pferde;
die Fülle an Dingen, die niemand zu brauchen scheint und doch begehrt.
Sag mir – was hält diese Welt im Innersten zusammen? Und was hält dich?`,
  antworten: [
    'Vielleicht hält uns gar nichts – wir rennen einfach mit.',
    'Ich denke, es geht um Verbindung: zu anderen, zu etwas, das größer ist als man selbst.',
    'Die Frage stelle ich mir auch. Vielleicht ist das Suchen schon die halbe Antwort.',
  ],
}

function renderLetter(brief: typeof ERSTER_BRIEF): string {
  const answersHtml = brief.antworten
    .map(
      (a, i) =>
        `<li><button type="button" class="answer-btn" data-answer="${i + 1}">${escapeHtml(a)}</button></li>`
    )
    .join('')
  return `
    <div class="letter-meta">Ein Brief von Sokrates</div>
    <div class="letter-body">${escapeHtml(brief.text)}</div>
    <p class="letter-prompt">Wie möchtest du antworten?</p>
    <ul class="answers">${answersHtml}</ul>
  `
}

function escapeHtml(s: string): string {
  const div = document.createElement('div')
  div.textContent = s
  return div.innerHTML
}

function renderAuthBar(user: { email: string | null } | null): string {
  if (user)
    return `
      <div class="auth-bar">
        <span class="user-email">${escapeHtml(user.email || '')}</span>
        <button type="button" class="btn-logout">Abmelden</button>
      </div>
    `
  return `
    <div class="auth-bar">
      <button type="button" class="btn-login">Mit Google anmelden</button>
    </div>
  `
}

function render(): string {
  return `
    <header class="header">
      <h1 class="title">Epistulae</h1>
      <p class="subtitle">Briefe aus der Gegenwart</p>
    </header>
    <main class="letter" id="letter-main">
      ${renderLetter(ERSTER_BRIEF)}
    </main>
    <footer class="footer">
      <p>Keine richtige Antwort – nur deine.</p>
    </footer>
  `
}

async function syncProgressToFirestore(uid: string, progress: Partial<UserProgress>): Promise<void> {
  try {
    await setUserProgress(uid, progress)
  } catch (e) {
    console.warn('Firestore sync failed (offline?):', e)
    // In Python: würde man z.B. in eine Queue schreiben für späteren Retry
  }
}

function bindAnswerButtons(): void {
  document.querySelectorAll('.answer-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const answerIndex = (btn as HTMLButtonElement).getAttribute('data-answer')
      if (!answerIndex) return
      const choice = Number(answerIndex)
      ;(btn as HTMLButtonElement).setAttribute('aria-pressed', 'true')
      ;(btn as HTMLButtonElement).style.borderColor = 'var(--accent)'

        const progress = {
          lastLetterId: ERSTER_BRIEF.id,
          chosenAnswers: { [ERSTER_BRIEF.id]: choice },
        }
        setOfflineProgress(progress)

      const user = getFirebaseAuth().currentUser
      if (user) await syncProgressToFirestore(user.uid, progress)
    })
  })
}

function mount(): void {
  const root = document.getElementById('app')
  if (!root) return

  root.innerHTML = `
    <div class="page" id="page-root">
      <div id="auth-bar-container"></div>
      ${render()}
    </div>
  `
  const page = document.getElementById('page-root')!
  const authBarEl = document.getElementById('auth-bar-container')!

  function updateAuthBar(html: string): void {
    authBarEl.innerHTML = html
    const loginBtn = authBarEl.querySelector('.btn-login')
    const logoutBtn = authBarEl.querySelector('.btn-logout')
    if (loginBtn) loginBtn.addEventListener('click', () => signInWithGoogle())
    if (logoutBtn) logoutBtn.addEventListener('click', () => signOut())
  }

  onAuthChange((user) => {
    updateAuthBar(renderAuthBar(user))
    if (user) {
      getUserProgress(user.uid).then((remote) => {
        const local = getOfflineProgress()
        if (!local?.lastLetterId) return
        const remoteTime = remote?.updatedAt && typeof (remote.updatedAt as { seconds?: number }).seconds === 'number'
          ? (remote.updatedAt as { seconds: number }).seconds * 1000
          : 0
        const localTime = new Date(local.updatedAt).getTime()
        if (localTime > remoteTime) {
          syncProgressToFirestore(user.uid, {
            lastLetterId: local.lastLetterId,
            chosenAnswers: local.chosenAnswers,
          })
        }
      })
    }
  })

  updateAuthBar(renderAuthBar(null))
  bindAnswerButtons()
}

export function initApp(): void {
  mount()
}
