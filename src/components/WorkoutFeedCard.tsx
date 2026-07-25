import { Clock, Layers, Dumbbell } from 'lucide-react'
import { GlassCard } from './ui/GlassCard'
import { ExerciseGif } from './ui/ExerciseGif'
import type { WorkoutSession } from '../types'
import { prettyDate, formatDuration } from '../lib/format'

interface WorkoutFeedCardProps {
  session: WorkoutSession
  onClick?: () => void
}

/** Lyfta-style feed card: header + stats + a grid of exercise thumbnails. */
export function WorkoutFeedCard({ session, onClick }: WorkoutFeedCardProps) {
  const completedSets = session.exercises.reduce(
    (n, ex) => n + ex.sets.filter((s) => s.completed).length,
    0,
  )
  const thumbs = session.exercises.slice(0, 6)
  const extra = session.exercises.length - thumbs.length

  return (
    <GlassCard interactive onClick={onClick} className="p-4">
      {/* header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="min-w-0">
          <p className="truncate font-semibold text-txt-primary">{session.name}</p>
          <p className="text-xs text-txt-secondary">{prettyDate(session.startTime)}</p>
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-lime/10">
          <Dumbbell size={17} className="text-lime" />
        </div>
      </div>

      {/* stats */}
      <div className="mb-3 flex items-center gap-4 text-xs text-txt-secondary">
        {session.endTime && (
          <span className="flex items-center gap-1">
            <Clock size={13} className="text-txt-tertiary" />
            {formatDuration(session.endTime - session.startTime)}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Layers size={13} className="text-txt-tertiary" />
          {Math.round(session.totalVolume).toLocaleString()} kg
        </span>
        <span className="text-txt-tertiary">{completedSets} sets</span>
      </div>

      {/* exercise thumbnails */}
      <div className="grid grid-cols-3 gap-2">
        {thumbs.map((ex) => (
          <div key={ex.exerciseId} className="min-w-0">
            <ExerciseGif
              exerciseId={ex.exerciseId}
              gifUrl={ex.gifUrl}
              name={ex.name}
              className="aspect-square w-full"
              rounded="rounded-md"
            />
            <p className="mt-1 truncate text-[10px] capitalize text-txt-secondary">
              {ex.sets.length}× {ex.name}
            </p>
          </div>
        ))}
      </div>
      {extra > 0 && (
        <p className="mt-2 text-center text-[11px] text-txt-tertiary">
          +{extra} more exercise{extra === 1 ? '' : 's'}
        </p>
      )}
    </GlassCard>
  )
}
