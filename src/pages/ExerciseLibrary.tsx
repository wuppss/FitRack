import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, X, Download, Dumbbell, Loader2, Bookmark } from 'lucide-react'
import { TopBar } from '../components/layout/TopBar'
import { PageLayout } from '../components/layout/PageLayout'
import { ExerciseGridCard } from '../components/ExerciseGridCard'
import { GlassCard } from '../components/ui/GlassCard'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { BodyPartChips } from '../components/ui/BodyPartChips'
import { useExercises } from '../context/ExerciseContext'
import { useFavorites } from '../context/FavoritesContext'
import { hasApiKey } from '../lib/exercisedb'
import { titleCase } from '../lib/format'
import { cn } from '../lib/cn'

const LIMIT = 60

export default function ExerciseLibrary() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const { search, bodyParts, syncedCount, syncing, progress, startSync, loading } = useExercises()
  const { favorites, isFavorite, toggleFavorite, count: favCount } = useFavorites()

  const [query, setQuery] = useState(params.get('q') ?? '')
  const [bodyPart, setBodyPart] = useState<string | undefined>(params.get('bodyPart') ?? undefined)
  const equipment = params.get('equipment') ?? undefined
  const savedOnly = params.get('saved') === '1'

  // keep URL in sync with the body-part chip selection
  useEffect(() => {
    const next = new URLSearchParams(params)
    if (bodyPart) next.set('bodyPart', bodyPart)
    else next.delete('bodyPart')
    setParams(next, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bodyPart])

  const results = useMemo(() => {
    let list = search(query, { bodyPart, equipment })
    if (savedOnly) list = list.filter((e) => favorites.has(e.id))
    return list
  }, [search, query, bodyPart, equipment, savedOnly, favorites])

  const shown = results.slice(0, LIMIT)

  const title = savedOnly
    ? 'Saved'
    : equipment
      ? titleCase(equipment)
      : bodyPart
        ? titleCase(bodyPart)
        : 'Exercises'

  return (
    <>
      <TopBar title={title} back />
      <PageLayout>
        {/* Search */}
        <div className="relative mb-3">
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-txt-tertiary" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exercises, muscles, gear…"
            className="h-12 w-full rounded-full border border-white/5 bg-bg-input pl-10 pr-10 text-[15px] text-txt-primary placeholder:text-txt-tertiary outline-none focus:border-lime/40"
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
        {syncedCount === 0 && !savedOnly && (
          <GlassCard accent className="mb-4">
            <div className="flex items-start gap-3">
              <Download size={20} className="mt-0.5 shrink-0 text-lime" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-txt-primary">
                  Sync the full exercise database
                </p>
                <p className="mt-0.5 text-xs text-txt-secondary">
                  Fetch 1,300+ exercises with demos from ExerciseDB. Runs once, then works
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
              icon={syncing ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              onClick={() => void startSync()}
            >
              {syncing ? `Syncing… ${progress?.fetched ?? 0} fetched` : 'Sync Exercise Library'}
            </Button>
          </GlassCard>
        )}

        {/* Body-part filter chips (hidden when locked to one via URL) */}
        {!equipment && !savedOnly && (
          <BodyPartChips
            bodyParts={bodyParts}
            selected={bodyPart}
            onSelect={setBodyPart}
            className="-mx-6 mb-3 px-6"
          />
        )}

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-lg skeleton" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <EmptyState
            icon={savedOnly ? Bookmark : Dumbbell}
            title={savedOnly ? 'No saved exercises' : 'No exercises found'}
            description={
              savedOnly
                ? 'Tap the bookmark on any exercise to save it here.'
                : 'Try a different search or sync the full library.'
            }
          />
        ) : (
          <>
            <p className="mb-2 text-xs text-txt-tertiary">
              {savedOnly ? `${favCount} saved` : `${results.length} exercise${results.length === 1 ? '' : 's'}`}
              {results.length > LIMIT && ` · showing first ${LIMIT}`}
            </p>
            <div className={cn('grid grid-cols-2 gap-3')}>
              {shown.map((ex) => (
                <ExerciseGridCard
                  key={ex.id}
                  exercise={ex}
                  saved={isFavorite(ex.id)}
                  onToggleSave={() => toggleFavorite(ex.id)}
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
