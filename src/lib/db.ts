import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Exercise } from '../types'

interface FitrackDB extends DBSchema {
  exercises: {
    key: string
    value: Exercise
    indexes: {
      bodyPart: string
      target: string
      equipment: string
    }
  }
}

let dbPromise: Promise<IDBPDatabase<FitrackDB>> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<FitrackDB>('fitrack', 1, {
      upgrade(db) {
        const store = db.createObjectStore('exercises', { keyPath: 'id' })
        store.createIndex('bodyPart', 'bodyPart')
        store.createIndex('target', 'target')
        store.createIndex('equipment', 'equipment')
      },
    })
  }
  return dbPromise
}

export async function putExercises(exercises: Exercise[]): Promise<void> {
  const db = await getDB()
  const tx = db.transaction('exercises', 'readwrite')
  await Promise.all(exercises.map((e) => tx.store.put(e)))
  await tx.done
}

export async function getAllExercises(): Promise<Exercise[]> {
  const db = await getDB()
  return db.getAll('exercises')
}

export async function getExerciseById(id: string): Promise<Exercise | undefined> {
  const db = await getDB()
  return db.get('exercises', id)
}

export async function countExercises(): Promise<number> {
  const db = await getDB()
  return db.count('exercises')
}

export async function clearExercises(): Promise<void> {
  const db = await getDB()
  await db.clear('exercises')
}
