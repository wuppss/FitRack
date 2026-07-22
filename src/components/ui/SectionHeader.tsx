import type { ReactNode } from 'react'

interface SectionHeaderProps {
  title: string
  action?: ReactNode
}

export function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <div className="mb-3 mt-6 flex items-center justify-between">
      <h2 className="font-display text-base font-bold text-txt-primary">{title}</h2>
      {action}
    </div>
  )
}
