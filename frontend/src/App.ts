/**
 * App: Brief-UI, Auth-Bar, Offline-Sync mit Firestore.
 */
import {
  getFirebaseAuth,
  onAuthChange,
  signInWithGoogle,
  handleRedirectResult,
  signOut,
  setUserProgress,
  getUserProgress,
  type UserProgress,
} from './firebase'
import { getOfflineProgress, setOfflineProgress } from './sync'

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

function escapeHtml(s: string): string {
  const div = document.createElement('div')
  div.textContent = s
  return div.innerHTML
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

function renderAuthBar(user: { email: string | null } | null, loading: boolean, error: string | null): string {
  if (error) {
    return `
      <div class="auth-bar">
        <span class="auth-error">${escapeHtml(error)}</span>
        <button type="button" class="btn-login">Erneut versuchen</button>
      </div>
    `
  }
  if (user) {
    return `
      <div class="auth-bar">
        <span class="user-email">${escapeHtml(user.email || '')}</span>
        <button type="button" class="btn-logout">Abmelden</button>
      </div>
    `
  }
  return `
    <div class="auth-bar">
      <button type="button" class="btn-login" ${loading ? 'disabled' : ''}>
        ${loading ? 'Wird angemeldet…' : 'Mit Google anmelden'}
      </button>
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
  } catch {
    // Offline oder Fehler – bleibt lokal
  }
}

function bindAnswerButtons(updateAuthBar: () => void): void {
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

  let authLoading = false
  let authError: string | null = null

  root.innerHTML = `
    <div class="page" id="page-root">
      <div id="auth-bar-container"></div>
      ${render()}
    </div>
  `
  const page = document.getElementById('page-root')!
  const authBarEl = document.getElementById('auth-bar-container')!

  try {
    getFirebaseAuth()
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Firebase nicht geladen.'
    authBarEl.innerHTML = `<div class="auth-bar"><span class="auth-error">${escapeHtml(msg)}</span></div><p style="margin:1rem 0;font-size:0.9rem;color:#666;">In <code>frontend/.env</code> die Werte aus der Firebase Console eintragen (Projekteinstellungen → Web-App).</p>`
    bindAnswerButtons(() => {})
    return
  }

  function updateAuthBar(): void {
    const user = getFirebaseAuth().currentUser
    authBarEl.innerHTML = renderAuthBar(user, authLoading, authError)
    const loginBtn = authBarEl.querySelector('.btn-login')
    const logoutBtn = authBarEl.querySelector('.btn-logout')
    if (loginBtn && !loginBtn.hasAttribute('disabled')) {
      loginBtn.addEventListener('click', async () => {
        authError = null
        authLoading = true
        updateAuthBar()
        try {
          await signInWithGoogle()
        } catch (e) {
          const msg = e instanceof Error ? e.message : ''
          if (msg === 'REDIRECT') return
          if (msg === 'UNAUTHORIZED_DOMAIN') {
            authError = 'Diese Domain ist in Firebase nicht freigegeben. In der Console unter Authentication → Einstellungen → Authorized domains hinzufügen.'
          } else if (msg === 'CONFIGURATION_NOT_FOUND') {
            authError = 'Firebase Authentication ist nicht eingerichtet. In der Firebase Console: Build → Authentication → Get started, dann unter Sign-in method „Google“ aktivieren.'
          } else {
            authError = 'Anmeldung fehlgeschlagen. Popup blockiert? Bitte erlauben oder Seite neu laden.'
          }
        } finally {
          authLoading = false
          updateAuthBar()
        }
      })
    }
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => signOut())
    }
  }

  onAuthChange((user) => {
    authError = null
    updateAuthBar()
    if (user) {
      getUserProgress(user.uid).then((remote) => {
        const local = getOfflineProgress()
        if (!local?.lastLetterId) return
        const remoteTs = remote?.updatedAt && typeof remote.updatedAt === 'object' && 'seconds' in remote.updatedAt
          ? (remote.updatedAt as { seconds: number }).seconds * 1000
          : 0
        const localTime = new Date(local.updatedAt).getTime()
        if (localTime > remoteTs) {
          syncProgressToFirestore(user.uid, {
            lastLetterId: local.lastLetterId,
            chosenAnswers: local.chosenAnswers,
          })
        }
      })
    }
  })

  handleRedirectResult().then((user) => {
    if (user) authError = null
    updateAuthBar()
  })

  updateAuthBar()
  bindAnswerButtons(updateAuthBar)
}

export function initApp(): void {
  mount()
}
