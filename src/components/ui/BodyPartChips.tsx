import { cn } from '../../lib/cn'
import { titleCase } from '../../lib/format'

interface BodyPartChipsProps {
  bodyParts: string[]
  selected: string | undefined
  onSelect: (bodyPart: string | undefined) => void
  className?: string
}

/** Horizontal, scrollable body-part filter chips (All + each body part). */
export function BodyPartChips({ bodyParts, selected, onSelect, className }: BodyPartChipsProps) {
  if (bodyParts.length === 0) return null
  return (
    <div className={cn('flex gap-2 overflow-x-auto no-scrollbar', className)}>
      <Chip active={!selected} onClick={() => onSelect(undefined)}>
        All
      </Chip>
      {bodyParts.map((bp) => (
        <Chip key={bp} active={selected === bp} onClick={() => onSelect(bp)}>
          {titleCase(bp)}
        </Chip>
      ))}
    </div>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
        active ? 'bg-lime text-black' : 'bg-bg-elevated text-txt-secondary',
      )}
    >
      {children}
    </button>
  )
}
