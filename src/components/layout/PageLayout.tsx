import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface PageLayoutProps {
  children: ReactNode
  /** disable default top/bottom padding (e.g. full-screen pages) */
  bare?: boolean
  className?: string
}

export function PageLayout({ children, bare, className }: PageLayoutProps) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.97 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'mx-auto min-h-[100dvh] w-full max-w-[428px]',
        !bare && 'px-6 pb-28 pt-[calc(56px+env(safe-area-inset-top))]',
        className,
      )}
    >
      {children}
    </motion.main>
  )
}
