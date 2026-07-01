"use client"

import { useState, useEffect, useCallback } from "react"

const STORAGE_KEY = "lms_knowledge_check_results"

export interface KnowledgeCheckResult {
  score: number
  passed: boolean
  attempts: number
}

type ResultStore = Record<string, KnowledgeCheckResult> // checkId → result

function load(): ResultStore {
  if (typeof window === "undefined") return {}
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as ResultStore
  } catch {
    return {}
  }
}

function save(store: ResultStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

// Tracks best score/pass status per knowledge check (client-only, no backend).
export function useKnowledgeCheckResults() {
  const [store, setStore] = useState<ResultStore>({})

  useEffect(() => {
    setStore(load())
  }, [])

  const getResult = useCallback((checkId: string) => store[checkId], [store])

  const submitResult = useCallback((checkId: string, score: number, passed: boolean) => {
    setStore((prev) => {
      const existing = prev[checkId]
      const next: ResultStore = {
        ...prev,
        [checkId]: {
          score: existing ? Math.max(existing.score, score) : score,
          passed: existing ? existing.passed || passed : passed,
          attempts: (existing?.attempts ?? 0) + 1,
        },
      }
      save(next)
      return next
    })
  }, [])

  return { getResult, submitResult }
}
