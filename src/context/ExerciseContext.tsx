import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Exercise } from '../types'
import { getAllExercises, putExercises } from '../lib/db'
import { SEED_EXERCISES } from '../data/seedExercises'
import {
  getUsage,
  remainingRequests,
  syncExercises,
  type SyncProgress,
  type SyncResult,
} from '../lib/exercisedb'
import { STORAGE_KEYS, saveJSON, loadJSON } from '../lib/storage'

interface ExerciseContextValue {
  exercises: Exercise[]
  loading: boolean
  byId: (id: string) => Exercise | undefined
  search: (q: string, filters?: Filters) => Exercise[]
  bodyParts: string[]
  equipmentTypes: string[]
  /** number of non-seed exercises in the cache */
  syncedCount: number
  lastSyncedAt: number | null
  // sync
  syncing: boolean
  progress: SyncProgress | null
  syncError: string | null
  startSync: () => Promise<void>
  cancelSync: () => void
  usageCount: number
  requestsRemaining: number
  refresh: () => Promise<void>
}

export interface Filters {
  bodyPart?: string
  equipment?: string
}

const ExerciseContext = createContext<ExerciseContextValue | null>(null)

export function ExerciseProvider({ children }: { children: ReactNode }) {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [progress, setProgress] = useState<SyncProgress | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(() =>
    loadJSON<number | null>(STORAGE_KEYS.exercisesSyncedAt, null),
  )
  const [usageCount, setUsageCount] = useState(() => getUsage().count)
  const abortRef = useRef<AbortController | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    let all = await getAllExercises()
    if (all.length === 0) {
      // First run — seed the store so the app has content immediately.
      await putExercises(SEED_EXERCISES)
      all = SEED_EXERCISES
    }
    all.sort((a, b) => a.name.localeCompare(b.name))
    setExercises(all)
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const startSync = useCallback(async () => {
    if (syncing) return
    setSyncError(null)
    setSyncing(true)
    setProgress(null)
    const controller = new AbortController()
    abortRef.current = controller
    try {
      const result: SyncResult = await syncExercises((p) => {
        setProgress(p)
        setUsageCount(getUsage().count)
      }, controller.signal)
      const now = Date.now()
      setLastSyncedAt(now)
      saveJSON(STORAGE_KEYS.exercisesSyncedAt, now)
      await load()
      if (result.stoppedEarly && controller.signal.aborted) {
        setSyncError('Sync cancelled. Cached what was fetched so far.')
      }
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Sync failed.')
    } finally {
      setUsageCount(getUsage().count)
      setSyncing(false)
      abortRef.current = null
    }
  }, [syncing, load])

  const cancelSync = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const byId = useCallback(
    (id: string) => exercises.find((e) => e.id === id),
    [exercises],
  )

  const search = useCallback(
    (q: string, filters?: Filters) => {
      const term = q.trim().toLowerCase()
      return exercises.filter((e) => {
        if (filters?.bodyPart && e.bodyPart !== filters.bodyPart) return false
        if (filters?.equipment && e.equipment !== filters.equipment) return false
        if (!term) return true
        return (
          e.name.toLowerCase().includes(term) ||
          e.target.toLowerCase().includes(term) ||
          e.bodyPart.toLowerCase().includes(term) ||
          e.equipment.toLowerCase().includes(term)
        )
      })
    },
    [exercises],
  )

  const bodyParts = useMemo(
    () => Array.from(new Set(exercises.map((e) => e.bodyPart).filter(Boolean))).sort(),
    [exercises],
  )
  const equipmentTypes = useMemo(
    () => Array.from(new Set(exercises.map((e) => e.equipment).filter(Boolean))).sort(),
    [exercises],
  )
  const syncedCount = useMemo(() => exercises.filter((e) => !e.seed).length, [exercises])

  const value = useMemo<ExerciseContextValue>(
    () => ({
      exercises,
      loading,
      byId,
      search,
      bodyParts,
      equipmentTypes,
      syncedCount,
      lastSyncedAt,
      syncing,
      progress,
      syncError,
      startSync,
      cancelSync,
      usageCount,
      requestsRemaining: remainingRequests(),
      refresh: load,
    }),
    [
      exercises,
      loading,
      byId,
      search,
      bodyParts,
      equipmentTypes,
      syncedCount,
      lastSyncedAt,
      syncing,
      progress,
      syncError,
      startSync,
      cancelSync,
      usageCount,
      load,
    ],
  )

  return <ExerciseContext.Provider value={value}>{children}</ExerciseContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useExercises(): ExerciseContextValue {
  const ctx = useContext(ExerciseContext)
  if (!ctx) throw new Error('useExercises must be used within ExerciseProvider')
  return ctx
}
