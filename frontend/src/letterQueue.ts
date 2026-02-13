/**
 * Letter Queue System
 * - Generiert Briefe im Hintergrund
 * - Initial: 3 Briefe nach Onboarding
 * - Dann: alle 20 Minuten 1 Brief
 * - Max: 7 Briefe in Queue
 */

import { generateLetter, type GeneratedLetter } from './gemini'
import { getRandomScholar, type Scholar } from './scholars'
import type { UserProfile } from './App'

const QUEUE_KEY = 'epistulae_letter_queue'
const QUEUE_STATE_KEY = 'epistulae_queue_state'
const MAX_QUEUE_SIZE = 7
const GENERATION_INTERVAL_MS = 20 * 60 * 1000 // 20 Minuten
const INITIAL_COUNT = 3

export interface QueuedLetter extends GeneratedLetter {
  id: string
  generatedAt: number
  scholar: Scholar
}

export interface QueueState {
  lastGeneratedAt: number
  totalGenerated: number
  isGenerating: boolean
}

// ============================================
// LOCAL STORAGE
// ============================================

function getQueue(): QueuedLetter[] {
  const raw = localStorage.getItem(QUEUE_KEY)
  return raw ? JSON.parse(raw) : []
}

function saveQueue(queue: QueuedLetter[]): void {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
}

function getQueueState(): QueueState {
  const raw = localStorage.getItem(QUEUE_STATE_KEY)
  return raw ? JSON.parse(raw) : { lastGeneratedAt: 0, totalGenerated: 0, isGenerating: false }
}

function saveQueueState(state: Partial<QueueState>): void {
  const current = getQueueState()
  const updated = { ...current, ...state }
  localStorage.setItem(QUEUE_STATE_KEY, JSON.stringify(updated))
}

// ============================================
// LETTER GENERATION
// ============================================

async function generateAndEnqueue(
  profile: UserProfile,
  letterHistory: Array<{ text: string; answer: string; scholar: string }>
): Promise<QueuedLetter> {
  const state = getQueueState()
  saveQueueState({ isGenerating: true })

  try {
    // Zufälliger Gelehrter
    const scholar = getRandomScholar()

    console.log(`📝 Generiere Brief von ${scholar.name}...`)

    // Gemini API aufrufen
    const generated = await generateLetter(scholar, profile, letterHistory)

    // In Queue hinzufügen
    const queuedLetter: QueuedLetter = {
      ...generated,
      id: `gen-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      generatedAt: Date.now(),
      scholar,
    }

    const queue = getQueue()
    queue.push(queuedLetter)
    saveQueue(queue)

    saveQueueState({
      lastGeneratedAt: Date.now(),
      totalGenerated: state.totalGenerated + 1,
      isGenerating: false,
    })

    console.log(`✅ Brief von ${scholar.name} generiert und zur Queue hinzugefügt`)
    return queuedLetter
  } catch (error) {
    console.error('❌ Fehler beim Generieren des Briefs:', error)
    saveQueueState({ isGenerating: false })
    throw error
  }
}

// ============================================
// QUEUE MANAGEMENT
// ============================================

export async function initializeQueue(
  profile: UserProfile,
  letterHistory: Array<{ text: string; answer: string; scholar: string }> = []
): Promise<void> {
  const queue = getQueue()
  const state = getQueueState()

  // Wenn Queue leer ist (erste Anmeldung), generiere 3 Briefe
  if (queue.length === 0 && state.totalGenerated === 0) {
    console.log('🚀 Erste Anmeldung: Generiere 3 initiale Briefe...')

    for (let i = 0; i < INITIAL_COUNT; i++) {
      try {
        await generateAndEnqueue(profile, letterHistory)
        console.log(`✅ Brief ${i + 1}/${INITIAL_COUNT} generiert`)
      } catch (error) {
        console.error(`❌ Fehler bei Brief ${i + 1}:`, error)
        // Weiter mit nächstem Brief
      }
    }

    console.log('✅ Initiale Briefe generiert')
  }
}

export function getNextLetter(): QueuedLetter | null {
  const queue = getQueue()
  if (queue.length === 0) return null

  // Ersten Brief aus Queue nehmen (FIFO)
  const letter = queue.shift()!
  saveQueue(queue)

  console.log(`📬 Brief ausgeliefert: ${letter.scholar.name}`)
  return letter
}

export function getQueueSize(): number {
  return getQueue().length
}

export async function tryGenerateNext(
  profile: UserProfile,
  letterHistory: Array<{ text: string; answer: string; scholar: string }>
): Promise<void> {
  const queue = getQueue()
  const state = getQueueState()

  // Prüfen: Max Queue Size erreicht?
  if (queue.length >= MAX_QUEUE_SIZE) {
    console.log(`⏸️ Queue voll (${queue.length}/${MAX_QUEUE_SIZE})`)
    return
  }

  // Prüfen: Ist bereits eine Generierung im Gange?
  if (state.isGenerating) {
    console.log('⏸️ Generierung läuft bereits')
    return
  }

  // Prüfen: Ist genug Zeit vergangen?
  const timeSinceLastGen = Date.now() - state.lastGeneratedAt
  if (timeSinceLastGen < GENERATION_INTERVAL_MS && state.totalGenerated >= INITIAL_COUNT) {
    const remainingMs = GENERATION_INTERVAL_MS - timeSinceLastGen
    const remainingMin = Math.ceil(remainingMs / 60000)
    console.log(`⏰ Nächster Brief in ${remainingMin} Minuten`)
    return
  }

  // Generiere nächsten Brief
  console.log('🔄 Generiere nächsten Brief...')
  try {
    await generateAndEnqueue(profile, letterHistory)
  } catch (error) {
    console.error('❌ Fehler beim Generieren:', error)
  }
}

// ============================================
// BACKGROUND TIMER
// ============================================

let generationTimer: number | null = null

export function startBackgroundGeneration(
  profile: UserProfile,
  getLetterHistory: () => Array<{ text: string; answer: string; scholar: string }>
): void {
  if (generationTimer !== null) {
    console.log('⚠️ Background Generation läuft bereits')
    return
  }

  console.log('⏰ Starte Background Generation (alle 20 Minuten)')

  generationTimer = window.setInterval(async () => {
    console.log('⏰ Background Check...')
    const history = getLetterHistory()
    await tryGenerateNext(profile, history)
  }, 60000) // Check jede Minute, ob generiert werden muss
}

export function stopBackgroundGeneration(): void {
  if (generationTimer !== null) {
    clearInterval(generationTimer)
    generationTimer = null
    console.log('⏹️ Background Generation gestoppt')
  }
}

// ============================================
// DEBUG / INFO
// ============================================

export function getQueueInfo(): {
  queueSize: number
  state: QueueState
  nextGenerationIn: number | null
} {
  const queue = getQueue()
  const state = getQueueState()

  let nextGenerationIn: number | null = null
  if (state.totalGenerated >= INITIAL_COUNT) {
    const timeSinceLastGen = Date.now() - state.lastGeneratedAt
    const remaining = GENERATION_INTERVAL_MS - timeSinceLastGen
    nextGenerationIn = remaining > 0 ? Math.ceil(remaining / 60000) : 0
  }

  return {
    queueSize: queue.length,
    state,
    nextGenerationIn,
  }
}
