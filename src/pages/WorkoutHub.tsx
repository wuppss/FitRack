import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Dumbbell, Play, ChevronRight, Library, Zap } from 'lucide-react'
import { TopBar } from '../components/layout/TopBar'
import { PageLayout } from '../components/layout/PageLayout'
import { GlassCard } from '../components/ui/GlassCard'
import { Button } from '../components/ui/Button'
import { SectionHeader } from '../components/ui/SectionHeader'
import { STARTER_TEMPLATES } from '../data/templates'
import { useExercises } from '../context/ExerciseContext'
import { useWorkout } from '../context/WorkoutContext'
import { cn } from '../lib/cn'

const ACCENT: Record<string, string> = {
  lime: '#CCFF00',
  cyan: '#00E5FF',
  orange: '#FF6B35',
  purple: '#B967FF',
}

export default function WorkoutHub() {
  const navigate = useNavigate()
  const { byId, syncedCount } = useExercises()
  const { active, startWorkout } = useWorkout()

  const start = (name: string, ids: string[]) => {
    const exercises = ids.map((id) => byId(id)).filter((e) => e != null)
    startWorkout(name, exercises)
    navigate('/active-workout')
  }

  return (
    <>
      <TopBar title="Workout" />
      <PageLayout>
        {/* Resume banner */}
        {active && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <GlassCard
              accent
              interactive
              onClick={() => navigate('/active-workout')}
              className="mb-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-lime" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-txt-primary">Workout in progress</p>
                  <p className="text-xs text-txt-secondary">
                    {active.name} · {active.exercises.length} exercises
                  </p>
                </div>
              </div>
              <Play size={18} className="text-lime" fill="currentColor" />
            </GlassCard>
          </motion.div>
        )}

        {/* Quick start */}
        <GlassCard className="mb-2 overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-lime/15">
              <Zap size={22} className="text-lime" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-txt-primary">Empty Workout</p>
              <p className="text-xs text-txt-secondary">Start fresh & add exercises as you go</p>
            </div>
          </div>
          <Button
            full
            className="mt-4"
            icon={<Play size={18} fill="currentColor" />}
            onClick={() => start('Quick Workout', [])}
          >
            Start Empty Workout
          </Button>
        </GlassCard>

        {/* Library entry */}
        <button
          onClick={() => navigate('/exercises')}
          className="mt-3 flex w-full items-center gap-3 rounded-lg border border-white/10 bg-bg-elevated p-4 text-left active:brightness-95"
        >
          <Library size={20} className="text-cyan-accent" />
          <div className="flex-1">
            <p className="font-medium text-txt-primary">Exercise Library</p>
            <p className="text-xs text-txt-secondary">
              {syncedCount > 0
                ? `${syncedCount} exercises · GIF demos`
                : 'Browse & sync full ExerciseDB catalog'}
            </p>
          </div>
          <Search size={18} className="text-txt-tertiary" />
        </button>

        {/* Templates */}
        <SectionHeader title="Templates" />
        <div className="space-y-3">
          {STARTER_TEMPLATES.map((tpl, i) => {
            const color = ACCENT[tpl.accent]
            return (
              <motion.div
                key={tpl.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <GlassCard className="flex items-center gap-4">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-md"
                    style={{ background: `${color}1A` }}
                  >
                    <Dumbbell size={22} style={{ color }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-txt-primary">{tpl.name}</p>
                    <p className="text-xs text-txt-secondary">
                      {tpl.description} · {tpl.exerciseIds.length} exercises
                    </p>
                  </div>
                  <button
                    onClick={() => start(tpl.name, tpl.exerciseIds)}
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full text-black',
                    )}
                    style={{ background: color }}
                    aria-label={`Start ${tpl.name}`}
                  >
                    <Play size={16} fill="currentColor" />
                  </button>
                </GlassCard>
              </motion.div>
            )
          })}
        </div>

        <button
          onClick={() => navigate('/history')}
          className="mt-6 flex w-full items-center justify-center gap-1 text-sm text-txt-secondary"
        >
          View workout history <ChevronRight size={15} />
        </button>
      </PageLayout>
    </>
  )
}
