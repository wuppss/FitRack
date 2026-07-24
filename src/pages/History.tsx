import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Dumbbell, Trash2, Clock, Layers, TrendingUp, Check, StickyNote } from 'lucide-react'
import { TopBar } from '../components/layout/TopBar'
import { PageLayout } from '../components/layout/PageLayout'
import { GlassCard } from '../components/ui/GlassCard'
import { ActionSheet } from '../components/ui/ActionSheet'
import { EmptyState } from '../components/ui/EmptyState'
import { SectionHeader } from '../components/ui/SectionHeader'
import { useWorkout } from '../context/WorkoutContext'
import type { WorkoutSession } from '../types'
import { dateKey, prettyDate, prettyTime, formatDuration } from '../lib/format'
import { subDays, format } from 'date-fns'
import { cn } from '../lib/cn'

export default function History() {
  const navigate = useNavigate()
  const { history, deleteSession } = useWorkout()
  const [selected, setSelected] = useState<WorkoutSession | null>(null)

  const volumeByDay = useMemo(() => {
    const map = new Map<string, number>()
    for (const s of history) {
      const k = dateKey(new Date(s.startTime))
      map.set(k, (map.get(k) ?? 0) + s.totalVolume)
    }
    return map
  }, [history])

  // 12 weeks heatmap (84 days)
  const days = useMemo(() => {
    const arr: { key: string; volume: number; date: Date }[] = []
    for (let i = 83; i >= 0; i--) {
      const d = subDays(new Date(), i)
      const key = dateKey(d)
      arr.push({ key, volume: volumeByDay.get(key) ?? 0, date: d })
    }
    return arr
  }, [volumeByDay])

  const maxVol = Math.max(1, ...days.map((d) => d.volume))

  return (
    <>
      <TopBar title="History" back />
      <PageLayout>
        {history.length === 0 ? (
          <div className="flex min-h-[70vh] flex-col justify-center">
            <EmptyState
              icon={Dumbbell}
              title="No workouts yet"
              description="Your completed sessions will appear here with volume, duration and PRs."
            />
          </div>
        ) : (
          <>
            {/* Heatmap */}
            <GlassCard>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-display text-sm font-bold text-txt-primary">Activity</h3>
                <span className="text-xs text-txt-tertiary">Last 12 weeks</span>
              </div>
              <div className="flex gap-1 overflow-x-auto no-scrollbar">
                {chunk(days, 7).map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-1">
                    {week.map((d) => {
                      const intensity = d.volume === 0 ? 0 : 0.25 + (d.volume / maxVol) * 0.75
                      return (
                        <div
                          key={d.key}
                          title={`${format(d.date, 'MMM d')} · ${Math.round(d.volume)} kg`}
                          className="h-4 w-4 rounded-[3px]"
                          style={{
                            background:
                              intensity === 0 ? '#171717' : `rgba(204,255,0,${intensity})`,
                          }}
                        />
                      )
                    })}
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-txt-tertiary">
                Less
                {[0, 0.35, 0.6, 0.85, 1].map((o) => (
                  <span
                    key={o}
                    className="h-3 w-3 rounded-[2px]"
                    style={{ background: o === 0 ? '#171717' : `rgba(204,255,0,${o})` }}
                  />
                ))}
                More
              </div>
            </GlassCard>

            {/* Summary counts */}
            <div className="mt-3 grid grid-cols-3 gap-3">
              <MiniTile label="Workouts" value={String(history.length)} />
              <MiniTile
                label="Total Volume"
                value={`${Math.round(history.reduce((s, w) => s + w.totalVolume, 0) / 1000)}t`}
              />
              <MiniTile label="This Week" value={String(thisWeekCount(history))} />
            </div>

            <SectionHeader title="Sessions" />
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {history.map((s) => (
                  <motion.div
                    key={s.id}
                    layout
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.2 }}
                  >
                    <GlassCard interactive onClick={() => setSelected(s)}>
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-txt-primary">{s.name}</p>
                          <p className="mt-0.5 text-xs text-txt-secondary">
                            {prettyDate(s.startTime)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteSession(s.id)
                          }}
                          className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-txt-tertiary active:bg-error/10 active:text-error"
                          aria-label="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-4 border-t border-white/5 pt-3 text-xs text-txt-secondary">
                        <Meta icon={Layers} text={`${s.exercises.length} exercises`} />
                        <Meta
                          icon={TrendingUp}
                          text={`${Math.round(s.totalVolume).toLocaleString()} kg`}
                        />
                        {s.endTime && (
                          <Meta
                            icon={Clock}
                            text={formatDuration(s.endTime - s.startTime)}
                          />
                        )}
                      </div>
                      {/* Exercise chips */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {s.exercises.slice(0, 4).map((e) => (
                          <span
                            key={e.exerciseId}
                            className="rounded-full bg-bg-surface px-2 py-0.5 text-[11px] capitalize text-txt-secondary"
                          >
                            {e.name}
                          </span>
                        ))}
                        {s.exercises.length > 4 && (
                          <span className="rounded-full bg-bg-surface px-2 py-0.5 text-[11px] text-txt-tertiary">
                            +{s.exercises.length - 4}
                          </span>
                        )}
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <button
              onClick={() => navigate('/progress')}
              className={cn('mt-6 w-full text-center text-sm text-txt-secondary')}
            >
              View detailed stats →
            </button>
          </>
        )}
      </PageLayout>

      {/* Session detail */}
      <ActionSheet
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.name ?? ''}
      >
        {selected && (
          <div>
            <p className="mb-4 text-xs text-txt-secondary">
              {prettyDate(selected.startTime)} · {prettyTime(selected.startTime)}
              {selected.endTime &&
                ` · ${formatDuration(selected.endTime - selected.startTime)}`}{' '}
              · {Math.round(selected.totalVolume).toLocaleString()} kg volume
            </p>
            <div className="space-y-4">
              {selected.exercises.map((ex) => (
                <div key={ex.exerciseId}>
                  <p className="mb-1.5 text-sm font-semibold capitalize text-txt-primary">
                    {ex.name}
                  </p>
                  {ex.notes && (
                    <p className="mb-1.5 flex items-start gap-1.5 rounded-md bg-bg-surface px-2.5 py-2 text-xs text-txt-secondary">
                      <StickyNote size={13} className="mt-0.5 shrink-0 text-lime" />
                      {ex.notes}
                    </p>
                  )}
                  <div className="space-y-1">
                    {ex.sets.map((set, i) => (
                      <div
                        key={set.id}
                        className={cn(
                          'flex items-center gap-3 rounded-md px-2.5 py-1.5 text-sm',
                          set.completed ? 'bg-lime/[0.07]' : 'bg-bg-surface opacity-60',
                        )}
                      >
                        <span className="w-5 text-xs font-semibold text-txt-tertiary">
                          {i + 1}
                        </span>
                        <span className="flex-1 text-txt-primary">
                          {set.weight} kg × {set.reps}
                          {set.rpe ? (
                            <span className="ml-1.5 text-xs text-txt-tertiary">
                              @RPE {set.rpe}
                            </span>
                          ) : null}
                        </span>
                        {set.completed && <Check size={14} className="text-lime" />}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </ActionSheet>
    </>
  )
}

function Meta({ icon: Icon, text }: { icon: typeof Clock; text: string }) {
  return (
    <span className="flex items-center gap-1">
      <Icon size={13} className="text-txt-tertiary" /> {text}
    </span>
  )
}

function MiniTile({ label, value }: { label: string; value: string }) {
  return (
    <GlassCard className="p-3 text-center">
      <p className="text-data text-lg text-lime">{value}</p>
      <p className="mt-0.5 text-[10px] uppercase tracking-wide text-txt-tertiary">{label}</p>
    </GlassCard>
  )
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

function thisWeekCount(history: { startTime: number; endTime: number | null }[]): number {
  const weekAgo = subDays(new Date(), 6)
  return history.filter((s) => s.endTime && new Date(s.startTime) >= weekAgo).length
}
