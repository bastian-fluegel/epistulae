/**
 * Offline-First: localStorage für Fortschritt, Sync mit Firestore bei Online.
 */
const STORAGE_KEY = 'epistulae_offline_progress'

export interface OfflineProgress {
  lastLetterId?: string
  chosenAnswers?: Record<string, number>
  treeData?: unknown
  updatedAt: string
}

export function getOfflineProgress(): OfflineProgress | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as OfflineProgress
  } catch {
    return null
  }
}

export function setOfflineProgress(data: Partial<Omit<OfflineProgress, 'updatedAt'>>): void {
  const current = getOfflineProgress() || {}
  const merged: OfflineProgress = {
    ...current,
    ...data,
    updatedAt: new Date().toISOString(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
}

export function getProgressToSync(): OfflineProgress | null {
  return getOfflineProgress()
}

export function clearOfflineProgress(): void {
  localStorage.removeItem(STORAGE_KEY)
}
