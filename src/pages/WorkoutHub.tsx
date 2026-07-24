import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Search,
  Dumbbell,
  Play,
  ChevronRight,
  Library,
  Zap,
  Plus,
  Trash2,
  Check,
} from 'lucide-react'
import { TopBar } from '../components/layout/TopBar'
import { PageLayout } from '../components/layout/PageLayout'
import { GlassCard } from '../components/ui/GlassCard'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { ActionSheet } from '../components/ui/ActionSheet'
import { SectionHeader } from '../components/ui/SectionHeader'
import { STARTER_TEMPLATES } from '../data/templates'
import { useExercises } from '../context/ExerciseContext'
import { useWorkout } from '../context/WorkoutContext'
import { useTemplates } from '../context/TemplateContext'
import type { WorkoutTemplate } from '../types'
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
  const { templates, addTemplate, deleteTemplate } = useTemplates()
  const [builderOpen, setBuilderOpen] = useState(false)

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

        {/* My templates */}
        <SectionHeader
          title="My Templates"
          action={
            <button
              onClick={() => setBuilderOpen(true)}
              className="flex items-center gap-1 text-xs font-medium text-lime"
            >
              <Plus size={14} /> New
            </button>
          }
        />
        {templates.length === 0 ? (
          <button
            onClick={() => setBuilderOpen(true)}
            className="flex w-full items-center gap-3 rounded-lg border border-dashed border-white/15 p-4 text-left active:bg-white/5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5">
              <Plus size={18} className="text-txt-secondary" />
            </div>
            <div>
              <p className="text-sm font-medium text-txt-primary">Create your own template</p>
              <p className="text-xs text-txt-secondary">
                Pick exercises from the library & save your routine
              </p>
            </div>
          </button>
        ) : (
          <div className="space-y-3">
            {templates.map((tpl) => (
              <TemplateCard
                key={tpl.id}
                tpl={tpl}
                onStart={() => start(tpl.name, tpl.exerciseIds)}
                onDelete={() => deleteTemplate(tpl.id)}
              />
            ))}
          </div>
        )}

        {/* Starter templates */}
        <SectionHeader title="Starter Templates" />
        <div className="space-y-3">
          {STARTER_TEMPLATES.map((tpl, i) => (
            <motion.div
              key={tpl.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <TemplateCard tpl={tpl} onStart={() => start(tpl.name, tpl.exerciseIds)} />
            </motion.div>
          ))}
        </div>

        <button
          onClick={() => navigate('/history')}
          className="mt-6 flex w-full items-center justify-center gap-1 text-sm text-txt-secondary"
        >
          View workout history <ChevronRight size={15} />
        </button>
      </PageLayout>

      <TemplateBuilderSheet
        open={builderOpen}
        onClose={() => setBuilderOpen(false)}
        onSave={(name, ids) => {
          addTemplate(name, ids)
          setBuilderOpen(false)
        }}
      />
    </>
  )
}

function TemplateCard({
  tpl,
  onStart,
  onDelete,
}: {
  tpl: WorkoutTemplate
  onStart: () => void
  onDelete?: () => void
}) {
  const color = ACCENT[tpl.accent] ?? '#CCFF00'
  return (
    <GlassCard className="flex items-center gap-4">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-md"
        style={{ background: `${color}1A` }}
      >
        <Dumbbell size={22} style={{ color }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-txt-primary">{tpl.name}</p>
        <p className="text-xs text-txt-secondary">
          {tpl.description} · {tpl.exerciseIds.length} exercises
        </p>
      </div>
      {onDelete && (
        <button
          onClick={onDelete}
          className="flex h-9 w-9 items-center justify-center rounded-full text-txt-tertiary active:bg-error/10 active:text-error"
          aria-label={`Delete ${tpl.name}`}
        >
          <Trash2 size={16} />
        </button>
      )}
      <button
        onClick={onStart}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-black"
        style={{ background: color }}
        aria-label={`Start ${tpl.name}`}
      >
        <Play size={16} fill="currentColor" />
      </button>
    </GlassCard>
  )
}

function TemplateBuilderSheet({
  open,
  onClose,
  onSave,
}: {
  open: boolean
  onClose: () => void
  onSave: (name: string, exerciseIds: string[]) => void
}) {
  const { search } = useExercises()
  const [name, setName] = useState('')
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState<string[]>([])

  const results = useMemo(() => search(q).slice(0, 30), [search, q])

  const toggle = (id: string) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  }

  const reset = () => {
    setName('')
    setQ('')
    setSelected([])
  }

  return (
    <ActionSheet open={open} onClose={onClose} title="New Template">
      <div className="space-y-3">
        <Input
          label="Template name"
          placeholder="e.g. Upper Body A"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="relative">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-txt-tertiary"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search exercises…"
            className="h-11 w-full rounded-md border border-white/5 bg-bg-input pl-10 pr-3 text-[15px] text-txt-primary placeholder:text-txt-tertiary outline-none focus:border-lime/40"
          />
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        {results.map((ex) => {
          const isSelected = selected.includes(ex.id)
          return (
            <button
              key={ex.id}
              onClick={() => toggle(ex.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors',
                isSelected
                  ? 'bg-lime/15 text-txt-primary ring-1 ring-lime/40'
                  : 'bg-bg-surface text-txt-secondary',
              )}
            >
              <span className="flex-1 truncate capitalize">{ex.name}</span>
              <span className="text-[11px] capitalize text-txt-tertiary">{ex.target}</span>
              {isSelected && <Check size={16} className="shrink-0 text-lime" />}
            </button>
          )
        })}
      </div>

      <Button
        full
        size="lg"
        className="mt-4"
        disabled={!name.trim() || selected.length === 0}
        onClick={() => {
          onSave(name, selected)
          reset()
        }}
      >
        Save Template ({selected.length} exercise{selected.length === 1 ? '' : 's'})
      </Button>
    </ActionSheet>
  )
}
