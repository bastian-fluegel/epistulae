/**
 * App: Orchestriert Auth, Onboarding, Views
 */
import {
  getFirebaseAuth,
  onAuthChange,
  signInWithGoogle,
  handleRedirectResult,
  signOut,
  getUserProfile,
  setUserProfile,
  getUserProgress,
  setUserProgress,
  type UserProfile,
  type UserProgress,
} from './firebase'
import { getLetter, getFirstLetterId, getNextLetterId, getLetterCount } from './letters'
import { getOfflineProgress, setOfflineProgress } from './sync'
import { renderHUD, bindHUD, type View } from './components/HUD'
import { showLetter, showWaiting, showEnd } from './views/LetterView'
import { showProgress } from './views/ProgressView'
import { showProfile } from './views/ProfileView'

function escapeHtml(s: string): string {
  const div = document.createElement('div')
  div.textContent = s
  return div.innerHTML
}

export function initApp(): void {
  const root = document.getElementById('app')
  if (!root) return

  // State
  let authLoading = false
  let authError: string | null = null
  let profile: UserProfile | null = null
  let progress: UserProgress | null = null
  let currentView: View = 'letter'

  // Layout
  root.innerHTML = `
    <div class="page">
      <div id="auth-bar"></div>
      <div id="hud"></div>
      <div id="content">
        <header class="header">
          <h1 class="title">Epistulae</h1>
          <p class="subtitle">Briefe aus der Gegenwart</p>
        </header>
        <main id="main"></main>
        <footer class="footer">
          <p>Keine richtige Antwort – nur deine.</p>
        </footer>
      </div>
    </div>
  `

  const authBarEl = document.getElementById('auth-bar')!
  const hudEl = document.getElementById('hud')!
  const mainEl = document.getElementById('main')!

  // ============================================
  // AUTH
  // ============================================

  async function handleLogin(): Promise<void> {
    authError = null
    authLoading = true
    updateAuthBar()
    try {
      await signInWithGoogle()
    } catch (e) {
      const msg = e instanceof Error ? e.message : ''
      if (msg === 'REDIRECT') return
      if (msg === 'UNAUTHORIZED_DOMAIN') {
        authError = 'Diese Domain ist in Firebase nicht freigegeben.'
      } else if (msg === 'CONFIGURATION_NOT_FOUND') {
        authError = 'Firebase Authentication ist nicht eingerichtet.'
      } else {
        authError = 'Anmeldung fehlgeschlagen. Popup erlauben oder Seite neu laden.'
      }
    } finally {
      authLoading = false
      updateAuthBar()
    }
  }

  function updateAuthBar(): void {
    const user = getFirebaseAuth().currentUser
    
    if (authError) {
      authBarEl.innerHTML = `
        <div class="auth-bar">
          <span class="auth-error">${escapeHtml(authError)}</span>
          <button type="button" class="btn-login">Erneut versuchen</button>
        </div>
      `
    } else if (user) {
      authBarEl.innerHTML = `
        <div class="auth-bar">
          <span class="user-email">${escapeHtml(user.email || '')}</span>
          <button type="button" class="btn-logout">Abmelden</button>
        </div>
      `
    } else {
      authBarEl.innerHTML = `
        <div class="auth-bar">
          <button type="button" class="btn-login" ${authLoading ? 'disabled' : ''}>
            ${authLoading ? 'Wird angemeldet…' : 'Mit Google anmelden'}
          </button>
        </div>
      `
    }

    // Bind buttons
    const loginBtn = authBarEl.querySelector('.btn-login')
    const logoutBtn = authBarEl.querySelector('.btn-logout')
    if (loginBtn) loginBtn.addEventListener('click', () => handleLogin())
    if (logoutBtn) logoutBtn.addEventListener('click', () => signOut())

    // Update login gate if in auth view
    const gate = mainEl.querySelector('.btn-login')
    if (gate && !gate.hasAttribute('disabled')) {
      gate.addEventListener('click', () => handleLogin())
    }
  }

  function showAuthGate(): void {
    const btnLabel = authLoading ? 'Wird angemeldet…' : 'Mit Google anmelden'
    const errorBlock = authError
      ? `<p class="auth-gate-error" role="alert">${escapeHtml(authError)}</p>`
      : ''

    mainEl.innerHTML = `
      <div class="auth-gate">
        <div class="auth-gate-card">
          <h2 class="auth-gate-title">Anmelden</h2>
          <p class="auth-gate-text">Die Briefe von Sokrates sind nur für dich sichtbar. Melde dich mit Google an, um Epistulae zu nutzen.</p>
          ${errorBlock}
          <button type="button" class="btn-login btn-login-primary" ${authLoading ? 'disabled' : ''}>
            ${escapeHtml(btnLabel)}
          </button>
        </div>
      </div>
    `

    const btn = mainEl.querySelector('.btn-login')
    if (btn && !btn.hasAttribute('disabled')) {
      btn.addEventListener('click', () => handleLogin())
    }
  }

  // ============================================
  // ONBOARDING
  // ============================================

  function showOnboarding(): void {
    hudEl.innerHTML = ''
    mainEl.innerHTML = `
      <div class="onboarding-wrap">
        <div class="onboarding">
          <h2 class="onboarding-title">Willkommen bei Epistulae</h2>
          <p class="onboarding-intro">Damit Sokrates dir passende Briefe schreiben kann, brauchen wir ein paar Angaben von dir.</p>
          <form id="onboarding-form" class="onboarding-form">
            <label>Wie sollen wir dich nennen?</label>
            <input type="text" name="displayName" required placeholder="Name oder Spitzname" maxlength="50">
            
            <label>Alter</label>
            <input type="number" name="age" required min="10" max="120" placeholder="z.B. 28">
            
            <label>Was möchtest du gerne lernen oder vertiefen?</label>
            <textarea name="wantToLearn" rows="3" placeholder="Kurz beschreiben …" maxlength="500"></textarea>
            
            <label>Wie würdest du dich selbst in wenigen Sätzen beschreiben?</label>
            <textarea name="selfDescription" rows="4" placeholder="Deine Selbstbeschreibung …" maxlength="800"></textarea>
            
            <button type="submit" class="btn-submit">Starten</button>
          </form>
        </div>
      </div>
    `

    const form = document.getElementById('onboarding-form') as HTMLFormElement
    const user = getFirebaseAuth().currentUser
    if (!user || !form) return

    form.addEventListener('submit', async (e) => {
      e.preventDefault()
      const data = new FormData(form)
      const displayName = (data.get('displayName') as string)?.trim() || 'Du'
      const age = Number(data.get('age')) || 0
      const wantToLearn = (data.get('wantToLearn') as string)?.trim() || ''
      const selfDescription = (data.get('selfDescription') as string)?.trim() || ''

      await setUserProfile(user.uid, { displayName, age, wantToLearn, selfDescription })
      profile = { displayName, age, wantToLearn, selfDescription }
      
      navigateToView('letter')
    })
  }

  // ============================================
  // VIEWS
  // ============================================

  function updateHUD(): void {
    if (!profile) return
    const letterCount = getLetterCount(progress?.letterHistory ?? [])
    hudEl.innerHTML = renderHUD({ displayName: profile.displayName, letterCount, currentView, onNavigate: navigateToView })
    bindHUD(hudEl, navigateToView)
  }

  function navigateToView(view: View): void {
    currentView = view
    updateHUD()

    if (view === 'letter') showLetterView()
    else if (view === 'progress') showProgressView()
    else if (view === 'profile') showProfileView()
  }

  function showLetterView(): void {
    const currentId = progress?.lastLetterId || getFirstLetterId()
    const letter = getLetter(currentId)

    if (!letter) {
      showEnd(mainEl)
      return
    }

    showLetter(mainEl, letter, async (answerIndex) => {
      const user = getFirebaseAuth().currentUser
      if (!user) return

      // Save progress
      const history = [...(progress?.letterHistory ?? []), { letterId: currentId, chosenIndex: answerIndex }]
      const nextId = getNextLetterId(currentId, answerIndex)
      
      const newProgress: Partial<UserProgress> = {
        lastLetterId: nextId || currentId,
        chosenAnswers: { ...progress?.chosenAnswers, [currentId]: answerIndex },
        letterHistory: history,
      }

      setOfflineProgress({ lastLetterId: newProgress.lastLetterId, chosenAnswers: newProgress.chosenAnswers })
      await setUserProgress(user.uid, newProgress)
      progress = { ...progress, ...newProgress } as UserProgress
      updateHUD()

      // End or next letter?
      if (!nextId) {
        showEnd(mainEl)
        return
      }

      // Waiting animation → next letter
      showWaiting(mainEl, () => {
        const nextLetter = getLetter(nextId)
        if (nextLetter) {
          showLetter(mainEl, nextLetter, (idx) => showLetterView())
        } else {
          showEnd(mainEl)
        }
      })
    })
  }

  function showProgressView(): void {
    const letterHistory = progress?.letterHistory ?? []
    showProgress(mainEl, letterHistory)
  }

  function showProfileView(): void {
    if (!profile) return
    const letterCount = getLetterCount(progress?.letterHistory ?? [])
    showProfile(mainEl, {
      displayName: profile.displayName,
      age: profile.age,
      wantToLearn: profile.wantToLearn,
      selfDescription: profile.selfDescription,
      letterCount,
    })
  }

  // ============================================
  // AUTH FLOW
  // ============================================

  async function handleAuthChange(): Promise<void> {
    const user = getFirebaseAuth().currentUser

    if (!user) {
      profile = null
      progress = null
      hudEl.innerHTML = ''
      showAuthGate()
      return
    }

    // Load profile & progress
    const [loadedProfile, loadedProgress] = await Promise.all([
      getUserProfile(user.uid),
      getUserProgress(user.uid),
    ])

    profile = loadedProfile
    progress = loadedProgress

    // Sync offline progress
    const local = getOfflineProgress()
    if (local?.lastLetterId && progress) {
      const remoteTs =
        progress.updatedAt && typeof progress.updatedAt === 'object' && 'seconds' in progress.updatedAt
          ? (progress.updatedAt as { seconds: number }).seconds * 1000
          : 0
      const localTime = new Date(local.updatedAt).getTime()
      if (localTime > remoteTs) {
        await setUserProgress(user.uid, {
          lastLetterId: local.lastLetterId,
          chosenAnswers: local.chosenAnswers,
        })
        progress = (await getUserProgress(user.uid)) ?? progress
      }
    }

    // Show onboarding or main app
    if (!profile) {
      showOnboarding()
    } else {
      navigateToView('letter')
    }
  }

  // ============================================
  // INIT
  // ============================================

  try {
    getFirebaseAuth()
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Firebase nicht geladen.'
    authBarEl.innerHTML = `
      <div class="auth-bar">
        <span class="auth-error">${escapeHtml(msg)}</span>
      </div>
      <p style="margin:1rem 0;font-size:0.9rem;color:#666;">
        In <code>frontend/.env</code> die Werte aus der Firebase Console eintragen.
      </p>
    `
    return
  }

  updateAuthBar()
  onAuthChange(() => {
    authError = null
    updateAuthBar()
    handleAuthChange()
  })

  handleRedirectResult().then((user) => {
    if (user) {
      authError = null
      updateAuthBar()
      handleAuthChange()
    }
  })

  // Initial view
  const user = getFirebaseAuth().currentUser
  if (user) {
    handleAuthChange()
  } else {
    showAuthGate()
  }
}
