import { useState } from 'react'
import { Dumbbell, ImageOff } from 'lucide-react'
import { cn } from '../../lib/cn'
import { getGifResolution } from '../../lib/exercisedb'

interface ExerciseGifProps {
  gifUrl: string
  name: string
  className?: string
  rounded?: string
}

/** Applies the configured resolution to an ExerciseDB gif URL when possible. */
function withResolution(url: string): string {
  if (!url) return url
  try {
    const u = new URL(url)
    if (!u.searchParams.has('resolution')) {
      u.searchParams.set('resolution', getGifResolution())
    }
    return u.toString()
  } catch {
    return url
  }
}

export function ExerciseGif({ gifUrl, name, className, rounded = 'rounded-lg' }: ExerciseGifProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(
    gifUrl ? 'loading' : 'error',
  )

  const showPlaceholder = !gifUrl || status === 'error'

  return (
    <div
      className={cn(
        'relative flex items-center justify-center overflow-hidden bg-bg-input',
        rounded,
        className,
      )}
    >
      {showPlaceholder ? (
        <div className="flex flex-col items-center gap-2 px-4 text-center">
          {gifUrl ? (
            <ImageOff size={28} className="text-txt-tertiary" />
          ) : (
            <Dumbbell size={28} className="text-txt-tertiary" />
          )}
          <span className="text-[11px] leading-tight text-txt-tertiary">
            {gifUrl ? 'GIF unavailable' : 'Sync library for demo GIF'}
          </span>
        </div>
      ) : (
        <>
          {status === 'loading' && <div className="absolute inset-0 skeleton" />}
          <img
            src={withResolution(gifUrl)}
            alt={`${name} demonstration`}
            loading="lazy"
            onLoad={() => setStatus('loaded')}
            onError={() => setStatus('error')}
            className={cn(
              'h-full w-full object-contain transition-opacity duration-300',
              status === 'loaded' ? 'opacity-100' : 'opacity-0',
            )}
          />
        </>
      )}
    </div>
  )
}
