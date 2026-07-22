import { useEffect, useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '../../lib/cn'
import type { ReactNode } from 'react'

interface TopBarProps {
  title?: string
  back?: boolean
  right?: ReactNode
  /** show the FITRACK wordmark instead of a title */
  brand?: boolean
}

export function TopBar({ title, back, right, brand }: TopBarProps) {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 transition-all duration-300',
        scrolled && 'border-b border-white/[0.06] bg-black/90 backdrop-blur-md',
      )}
    >
      <div className="safe-top" />
      <div className="mx-auto flex h-14 max-w-[428px] items-center justify-between px-6">
        <div className="flex items-center gap-2">
          {back && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-txt-primary active:bg-white/5"
              aria-label="Back"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          {brand ? (
            <span className="font-display text-xl font-bold tracking-tight text-lime">
              FITRACK
            </span>
          ) : (
            <h1 className="font-display text-lg font-bold text-txt-primary">{title}</h1>
          )}
        </div>
        <div className="flex items-center gap-2">{right}</div>
      </div>
    </header>
  )
}
