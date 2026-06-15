"use client"

import { useState, useEffect, useCallback } from "react"

const STORAGE_KEY = "lms_progress"

type ProgressStore = Record<string, string[]> // courseId → lessonId[]

function load(): ProgressStore {
  if (typeof window === "undefined") return {}
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as ProgressStore
  } catch {
    return {}
  }
}

function save(store: ProgressStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

// Returns completed lesson IDs for a course + a function to mark/unmark a lesson
export function useProgress(courseId: string) {
  const [store, setStore] = useState<ProgressStore>({})

  // Hydrate from localStorage on mount (avoids SSR mismatch)
  useEffect(() => {
    setStore(load())
  }, [])

  const completedIds = new Set<string>(store[courseId] ?? [])

  const markComplete = useCallback((lessonId: string, done = true) => {
    setStore((prev) => {
      const current = new Set<string>(prev[courseId] ?? [])
      done ? current.add(lessonId) : current.delete(lessonId)
      const next = { ...prev, [courseId]: Array.from(current) }
      save(next)
      return next
    })
  }, [courseId])

  const isComplete = useCallback((lessonId: string) => completedIds.has(lessonId), [completedIds])

  return { completedIds, markComplete, isComplete }
}
