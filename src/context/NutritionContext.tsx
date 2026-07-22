import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { FoodEntry, MealType } from '../types'
import { STORAGE_KEYS, loadJSON, saveJSON, uid } from '../lib/storage'
import { dateKey } from '../lib/format'

export interface MacroTotals {
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface NutritionContextValue {
  entries: FoodEntry[]
  addFood: (input: Omit<FoodEntry, 'id' | 'createdAt' | 'date'> & { date?: string }) => void
  removeFood: (id: string) => void
  entriesForDate: (date?: string) => FoodEntry[]
  totalsForDate: (date?: string) => MacroTotals
  recentFoods: FoodEntry[]
}

const NutritionContext = createContext<NutritionContextValue | null>(null)

const EMPTY: MacroTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 }

export function NutritionProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<FoodEntry[]>(() =>
    loadJSON<FoodEntry[]>(STORAGE_KEYS.food, []),
  )

  useEffect(() => {
    saveJSON(STORAGE_KEYS.food, entries)
  }, [entries])

  const addFood = useCallback<NutritionContextValue['addFood']>((input) => {
    const entry: FoodEntry = {
      id: uid('food-'),
      createdAt: Date.now(),
      date: input.date ?? dateKey(),
      name: input.name,
      meal: input.meal,
      calories: input.calories,
      protein: input.protein,
      carbs: input.carbs,
      fat: input.fat,
    }
    setEntries((e) => [entry, ...e])
  }, [])

  const removeFood = useCallback((id: string) => {
    setEntries((e) => e.filter((x) => x.id !== id))
  }, [])

  const entriesForDate = useCallback(
    (date = dateKey()) => entries.filter((e) => e.date === date),
    [entries],
  )

  const totalsForDate = useCallback(
    (date = dateKey()): MacroTotals =>
      entries
        .filter((e) => e.date === date)
        .reduce(
          (acc, e) => ({
            calories: acc.calories + e.calories,
            protein: acc.protein + e.protein,
            carbs: acc.carbs + e.carbs,
            fat: acc.fat + e.fat,
          }),
          { ...EMPTY },
        ),
    [entries],
  )

  const recentFoods = useMemo(() => {
    const seen = new Set<string>()
    const out: FoodEntry[] = []
    for (const e of entries) {
      const k = e.name.toLowerCase()
      if (seen.has(k)) continue
      seen.add(k)
      out.push(e)
      if (out.length >= 8) break
    }
    return out
  }, [entries])

  const value = useMemo<NutritionContextValue>(
    () => ({ entries, addFood, removeFood, entriesForDate, totalsForDate, recentFoods }),
    [entries, addFood, removeFood, entriesForDate, totalsForDate, recentFoods],
  )

  return <NutritionContext.Provider value={value}>{children}</NutritionContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNutrition(): NutritionContextValue {
  const ctx = useContext(NutritionContext)
  if (!ctx) throw new Error('useNutrition must be used within NutritionProvider')
  return ctx
}

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
}
