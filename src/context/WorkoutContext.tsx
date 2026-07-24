import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Exercise, WorkoutExercise, WorkoutSession, WorkoutSet } from '../types'
import { STORAGE_KEYS, loadJSON, saveJSON, uid } from '../lib/storage'

interface WorkoutContextValue {
  history: WorkoutSession[]
  active: WorkoutSession | null
  startWorkout: (name: string, exercises: Exercise[]) => void
  addExerciseToActive: (exercise: Exercise) => void
  removeExerciseFromActive: (exerciseId: string) => void
  addSet: (exerciseId: string) => void
  updateSet: (exerciseId: string, setId: string, patch: Partial<WorkoutSet>) => void
  removeSet: (exerciseId: string, setId: string) => void
  toggleSetComplete: (exerciseId: string, setId: string) => void
  setExerciseNotes: (exerciseId: string, notes: string) => void
  finishWorkout: () => WorkoutSession | null
  cancelWorkout: () => void
  deleteSession: (id: string) => void
}

const WorkoutContext = createContext<WorkoutContextValue | null>(null)

function toWorkoutExercise(ex: Exercise): WorkoutExercise {
  return {
    exerciseId: ex.id,
    name: ex.name,
    bodyPart: ex.bodyPart,
    target: ex.target,
    equipment: ex.equipment,
    gifUrl: ex.gifUrl,
    notes: '',
    sets: [{ id: uid('set-'), weight: 0, reps: 0, completed: false }],
  }
}

function computeVolume(exercises: WorkoutExercise[]): number {
  return exercises.reduce(
    (total, ex) =>
      total +
      ex.sets.reduce((s, set) => (set.completed ? s + set.weight * set.reps : s), 0),
    0,
  )
}

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<WorkoutSession[]>(() =>
    loadJSON<WorkoutSession[]>(STORAGE_KEYS.workouts, []),
  )
  const [active, setActive] = useState<WorkoutSession | null>(() =>
    loadJSON<WorkoutSession | null>(STORAGE_KEYS.activeSession, null),
  )

  useEffect(() => {
    saveJSON(STORAGE_KEYS.workouts, history)
  }, [history])

  useEffect(() => {
    saveJSON(STORAGE_KEYS.activeSession, active)
  }, [active])

  const startWorkout = useCallback((name: string, exercises: Exercise[]) => {
    setActive({
      id: uid('w-'),
      name,
      exercises: exercises.map(toWorkoutExercise),
      startTime: Date.now(),
      endTime: null,
      totalVolume: 0,
    })
  }, [])

  const mutateActive = useCallback(
    (fn: (s: WorkoutSession) => WorkoutSession) => {
      setActive((prev) => (prev ? fn(prev) : prev))
    },
    [],
  )

  const addExerciseToActive = useCallback(
    (exercise: Exercise) => {
      mutateActive((s) => {
        if (s.exercises.some((e) => e.exerciseId === exercise.id)) return s
        return { ...s, exercises: [...s.exercises, toWorkoutExercise(exercise)] }
      })
    },
    [mutateActive],
  )

  const removeExerciseFromActive = useCallback(
    (exerciseId: string) => {
      mutateActive((s) => ({
        ...s,
        exercises: s.exercises.filter((e) => e.exerciseId !== exerciseId),
      }))
    },
    [mutateActive],
  )

  const addSet = useCallback(
    (exerciseId: string) => {
      mutateActive((s) => ({
        ...s,
        exercises: s.exercises.map((e) => {
          if (e.exerciseId !== exerciseId) return e
          const last = e.sets[e.sets.length - 1]
          return {
            ...e,
            sets: [
              ...e.sets,
              {
                id: uid('set-'),
                weight: last?.weight ?? 0,
                reps: last?.reps ?? 0,
                completed: false,
              },
            ],
          }
        }),
      }))
    },
    [mutateActive],
  )

  const updateSet = useCallback(
    (exerciseId: string, setId: string, patch: Partial<WorkoutSet>) => {
      mutateActive((s) => ({
        ...s,
        exercises: s.exercises.map((e) =>
          e.exerciseId !== exerciseId
            ? e
            : {
                ...e,
                sets: e.sets.map((set) => (set.id === setId ? { ...set, ...patch } : set)),
              },
        ),
      }))
    },
    [mutateActive],
  )

  const removeSet = useCallback(
    (exerciseId: string, setId: string) => {
      mutateActive((s) => ({
        ...s,
        exercises: s.exercises.map((e) =>
          e.exerciseId !== exerciseId
            ? e
            : { ...e, sets: e.sets.filter((set) => set.id !== setId) },
        ),
      }))
    },
    [mutateActive],
  )

  const toggleSetComplete = useCallback(
    (exerciseId: string, setId: string) => {
      mutateActive((s) => ({
        ...s,
        exercises: s.exercises.map((e) =>
          e.exerciseId !== exerciseId
            ? e
            : {
                ...e,
                sets: e.sets.map((set) =>
                  set.id === setId ? { ...set, completed: !set.completed } : set,
                ),
              },
        ),
      }))
    },
    [mutateActive],
  )

  const setExerciseNotes = useCallback(
    (exerciseId: string, notes: string) => {
      mutateActive((s) => ({
        ...s,
        exercises: s.exercises.map((e) =>
          e.exerciseId !== exerciseId ? e : { ...e, notes },
        ),
      }))
    },
    [mutateActive],
  )

  const finishWorkout = useCallback((): WorkoutSession | null => {
    let finished: WorkoutSession | null = null
    setActive((prev) => {
      if (!prev) return null
      finished = {
        ...prev,
        endTime: Date.now(),
        totalVolume: computeVolume(prev.exercises),
      }
      return null
    })
    if (finished) {
      setHistory((h) => [finished as WorkoutSession, ...h])
    }
    return finished
  }, [])

  const cancelWorkout = useCallback(() => setActive(null), [])

  const deleteSession = useCallback((id: string) => {
    setHistory((h) => h.filter((s) => s.id !== id))
  }, [])

  const value = useMemo<WorkoutContextValue>(
    () => ({
      history,
      active,
      startWorkout,
      addExerciseToActive,
      removeExerciseFromActive,
      addSet,
      updateSet,
      removeSet,
      toggleSetComplete,
      setExerciseNotes,
      finishWorkout,
      cancelWorkout,
      deleteSession,
    }),
    [
      history,
      active,
      startWorkout,
      addExerciseToActive,
      removeExerciseFromActive,
      addSet,
      updateSet,
      removeSet,
      toggleSetComplete,
      setExerciseNotes,
      finishWorkout,
      cancelWorkout,
      deleteSession,
    ],
  )

  return <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWorkout(): WorkoutContextValue {
  const ctx = useContext(WorkoutContext)
  if (!ctx) throw new Error('useWorkout must be used within WorkoutProvider')
  return ctx
}
