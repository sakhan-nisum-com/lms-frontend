"use client"

import { useState, useEffect, useCallback } from "react"

const STORAGE_KEY = "lms_workshop_registrations"
const SEED_IDS = ["ws1"]

function load(): string[] {
  if (typeof window === "undefined") return SEED_IDS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : SEED_IDS
  } catch {
    return SEED_IDS
  }
}

function save(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
}

// Tracks which workshops the student has registered for (client-only, no
// backend) — same pattern as usePurchases, so registering on the catalog
// page is immediately reflected on the My Workshops page.
export function useWorkshopRegistrations() {
  const [ids, setIds] = useState<string[]>(SEED_IDS)

  useEffect(() => {
    setIds(load())
  }, [])

  const registeredIds = new Set(ids)

  const isRegistered = useCallback((workshopId: string) => registeredIds.has(workshopId), [registeredIds])

  const toggleRegistration = useCallback((workshopId: string) => {
    setIds((prev) => {
      const next = prev.includes(workshopId) ? prev.filter((id) => id !== workshopId) : [...prev, workshopId]
      save(next)
      return next
    })
  }, [])

  return { registeredIds, isRegistered, toggleRegistration }
}
