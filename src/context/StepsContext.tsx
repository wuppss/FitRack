import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { StepsLog } from '../types'
import { STORAGE_KEYS, loadJSON, saveJSON } from '../lib/storage'
import { dateKey } from '../lib/format'

interface StepsContextValue {
  log: StepsLog
  today: number
  addSteps: (steps: number, date?: string) => void
  setSteps: (steps: number, date?: string) => void
  forDate: (date?: string) => number
}

const StepsContext = createContext<StepsContextValue | null>(null)

export function StepsProvider({ children }: { children: ReactNode }) {
  const [log, setLog] = useState<StepsLog>(() => loadJSON<StepsLog>(STORAGE_KEYS.steps, {}))

  useEffect(() => {
    saveJSON(STORAGE_KEYS.steps, log)
  }, [log])

  const addSteps = useCallback((steps: number, date = dateKey()) => {
    setLog((l) => ({ ...l, [date]: Math.max(0, (l[date] ?? 0) + steps) }))
  }, [])

  const setSteps = useCallback((steps: number, date = dateKey()) => {
    setLog((l) => ({ ...l, [date]: Math.max(0, steps) }))
  }, [])

  const forDate = useCallback((date = dateKey()) => log[date] ?? 0, [log])

  const value = useMemo<StepsContextValue>(
    () => ({ log, today: log[dateKey()] ?? 0, addSteps, setSteps, forDate }),
    [log, addSteps, setSteps, forDate],
  )

  return <StepsContext.Provider value={value}>{children}</StepsContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSteps(): StepsContextValue {
  const ctx = useContext(StepsContext)
  if (!ctx) throw new Error('useSteps must be used within StepsProvider')
  return ctx
}
