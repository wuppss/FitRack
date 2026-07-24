import { STORAGE_KEYS } from './storage'

/**
 * Export/import all FITRACK user data (profile, logs, workouts, templates,
 * goals, settings) as a single JSON file. The exercise catalog and cached GIFs
 * live in IndexedDB and are intentionally NOT included — they are re-synced from
 * ExerciseDB, and bundling ~1300 exercises + GIF blobs would bloat the backup.
 * The RapidAPI key is also excluded so backups can be shared safely.
 */

const EXPORT_KEYS: string[] = [
  STORAGE_KEYS.profile,
  STORAGE_KEYS.workouts,
  STORAGE_KEYS.food,
  STORAGE_KEYS.water,
  STORAGE_KEYS.steps,
  STORAGE_KEYS.templates,
  STORAGE_KEYS.weightLog,
  STORAGE_KEYS.restDuration,
  STORAGE_KEYS.gifResolution,
  'fitrack:apiUsage',
]

interface BackupFile {
  app: 'fitrack'
  version: 1
  exportedAt: string
  data: Record<string, unknown>
}

export function exportData(): void {
  const data: Record<string, unknown> = {}
  for (const key of EXPORT_KEYS) {
    const raw = localStorage.getItem(key)
    if (raw != null) {
      try {
        data[key] = JSON.parse(raw)
      } catch {
        data[key] = raw
      }
    }
  }

  const payload: BackupFile = {
    app: 'fitrack',
    version: 1,
    exportedAt: new Date().toISOString(),
    data,
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `fitrack-backup-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export async function importData(file: File): Promise<number> {
  const text = await file.text()
  const parsed = JSON.parse(text) as Partial<BackupFile>

  if (parsed.app !== 'fitrack' || typeof parsed.data !== 'object' || parsed.data == null) {
    throw new Error('Not a valid FITRACK backup file.')
  }

  let restored = 0
  for (const [key, value] of Object.entries(parsed.data)) {
    if (!EXPORT_KEYS.includes(key)) continue // ignore unknown keys defensively
    localStorage.setItem(key, JSON.stringify(value))
    restored += 1
  }
  return restored
}
