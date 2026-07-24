import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Dumbbell, Bookmark, ChevronRight } from 'lucide-react'
import { TopBar } from '../components/layout/TopBar'
import { PageLayout } from '../components/layout/PageLayout'
import { SectionHeader } from '../components/ui/SectionHeader'
import { useExercises } from '../context/ExerciseContext'
import { useFavorites } from '../context/FavoritesContext'
import { titleCase } from '../lib/format'
import { cn } from '../lib/cn'

// A stable palette so each muscle/equipment card keeps a consistent accent.
const PALETTE = ['#CCFF00', '#00E5FF', '#FF6B35', '#B967FF', '#34C759', '#FF9500']
const colorFor = (s: string) => {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return PALETTE[h % PALETTE.length]
}

export default function Discover() {
  const navigate = useNavigate()
  const { bodyParts, equipmentTypes, exercises, syncedCount } = useExercises()
  const { count: favCount } = useFavorites()

  const countBy = useMemo(() => {
    const bp = new Map<string, number>()
    const eq = new Map<string, number>()
    for (const e of exercises) {
      if (e.bodyPart) bp.set(e.bodyPart, (bp.get(e.bodyPart) ?? 0) + 1)
      if (e.equipment) eq.set(e.equipment, (eq.get(e.equipment) ?? 0) + 1)
    }
    return { bp, eq }
  }, [exercises])

  return (
    <>
      <TopBar title="Discover" />
      <PageLayout>
        {/* Search pill */}
        <button
          onClick={() => navigate('/exercises')}
          className="mb-5 flex w-full items-center gap-3 rounded-full bg-bg-input px-5 py-3.5 text-left"
        >
          <Search size={18} className="text-txt-tertiary" />
          <span className="text-[15px] text-txt-tertiary">Search exercises…</span>
        </button>

        {/* Quick rows */}
        <div className="mb-2 space-y-2">
          <QuickRow
            icon={Dumbbell}
            color="#CCFF00"
            title="All Exercises"
            sub={syncedCount > 0 ? `${syncedCount} in your library` : 'Sync to unlock 1,300+'}
            onClick={() => navigate('/exercises')}
          />
          <QuickRow
            icon={Bookmark}
            color="#00E5FF"
            title="Saved"
            sub={`${favCount} bookmarked exercise${favCount === 1 ? '' : 's'}`}
            onClick={() => navigate('/exercises?saved=1')}
          />
        </div>

        {/* By muscle */}
        <SectionHeader title="By Muscle" />
        <div className="grid grid-cols-2 gap-3">
          {bodyParts.map((bp, i) => (
            <BrowseCard
              key={bp}
              label={titleCase(bp)}
              count={countBy.bp.get(bp) ?? 0}
              color={colorFor(bp)}
              index={i}
              onClick={() => navigate(`/exercises?bodyPart=${encodeURIComponent(bp)}`)}
            />
          ))}
        </div>

        {/* By equipment */}
        <SectionHeader title="By Equipment" />
        <div className="grid grid-cols-2 gap-3">
          {equipmentTypes.map((eq, i) => (
            <BrowseCard
              key={eq}
              label={titleCase(eq)}
              count={countBy.eq.get(eq) ?? 0}
              color={colorFor(eq)}
              index={i}
              onClick={() => navigate(`/exercises?equipment=${encodeURIComponent(eq)}`)}
            />
          ))}
        </div>

        <div className="h-4" />
      </PageLayout>
    </>
  )
}

function QuickRow({
  icon: Icon,
  color,
  title,
  sub,
  onClick,
}: {
  icon: typeof Dumbbell
  color: string
  title: string
  sub: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg border border-white/10 bg-bg-elevated p-4 text-left active:brightness-95"
    >
      <div
        className="flex h-11 w-11 items-center justify-center rounded-full"
        style={{ background: `${color}1A` }}
      >
        <Icon size={20} style={{ color }} />
      </div>
      <div className="flex-1">
        <p className="font-medium text-txt-primary">{title}</p>
        <p className="text-xs text-txt-secondary">{sub}</p>
      </div>
      <ChevronRight size={18} className="text-txt-tertiary" />
    </button>
  )
}

function BrowseCard({
  label,
  count,
  color,
  index,
  onClick,
}: {
  label: string
  count: number
  color: string
  index: number
  onClick: () => void
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'relative flex h-24 flex-col justify-end overflow-hidden rounded-lg p-3 text-left',
        'border border-white/[0.06] bg-bg-surface',
      )}
    >
      {/* accent glow */}
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-40 blur-2xl"
        style={{ background: color }}
      />
      <Dumbbell
        size={26}
        className="absolute right-3 top-3 opacity-20"
        style={{ color }}
      />
      <p className="relative font-display font-bold text-txt-primary">{label}</p>
      <p className="relative text-[11px] text-txt-secondary">{count} exercises</p>
    </motion.button>
  )
}
