import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import type { Exercise } from '../types'
import { ExerciseGif } from './ui/ExerciseGif'
import { titleCase } from '../lib/format'

interface ExerciseCardProps {
  exercise: Exercise
  onClick?: () => void
  trailing?: React.ReactNode
}

export function ExerciseCard({ exercise, onClick, trailing }: ExerciseCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className="glass-card flex w-full items-center gap-3 rounded-lg p-3 text-left active:brightness-95"
    >
      <ExerciseGif
        gifUrl={exercise.gifUrl}
        name={exercise.name}
        className="h-14 w-14 shrink-0"
        rounded="rounded-md"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium capitalize text-txt-primary">{exercise.name}</p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-lime/10 px-2 py-0.5 text-[11px] font-medium capitalize text-lime">
            {titleCase(exercise.target)}
          </span>
          <span className="text-[11px] capitalize text-txt-tertiary">{exercise.equipment}</span>
        </div>
      </div>
      {trailing ?? <ChevronRight size={18} className="shrink-0 text-txt-tertiary" />}
    </motion.button>
  )
}
