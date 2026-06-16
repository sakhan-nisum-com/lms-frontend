"use client"

import { useState, useEffect, useCallback } from "react"

const STORAGE_KEY = "lms_purchases"

interface PurchaseRecord {
  courseId: string
  purchasedAt: string
}

function load(): PurchaseRecord[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as PurchaseRecord[]
  } catch {
    return []
  }
}

function save(records: PurchaseRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

// Tracks which courses the student has purchased (client-only, no backend).
export function usePurchases() {
  const [records, setRecords] = useState<PurchaseRecord[]>([])

  // Hydrate from localStorage on mount (avoids SSR mismatch)
  useEffect(() => {
    setRecords(load())
  }, [])

  const purchasedIds = new Set(records.map((r) => r.courseId))

  const isPurchased = useCallback((courseId: string) => purchasedIds.has(courseId), [purchasedIds])

  const purchase = useCallback((courseId: string) => {
    setRecords((prev) => {
      if (prev.some((r) => r.courseId === courseId)) return prev
      const next = [...prev, { courseId, purchasedAt: new Date().toISOString() }]
      save(next)
      return next
    })
  }, [])

  return { purchasedIds, isPurchased, purchase }
}
