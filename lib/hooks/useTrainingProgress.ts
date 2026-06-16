"use client"

import { useState, useEffect, useCallback } from "react"

const STORAGE_KEY = "lms_training_progress"

type ProgressStore = Record<string, string[]> // trackId → moduleId[]

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

// Returns completed module IDs for a track + a function to mark/unmark one.
export function useTrainingProgress(trackId: string) {
  const [store, setStore] = useState<ProgressStore>({})

  useEffect(() => {
    setStore(load())
  }, [])

  const completedIds = new Set<string>(store[trackId] ?? [])

  const markComplete = useCallback((moduleId: string, done = true) => {
    setStore((prev) => {
      const current = new Set<string>(prev[trackId] ?? [])
      done ? current.add(moduleId) : current.delete(moduleId)
      const next = { ...prev, [trackId]: Array.from(current) }
      save(next)
      return next
    })
  }, [trackId])

  const isComplete = useCallback((moduleId: string) => completedIds.has(moduleId), [completedIds])

  return { completedIds, markComplete, isComplete }
}

// Full store across every track — for list views (catalog, My Trainings)
// that need real completion status without calling the hook per track.
export function useAllTrainingProgress(): ProgressStore {
  const [store, setStore] = useState<ProgressStore>({})

  useEffect(() => {
    setStore(load())
  }, [])

  return store
}
