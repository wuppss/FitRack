import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: ReactNode
  suffix?: ReactNode
}

export function Input({ label, icon, suffix, className, id, ...rest }: InputProps) {
  return (
    <label className="block" htmlFor={id}>
      {label && (
        <span className="mb-1.5 block text-xs font-medium text-txt-secondary">{label}</span>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span className="pointer-events-none absolute left-3 text-txt-tertiary">{icon}</span>
        )}
        <input
          id={id}
          className={cn(
            'h-12 w-full rounded-md bg-bg-input px-3 text-[15px] text-txt-primary placeholder:text-txt-tertiary',
            'border border-white/5 outline-none transition-colors focus:border-lime/40',
            icon && 'pl-10',
            suffix && 'pr-14',
            className,
          )}
          {...rest}
        />
        {suffix && (
          <span className="absolute right-3 text-sm text-txt-secondary">{suffix}</span>
        )}
      </div>
    </label>
  )
}
