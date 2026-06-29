"use client"

import { useState, useEffect, useCallback } from "react"

const STORAGE_KEY = "lms_scorm_attempts"

export interface ScormAttempt {
  id: string
  packageId: string
  scoId: string
  startedAt: string
  completedAt?: string
  status: "incomplete" | "completed" | "passed" | "failed"
  scoreRaw?: number
  timeSpentSeconds: number
  reportedSessionTimeSeconds?: number
}

type AttemptsStore = ScormAttempt[]

function load(): AttemptsStore {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as AttemptsStore
  } catch {
    return []
  }
}

function save(attempts: AttemptsStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts))
}

export function useScormAttempts(packageId?: string) {
  const [attempts, setAttempts] = useState<AttemptsStore>([])

  useEffect(() => {
    setAttempts(load())
  }, [])

  const filtered = packageId ? attempts.filter((a) => a.packageId === packageId) : attempts

  const startAttempt = useCallback(
    (pkgId: string, scoId: string): string => {
      const id = `attempt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      const newAttempt: ScormAttempt = {
        id,
        packageId: pkgId,
        scoId,
        startedAt: new Date().toISOString(),
        status: "incomplete",
        timeSpentSeconds: 0,
      }
      setAttempts((prev) => {
        const next = [...prev, newAttempt]
        save(next)
        return next
      })
      return id
    },
    []
  )

  const updateAttempt = useCallback((attemptId: string, patch: Partial<ScormAttempt>) => {
    setAttempts((prev) => {
      const idx = prev.findIndex((a) => a.id === attemptId)
      if (idx === -1) return prev
      const next = [...prev]
      next[idx] = { ...next[idx], ...patch }
      save(next)
      return next
    })
  }, [])

  const finishAttempt = useCallback((attemptId: string, patch: Partial<ScormAttempt>) => {
    setAttempts((prev) => {
      const idx = prev.findIndex((a) => a.id === attemptId)
      if (idx === -1) return prev
      const next = [...prev]
      next[idx] = {
        ...next[idx],
        ...patch,
        completedAt: next[idx].completedAt || new Date().toISOString(),
      }
      save(next)
      return next
    })
  }, [])

  const getAttempt = useCallback(
    (attemptId: string): ScormAttempt | undefined => {
      return attempts.find((a) => a.id === attemptId)
    },
    [attempts]
  )

  const latestAttemptForSco = useCallback(
    (pkgId: string, scoId: string): ScormAttempt | undefined => {
      const matching = attempts.filter((a) => a.packageId === pkgId && a.scoId === scoId)
      return matching.length > 0 ? matching[matching.length - 1] : undefined
    },
    [attempts]
  )

  return { attempts: filtered, startAttempt, updateAttempt, finishAttempt, getAttempt, latestAttemptForSco }
}

export function useAllScormAttempts(): AttemptsStore {
  const [attempts, setAttempts] = useState<AttemptsStore>([])

  useEffect(() => {
    setAttempts(load())
  }, [])

  return attempts
}
