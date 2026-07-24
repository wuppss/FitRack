import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { WorkoutTemplate } from '../types'
import { STORAGE_KEYS, loadJSON, saveJSON, uid } from '../lib/storage'

const ACCENTS: WorkoutTemplate['accent'][] = ['lime', 'cyan', 'orange', 'purple']

interface TemplateContextValue {
  /** user-created templates (starter templates live in src/data/templates.ts) */
  templates: WorkoutTemplate[]
  addTemplate: (name: string, exerciseIds: string[]) => void
  deleteTemplate: (id: string) => void
}

const TemplateContext = createContext<TemplateContextValue | null>(null)

export function TemplateProvider({ children }: { children: ReactNode }) {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>(() =>
    loadJSON<WorkoutTemplate[]>(STORAGE_KEYS.templates, []),
  )

  useEffect(() => {
    saveJSON(STORAGE_KEYS.templates, templates)
  }, [templates])

  const addTemplate = useCallback((name: string, exerciseIds: string[]) => {
    setTemplates((t) => [
      {
        id: uid('tpl-'),
        name: name.trim(),
        description: `${exerciseIds.length} exercises`,
        accent: ACCENTS[t.length % ACCENTS.length],
        exerciseIds,
      },
      ...t,
    ])
  }, [])

  const deleteTemplate = useCallback((id: string) => {
    setTemplates((t) => t.filter((tpl) => tpl.id !== id))
  }, [])

  const value = useMemo<TemplateContextValue>(
    () => ({ templates, addTemplate, deleteTemplate }),
    [templates, addTemplate, deleteTemplate],
  )

  return <TemplateContext.Provider value={value}>{children}</TemplateContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTemplates(): TemplateContextValue {
  const ctx = useContext(TemplateContext)
  if (!ctx) throw new Error('useTemplates must be used within TemplateProvider')
  return ctx
}
