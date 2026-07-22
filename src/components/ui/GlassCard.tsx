import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface GlassCardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  interactive?: boolean
  accent?: boolean
}

export function GlassCard({
  children,
  className,
  onClick,
  interactive,
  accent,
}: GlassCardProps) {
  const clickable = interactive || Boolean(onClick)
  return (
    <motion.div
      onClick={onClick}
      whileTap={clickable ? { scale: 0.98 } : undefined}
      className={cn(
        'glass-card rounded-lg p-4',
        accent && 'border-l-[3px] border-l-lime',
        clickable && 'cursor-pointer active:brightness-95',
        className,
      )}
    >
      {children}
    </motion.div>
  )
}
