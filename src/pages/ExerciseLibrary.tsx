import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, Download, Dumbbell, Loader2 } from 'lucide-react'
import { TopBar } from '../components/layout/TopBar'
import { PageLayout } from '../components/layout/PageLayout'
import { ExerciseCard } from '../components/ExerciseCard'
import { GlassCard } from '../components/ui/GlassCard'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { useExercises } from '../context/ExerciseContext'
import { hasApiKey } from '../lib/exercisedb'
import { cn } from '../lib/cn'
import { titleCase } from '../lib/format'

const LIMIT = 80

export default function ExerciseLibrary() {
  const navigate = useNavigate()
  const { search, bodyParts, syncedCount, syncing, progress, startSync, loading } = useExercises()
  const [query, setQuery] = useState('')
  const [bodyPart, setBodyPart] = useState<string | undefined>(undefined)

  const results = useMemo(
    () => search(query, { bodyPart }),
    [search, query, bodyPart],
  )
  const shown = results.slice(0, LIMIT)

  return (
    <>
      <TopBar title="Exercises" back />
      <PageLayout>
        {/* Search */}
        <div className="relative mb-3">
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-txt-tertiary" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exercises, muscles, gear…"
            className="h-12 w-full rounded-md border border-white/5 bg-bg-input pl-10 pr-10 text-[15px] text-txt-primary placeholder:text-txt-tertiary outline-none focus:border-lime/40"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-tertiary"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Sync banner */}
        {syncedCount === 0 && (
          <GlassCard accent className="mb-4">
            <div className="flex items-start gap-3">
              <Download size={20} className="mt-0.5 shrink-0 text-lime" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-txt-primary">
                  Sync the full exercise database
                </p>
                <p className="mt-0.5 text-xs text-txt-secondary">
                  Fetch 1,300+ exercises with GIF demos from ExerciseDB. Runs once, then works
                  offline. Uses ~130 of your monthly API requests.
                </p>
                {!hasApiKey() && (
                  <p className="mt-1 text-xs text-warning">
                    Add your RapidAPI key in Profile first.
                  </p>
                )}
              </div>
            </div>
            <Button
              full
              className="mt-3"
              disabled={syncing || !hasApiKey()}
              icon={
                syncing ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />
              }
              onClick={() => void startSync()}
            >
              {syncing
                ? `Syncing… ${progress?.fetched ?? 0} fetched`
                : 'Sync Exercise Library'}
            </Button>
          </GlassCard>
        )}

        {/* Body part filter chips */}
        {bodyParts.length > 0 && (
          <div className="-mx-6 mb-3 flex gap-2 overflow-x-auto px-6 no-scrollbar">
            <Chip active={!bodyPart} onClick={() => setBodyPart(undefined)}>
              All
            </Chip>
            {bodyParts.map((bp) => (
              <Chip key={bp} active={bodyPart === bp} onClick={() => setBodyPart(bp)}>
                {titleCase(bp)}
              </Chip>
            ))}
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 rounded-lg skeleton" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <EmptyState
            icon={Dumbbell}
            title="No exercises found"
            description="Try a different search or sync the full library."
          />
        ) : (
          <>
            <p className="mb-2 text-xs text-txt-tertiary">
              {results.length} exercise{results.length === 1 ? '' : 's'}
              {results.length > LIMIT && ` · showing first ${LIMIT}`}
            </p>
            <div className="space-y-2">
              {shown.map((ex) => (
                <ExerciseCard
                  key={ex.id}
                  exercise={ex}
                  onClick={() => navigate(`/exercise/${ex.id}`)}
                />
              ))}
            </div>
            {results.length > LIMIT && (
              <p className="mt-4 text-center text-xs text-txt-tertiary">
                Refine your search to see more.
              </p>
            )}
          </>
        )}
      </PageLayout>
    </>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
        active ? 'bg-lime text-black' : 'bg-bg-elevated text-txt-secondary',
      )}
    >
      {children}
    </button>
  )
}
