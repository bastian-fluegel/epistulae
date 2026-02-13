/**
 * Firebase-Boilerplate: Auth (Google) + Firestore.
 *
 * Python-Vergleich: In Python würdest du firebase-admin im Backend nutzen
 * (Service-Account, get_firestore(), auth.verify_id_token()). Hier läuft alles
 * im Browser – keine eigene Server-Instanz, daher das Firebase JS SDK.
 * Logik, die in Python "auf dem Server" wäre (z.B. Nutzer-Fortschritt speichern),
 * passiert hier im Client und wird direkt in Firestore geschrieben (Regeln schützen).
 */
import { initializeApp, type FirebaseApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
  type Auth,
  connectAuthEmulator,
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

// Konfiguration aus Build-Zeit-Umgebung (Vite: import.meta.env).
// In Python: os.getenv("FIREBASE_...") oder settings; hier müssen die Werte
// zur Build-Zeit verfügbar sein, da sie ins Bundle eingebettet werden.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

let app: FirebaseApp
let auth: Auth
let db: Firestore
let analytics: Analytics | null = null

function initFirebase(): void {
  if (app) return
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)

  // Optional: Emulatoren für lokale Entwicklung (wie in Python: FIRESTORE_EMULATOR_HOST).
  // Bei Docker: Host-Ports 9098 (Auth) und 8081 (Firestore) – per .env setzbar.
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

/** Google Login. In Python: Backend würde OAuth-Token prüfen und Session setzen. */
export async function signInWithGoogle(): Promise<User> {
  initFirebase()
  const provider = new GoogleAuthProvider()
  const result = await signInWithPopup(auth, provider)
  return result.user
}

export async function signOut(): Promise<void> {
  if (!auth) return
  await firebaseSignOut(auth)
}

/** Auth-State beobachten. In Python: Middleware/Session-Check pro Request. */
export function onAuthChange(callback: (user: User | null) => void): Unsubscribe {
  initFirebase()
  return onAuthStateChanged(auth, callback)
}

// Firestore-Pfade (Nutzer-ID-basiert, Spark-konform: wenige Collections)
const USERS_COLLECTION = 'users'
const PROGRESS_DOC = 'progress'

export interface UserProgress {
  lastLetterId?: string
  chosenAnswers?: Record<string, number>
  treeData?: unknown
  updatedAt: { seconds: number; nanoseconds: number } | unknown
}

/**
 * Fortschritt des Nutzers lesen.
 * In Python: db.collection('users').document(uid).get() mit firebase-admin.
 */
export async function getUserProgress(uid: string): Promise<UserProgress | null> {
  const d = getFirebaseDb()
  const ref = doc(d, USERS_COLLECTION, uid, PROGRESS_DOC, 'data')
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return snap.data() as UserProgress
}

/**
 * Fortschritt speichern (merge). In Python: set_doc mit merge=True.
 */
export async function setUserProgress(
  uid: string,
  data: Partial<UserProgress>
): Promise<void> {
  const d = getFirebaseDb()
  const ref = doc(d, USERS_COLLECTION, uid, PROGRESS_DOC, 'data')
  await setDoc(
    ref,
    {
      ...data,
      updatedAt: new Date(),
    },
    { merge: true }
  )
}

/**
 * Echtzeit-Listener auf Nutzer-Fortschritt (optional, z.B. für Multi-Tab).
 * In Python: typischerweise kein langer Lauscher; hier Firestore onSnapshot.
 */
export function subscribeUserProgress(
  uid: string,
  callback: (data: UserProgress | null) => void
): Unsubscribe {
  const d = getFirebaseDb()
  const ref = doc(d, USERS_COLLECTION, uid, PROGRESS_DOC, 'data')
  return onSnapshot(ref, (snap) => {
    callback(snap.exists() ? (snap.data() as UserProgress) : null)
  })
}
