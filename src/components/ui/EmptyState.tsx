import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  color?: string
}

export function EmptyState({ icon: Icon, title, description, action, color = '#CCFF00' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div
        className="mb-4 flex h-16 w-16 items-center justify-center rounded-full"
        style={{ background: `${color}1A` }}
      >
        <Icon size={30} style={{ color }} />
      </div>
      <h3 className="font-display text-lg font-semibold text-txt-primary">{title}</h3>
      {description && (
        <p className="mt-1 max-w-xs text-sm text-txt-secondary">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
