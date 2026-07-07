"use client"

import { useState, useEffect, useCallback } from "react"
import { progressApi } from "@/lib/api/progress"

const STORAGE_KEY = "lms_progress"
type ProgressStore = Record<string, string[]> // courseId → completed lessonId[]

function loadLocal(): ProgressStore {
  if (typeof window === "undefined") return {}
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as ProgressStore } catch { return {} }
}

function saveLocal(store: ProgressStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

export function useProgress(courseId: string) {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Seed from localStorage immediately so there's no flash
    const local = loadLocal()
    if (local[courseId]) setCompletedIds(new Set(local[courseId]))

    progressApi.getCourseProgress(courseId)
      .then((list) => {
        const ids = new Set(list.filter((p) => p.completed).map((p) => p.lessonId))
        setCompletedIds(ids)
        saveLocal({ ...loadLocal(), [courseId]: Array.from(ids) })
      })
      .catch(() => {
        // Backend unavailable — keep localStorage state
      })
      .finally(() => setLoading(false))
  }, [courseId])

  const markComplete = useCallback((lessonId: string, done = true) => {
    // Optimistic update
    setCompletedIds((prev) => {
      const next = new Set(prev)
      done ? next.add(lessonId) : next.delete(lessonId)
      saveLocal({ ...loadLocal(), [courseId]: Array.from(next) })
      return next
    })

    // Persist to backend; revert on failure
    progressApi.markLesson(lessonId, done).catch(() => {
      setCompletedIds((prev) => {
        const next = new Set(prev)
        done ? next.delete(lessonId) : next.add(lessonId)
        return next
      })
    })
  }, [courseId])

  const isComplete = useCallback((lessonId: string) => completedIds.has(lessonId), [completedIds])

  return { completedIds, markComplete, isComplete, loading }
}

// Returns the full progress store across all courses (for My Courses, Certificates pages).
// Still reads from localStorage — those pages don't need real-time accuracy.
export function useAllProgress(): ProgressStore {
  const [store, setStore] = useState<ProgressStore>({})
  useEffect(() => { setStore(loadLocal()) }, [])
  return store
}
