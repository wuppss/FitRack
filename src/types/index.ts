// ---------------------------------------------------------------------------
// Exercise library (sourced from ExerciseDB / RapidAPI, cached in IndexedDB)
// ---------------------------------------------------------------------------

/** Raw shape returned by the ExerciseDB `/exercises` endpoints. */
export interface ExerciseDBRaw {
  id: string
  name: string
  bodyPart: string
  target: string
  equipment: string
  gifUrl: string
  secondaryMuscles?: string[]
  instructions?: string[]
}

/** Normalized exercise stored locally and used throughout the app. */
export interface Exercise {
  id: string
  name: string
  bodyPart: string
  target: string
  equipment: string
  gifUrl: string
  secondaryMuscles: string[]
  instructions: string[]
  /** true when this record is one of the bundled fallback exercises. */
  seed?: boolean
}

// ---------------------------------------------------------------------------
// Workouts
// ---------------------------------------------------------------------------

export interface WorkoutSet {
  id: string
  weight: number
  reps: number
  rpe?: number
  completed: boolean
}

export interface WorkoutExercise {
  exerciseId: string
  /** denormalized so history renders without a library lookup */
  name: string
  bodyPart: string
  target: string
  equipment: string
  gifUrl: string
  sets: WorkoutSet[]
  notes: string
}

export interface WorkoutSession {
  id: string
  name: string
  exercises: WorkoutExercise[]
  startTime: number
  endTime: number | null
  /** total volume in kg */
  totalVolume: number
}

export interface WorkoutTemplate {
  id: string
  name: string
  description: string
  accent: 'lime' | 'cyan' | 'orange' | 'purple'
  /** exercise ids referencing the library */
  exerciseIds: string[]
}

// ---------------------------------------------------------------------------
// Nutrition
// ---------------------------------------------------------------------------

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export interface FoodEntry {
  id: string
  name: string
  meal: MealType
  calories: number
  protein: number
  carbs: number
  fat: number
  /** ISO date (yyyy-MM-dd) */
  date: string
  createdAt: number
}

// ---------------------------------------------------------------------------
// Water & Steps (keyed by ISO date)
// ---------------------------------------------------------------------------

export interface WaterLog {
  /** ml consumed per day, keyed by yyyy-MM-dd */
  [date: string]: number
}

export interface StepsLog {
  [date: string]: number
}

// ---------------------------------------------------------------------------
// Profile & goals
// ---------------------------------------------------------------------------

export type UnitSystem = 'metric' | 'imperial'
export type Gender = 'male' | 'female'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'

export interface Profile {
  name: string
  gender: Gender
  age: number
  /** cm */
  height: number
  /** kg */
  weight: number
  activityLevel: ActivityLevel
  units: UnitSystem
  goals: Goals
}

export interface Goals {
  calories: number
  protein: number // grams
  carbs: number // grams
  fat: number // grams
  water: number // ml
  steps: number
  weeklyWorkouts: number
}
