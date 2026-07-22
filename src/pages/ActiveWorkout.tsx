import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  X,
  Plus,
  Check,
  Timer,
  Trash2,
  Dumbbell,
  Flag,
  Search,
  SkipForward,
  Minus,
} from 'lucide-react'
import { PageLayout } from '../components/layout/PageLayout'
import { GlassCard } from '../components/ui/GlassCard'
import { Button } from '../components/ui/Button'
import { ActionSheet } from '../components/ui/ActionSheet'
import { ExerciseGif } from '../components/ui/ExerciseGif'
import { ExerciseCard } from '../components/ExerciseCard'
import { EmptyState } from '../components/ui/EmptyState'
import { useWorkout } from '../context/WorkoutContext'
import { useExercises } from '../context/ExerciseContext'
import { useProfile } from '../context/ProfileContext'
import type { WorkoutExercise, WorkoutSession } from '../types'
import { formatClock, formatDuration } from '../lib/format'
import { cn } from '../lib/cn'

export default function ActiveWorkout() {
  const navigate = useNavigate()
  const {
    active,
    startWorkout,
    addExerciseToActive,
    removeExerciseFromActive,
    addSet,
    updateSet,
    removeSet,
    toggleSetComplete,
    finishWorkout,
    cancelWorkout,
  } = useWorkout()

  const units = useProfile().profile.units
  const [now, setNow] = useState(Date.now())
  const [addOpen, setAddOpen] = useState(false)
  const [rest, setRest] = useState<{ total: number; endsAt: number } | null>(null)
  const [summary, setSummary] = useState<WorkoutSession | null>(null)

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const elapsed = active ? now - active.startTime : 0

  const stats = useMemo(() => {
    if (!active) return { volume: 0, sets: 0, done: 0 }
    let volume = 0
    let sets = 0
    let done = 0
    for (const ex of active.exercises) {
      for (const s of ex.sets) {
        sets += 1
        if (s.completed) {
          done += 1
          volume += s.weight * s.reps
        }
      }
    }
    return { volume, sets, done }
  }, [active])

  // --- empty state -----------------------------------------------------------
  if (!active) {
    return (
      <PageLayout>
        <div className="flex min-h-[80vh] flex-col justify-center">
          <EmptyState
            icon={Dumbbell}
            title="No active workout"
            description="Start an empty session and add exercises, or pick a template from the Workout hub."
            action={
              <div className="flex flex-col gap-2">
                <Button onClick={() => startWorkout('Quick Workout', [])} icon={<Plus size={18} />}>
                  Start Empty Workout
                </Button>
                <Button variant="ghost" onClick={() => navigate('/workout')}>
                  Browse templates
                </Button>
              </div>
            }
          />
        </div>
      </PageLayout>
    )
  }

  const handleFinish = () => {
    const done = finishWorkout()
    if (done) setSummary(done)
  }

  const completeSet = (exId: string, setId: string, wasCompleted: boolean) => {
    toggleSetComplete(exId, setId)
    if (!wasCompleted) {
      // starting rest on completion
      setRest({ total: 90, endsAt: Date.now() + 90 * 1000 })
    }
  }

  return (
    <div className="mx-auto min-h-[100dvh] w-full max-w-[428px] bg-bg-primary">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-black/85 backdrop-blur-md">
        <div className="safe-top" />
        <div className="flex items-center justify-between px-5 py-3">
          <button
            onClick={() => cancelWorkout()}
            className="flex h-9 items-center gap-1 rounded-full px-3 text-sm text-txt-secondary active:bg-white/5"
          >
            <X size={18} /> Discard
          </button>
          <div className="text-center">
            <p className="text-xs text-txt-tertiary">{active.name}</p>
            <p className="text-data text-lg tabular-nums text-lime">
              {formatClock(elapsed / 1000)}
            </p>
          </div>
          <button
            onClick={handleFinish}
            className="flex h-9 items-center gap-1 rounded-full bg-lime px-3 text-sm font-semibold text-black active:brightness-95"
          >
            <Flag size={15} /> Finish
          </button>
        </div>
        {/* Live stats */}
        <div className="grid grid-cols-3 border-t border-white/5 text-center">
          <HeaderStat label="Volume" value={`${Math.round(stats.volume).toLocaleString()} kg`} />
          <HeaderStat label="Sets" value={`${stats.done}/${stats.sets}`} />
          <HeaderStat label="Exercises" value={String(active.exercises.length)} />
        </div>
      </header>

      <div className="px-5 pb-40 pt-4">
        {active.exercises.length === 0 ? (
          <EmptyState
            icon={Plus}
            title="Add your first exercise"
            description="Pick from the library to start logging sets."
            action={<Button onClick={() => setAddOpen(true)} icon={<Search size={18} />}>Add Exercise</Button>}
          />
        ) : (
          <div className="space-y-4">
            {active.exercises.map((ex) => (
              <ExerciseBlock
                key={ex.exerciseId}
                ex={ex}
                units={units}
                onAddSet={() => addSet(ex.exerciseId)}
                onRemove={() => removeExerciseFromActive(ex.exerciseId)}
                onUpdateSet={(setId, patch) => updateSet(ex.exerciseId, setId, patch)}
                onRemoveSet={(setId) => removeSet(ex.exerciseId, setId)}
                onToggle={(setId, was) => completeSet(ex.exerciseId, setId, was)}
              />
            ))}
          </div>
        )}

        {active.exercises.length > 0 && (
          <Button
            full
            variant="secondary"
            className="mt-4"
            icon={<Plus size={18} />}
            onClick={() => setAddOpen(true)}
          >
            Add Exercise
          </Button>
        )}
      </div>

      {/* Rest timer overlay */}
      <AnimatePresence>
        {rest && (
          <RestTimer
            key="rest"
            total={rest.total}
            endsAt={rest.endsAt}
            onAdjust={(delta) =>
              setRest((r) =>
                r ? { total: r.total + delta, endsAt: r.endsAt + delta * 1000 } : r,
              )
            }
            onDismiss={() => setRest(null)}
          />
        )}
      </AnimatePresence>

      {/* Add exercise sheet */}
      <AddExerciseSheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        existing={active.exercises.map((e) => e.exerciseId)}
        onPick={(ex) => {
          addExerciseToActive(ex)
          setAddOpen(false)
        }}
      />

      {/* Summary sheet */}
      <ActionSheet open={Boolean(summary)} onClose={() => {}} title="Workout Complete 🎉">
        {summary && (
          <div>
            <div className="grid grid-cols-3 gap-3">
              <SummaryStat label="Duration" value={formatDuration((summary.endTime ?? 0) - summary.startTime)} />
              <SummaryStat label="Volume" value={`${Math.round(summary.totalVolume).toLocaleString()} kg`} />
              <SummaryStat label="Exercises" value={String(summary.exercises.length)} />
            </div>
            <div className="mt-4 space-y-2">
              {summary.exercises.map((ex) => (
                <div
                  key={ex.exerciseId}
                  className="flex items-center justify-between rounded-md bg-bg-surface px-3 py-2"
                >
                  <span className="truncate text-sm capitalize text-txt-primary">{ex.name}</span>
                  <span className="text-xs text-txt-secondary">
                    {ex.sets.filter((s) => s.completed).length} sets
                  </span>
                </div>
              ))}
            </div>
            <Button
              full
              size="lg"
              className="mt-5"
              icon={<Check size={20} />}
              onClick={() => {
                setSummary(null)
                navigate('/')
              }}
            >
              Done
            </Button>
          </div>
        )}
      </ActionSheet>
    </div>
  )
}

function HeaderStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-2">
      <p className="text-data text-sm text-txt-primary">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-txt-tertiary">{label}</p>
    </div>
  )
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-bg-surface p-3 text-center">
      <p className="text-data text-base text-lime">{value}</p>
      <p className="mt-0.5 text-[10px] uppercase tracking-wide text-txt-tertiary">{label}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------

function ExerciseBlock({
  ex,
  units,
  onAddSet,
  onRemove,
  onUpdateSet,
  onRemoveSet,
  onToggle,
}: {
  ex: WorkoutExercise
  units: 'metric' | 'imperial'
  onAddSet: () => void
  onRemove: () => void
  onUpdateSet: (setId: string, patch: Partial<{ weight: number; reps: number; rpe: number }>) => void
  onRemoveSet: (setId: string) => void
  onToggle: (setId: string, wasCompleted: boolean) => void
}) {
  const unit = units === 'metric' ? 'kg' : 'lb'
  return (
    <GlassCard className="p-3">
      <div className="mb-2 flex items-center gap-3">
        <ExerciseGif gifUrl={ex.gifUrl} name={ex.name} className="h-11 w-11 shrink-0" rounded="rounded-md" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold capitalize text-txt-primary">{ex.name}</p>
          <p className="text-xs capitalize text-txt-tertiary">{ex.target}</p>
        </div>
        <button
          onClick={onRemove}
          className="flex h-8 w-8 items-center justify-center rounded-full text-txt-tertiary active:bg-white/5"
          aria-label="Remove exercise"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Column labels */}
      <div className="mb-1 grid grid-cols-[28px_1fr_1fr_44px] items-center gap-2 px-1 text-[10px] uppercase tracking-wide text-txt-tertiary">
        <span>Set</span>
        <span className="text-center">{unit}</span>
        <span className="text-center">Reps</span>
        <span className="text-center">Done</span>
      </div>

      <div className="space-y-1.5">
        {ex.sets.map((set, i) => (
          <div
            key={set.id}
            className={cn(
              'grid grid-cols-[28px_1fr_1fr_44px] items-center gap-2 rounded-md px-1 py-1 transition-colors',
              set.completed && 'bg-lime/[0.07]',
            )}
          >
            <span className="text-center text-sm font-semibold text-txt-secondary">{i + 1}</span>
            <NumberField
              value={set.weight}
              onChange={(v) => onUpdateSet(set.id, { weight: v })}
              step={2.5}
            />
            <NumberField
              value={set.reps}
              onChange={(v) => onUpdateSet(set.id, { reps: v })}
              step={1}
            />
            <div className="flex justify-center">
              <button
                onClick={() => onToggle(set.id, set.completed)}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-md border transition-colors',
                  set.completed
                    ? 'border-lime bg-lime text-black'
                    : 'border-white/10 text-txt-tertiary',
                )}
                aria-label="Complete set"
              >
                <Check size={16} strokeWidth={3} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2 flex gap-2">
        <button
          onClick={onAddSet}
          className="flex flex-1 items-center justify-center gap-1 rounded-md bg-bg-surface py-2 text-sm font-medium text-txt-secondary active:brightness-90"
        >
          <Plus size={15} /> Add set
        </button>
        {ex.sets.length > 1 && (
          <button
            onClick={() => onRemoveSet(ex.sets[ex.sets.length - 1].id)}
            className="flex items-center justify-center rounded-md bg-bg-surface px-3 py-2 text-txt-tertiary active:brightness-90"
            aria-label="Remove last set"
          >
            <Minus size={15} />
          </button>
        )}
      </div>
    </GlassCard>
  )
}

function NumberField({
  value,
  onChange,
  step,
}: {
  value: number
  onChange: (v: number) => void
  step: number
}) {
  return (
    <input
      type="number"
      inputMode="decimal"
      value={value === 0 ? '' : value}
      placeholder="0"
      step={step}
      onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
      className="h-9 w-full rounded-md bg-bg-input text-center text-sm font-semibold text-txt-primary outline-none focus:ring-1 focus:ring-lime/40"
    />
  )
}

// ---------------------------------------------------------------------------

function RestTimer({
  total,
  endsAt,
  onAdjust,
  onDismiss,
}: {
  total: number
  endsAt: number
  onAdjust: (delta: number) => void
  onDismiss: () => void
}) {
  const [remaining, setRemaining] = useState(Math.round((endsAt - Date.now()) / 1000))

  useEffect(() => {
    const t = setInterval(() => {
      const r = Math.round((endsAt - Date.now()) / 1000)
      setRemaining(r)
      if (r <= 0) {
        clearInterval(t)
        onDismiss()
      }
    }, 250)
    return () => clearInterval(t)
  }, [endsAt, onDismiss])

  const pct = Math.max(0, Math.min(100, (remaining / total) * 100))

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[428px] px-4 pb-[calc(16px+env(safe-area-inset-bottom))]"
    >
      <div className="glass-card overflow-hidden rounded-xl p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer size={18} className="text-lime" />
            <span className="text-sm font-medium text-txt-secondary">Rest</span>
          </div>
          <span className="text-data text-2xl tabular-nums text-lime">
            {formatClock(Math.max(0, remaining))}
          </span>
        </div>
        <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/5">
          <div className="h-full rounded-full bg-lime transition-all duration-200" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onAdjust(-15)}
            className="flex-1 rounded-md bg-bg-surface py-2 text-sm text-txt-secondary active:brightness-90"
          >
            −15s
          </button>
          <button
            onClick={() => onAdjust(15)}
            className="flex-1 rounded-md bg-bg-surface py-2 text-sm text-txt-secondary active:brightness-90"
          >
            +15s
          </button>
          <button
            onClick={onDismiss}
            className="flex flex-1 items-center justify-center gap-1 rounded-md bg-lime py-2 text-sm font-semibold text-black active:brightness-95"
          >
            <SkipForward size={15} /> Skip
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------

function AddExerciseSheet({
  open,
  onClose,
  existing,
  onPick,
}: {
  open: boolean
  onClose: () => void
  existing: string[]
  onPick: (ex: import('../types').Exercise) => void
}) {
  const { search } = useExercises()
  const [q, setQ] = useState('')
  const results = useMemo(() => search(q).slice(0, 40), [search, q])

  return (
    <ActionSheet open={open} onClose={onClose} title="Add Exercise">
      <div className="relative mb-3">
        <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-txt-tertiary" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search exercises…"
          className="h-11 w-full rounded-md border border-white/5 bg-bg-input pl-10 pr-3 text-[15px] text-txt-primary placeholder:text-txt-tertiary outline-none focus:border-lime/40"
        />
      </div>
      <div className="space-y-2">
        {results.map((ex) => {
          const added = existing.includes(ex.id)
          return (
            <ExerciseCard
              key={ex.id}
              exercise={ex}
              onClick={() => !added && onPick(ex)}
              trailing={
                added ? (
                  <Check size={18} className="shrink-0 text-lime" />
                ) : (
                  <Plus size={18} className="shrink-0 text-txt-secondary" />
                )
              }
            />
          )
        })}
      </div>
    </ActionSheet>
  )
}
