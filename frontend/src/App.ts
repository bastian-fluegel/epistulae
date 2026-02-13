/**
 * App: Onboarding, HUD (Name, Profil, Fortschritt), Briefe mit Typewriter.
 */
import {
  getFirebaseAuth,
  onAuthChange,
  signInWithGoogle,
  handleRedirectResult,
  signOut,
  setUserProgress,
  setUserProfile,
  getUserProgress,
  getUserProfile,
  type UserProgress,
  type UserProfile,
} from './firebase'
import { getLetter, getFirstLetterId, getNextLetterId, getLetterCount, type Letter } from './letters'
import { getOfflineProgress, setOfflineProgress } from './sync'

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

function renderAuthBar(user: { email: string | null } | null, loading: boolean, error: string | null): string {
  if (error) {
    return `<div class="auth-bar"><span class="auth-error">${escapeHtml(error)}</span><button type="button" class="btn-login">Erneut versuchen</button></div>`
  }
  if (user) {
    return `<div class="auth-bar"><span class="user-email">${escapeHtml(user.email || '')}</span><button type="button" class="btn-logout">Abmelden</button></div>`
  }
  return `<div class="auth-bar"><button type="button" class="btn-login" ${loading ? 'disabled' : ''}>${loading ? 'Wird angemeldet…' : 'Mit Google anmelden'}</button></div>`
}

function renderHud(profile: UserProfile, letterCount: number): string {
  return `
    <div class="hud">
      <span class="hud-name">Hallo, ${escapeHtml(profile.displayName)}</span>
      <span class="hud-progress">Fortschritt: ${letterCount} Brief${letterCount !== 1 ? 'e' : ''}</span>
      <button type="button" class="btn-profile">Profil</button>
    </div>
  `
}

function renderOnboarding(): string {
  return `
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
  `
}

function renderLetterArea(letter: Letter, isTyping: boolean): string {
  const answersHtml = letter.antworten
    .map((a, i) => `<li><button type="button" class="answer-btn" data-answer="${i}">${escapeHtml(a)}</button></li>`)
    .join('')
  return `
    <div class="letter-meta">Ein Brief von Sokrates</div>
    <div class="letter-body typewriter-target" data-typed="${isTyping ? '0' : '1'}">${isTyping ? '' : escapeHtml(letter.text)}</div>
    <p class="letter-prompt" style="${isTyping ? 'visibility:hidden' : ''}">Wie möchtest du antworten?</p>
    <ul class="answers" style="${isTyping ? 'visibility:hidden' : ''}">${answersHtml}</ul>
  `
}

function renderEndOfBranch(): string {
  return `
    <div class="letter-meta">Ein Brief von Sokrates</div>
    <div class="letter-body">Für diesmal reicht es. Du hast einen Weg beschritten – den nächsten Brief findest du, wenn du bereit bist. Bis dahin: denke nach, und lebe wohl.</div>
    <p class="letter-prompt">Du kannst im Profil deinen Fortschritt sehen oder dich abmelden.</p>
  `
}

function render(): string {
  return `
    <header class="header">
      <h1 class="title">Epistulae</h1>
      <p class="subtitle">Briefe aus der Gegenwart</p>
    </header>
    <main class="letter" id="letter-main"></main>
    <footer class="footer">
      <p>Keine richtige Antwort – nur deine.</p>
    </footer>
  `
}

async function syncProgressToFirestore(uid: string, progress: Partial<UserProgress>): Promise<void> {
  try {
    await setUserProgress(uid, progress)
  } catch {
    // Offline
  }
}

function mount(): void {
  const root = document.getElementById('app')
  if (!root) return

  let authLoading = false
  let authError: string | null = null
  let profile: UserProfile | null = null
  let progress: UserProgress | null = null
  let view: 'auth' | 'onboarding' | 'letter' | 'end' = 'auth'

  root.innerHTML = `
    <div class="page" id="page-root">
      <div id="auth-bar-container"></div>
      <div id="hud-container"></div>
      <div id="content-container">${render()}</div>
    </div>
  `
  const authBarEl = document.getElementById('auth-bar-container')!
  const hudEl = document.getElementById('hud-container')!
  const contentEl = document.getElementById('content-container')!
  const letterMain = contentEl.querySelector('#letter-main') as HTMLElement

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
          if (msg === 'UNAUTHORIZED_DOMAIN') authError = 'Diese Domain ist in Firebase nicht freigegeben. In der Console unter Authentication → Authorized domains hinzufügen.'
          else if (msg === 'CONFIGURATION_NOT_FOUND') authError = 'Firebase Authentication ist nicht eingerichtet. In der Console: Build → Authentication → Get started, dann Google aktivieren.'
          else authError = 'Anmeldung fehlgeschlagen. Popup blockiert? Bitte erlauben oder Seite neu laden.'
        } finally {
          authLoading = false
          updateAuthBar()
        }
      })
    }
    if (logoutBtn) logoutBtn.addEventListener('click', () => signOut())
  }

  function showOnboarding(): void {
    view = 'onboarding'
    hudEl.innerHTML = ''
    contentEl.innerHTML = `<div class="onboarding-wrap">${renderOnboarding()}</div>`
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
      showLetterView()
    })
  }

  function showLetterView(): void {
    view = 'letter'
    contentEl.innerHTML = render()
    const mainEl = contentEl.querySelector('#letter-main') as HTMLElement
    if (!mainEl) return
    const user = getFirebaseAuth().currentUser
    const letterCount = getLetterCount(progress?.letterHistory ?? [])
    hudEl.innerHTML = profile && user ? renderHud(profile, letterCount) : ''
    const profileBtn = hudEl.querySelector('.btn-profile')
    if (profileBtn) profileBtn.addEventListener('click', () => showProfileModal())

    const currentId = progress?.lastLetterId || getFirstLetterId()
    const letter = getLetter(currentId)
    if (!letter) {
      mainEl.innerHTML = renderEndOfBranch()
      view = 'end'
      return
    }
    mainEl.innerHTML = renderLetterArea(letter, true)
    const bodyEl = mainEl.querySelector('.letter-body') as HTMLElement
    const promptEl = mainEl.querySelector('.letter-prompt') as HTMLElement
    const answersEl = mainEl.querySelector('.answers') as HTMLElement
    typewriter(bodyEl, letter.text, () => {
      bodyEl.classList.remove('typewriter-cursor')
      if (promptEl) promptEl.style.visibility = ''
      if (answersEl) answersEl.style.visibility = ''
      bindAnswerButtons()
    })
  }

  function showProfileModal(): void {
    if (!profile) return
    const overlay = document.createElement('div')
    overlay.className = 'modal-overlay'
    overlay.innerHTML = `
      <div class="modal">
        <h3>Dein Profil</h3>
        <p><strong>Name:</strong> ${escapeHtml(profile.displayName)}</p>
        <p><strong>Alter:</strong> ${profile.age}</p>
        <p><strong>Lernwunsch:</strong></p>
        <p class="modal-text">${escapeHtml(profile.wantToLearn) || '–'}</p>
        <p><strong>Selbstbeschreibung:</strong></p>
        <p class="modal-text">${escapeHtml(profile.selfDescription) || '–'}</p>
        <p><strong>Fortschritt:</strong> ${getLetterCount(progress?.letterHistory ?? [])} Briefe beantwortet</p>
        <button type="button" class="btn-close">Schließen</button>
      </div>
    `
    overlay.querySelector('.btn-close')?.addEventListener('click', () => overlay.remove())
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove() })
    document.body.appendChild(overlay)
  }

  function bindAnswerButtons(): void {
    const user = getFirebaseAuth().currentUser
    const currentId = progress?.lastLetterId || getFirstLetterId()
    const letter = getLetter(currentId)
    const mainEl = contentEl.querySelector('#letter-main') as HTMLElement
    if (!letter || !mainEl) return
    mainEl.querySelectorAll('.answer-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const idx = parseInt((btn as HTMLButtonElement).getAttribute('data-answer') ?? '-1', 10)
        if (idx < 0) return
        ;(btn as HTMLButtonElement).setAttribute('aria-pressed', 'true')
        ;(btn as HTMLButtonElement).style.borderColor = 'var(--accent)'
        const history = [...(progress?.letterHistory ?? []), { letterId: currentId, chosenIndex: idx }]
        const nextId = getNextLetterId(currentId, idx)
        const newProgress: Partial<UserProgress> = {
          lastLetterId: nextId || currentId,
          chosenAnswers: { ...progress?.chosenAnswers, [currentId]: idx },
          letterHistory: history,
        }
        if (user) setOfflineProgress({ lastLetterId: newProgress.lastLetterId, chosenAnswers: newProgress.chosenAnswers })
        if (user) await syncProgressToFirestore(user.uid, newProgress)
        progress = { ...progress, ...newProgress } as UserProgress
        const mainEl2 = contentEl.querySelector('#letter-main') as HTMLElement
        if (!nextId) {
          if (mainEl2) mainEl2.innerHTML = renderEndOfBranch()
          view = 'end'
          const letterCount = getLetterCount(progress?.letterHistory ?? [])
          hudEl.innerHTML = profile ? renderHud(profile, letterCount) : ''
          const profileBtn = hudEl.querySelector('.btn-profile')
          if (profileBtn) profileBtn.addEventListener('click', () => showProfileModal())
          return
        }
        const nextLetter = getLetter(nextId)
        if (!nextLetter || !mainEl2) {
          if (mainEl2) mainEl2.innerHTML = renderEndOfBranch()
          view = 'end'
          return
        }
        mainEl2.innerHTML = renderLetterArea(nextLetter, true)
        const bodyEl = mainEl2.querySelector('.letter-body') as HTMLElement
        const promptEl = mainEl2.querySelector('.letter-prompt') as HTMLElement
        const answersEl = mainEl2.querySelector('.answers') as HTMLElement
        typewriter(bodyEl, nextLetter.text, () => {
          bodyEl.classList.remove('typewriter-cursor')
          if (promptEl) promptEl.style.visibility = ''
          if (answersEl) answersEl.style.visibility = ''
          bindAnswerButtons()
        })
        const letterCount = getLetterCount(progress?.letterHistory ?? [])
        hudEl.innerHTML = profile ? renderHud(profile, letterCount) : ''
        const profileBtn2 = hudEl.querySelector('.btn-profile')
        if (profileBtn2) profileBtn2.addEventListener('click', () => showProfileModal())
      })
    })
  }

  function decideView(): void {
    const user = getFirebaseAuth().currentUser
    if (!user) {
      view = 'auth'
      hudEl.innerHTML = ''
      contentEl.innerHTML = render()
      const mainEl = contentEl.querySelector('#letter-main') as HTMLElement
      const first = getLetter(getFirstLetterId())
      if (mainEl && first) {
        mainEl.innerHTML = renderLetterArea(first, true)
        const bodyEl = mainEl.querySelector('.letter-body') as HTMLElement
        const promptEl = mainEl.querySelector('.letter-prompt') as HTMLElement
        const answersEl = mainEl.querySelector('.answers') as HTMLElement
        typewriter(bodyEl, first.text, () => {
          bodyEl.classList.remove('typewriter-cursor')
          if (promptEl) promptEl.style.visibility = ''
          if (answersEl) answersEl.style.visibility = ''
          bindAnswerButtons()
        })
      }
      return
    }
    if (!profile) {
      getUserProfile(user.uid).then((p) => {
        profile = p
        if (!p) showOnboarding()
        else showLetterView()
      })
      return
    }
    showLetterView()
  }

  onAuthChange(async (user) => {
    authError = null
    updateAuthBar()
    if (user) {
      const [p, prog] = await Promise.all([getUserProfile(user.uid), getUserProgress(user.uid)])
      profile = p
      progress = prog
      const local = getOfflineProgress()
      if (local?.lastLetterId && prog) {
        const remoteTs = prog.updatedAt && typeof prog.updatedAt === 'object' && 'seconds' in prog.updatedAt ? (prog.updatedAt as { seconds: number }).seconds * 1000 : 0
        const localTime = new Date(local.updatedAt).getTime()
        if (localTime > remoteTs) {
          await syncProgressToFirestore(user.uid, { lastLetterId: local.lastLetterId, chosenAnswers: local.chosenAnswers })
          progress = await getUserProgress(user.uid) ?? progress
        }
      }
      decideView()
    } else {
      profile = null
      progress = null
      view = 'auth'
      hudEl.innerHTML = ''
      contentEl.innerHTML = render()
      const mainEl = contentEl.querySelector('#letter-main') as HTMLElement
      const first = getLetter(getFirstLetterId())
      if (mainEl && first) {
        mainEl.innerHTML = renderLetterArea(first, true)
        const bodyEl = mainEl.querySelector('.letter-body') as HTMLElement
        const promptEl = mainEl.querySelector('.letter-prompt') as HTMLElement
        const answersEl = mainEl.querySelector('.answers') as HTMLElement
        typewriter(bodyEl, first.text, () => {
          bodyEl.classList.remove('typewriter-cursor')
          if (promptEl) promptEl.style.visibility = ''
          if (answersEl) answersEl.style.visibility = ''
          bindAnswerButtons()
        })
      }
    }
  })

  handleRedirectResult().then((user) => {
    if (user) authError = null
    updateAuthBar()
    if (user) {
      getUserProfile(user.uid).then((p) => {
        profile = p
        getUserProgress(user.uid).then((prog) => {
          progress = prog
          decideView()
        })
      })
    }
  })

  try {
    getFirebaseAuth()
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Firebase nicht geladen.'
    authBarEl.innerHTML = `<div class="auth-bar"><span class="auth-error">${escapeHtml(msg)}</span></div><p style="margin:1rem 0;font-size:0.9rem;color:#666;">In <code>frontend/.env</code> die Werte aus der Firebase Console eintragen.</p>`
    return
  }

  updateAuthBar()
  decideView()
}

export function initApp(): void {
  mount()
}
