import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

interface QuickActionButtonProps {
  icon: LucideIcon
  label: string
  onClick?: () => void
  color?: string
}

export function QuickActionButton({
  icon: Icon,
  label,
  onClick,
  color = '#CCFF00',
}: QuickActionButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-2 rounded-full border border-white/10 bg-bg-elevated px-4 py-2.5 text-sm font-medium text-txt-primary"
    >
      <Icon size={18} style={{ color }} />
      {label}
    </motion.button>
  )
}
