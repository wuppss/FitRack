import { format } from 'date-fns'

/** Local ISO date key: yyyy-MM-dd (used for all daily logs). */
export function dateKey(d: Date = new Date()): string {
  return format(d, 'yyyy-MM-dd')
}

export function prettyDate(d: Date | number): string {
  return format(typeof d === 'number' ? new Date(d) : d, 'EEE, MMM d')
}

export function prettyTime(d: Date | number): string {
  return format(typeof d === 'number' ? new Date(d) : d, 'HH:mm')
}

/** e.g. 1h 12m or 42m */
export function formatDuration(ms: number): string {
  const totalMin = Math.max(0, Math.round(ms / 60000))
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h === 0) return `${m}m`
  return `${h}h ${m}m`
}

/** mm:ss for timers */
export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.round(seconds))
  const mm = Math.floor(s / 60)
  const ss = s % 60
  return `${mm}:${ss.toString().padStart(2, '0')}`
}

export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10
}

export function lbsToKg(lbs: number): number {
  return Math.round((lbs / 2.20462) * 10) / 10
}

export function cmToFtIn(cm: number): string {
  const totalIn = cm / 2.54
  const ft = Math.floor(totalIn / 12)
  const inch = Math.round(totalIn % 12)
  return `${ft}'${inch}"`
}

export function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase())
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

/** Epley estimated one-rep max. */
export function epley1Rm(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0
  return weight * (1 + reps / 30)
}
