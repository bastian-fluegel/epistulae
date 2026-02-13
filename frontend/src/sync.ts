/**
 * Offline-First: Lokale Daten (localStorage/IndexedDB) und Sync mit Firestore.
 *
 * Python-Vergleich: In einer Python-Backend-Architektur würdest du eine
 * "Sync-Schicht" eher serverseitig haben (Queue, Retry, Konfliktlösung).
 * Hier passiert alles im Browser: zuerst lokal schreiben, bei Online-Verbindung
 * mit Firestore abgleichen. Kein eigener Server = diese Logik muss in JS leben.
 */

const STORAGE_KEY = 'epistulae_offline_progress'

export interface OfflineProgress {
  lastLetterId?: string
  chosenAnswers?: Record<string, number>
  treeData?: unknown
  updatedAt: string
}

/** Lesen aus localStorage. In Python: z.B. Redis/Cache oder lokale SQLite. */
export function getOfflineProgress(): OfflineProgress | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as OfflineProgress
  } catch {
    return null
  }
}

/** Schreiben in localStorage (sofort). Sync mit Firestore erfolgt separat. */
export function setOfflineProgress(data: Partial<Omit<OfflineProgress, 'updatedAt'>>): void {
  const current = getOfflineProgress() || {}
  const merged: OfflineProgress = {
    ...current,
    ...data,
    updatedAt: new Date().toISOString(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
}

/**
 * Bei Online: lokale Daten nach Firestore pushen und ggf. Remote-Stand einlesen.
 * Konfliktstrategie: "last write wins" (einfach für Spark-Plan).
 * In Python: würde man z.B. Celery/Queue nutzen oder einen Sync-Endpoint.
 */
export function getProgressToSync(): OfflineProgress | null {
  return getOfflineProgress()
}

export function clearOfflineProgress(): void {
  localStorage.removeItem(STORAGE_KEY)
}
