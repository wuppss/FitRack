import type { Exercise, ExerciseDBRaw } from '../types'
import { STORAGE_KEYS, loadJSON, saveJSON } from './storage'
import { putExercises, countExercises, getGifBlob, putGifBlob } from './db'

/**
 * ExerciseDB (RapidAPI) client — designed around the **Basic (free) plan**:
 *   • 690 requests / month (hard limit)
 *   • list endpoints return at most 10 exercises per response
 *   • 1000 requests / hour rate limit
 *
 * Strategy: the full catalog (~1300 exercises) is fetched ONCE from the user's
 * browser, 10 at a time (~130 requests), and cached permanently in IndexedDB.
 * After that the whole app runs offline from the cache — no further API calls.
 * A monthly request counter is kept in localStorage so we never silently blow
 * through the quota; the sync also refuses to start if too few requests remain.
 */

const HOST = (import.meta.env.VITE_RAPIDAPI_HOST as string) || 'exercisedb.p.rapidapi.com'
const BASE = `https://${HOST}`
const PAGE_SIZE = 10 // Basic plan hard cap for list endpoints
const MONTHLY_LIMIT = 690

export type GifResolution = '180' | '360' | '720' | '1080'

// --- credentials ------------------------------------------------------------

export function getApiKey(): string {
  const stored = loadJSON<string>(STORAGE_KEYS.apiKey, '')
  if (stored) return stored
  return (import.meta.env.VITE_RAPIDAPI_KEY as string) || ''
}

export function setApiKey(key: string): void {
  saveJSON(STORAGE_KEYS.apiKey, key.trim())
}

export function hasApiKey(): boolean {
  return getApiKey().length > 0
}

export function getGifResolution(): GifResolution {
  return loadJSON<GifResolution>(STORAGE_KEYS.gifResolution, '360')
}

export function setGifResolution(res: GifResolution): void {
  saveJSON(STORAGE_KEYS.gifResolution, res)
}

// --- monthly usage tracking -------------------------------------------------

interface Usage {
  month: string // yyyy-MM
  count: number
}

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7)
}

const USAGE_KEY = 'fitrack:apiUsage'

export function getUsage(): Usage {
  const u = loadJSON<Usage>(USAGE_KEY, { month: currentMonth(), count: 0 })
  if (u.month !== currentMonth()) {
    const fresh = { month: currentMonth(), count: 0 }
    saveJSON(USAGE_KEY, fresh)
    return fresh
  }
  return u
}

export function remainingRequests(): number {
  return Math.max(0, MONTHLY_LIMIT - getUsage().count)
}

function trackRequest(n = 1): void {
  const u = getUsage()
  saveJSON(USAGE_KEY, { month: u.month, count: u.count + n })
}

export const MONTHLY_REQUEST_LIMIT = MONTHLY_LIMIT

// --- low level fetch --------------------------------------------------------

async function apiGet<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const key = getApiKey()
  if (!key) throw new Error('Missing RapidAPI key. Add it in Profile → Exercise Library.')

  const url = new URL(BASE + path)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))

  const res = await fetch(url.toString(), {
    headers: {
      'X-RapidAPI-Key': key,
      'X-RapidAPI-Host': HOST,
    },
  })
  trackRequest(1)

  if (res.status === 429) {
    throw new Error('Rate limit reached. Wait a bit and try again.')
  }
  if (res.status === 401 || res.status === 403) {
    throw new Error('Invalid or unauthorized RapidAPI key.')
  }
  if (!res.ok) {
    throw new Error(`ExerciseDB request failed (${res.status}).`)
  }
  return (await res.json()) as T
}

// --- normalization ----------------------------------------------------------

function normalize(raw: ExerciseDBRaw): Exercise {
  return {
    id: raw.id,
    name: raw.name ?? '',
    bodyPart: raw.bodyPart ?? '',
    target: raw.target ?? '',
    equipment: raw.equipment ?? '',
    gifUrl: raw.gifUrl ?? '',
    secondaryMuscles: raw.secondaryMuscles ?? [],
    instructions: raw.instructions ?? [],
  }
}

// --- public API -------------------------------------------------------------

export interface SyncProgress {
  fetched: number
  page: number
  done: boolean
}

export interface SyncResult {
  total: number
  requestsUsed: number
  stoppedEarly: boolean
}

/**
 * Page through the full catalog, 10 at a time, storing to IndexedDB as we go.
 * `onProgress` fires after each page. Pass an AbortSignal to cancel.
 */
export async function syncExercises(
  onProgress?: (p: SyncProgress) => void,
  signal?: AbortSignal,
): Promise<SyncResult> {
  if (!hasApiKey()) {
    throw new Error('Add your RapidAPI key first.')
  }

  const budget = remainingRequests()
  if (budget < 1) {
    throw new Error(
      `Monthly request budget exhausted (${MONTHLY_LIMIT}/mo). Resets next month.`,
    )
  }

  let offset = 0
  let page = 0
  let fetched = 0
  let stoppedEarly = false
  const startCount = getUsage().count

  // Hard safety cap: never issue more than the remaining budget of requests.
  const maxPages = Math.min(200, budget)

  while (page < maxPages) {
    if (signal?.aborted) {
      stoppedEarly = true
      break
    }

    const batch = await apiGet<ExerciseDBRaw[]>('/exercises', {
      limit: String(PAGE_SIZE),
      offset: String(offset),
    })

    if (!Array.isArray(batch) || batch.length === 0) break

    await putExercises(batch.map(normalize))
    fetched += batch.length
    page += 1
    offset += PAGE_SIZE
    onProgress?.({ fetched, page, done: false })

    // Last page reached (Basic plan returns exactly 10 while more remain).
    if (batch.length < PAGE_SIZE) break

    // Gentle pacing — well within 1000/hr, avoids bursts.
    await sleep(120)
  }

  if (page >= maxPages) stoppedEarly = true

  const total = await countExercises()
  onProgress?.({ fetched, page, done: true })
  return {
    total,
    requestsUsed: getUsage().count - startCount,
    stoppedEarly,
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

// --- exercise GIFs ----------------------------------------------------------
//
// On the current ExerciseDB API the /exercises list endpoint does NOT return a
// usable gifUrl. GIFs are served from a separate authenticated endpoint:
//   GET /image?exerciseId=<id>&resolution=<res>   (needs the RapidAPI key)
// Each call counts against the monthly request budget, so we fetch a GIF only
// on demand and cache the blob permanently in IndexedDB — every exercise's GIF
// then costs at most one request, ever.

/** Synthetic bundled exercises can't be fetched from the API. */
export function isRealExerciseId(id: string): boolean {
  return Boolean(id) && !id.startsWith('seed-')
}

interface GifResult {
  url: string // object URL for the cached blob
  fromCache: boolean
}

/**
 * Return an object URL for an exercise's demo GIF, fetching + caching it if
 * needed. Callers own the returned object URL and should revoke it on unmount.
 * Pass `allowNetwork: false` to only ever use the cache (no request spent).
 */
export async function getExerciseGifUrl(
  exerciseId: string,
  opts: { allowNetwork?: boolean } = {},
): Promise<GifResult | null> {
  if (!isRealExerciseId(exerciseId)) return null

  const resolution = getGifResolution()
  const key = `${exerciseId}:${resolution}`

  const cached = await getGifBlob(key)
  if (cached) return { url: URL.createObjectURL(cached), fromCache: true }

  if (opts.allowNetwork === false) return null
  if (!hasApiKey()) return null
  if (remainingRequests() < 1) return null

  const url = new URL(BASE + '/image')
  url.searchParams.set('exerciseId', exerciseId)
  url.searchParams.set('resolution', resolution)

  const res = await fetch(url.toString(), {
    headers: {
      'X-RapidAPI-Key': getApiKey(),
      'X-RapidAPI-Host': HOST,
    },
  })
  trackRequest(1)

  if (!res.ok) {
    throw new Error(`GIF request failed (${res.status}).`)
  }
  const blob = await res.blob()
  await putGifBlob(key, blob)
  return { url: URL.createObjectURL(blob), fromCache: false }
}

/** True once the catalog has been synced at least once. */
export async function isCatalogSynced(): Promise<boolean> {
  // seed exercises are also in the store, so require more than the seed count
  return (await countExercises()) > 40
}
