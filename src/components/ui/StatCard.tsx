import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/cn'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: number
  suffix?: string
  sub?: string
  accentColor?: string
  onClick?: () => void
  decimals?: number
}

export function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  sub,
  accentColor = '#CCFF00',
  onClick,
  decimals = 0,
}: StatCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={onClick ? { scale: 0.97 } : undefined}
      className={cn(
        'glass-card flex flex-col gap-2 rounded-lg p-4 text-left',
        onClick && 'active:brightness-95',
      )}
    >
      <div className="flex items-center gap-2">
        <Icon size={18} style={{ color: accentColor }} strokeWidth={2} />
        <span className="text-xs font-medium uppercase tracking-wide text-txt-secondary">
          {label}
        </span>
      </div>
      <div className="text-data text-[28px] leading-none text-txt-primary">
        <CountUp end={value} duration={1.2} decimals={decimals} separator="," />
        {suffix && <span className="ml-1 text-base text-txt-secondary">{suffix}</span>}
      </div>
      {sub && <span className="text-xs text-txt-tertiary">{sub}</span>}
    </motion.button>
  )
}
