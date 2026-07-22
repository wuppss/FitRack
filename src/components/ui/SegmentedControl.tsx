import { motion } from 'framer-motion'
import { useId } from 'react'
import { cn } from '../../lib/cn'

interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  className?: string
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  const groupId = useId()
  return (
    <div className={cn('flex rounded-full bg-bg-surface p-[3px]', className)}>
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="relative flex-1 rounded-full px-3 py-2 text-sm font-medium"
          >
            {active && (
              <motion.span
                layoutId={`seg-${groupId}`}
                className="absolute inset-0 rounded-full bg-lime"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span
              className={cn(
                'relative z-10 transition-colors',
                active ? 'font-semibold text-black' : 'text-txt-secondary',
              )}
            >
              {opt.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
