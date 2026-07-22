import type { WorkoutTemplate } from '../types'

/**
 * Starter templates reference the bundled seed exercises so a workout can be
 * started immediately. Once the full ExerciseDB library is synced the user can
 * build custom templates from any exercise.
 */
export const STARTER_TEMPLATES: WorkoutTemplate[] = [
  {
    id: 'tpl-push',
    name: 'Push Day',
    description: 'Chest, shoulders & triceps',
    accent: 'lime',
    exerciseIds: ['seed-bench-press', 'seed-shoulder-press', 'seed-tricep-pushdown'],
  },
  {
    id: 'tpl-pull',
    name: 'Pull Day',
    description: 'Back & biceps',
    accent: 'cyan',
    exerciseIds: ['seed-deadlift', 'seed-pullup', 'seed-dumbbell-row', 'seed-bicep-curl'],
  },
  {
    id: 'tpl-legs',
    name: 'Leg Day',
    description: 'Quads, glutes & hamstrings',
    accent: 'orange',
    exerciseIds: ['seed-squat', 'seed-leg-press', 'seed-lunge'],
  },
  {
    id: 'tpl-full',
    name: 'Full Body',
    description: 'A bit of everything',
    accent: 'purple',
    exerciseIds: ['seed-squat', 'seed-bench-press', 'seed-dumbbell-row', 'seed-plank'],
  },
]
