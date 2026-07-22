import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { WaterLog } from '../types'
import { STORAGE_KEYS, loadJSON, saveJSON } from '../lib/storage'
import { dateKey } from '../lib/format'

interface WaterContextValue {
  log: WaterLog
  today: number
  addWater: (ml: number, date?: string) => void
  setWater: (ml: number, date?: string) => void
  forDate: (date?: string) => number
  streak: (goal: number) => number
}

const WaterContext = createContext<WaterContextValue | null>(null)

export function WaterProvider({ children }: { children: ReactNode }) {
  const [log, setLog] = useState<WaterLog>(() => loadJSON<WaterLog>(STORAGE_KEYS.water, {}))

  useEffect(() => {
    saveJSON(STORAGE_KEYS.water, log)
  }, [log])

  const addWater = useCallback((ml: number, date = dateKey()) => {
    setLog((l) => ({ ...l, [date]: Math.max(0, (l[date] ?? 0) + ml) }))
  }, [])

  const setWater = useCallback((ml: number, date = dateKey()) => {
    setLog((l) => ({ ...l, [date]: Math.max(0, ml) }))
  }, [])

  const forDate = useCallback((date = dateKey()) => log[date] ?? 0, [log])

  const streak = useCallback(
    (goal: number) => {
      let count = 0
      const d = new Date()
      // walk backwards from today while the goal was met
      for (;;) {
        const key = dateKey(d)
        if ((log[key] ?? 0) >= goal) {
          count += 1
          d.setDate(d.getDate() - 1)
        } else {
          break
        }
      }
      return count
    },
    [log],
  )

  const value = useMemo<WaterContextValue>(
    () => ({ log, today: log[dateKey()] ?? 0, addWater, setWater, forDate, streak }),
    [log, addWater, setWater, forDate, streak],
  )

  return <WaterContext.Provider value={value}>{children}</WaterContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWater(): WaterContextValue {
  const ctx = useContext(WaterContext)
  if (!ctx) throw new Error('useWater must be used within WaterProvider')
  return ctx
}
