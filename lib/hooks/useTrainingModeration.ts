"use client"

import { useState, useEffect, useCallback } from "react"
import type { TrainingTrack } from "@/lib/data/trainings"

export interface EditableTrainingFields {
  title: string
  description: string
  type: TrainingTrack["type"]
  category: TrainingTrack["category"]
  level: string
  totalHours: number
  badge: string
  isMandatory: boolean
  deadline: string | null
}

const STORAGE_KEY = "lms_training_moderation"

function load(): Record<string, Partial<EditableTrainingFields>> {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, Partial<EditableTrainingFields>>) : {}
  } catch {
    return {}
  }
}

function save(overrides: Record<string, Partial<EditableTrainingFields>>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides))
}

// Admin overlay on top of the read-only TRAINING_TRACKS catalog: mandatory
// flag/deadline plus editable content fields (title, description, type,
// category, level, hours, badge) — all stored client-side only, same
// pattern as useCourseModeration. Tracks with no override fall back to
// their seed values.
export function useTrainingModeration() {
  const [overrides, setOverrides] = useState<Record<string, Partial<EditableTrainingFields>>>({})

  useEffect(() => {
    setOverrides(load())
  }, [])

  const getContent = useCallback(
    (track: TrainingTrack): TrainingTrack => {
      const patch = overrides[track.id]
      return patch ? { ...track, ...patch } : track
    },
    [overrides]
  )

  const updateContent = useCallback((trainingId: string, patch: Partial<EditableTrainingFields>) => {
    setOverrides((prev) => {
      const next = { ...prev, [trainingId]: { ...(prev[trainingId] ?? {}), ...patch } }
      save(next)
      return next
    })
  }, [])

  const toggleMandatory = useCallback(
    (trainingId: string, currentValue: boolean) => updateContent(trainingId, { isMandatory: !currentValue }),
    [updateContent]
  )

  const setDeadline = useCallback(
    (trainingId: string, deadline: string | null) => updateContent(trainingId, { deadline }),
    [updateContent]
  )

  return { getContent, updateContent, toggleMandatory, setDeadline }
}
