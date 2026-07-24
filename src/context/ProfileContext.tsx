import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Goals, Profile } from '../types'
import { STORAGE_KEYS, loadJSON, saveJSON } from '../lib/storage'
import { dateKey } from '../lib/format'

/** kg per day, keyed by yyyy-MM-dd */
export type WeightLog = Record<string, number>

const DEFAULT_PROFILE: Profile = {
  name: 'Athlete',
  gender: 'male',
  age: 27,
  height: 178,
  weight: 78,
  activityLevel: 'moderate',
  units: 'metric',
  goals: {
    calories: 2600,
    water: 2500,
    steps: 10000,
    weeklyWorkouts: 4,
  },
}

interface ProfileContextValue {
  profile: Profile
  updateProfile: (patch: Partial<Profile>) => void
  updateGoals: (patch: Partial<Goals>) => void
  /** update current weight AND record it in the daily weight log */
  logWeight: (kg: number) => void
  weightLog: WeightLog
  bmr: number
  tdee: number
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

const ACTIVITY_FACTOR: Record<Profile['activityLevel'], number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(() =>
    loadJSON<Profile>(STORAGE_KEYS.profile, DEFAULT_PROFILE),
  )
  const [weightLog, setWeightLog] = useState<WeightLog>(() =>
    loadJSON<WeightLog>(STORAGE_KEYS.weightLog, {}),
  )

  useEffect(() => {
    saveJSON(STORAGE_KEYS.profile, profile)
  }, [profile])

  useEffect(() => {
    saveJSON(STORAGE_KEYS.weightLog, weightLog)
  }, [weightLog])

  const value = useMemo<ProfileContextValue>(() => {
    // Mifflin-St Jeor
    const s = profile.gender === 'male' ? 5 : -161
    const bmr = Math.round(10 * profile.weight + 6.25 * profile.height - 5 * profile.age + s)
    const tdee = Math.round(bmr * ACTIVITY_FACTOR[profile.activityLevel])
    return {
      profile,
      weightLog,
      bmr,
      tdee,
      updateProfile: (patch) => setProfile((p) => ({ ...p, ...patch })),
      updateGoals: (patch) => setProfile((p) => ({ ...p, goals: { ...p.goals, ...patch } })),
      logWeight: (kg) => {
        if (kg <= 0) return
        setProfile((p) => ({ ...p, weight: kg }))
        setWeightLog((l) => ({ ...l, [dateKey()]: kg }))
      },
    }
  }, [profile, weightLog])

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider')
  return ctx
}
