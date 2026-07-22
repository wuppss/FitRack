import { useEffect, useRef, useState } from 'react'
import { Dumbbell, ImageOff, Loader2 } from 'lucide-react'
import { cn } from '../../lib/cn'
import { getExerciseGifUrl, isRealExerciseId } from '../../lib/exercisedb'

interface ExerciseGifProps {
  /** ExerciseDB exercise id — used to fetch the GIF from the /image endpoint */
  exerciseId?: string
  /** direct GIF url, if the data ever provides one (takes priority) */
  gifUrl?: string
  name: string
  className?: string
  rounded?: string
  /**
   * When true, the GIF is fetched from the API if not already cached (costs one
   * request, then cached forever). When false/omitted, only an already-cached
   * GIF is shown — no request is spent (used for list thumbnails).
   */
  allowFetch?: boolean
}

type Status = 'idle' | 'loading' | 'loaded' | 'error' | 'placeholder'

export function ExerciseGif({
  exerciseId,
  gifUrl,
  name,
  className,
  rounded = 'rounded-lg',
  allowFetch = false,
}: ExerciseGifProps) {
  const [status, setStatus] = useState<Status>('idle')
  const [src, setSrc] = useState<string>('')
  const objectUrlRef = useRef<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const revoke = () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
        objectUrlRef.current = null
      }
    }

    // 1) A real direct URL wins (future-proofing; current API returns none).
    if (gifUrl && /^https?:\/\//.test(gifUrl)) {
      setSrc(gifUrl)
      setStatus('loading')
      return () => {
        cancelled = true
        revoke()
      }
    }

    // 2) Otherwise fetch/cache via the ExerciseDB image endpoint by id.
    if (exerciseId && isRealExerciseId(exerciseId)) {
      setStatus('loading')
      getExerciseGifUrl(exerciseId, { allowNetwork: allowFetch })
        .then((res) => {
          if (cancelled) return
          if (!res) {
            setStatus('placeholder')
            return
          }
          revoke()
          objectUrlRef.current = res.url
          setSrc(res.url)
          setStatus('loaded')
        })
        .catch(() => {
          if (!cancelled) setStatus('error')
        })
      return () => {
        cancelled = true
        revoke()
      }
    }

    // 3) Nothing to show (bundled/seed exercise).
    setStatus('placeholder')
    return () => {
      cancelled = true
      revoke()
    }
  }, [exerciseId, gifUrl, allowFetch])

  const showImg = status === 'loading' || status === 'loaded'

  return (
    <div
      className={cn(
        'relative flex items-center justify-center overflow-hidden bg-bg-input',
        rounded,
        className,
      )}
    >
      {status === 'placeholder' || status === 'error' ? (
        <div className="flex flex-col items-center gap-2 px-3 text-center">
          {status === 'error' ? (
            <ImageOff size={26} className="text-txt-tertiary" />
          ) : (
            <Dumbbell size={26} className="text-txt-tertiary" />
          )}
          <span className="text-[11px] leading-tight text-txt-tertiary">
            {status === 'error' ? 'GIF unavailable' : 'Tap exercise to load GIF'}
          </span>
        </div>
      ) : (
        showImg && (
          <>
            {status === 'loading' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute inset-0 skeleton" />
                <Loader2 size={22} className="relative animate-spin text-txt-tertiary" />
              </div>
            )}
            {src && (
              <img
                src={src}
                alt={`${name} demonstration`}
                loading="lazy"
                onLoad={() => setStatus('loaded')}
                onError={() => setStatus('error')}
                className={cn(
                  'h-full w-full object-contain transition-opacity duration-300',
                  status === 'loaded' ? 'opacity-100' : 'opacity-0',
                )}
              />
            )}
          </>
        )
      )}
    </div>
  )
}
