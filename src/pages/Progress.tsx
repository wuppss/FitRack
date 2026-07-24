import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
} from 'recharts'
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Dumbbell,
  BarChart3,
  Clock,
  Layers,
  ChevronRight,
} from 'lucide-react'
import { TopBar } from '../components/layout/TopBar'
import { PageLayout } from '../components/layout/PageLayout'
import { GlassCard } from '../components/ui/GlassCard'
import { EmptyState } from '../components/ui/EmptyState'
import { SectionHeader } from '../components/ui/SectionHeader'
import { useWorkout } from '../context/WorkoutContext'
import { useProfile } from '../context/ProfileContext'
import { titleCase, formatDuration, epley1Rm } from '../lib/format'
import { format, parseISO, subDays } from 'date-fns'

interface PR {
  name: string
  weight: number
  reps: number
  oneRm: number
}

export default function Progress() {
  const navigate = useNavigate()
  const { history } = useWorkout()
  const { weightLog } = useProfile()

  const completed = useMemo(() => history.filter((s) => s.endTime), [history])

  // --- weekly summary (this week vs previous week) --------------------------
  const summary = useMemo(() => {
    const now = new Date()
    const weekAgo = subDays(now, 7)
    const twoWeeksAgo = subDays(now, 14)
    const inRange = (t: number, from: Date, to: Date) =>
      new Date(t) >= from && new Date(t) < to
    const agg = (from: Date, to: Date) => {
      const list = completed.filter((s) => inRange(s.startTime, from, to))
      return {
        workouts: list.length,
        duration: list.reduce((sum, s) => sum + ((s.endTime ?? s.startTime) - s.startTime), 0),
        volume: list.reduce((sum, s) => sum + s.totalVolume, 0),
      }
    }
    return { cur: agg(weekAgo, now), prev: agg(twoWeeksAgo, weekAgo) }
  }, [completed])

  const prs = useMemo<PR[]>(() => {
    const map = new Map<string, PR>()
    for (const s of completed) {
      for (const ex of s.exercises) {
        for (const set of ex.sets) {
          if (!set.completed || set.weight <= 0) continue
          const oneRm = epley1Rm(set.weight, set.reps)
          const existing = map.get(ex.name)
          if (!existing || oneRm > existing.oneRm) {
            map.set(ex.name, { name: ex.name, weight: set.weight, reps: set.reps, oneRm })
          }
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => b.oneRm - a.oneRm).slice(0, 6)
  }, [completed])

  const volumeSeries = useMemo(
    () =>
      [...completed]
        .reverse()
        .slice(-12)
        .map((s) => ({
          date: format(new Date(s.startTime), 'MMM d'),
          volume: Math.round(s.totalVolume),
        })),
    [completed],
  )

  const muscleData = useMemo(() => {
    const counts = new Map<string, number>()
    for (const s of completed) {
      for (const ex of s.exercises) {
        const sets = ex.sets.filter((set) => set.completed).length
        counts.set(ex.bodyPart || 'other', (counts.get(ex.bodyPart || 'other') ?? 0) + sets)
      }
    }
    return Array.from(counts.entries())
      .map(([k, v]) => ({ muscle: titleCase(k), value: v }))
      .slice(0, 8)
  }, [completed])

  const weightSeries = useMemo(
    () =>
      Object.entries(weightLog)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-30)
        .map(([date, kg]) => ({ date: format(parseISO(date), 'MMM d'), kg })),
    [weightLog],
  )

  const nothing = completed.length === 0 && weightSeries.length < 2

  return (
    <>
      <TopBar title="Progress" />
      <PageLayout>
        {/* Weekly summary */}
        <SectionHeader title="This Week" />
        <GlassCard>
          <div className="grid grid-cols-3 gap-2">
            <SummaryTile
              icon={Dumbbell}
              label="Workouts"
              value={String(summary.cur.workouts)}
              delta={summary.cur.workouts - summary.prev.workouts}
            />
            <SummaryTile
              icon={Clock}
              label="Duration"
              value={formatDuration(summary.cur.duration)}
              delta={Math.round((summary.cur.duration - summary.prev.duration) / 60000)}
              deltaSuffix="m"
            />
            <SummaryTile
              icon={Layers}
              label="Volume"
              value={`${Math.round(summary.cur.volume / 1000)}t`}
              delta={Math.round((summary.cur.volume - summary.prev.volume) / 1000)}
              deltaSuffix="t"
            />
          </div>
        </GlassCard>

        {nothing ? (
          <div className="mt-8">
            <EmptyState
              icon={BarChart3}
              title="No stats yet"
              description="Complete a few workouts to unlock volume trends, muscle distribution and PRs."
            />
          </div>
        ) : (
          <>
            {/* Body weight */}
            {weightSeries.length >= 2 && (
              <>
                <SectionHeader title="Body Weight" />
                <GlassCard>
                  <div className="h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weightSeries} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                        <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#5A5A5E', fontSize: 10 }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fill: '#5A5A5E', fontSize: 10 }} width={40} domain={['dataMin - 1', 'dataMax + 1']} />
                        <Tooltip
                          contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                          labelStyle={{ color: '#8A8A8E' }}
                          formatter={(v) => [`${v} kg`, 'Weight']}
                        />
                        <Line type="monotone" dataKey="kg" stroke="#00E5FF" strokeWidth={2.5} dot={{ r: 3, fill: '#00E5FF' }} activeDot={{ r: 5 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </GlassCard>
              </>
            )}

            {completed.length > 0 && (
              <>
                {/* Volume progression */}
                <SectionHeader title="Volume Progression" />
                <GlassCard>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={volumeSeries} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                        <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#5A5A5E', fontSize: 10 }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fill: '#5A5A5E', fontSize: 10 }} width={40} />
                        <Tooltip
                          contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                          labelStyle={{ color: '#8A8A8E' }}
                        />
                        <Line type="monotone" dataKey="volume" stroke="#CCFF00" strokeWidth={2.5} dot={{ r: 3, fill: '#CCFF00' }} activeDot={{ r: 5 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </GlassCard>

                {/* Muscle distribution */}
                {muscleData.length >= 3 && (
                  <>
                    <SectionHeader title="Muscle Distribution" />
                    <GlassCard>
                      <div className="h-56 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={muscleData} outerRadius="72%">
                            <PolarGrid stroke="rgba(255,255,255,0.08)" />
                            <PolarAngleAxis dataKey="muscle" tick={{ fill: '#8A8A8E', fontSize: 10 }} />
                            <Radar dataKey="value" stroke="#B967FF" fill="#B967FF" fillOpacity={0.35} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </GlassCard>
                  </>
                )}

                {/* Personal records */}
                <SectionHeader
                  title="Personal Records"
                  action={
                    <button
                      onClick={() => navigate('/history')}
                      className="flex items-center gap-1 text-xs text-txt-secondary"
                    >
                      History <ChevronRight size={14} />
                    </button>
                  }
                />
                <div className="space-y-2">
                  {prs.map((pr, i) => (
                    <GlassCard key={pr.name} className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full"
                        style={{ background: i === 0 ? 'rgba(204,255,0,0.15)' : 'rgba(255,255,255,0.05)' }}
                      >
                        {i === 0 ? (
                          <Trophy size={18} className="text-lime" />
                        ) : (
                          <Dumbbell size={18} className="text-txt-secondary" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium capitalize text-txt-primary">{pr.name}</p>
                        <p className="text-xs text-txt-tertiary">
                          {pr.weight} kg × {pr.reps} reps
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-data text-base text-lime">{Math.round(pr.oneRm)}</p>
                        <p className="flex items-center gap-0.5 text-[10px] text-txt-tertiary">
                          <TrendingUp size={10} /> est. 1RM
                        </p>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </PageLayout>
    </>
  )
}

function SummaryTile({
  icon: Icon,
  label,
  value,
  delta,
  deltaSuffix = '',
}: {
  icon: typeof Dumbbell
  label: string
  value: string
  delta: number
  deltaSuffix?: string
}) {
  const up = delta > 0
  const flat = delta === 0
  return (
    <div className="rounded-lg bg-bg-surface p-3 text-center">
      <Icon size={16} className="mx-auto mb-1 text-txt-secondary" />
      <p className="text-data text-base text-txt-primary">{value}</p>
      <p className="mb-1 text-[10px] uppercase tracking-wide text-txt-tertiary">{label}</p>
      <span
        className={cnDelta(flat, up)}
      >
        {!flat && (up ? <TrendingUp size={10} /> : <TrendingDown size={10} />)}
        {flat ? '—' : `${up ? '+' : ''}${delta}${deltaSuffix}`}
      </span>
    </div>
  )
}

function cnDelta(flat: boolean, up: boolean): string {
  const base = 'inline-flex items-center gap-0.5 text-[10px] font-medium '
  if (flat) return base + 'text-txt-tertiary'
  return base + (up ? 'text-success' : 'text-error')
}
