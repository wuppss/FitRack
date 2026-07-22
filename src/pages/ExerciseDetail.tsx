import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, Target, Dumbbell, Layers, ListChecks, Check } from 'lucide-react'
import { TopBar } from '../components/layout/TopBar'
import { PageLayout } from '../components/layout/PageLayout'
import { GlassCard } from '../components/ui/GlassCard'
import { Button } from '../components/ui/Button'
import { ExerciseGif } from '../components/ui/ExerciseGif'
import { EmptyState } from '../components/ui/EmptyState'
import { ExerciseCard } from '../components/ExerciseCard'
import { SectionHeader } from '../components/ui/SectionHeader'
import { useExercises } from '../context/ExerciseContext'
import { useWorkout } from '../context/WorkoutContext'
import { titleCase } from '../lib/format'

export default function ExerciseDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { byId, exercises } = useExercises()
  const { active, startWorkout, addExerciseToActive } = useWorkout()

  const exercise = id ? byId(id) : undefined

  const related = useMemo(() => {
    if (!exercise) return []
    return exercises
      .filter((e) => e.id !== exercise.id && e.target === exercise.target)
      .slice(0, 4)
  }, [exercise, exercises])

  const inActive = active?.exercises.some((e) => e.exerciseId === exercise?.id)

  if (!exercise) {
    return (
      <>
        <TopBar back title="Exercise" />
        <PageLayout>
          <EmptyState icon={Dumbbell} title="Exercise not found" />
        </PageLayout>
      </>
    )
  }

  const handleAdd = () => {
    if (active) {
      addExerciseToActive(exercise)
      navigate('/active-workout')
    } else {
      startWorkout('Quick Workout', [exercise])
      navigate('/active-workout')
    }
  }

  return (
    <>
      <TopBar back title="" />
      <PageLayout>
        {/* GIF hero */}
        <ExerciseGif
          exerciseId={exercise.id}
          gifUrl={exercise.gifUrl}
          name={exercise.name}
          allowFetch
          className="aspect-square w-full bg-gradient-to-b from-bg-surface to-bg-input"
        />

        <h1 className="mt-4 font-display text-2xl font-bold capitalize text-txt-primary">
          {exercise.name}
        </h1>

        {/* Meta pills */}
        <div className="mt-3 flex flex-wrap gap-2">
          <MetaPill icon={Target} label={titleCase(exercise.target)} color="#CCFF00" />
          <MetaPill icon={Layers} label={titleCase(exercise.bodyPart)} color="#00E5FF" />
          <MetaPill icon={Dumbbell} label={titleCase(exercise.equipment)} color="#B967FF" />
        </div>

        {/* Secondary muscles */}
        {exercise.secondaryMuscles.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-txt-secondary">
              Secondary Muscles
            </p>
            <div className="flex flex-wrap gap-2">
              {exercise.secondaryMuscles.map((m) => (
                <span
                  key={m}
                  className="rounded-full bg-bg-elevated px-3 py-1 text-xs capitalize text-txt-secondary"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        {exercise.instructions.length > 0 && (
          <GlassCard className="mt-5">
            <div className="mb-3 flex items-center gap-2">
              <ListChecks size={18} className="text-lime" />
              <h2 className="font-display font-bold text-txt-primary">How to perform</h2>
            </div>
            <ol className="space-y-3">
              {exercise.instructions.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lime/15 text-xs font-bold text-lime">
                    {i + 1}
                  </span>
                  <span className="text-sm leading-relaxed text-txt-secondary">{step}</span>
                </li>
              ))}
            </ol>
          </GlassCard>
        )}

        {/* Related */}
        {related.length > 0 && (
          <>
            <SectionHeader title="Related Exercises" />
            <div className="space-y-2">
              {related.map((ex) => (
                <ExerciseCard
                  key={ex.id}
                  exercise={ex}
                  onClick={() => navigate(`/exercise/${ex.id}`)}
                />
              ))}
            </div>
          </>
        )}

        {/* Sticky add button */}
        <div className="sticky bottom-24 mt-6">
          <Button
            full
            size="lg"
            disabled={inActive}
            icon={inActive ? <Check size={20} /> : <Plus size={20} />}
            onClick={handleAdd}
          >
            {inActive
              ? 'Added to workout'
              : active
                ? 'Add to current workout'
                : 'Start workout with this'}
          </Button>
        </div>
      </PageLayout>
    </>
  )
}

function MetaPill({
  icon: Icon,
  label,
  color,
}: {
  icon: typeof Target
  label: string
  color: string
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
      style={{ background: `${color}1A`, color }}
    >
      <Icon size={14} />
      {label}
    </span>
  )
}
