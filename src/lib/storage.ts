/** Thin, type-safe localStorage wrapper with JSON (de)serialization. */

export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw == null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function saveJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage full / unavailable — ignore for an offline-first MVP
  }
}

export function removeKey(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    /* noop */
  }
}

export const STORAGE_KEYS = {
  profile: 'fitrack:profile',
  workouts: 'fitrack:workouts',
  activeSession: 'fitrack:activeSession',
  food: 'fitrack:food',
  water: 'fitrack:water',
  steps: 'fitrack:steps',
  apiKey: 'fitrack:apiKey',
  gifResolution: 'fitrack:gifResolution',
  exercisesSyncedAt: 'fitrack:exercisesSyncedAt',
} as const

/** Simple id generator good enough for local records. */
export function uid(prefix = ''): string {
  return (
    prefix +
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 8)
  )
}
