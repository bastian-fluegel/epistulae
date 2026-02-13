/**
 * App: Lokale Version (ohne Auth) mit Gemini Letter Queue
 */
import { renderHUD, bindHUD, type View } from './components/HUD'
import { showHome } from './views/HomeView'
import { showLetter, showWaiting, showEnd, type LetterWithScholar } from './views/LetterView'
import { showProgress } from './views/ProgressViewNew'
import { showScholars } from './views/ScholarsView'
import { showProfile } from './views/ProfileView'
import { renderCountdown } from './components/Countdown'
import {
  initializeQueue,
  getNextLetter,
  startBackgroundGeneration,
  stopBackgroundGeneration,
  getQueueSize,
  getQueueInfo,
  type QueuedLetter,
} from './letterQueue'

// Types
export interface UserProfile {
  displayName: string
  age: number
  wantToLearn: string
  selfDescription: string
}

export interface AnsweredLetter {
  letterId: string
  text: string
  answer: string
  scholarName: string
  answeredAt: number
}

export interface UserProgress {
  currentLetter: QueuedLetter | null
  answeredLetters: AnsweredLetter[]
  updatedAt?: number
}

function escapeHtml(s: string): string {
  const div = document.createElement('div')
  div.textContent = s
  return div.innerHTML
}

export function initApp(): void {
  const root = document.getElementById('app')
  if (!root) return

  // State (LOCAL ONLY - kein Auth)
  let profile: UserProfile | null = getLocalProfile()
  let progress: UserProgress = getLocalProgress() || { currentLetter: null, answeredLetters: [] }
  let currentView: View = 'home'

  /*         <header class="header">
          <h1 class="title">Epistulae</h1>
          <p class="subtitle">Briefe aus der Gegenwart – Lokale Version</p>
        </header> */
  // Layout
  root.innerHTML = `
    <div class="page">
      <div id="hud"></div>
      <div id="content">

        <main id="main" style="display:block;min-height:200px;flex:1;"></main>
        <footer class="footer">
          <p>Keine richtige Antwort – nur deine.<br><br>Copyright (c) 2026 - Bastian Flügel<br>All rights reserved.<br>Icons by Icons8</p>
        </footer>
      </div>
    </div>
  `

  const hudEl = document.getElementById('hud')!
  const mainEl = document.getElementById('main')!

  // ============================================
  // LOCAL STORAGE HELPERS
  // ============================================

  function getLocalProfile(): UserProfile | null {
    const raw = localStorage.getItem('epistulae_profile')
    return raw ? JSON.parse(raw) : null
  }

  function saveLocalProfile(p: UserProfile): void {
    localStorage.setItem('epistulae_profile', JSON.stringify(p))
    profile = p
  }

  function getLocalProgress(): UserProgress | null {
    const raw = localStorage.getItem('epistulae_progress')
    if (!raw) {
      return { currentLetter: null, answeredLetters: [] }
    }
    return JSON.parse(raw)
  }

  function saveLocalProgress(p: Partial<UserProgress>): void {
    const updated = { ...progress, ...p, updatedAt: Date.now() }
    localStorage.setItem('epistulae_progress', JSON.stringify(updated))
    progress = updated as UserProgress
  }

  function getLetterHistoryForGemini(): Array<{ text: string; answer: string; scholar: string }> {
    if (!progress || !progress.answeredLetters) return []
    return progress.answeredLetters.map(l => ({
      text: l.text,
      answer: l.answer,
      scholar: l.scholarName,
    }))
  }

  // ============================================
  // ONBOARDING (LOCAL)
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
    if (!form) return

    form.addEventListener('submit', async (e) => {
      e.preventDefault()
      const submitBtn = form.querySelector('.btn-submit') as HTMLButtonElement
      submitBtn.disabled = true
      submitBtn.textContent = 'Generiere erste Briefe...'

      const data = new FormData(form)
      const displayName = (data.get('displayName') as string)?.trim() || 'Du'
      const age = Number(data.get('age')) || 0
      const wantToLearn = (data.get('wantToLearn') as string)?.trim() || ''
      const selfDescription = (data.get('selfDescription') as string)?.trim() || ''

      const newProfile: UserProfile = { displayName, age, wantToLearn, selfDescription }
      saveLocalProfile(newProfile)

      // Initialisiere Queue (3 Briefe)
      try {
        await initializeQueue(newProfile, [])
        console.log('✅ Queue initialisiert')
        
        // Starte Background Generation
        startBackgroundGeneration(newProfile, getLetterHistoryForGemini)
        
        navigateToView('letter')
      } catch (error) {
        console.error('❌ Fehler beim Initialisieren der Queue:', error)
        alert('Fehler beim Generieren der Briefe. Bitte versuche es erneut.')
        submitBtn.disabled = false
        submitBtn.textContent = 'Starten'
      }
    })
  }

  // ============================================
  // VIEWS
  // ============================================

  function updateHUD(): void {
    if (!profile) return
    const letterCount = progress?.answeredLetters?.length || 0
    const availableLetters = getQueueSize()
    
    // Debug Info
    const queueInfo = getQueueInfo()
    console.log(`📊 Queue: ${queueInfo.queueSize} Briefe, Nächster in: ${queueInfo.nextGenerationIn ?? '-'} Min`)
    
    hudEl.innerHTML = renderHUD({ 
      displayName: profile.displayName, 
      letterCount, 
      availableLetters,
      currentView, 
      onNavigate: navigateToView 
    })
    bindHUD(hudEl, navigateToView)
  }

  function navigateToView(view: View): void {
    currentView = view
    updateHUD()

    if (view === 'home') showHomeView()
    else if (view === 'letter') showLetterView()
    else if (view === 'progress') showProgressView()
    else if (view === 'scholars') showScholarsView()
    else if (view === 'profile') showProfileView()
  }

  function showHomeView(): void {
    if (!profile) return
    const letterCount = progress?.answeredLetters?.length || 0
    showHome(mainEl, profile.displayName, letterCount)
  }

  function showScholarsView(): void {
    showScholars(mainEl)
  }

  function showLetterView(): void {
    if (!profile) return
    updateHUD()
    
    // Hole aktuellen Brief (entweder aus progress oder nächsten aus Queue)
    let currentLetter = progress.currentLetter

    if (!currentLetter) {
      // Kein aktueller Brief: hole nächsten aus Queue
      currentLetter = getNextLetter()
      
      if (!currentLetter) {
        // Queue leer - zeige Countdown
        const queueInfo = getQueueInfo()
        const countdownHtml = queueInfo.nextGenerationIn !== null 
          ? renderCountdown(queueInfo.nextGenerationIn)
          : '<div class="countdown">📬 Briefe werden generiert...</div>'
        
        mainEl.innerHTML = `
          <div style="text-align:center;padding:4rem 2rem;">
            <h2 style="color:var(--accent);margin-bottom:2rem;">Alle Briefe beantwortet!</h2>
            ${countdownHtml}
            <p style="margin-top:2rem;color:var(--accent-soft);font-size:0.9rem;">
              Briefe in Queue: ${getQueueSize()} / 7
            </p>
          </div>
        `
        return
      }

      // Speichere als aktuellen Brief
      saveLocalProgress({ currentLetter })
    }

    // Zeige Brief an
    const letterWithScholar: LetterWithScholar = {
      id: currentLetter.id,
      topic: currentLetter.topic,
      text: currentLetter.text,
      antworten: currentLetter.answers as [string, string, string],
      scholar: currentLetter.scholar,
    }

    showLetter(mainEl, letterWithScholar, (answerText: string) => {
      // Speichere Antwort
      const answeredLetter: AnsweredLetter = {
        letterId: currentLetter!.id,
        text: currentLetter!.text,
        answer: answerText,
        scholarName: currentLetter!.scholar.name,
        answeredAt: Date.now(),
      }

      const updatedAnswered = [...progress.answeredLetters, answeredLetter]

      saveLocalProgress({
        currentLetter: null, // Aktuellen Brief löschen
        answeredLetters: updatedAnswered,
      })

      updateHUD()

      // Waiting animation → nächster Brief
      showWaiting(mainEl, () => {
        showLetterView()
      })
    })
  }

  function showProgressView(): void {
    const letters = progress?.answeredLetters || []
    showProgress(mainEl, letters)
  }

  function showProfileView(): void {
    if (!profile) return
    const letterCount = progress?.answeredLetters?.length || 0
    
    showProfile(
      mainEl, 
      {
        displayName: profile.displayName,
        age: profile.age,
        wantToLearn: profile.wantToLearn,
        selfDescription: profile.selfDescription,
        letterCount,
      },
      (updated) => {
        // Speichere aktualisiertes Profil
        saveLocalProfile({
          displayName: updated.displayName,
          age: updated.age,
          wantToLearn: updated.wantToLearn,
          selfDescription: updated.selfDescription,
        })
        updateHUD()
      }
    )
  }

  // ============================================
  // INIT (LOCAL ONLY)
  // ============================================

  // Show onboarding or main app
  if (!profile) {
    showOnboarding()
  } else {
    // Profil existiert: Starte Background Generation
    startBackgroundGeneration(profile, getLetterHistoryForGemini)
    navigateToView('home')
  }
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    stopBackgroundGeneration()
  })
}
