import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Goals, Profile } from '../types'
import { STORAGE_KEYS, loadJSON, saveJSON } from '../lib/storage'

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

  useEffect(() => {
    saveJSON(STORAGE_KEYS.profile, profile)
  }, [profile])

  const value = useMemo<ProfileContextValue>(() => {
    // Mifflin-St Jeor
    const s = profile.gender === 'male' ? 5 : -161
    const bmr = Math.round(10 * profile.weight + 6.25 * profile.height - 5 * profile.age + s)
    const tdee = Math.round(bmr * ACTIVITY_FACTOR[profile.activityLevel])
    return {
      profile,
      bmr,
      tdee,
      updateProfile: (patch) => setProfile((p) => ({ ...p, ...patch })),
      updateGoals: (patch) => setProfile((p) => ({ ...p, goals: { ...p.goals, ...patch } })),
    }
  }, [profile])

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider')
  return ctx
}
