"use client"

import { useState, useEffect, useCallback } from "react"

const STORAGE_KEY = "lms_training_enrollments"

function load(): string[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as string[]
  } catch {
    return []
  }
}

function save(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
}

// Tracks which training tracks the student has enrolled in beyond the
// statically-seeded ones (e.g. clicking "Start Training" in the catalog) —
// same client-only pattern as usePurchases / useWorkshopRegistrations.
export function useTrainingEnrollments() {
  const [ids, setIds] = useState<string[]>([])

  useEffect(() => {
    setIds(load())
  }, [])

  const enrolledIds = new Set(ids)

  const isEnrolled = useCallback((trackId: string) => enrolledIds.has(trackId), [enrolledIds])

  const enroll = useCallback((trackId: string) => {
    setIds((prev) => {
      if (prev.includes(trackId)) return prev
      const next = [...prev, trackId]
      save(next)
      return next
    })
  }, [])

  return { enrolledIds, isEnrolled, enroll }
}
