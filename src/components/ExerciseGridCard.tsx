import { motion } from 'framer-motion'
import { Bookmark } from 'lucide-react'
import type { Exercise } from '../types'
import { ExerciseGif } from './ui/ExerciseGif'
import { titleCase } from '../lib/format'
import { cn } from '../lib/cn'

interface ExerciseGridCardProps {
  exercise: Exercise
  onClick?: () => void
  saved?: boolean
  onToggleSave?: () => void
}

/** Lyfta-style image-forward card used in the 2-column exercise grid. */
export function ExerciseGridCard({
  exercise,
  onClick,
  saved,
  onToggleSave,
}: ExerciseGridCardProps) {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex cursor-pointer flex-col overflow-hidden rounded-lg border border-white/[0.06] bg-bg-surface"
    >
      <div className="relative">
        <ExerciseGif
          exerciseId={exercise.id}
          gifUrl={exercise.gifUrl}
          name={exercise.name}
          rounded="rounded-none"
          className="aspect-square w-full bg-gradient-to-b from-[#141414] to-[#0d0d0d]"
        />
        {onToggleSave && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleSave()
            }}
            className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm active:scale-90"
            aria-label={saved ? 'Remove bookmark' : 'Bookmark exercise'}
          >
            <Bookmark
              size={15}
              className={cn(saved ? 'text-lime' : 'text-white')}
              fill={saved ? '#CCFF00' : 'none'}
            />
          </button>
        )}
      </div>
      <div className="p-3">
        <p className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold capitalize leading-tight text-txt-primary">
          {exercise.name}
        </p>
        <p className="mt-1 text-xs capitalize text-txt-secondary">{titleCase(exercise.target)}</p>
      </div>
    </motion.div>
  )
}
