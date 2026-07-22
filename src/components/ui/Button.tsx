import { motion } from 'framer-motion'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'ref'> {
  variant?: Variant
  size?: Size
  icon?: ReactNode
  full?: boolean
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-lime text-black font-semibold shadow-glow-lime hover:bg-lime-dim',
  secondary: 'bg-bg-elevated text-txt-primary border border-white/10 hover:border-lime/30',
  ghost: 'bg-transparent text-txt-secondary hover:text-txt-primary',
  danger: 'bg-error/15 text-error border border-error/30 hover:bg-error/25',
}

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm rounded-md gap-1.5',
  md: 'h-12 px-5 text-[15px] rounded-md gap-2',
  lg: 'h-14 px-6 text-base rounded-lg gap-2',
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  full,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      className={cn(
        'inline-flex items-center justify-center font-body transition-colors disabled:opacity-40 disabled:pointer-events-none',
        VARIANTS[variant],
        SIZES[size],
        full && 'w-full',
        className,
      )}
      {...(rest as React.ComponentProps<typeof motion.button>)}
    >
      {icon}
      {children}
    </motion.button>
  )
}
