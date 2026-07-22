import { useMemo } from 'react'
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
import { Trophy, TrendingUp, Dumbbell, BarChart3 } from 'lucide-react'
import { TopBar } from '../components/layout/TopBar'
import { PageLayout } from '../components/layout/PageLayout'
import { GlassCard } from '../components/ui/GlassCard'
import { EmptyState } from '../components/ui/EmptyState'
import { SectionHeader } from '../components/ui/SectionHeader'
import { useWorkout } from '../context/WorkoutContext'
import { titleCase } from '../lib/format'
import { format } from 'date-fns'

interface PR {
  name: string
  weight: number
  reps: number
  oneRm: number
}

export default function Stats() {
  const { history } = useWorkout()

  const completed = useMemo(() => history.filter((s) => s.endTime), [history])

  const prs = useMemo<PR[]>(() => {
    const map = new Map<string, PR>()
    for (const s of completed) {
      for (const ex of s.exercises) {
        for (const set of ex.sets) {
          if (!set.completed || set.weight <= 0) continue
          const oneRm = set.weight * (1 + set.reps / 30)
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

  if (completed.length === 0) {
    return (
      <>
        <TopBar title="Statistics" back />
        <PageLayout>
          <div className="flex min-h-[70vh] flex-col justify-center">
            <EmptyState
              icon={BarChart3}
              title="No stats yet"
              description="Complete a few workouts to unlock personal records, volume trends and muscle distribution."
            />
          </div>
        </PageLayout>
      </>
    )
  }

  return (
    <>
      <TopBar title="Statistics" back />
      <PageLayout>
        {/* Volume progression */}
        <SectionHeader title="Volume Progression" />
        <GlassCard>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={volumeSeries} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#5A5A5E', fontSize: 10 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#5A5A5E', fontSize: 10 }} width={40} />
                <Tooltip
                  contentStyle={{
                    background: '#111',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: '#8A8A8E' }}
                />
                <Line
                  type="monotone"
                  dataKey="volume"
                  stroke="#CCFF00"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#CCFF00' }}
                  activeDot={{ r: 5 }}
                />
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
        <SectionHeader title="Personal Records" />
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
      </PageLayout>
    </>
  )
}
