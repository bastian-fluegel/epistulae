/**
 * Firebase: Auth (Google), Firestore, Analytics.
 * Kein Backend – alles im Browser über Firebase JS SDK.
 */
import { initializeApp, type FirebaseApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  browserLocalPersistence,
  setPersistence,
  type User,
  type Auth,
  type UserCredential,
  connectAuthEmulator,
  type AuthError,
} from 'firebase/auth'
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  type Firestore,
  type Unsubscribe,
  connectFirestoreEmulator,
} from 'firebase/firestore'
import { getAnalytics, type Analytics, isSupported } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

function validateConfig(): void {
  const required = ['apiKey', 'authDomain', 'projectId', 'appId'] as const
  for (const key of required) {
    const val = firebaseConfig[key]
    if (val == null || String(val).trim() === '' || String(val) === 'undefined') {
      throw new Error(
        `Firebase: VITE_FIREBASE_${key.toUpperCase().replace(/([A-Z])/g, '_$1')} fehlt. Bitte frontend/.env anlegen (siehe .env.example).`
      )
    }
  }
}

let app: FirebaseApp
let auth: Auth
let db: Firestore
let analytics: Analytics | null = null

function initFirebase(): void {
  if (app) return
  validateConfig()
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)

  setPersistence(auth, browserLocalPersistence).catch(() => {})

  const useEmulator = import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true'
  if (useEmulator) {
    const authPort = import.meta.env.VITE_AUTH_EMULATOR_PORT || '9099'
    const firestorePort = import.meta.env.VITE_FIRESTORE_EMULATOR_PORT || '8080'
    connectAuthEmulator(auth, `http://127.0.0.1:${authPort}`, { disableWarnings: true })
    connectFirestoreEmulator(db, '127.0.0.1', Number(firestorePort))
  }

  if (firebaseConfig.measurementId) {
    isSupported().then((yes) => {
      if (yes) analytics = getAnalytics(app)
    })
  }
}

export function getFirebaseAuth(): Auth {
  if (!auth) initFirebase()
  return auth
}

export function getFirebaseDb(): Firestore {
  if (!db) initFirebase()
  return db
}

function isAuthError(e: unknown): e is AuthError {
  return typeof e === 'object' && e !== null && 'code' in e
}

/**
 * Google Login: zuerst Popup, bei Blockierung Redirect.
 * Nach Redirect: getRedirectResult() beim App-Start aufrufen.
 */
export async function signInWithGoogle(): Promise<User> {
  initFirebase()
  const provider = new GoogleAuthProvider()
  provider.addScope('email')
  provider.setCustomParameters({ prompt: 'select_account' })

  try {
    const result = await signInWithPopup(auth, provider)
    return result.user
  } catch (err) {
    if (isAuthError(err)) {
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request' || err.code === 'auth/popup-closed-by-user') {
        await signInWithRedirect(auth, provider)
        throw new Error('REDIRECT')
      }
      if (err.code === 'auth/unauthorized-domain') {
        throw new Error('UNAUTHORIZED_DOMAIN')
      }
      if (err.code === 'auth/invalid-api-key' || err.code === 'auth/configuration-not-found' || String((err as { message?: string }).message || '').includes('CONFIGURATION_NOT_FOUND')) {
        throw new Error('CONFIGURATION_NOT_FOUND')
      }
      throw new Error(err.code)
    }
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('CONFIGURATION_NOT_FOUND')) throw new Error('CONFIGURATION_NOT_FOUND')
    throw err
  }
}

/** Nach Rückkehr von Redirect-Login: einmal beim App-Start aufrufen. */
export async function handleRedirectResult(): Promise<User | null> {
  initFirebase()
  try {
    const result: UserCredential | null = await getRedirectResult(auth)
    return result?.user ?? null
  } catch {
    return null
  }
}

export async function signOut(): Promise<void> {
  if (!auth) return
  await firebaseSignOut(auth)
}

export function onAuthChange(callback: (user: User | null) => void): Unsubscribe {
  initFirebase()
  return onAuthStateChanged(auth, callback)
}

const USERS_COLLECTION = 'users'
const PROGRESS_COLLECTION = 'progress'
const PROGRESS_DOC = 'data'
const PROFILE_COLLECTION = 'profile'
const PROFILE_DOC = 'data'

export interface UserProfile {
  displayName: string
  age: number
  wantToLearn: string
  selfDescription: string
  createdAt?: unknown
}

export interface UserProgress {
  lastLetterId?: string
  chosenAnswers?: Record<string, number>
  letterHistory?: { letterId: string; chosenIndex: number }[]
  treeData?: unknown
  updatedAt?: { seconds: number; nanoseconds: number }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const d = getFirebaseDb()
  const ref = doc(d, USERS_COLLECTION, uid, PROFILE_COLLECTION, PROFILE_DOC)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return snap.data() as UserProfile
}

export async function setUserProfile(uid: string, data: UserProfile): Promise<void> {
  const d = getFirebaseDb()
  const ref = doc(d, USERS_COLLECTION, uid, PROFILE_COLLECTION, PROFILE_DOC)
  await setDoc(ref, { ...data, createdAt: new Date() }, { merge: true })
}

export async function getUserProgress(uid: string): Promise<UserProgress | null> {
  const d = getFirebaseDb()
  const ref = doc(d, USERS_COLLECTION, uid, PROGRESS_COLLECTION, PROGRESS_DOC)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return snap.data() as UserProgress
}

export async function setUserProgress(uid: string, data: Partial<UserProgress>): Promise<void> {
  const d = getFirebaseDb()
  const ref = doc(d, USERS_COLLECTION, uid, PROGRESS_COLLECTION, PROGRESS_DOC)
  await setDoc(
    ref,
    { ...data, updatedAt: new Date() },
    { merge: true }
  )
}

export function subscribeUserProgress(
  uid: string,
  callback: (data: UserProgress | null) => void
): Unsubscribe {
  const d = getFirebaseDb()
  const ref = doc(d, USERS_COLLECTION, uid, PROGRESS_COLLECTION, PROGRESS_DOC)
  return onSnapshot(ref, (snap) => {
    callback(snap.exists() ? (snap.data() as UserProgress) : null)
  })
}
