import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import {
  Bell,
  Flame,
  Droplets,
  Footprints,
  Dumbbell,
  Plus,
  TrendingUp,
  ChevronRight,
} from 'lucide-react'
import { Bar, BarChart, ResponsiveContainer, XAxis, Cell } from 'recharts'
import { TopBar } from '../components/layout/TopBar'
import { PageLayout } from '../components/layout/PageLayout'
import { GlassCard } from '../components/ui/GlassCard'
import { ProgressRing } from '../components/ui/ProgressRing'
import { QuickActionButton } from '../components/ui/QuickActionButton'
import { SectionHeader } from '../components/ui/SectionHeader'
import { useProfile } from '../context/ProfileContext'
import { useNutrition } from '../context/NutritionContext'
import { useWater } from '../context/WaterContext'
import { useSteps } from '../context/StepsContext'
import { useWorkout } from '../context/WorkoutContext'
import { dateKey, prettyDate, formatDuration } from '../lib/format'
import { subDays, format } from 'date-fns'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { profile } = useProfile()
  const { totalsForDate } = useNutrition()
  const { today: water } = useWater()
  const { today: steps } = useSteps()
  const { history } = useWorkout()

  const cals = totalsForDate().calories
  const calPct = Math.round((cals / profile.goals.calories) * 100)
  const waterPct = Math.round((water / profile.goals.water) * 100)
  const stepPct = Math.round((steps / profile.goals.steps) * 100)

  const weekly = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = subDays(new Date(), 6 - i)
      const key = dateKey(d)
      const count = history.filter(
        (s) => s.endTime && dateKey(new Date(s.startTime)) === key,
      ).length
      const volume = history
        .filter((s) => s.endTime && dateKey(new Date(s.startTime)) === key)
        .reduce((sum, s) => sum + s.totalVolume, 0)
      return {
        day: format(d, 'EEEEE'),
        value: volume || count * 100,
        active: count > 0,
      }
    })
  }, [history])

  const weeklyWorkouts = useMemo(() => {
    const weekAgo = subDays(new Date(), 6)
    return history.filter((s) => s.endTime && new Date(s.startTime) >= weekAgo).length
  }, [history])

  const lastWorkout = history[0]
  const greeting = getGreeting()

  return (
    <>
      <TopBar
        brand
        right={
          <button className="relative flex h-10 w-10 items-center justify-center rounded-full text-txt-secondary active:bg-white/5">
            <Bell size={22} />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-error" />
          </button>
        }
      />
      <PageLayout>
        <motion.div variants={container} initial="hidden" animate="show">
          {/* Greeting */}
          <motion.div variants={item} className="mb-5 mt-1">
            <p className="text-sm text-txt-secondary">{greeting},</p>
            <h1 className="font-display text-2xl font-bold text-txt-primary">{profile.name}</h1>
            <p className="mt-0.5 text-xs text-txt-tertiary">{prettyDate(new Date())}</p>
          </motion.div>

          {/* Hero: calorie ring + side stats */}
          <motion.div variants={item}>
            <GlassCard className="flex items-center gap-5">
              <ProgressRing progress={calPct} size={116} color="#FF6B35">
                <span className="text-data text-2xl text-txt-primary">
                  <CountUp end={cals} duration={1.2} separator="," />
                </span>
                <span className="text-[11px] text-txt-secondary">/ {profile.goals.calories}</span>
                <span className="mt-0.5 text-[10px] uppercase tracking-wide text-txt-tertiary">
                  kcal
                </span>
              </ProgressRing>
              <div className="flex-1 space-y-3">
                <MiniStat
                  icon={Droplets}
                  color="#00E5FF"
                  label="Water"
                  value={`${(water / 1000).toFixed(1)}L`}
                  pct={waterPct}
                />
                <MiniStat
                  icon={Footprints}
                  color="#CCFF00"
                  label="Steps"
                  value={steps.toLocaleString()}
                  pct={stepPct}
                />
                <MiniStat
                  icon={Dumbbell}
                  color="#B967FF"
                  label="Workouts / wk"
                  value={`${weeklyWorkouts}/${profile.goals.weeklyWorkouts}`}
                  pct={Math.round((weeklyWorkouts / profile.goals.weeklyWorkouts) * 100)}
                />
              </div>
            </GlassCard>
          </motion.div>

          {/* Quick actions */}
          <motion.div variants={item} className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
            <QuickActionButton icon={Plus} label="Log Food" color="#FF6B35" onClick={() => navigate('/calories')} />
            <QuickActionButton icon={Droplets} label="Add Water" color="#00E5FF" onClick={() => navigate('/water')} />
            <QuickActionButton icon={Dumbbell} label="Workout" color="#CCFF00" onClick={() => navigate('/active-workout')} />
          </motion.div>

          {/* Weekly activity chart */}
          <motion.div variants={item}>
            <SectionHeader
              title="Weekly Activity"
              action={
                <button
                  onClick={() => navigate('/stats')}
                  className="flex items-center gap-1 text-xs text-txt-secondary"
                >
                  Stats <ChevronRight size={14} />
                </button>
              }
            />
            <GlassCard>
              <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weekly} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#5A5A5E', fontSize: 11 }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 4, 4]} maxBarSize={22}>
                      {weekly.map((d, i) => (
                        <Cell key={i} fill={d.active ? '#CCFF00' : '#1F1F1F'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </motion.div>

          {/* Recent workout */}
          <motion.div variants={item}>
            <SectionHeader
              title="Recent Workout"
              action={
                <button
                  onClick={() => navigate('/history')}
                  className="flex items-center gap-1 text-xs text-txt-secondary"
                >
                  History <ChevronRight size={14} />
                </button>
              }
            />
            {lastWorkout ? (
              <GlassCard interactive onClick={() => navigate('/history')}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-txt-primary">{lastWorkout.name}</p>
                    <p className="mt-0.5 text-xs text-txt-secondary">
                      {prettyDate(lastWorkout.startTime)} ·{' '}
                      {lastWorkout.exercises.length} exercises
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-data text-lg text-lime">
                      {Math.round(lastWorkout.totalVolume).toLocaleString()}
                    </p>
                    <p className="text-[10px] uppercase tracking-wide text-txt-tertiary">
                      kg volume
                    </p>
                  </div>
                </div>
                {lastWorkout.endTime && (
                  <div className="mt-3 flex items-center gap-1 border-t border-white/5 pt-3 text-xs text-txt-tertiary">
                    <TrendingUp size={13} className="text-success" />
                    {formatDuration(lastWorkout.endTime - lastWorkout.startTime)} session
                  </div>
                )}
              </GlassCard>
            ) : (
              <GlassCard interactive onClick={() => navigate('/active-workout')}>
                <div className="flex items-center gap-3 py-1">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-lime/10">
                    <Dumbbell size={20} className="text-lime" />
                  </div>
                  <div>
                    <p className="font-medium text-txt-primary">Start your first workout</p>
                    <p className="text-xs text-txt-secondary">Log sets, reps & weights</p>
                  </div>
                </div>
              </GlassCard>
            )}
          </motion.div>
        </motion.div>
      </PageLayout>
    </>
  )
}

function MiniStat({
  icon: Icon,
  color,
  label,
  value,
  pct,
}: {
  icon: typeof Flame
  color: string
  label: string
  value: string
  pct: number
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon size={18} style={{ color }} className="shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-txt-secondary">{label}</span>
          <span className="text-sm font-semibold text-txt-primary">{value}</span>
        </div>
        <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${Math.min(100, Math.max(0, pct))}%`, background: color }}
          />
        </div>
      </div>
    </div>
  )
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}
