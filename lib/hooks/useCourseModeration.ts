"use client"

import { useState, useEffect, useCallback } from "react"
import type { Course, CourseCategory, CourseLevel } from "@/lib/data/courses"

export type CourseStatus = "published" | "draft" | "pending-review" | "unpublished"
export type CourseBadge = "featured" | "premium" | "topRated"

interface ModerationEntry {
  status: CourseStatus
  featured: boolean
  premium: boolean
  topRated: boolean
}

export interface EditableCourseFields {
  title: string
  shortDesc: string
  description: string
  category: CourseCategory
  level: CourseLevel
  price: number | "Free"
  instructor: string
  instructorTitle: string
  tags: string[]
  isMandatory: boolean
  certificateOffered: boolean
}

const STORAGE_KEY = "lms_course_moderation"
const CONTENT_KEY = "lms_course_content"

function load(): Record<string, ModerationEntry> {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? (JSON.parse(raw) as Record<string, Partial<ModerationEntry>>) : {}
    const merged: Record<string, ModerationEntry> = {}
    for (const [id, entry] of Object.entries(parsed)) {
      merged[id] = { ...DEFAULT_ENTRY, ...entry }
    }
    return merged
  } catch {
    return {}
  }
}

function save(overrides: Record<string, ModerationEntry>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides))
}

function loadContent(): Record<string, Partial<EditableCourseFields>> {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(CONTENT_KEY)
    return raw ? (JSON.parse(raw) as Record<string, Partial<EditableCourseFields>>) : {}
  } catch {
    return {}
  }
}

function saveContent(overrides: Record<string, Partial<EditableCourseFields>>) {
  localStorage.setItem(CONTENT_KEY, JSON.stringify(overrides))
}

const DEFAULT_ENTRY: ModerationEntry = { status: "published", featured: false, premium: false, topRated: false }

// Admin overlay on top of the read-only COURSES catalog: publish state,
// catalog badges (featured / premium / top rated), and editable content
// fields (title, description, price, etc.) — all stored client-side only
// (no backend), same pattern as the other localStorage-backed hooks.
// Courses with no override default to "published", no badges, and the
// original seeded content.
export function useCourseModeration() {
  const [overrides, setOverrides] = useState<Record<string, ModerationEntry>>({})
  const [contentOverrides, setContentOverrides] = useState<Record<string, Partial<EditableCourseFields>>>({})

  useEffect(() => {
    setOverrides(load())
    setContentOverrides(loadContent())
  }, [])

  const getEntry = useCallback(
    (courseId: string) => overrides[courseId] ?? DEFAULT_ENTRY,
    [overrides]
  )

  const setStatus = useCallback((courseId: string, status: CourseStatus) => {
    setOverrides((prev) => {
      const next = { ...prev, [courseId]: { ...(prev[courseId] ?? DEFAULT_ENTRY), status } }
      save(next)
      return next
    })
  }, [])

  const toggleBadge = useCallback((courseId: string, badge: CourseBadge) => {
    setOverrides((prev) => {
      const current = prev[courseId] ?? DEFAULT_ENTRY
      const next = { ...prev, [courseId]: { ...current, [badge]: !current[badge] } }
      save(next)
      return next
    })
  }, [])

  const toggleFeatured = useCallback((courseId: string) => toggleBadge(courseId, "featured"), [toggleBadge])
  const togglePremium = useCallback((courseId: string) => toggleBadge(courseId, "premium"), [toggleBadge])
  const toggleTopRated = useCallback((courseId: string) => toggleBadge(courseId, "topRated"), [toggleBadge])

  const getContent = useCallback(
    (course: Course): Course => {
      const patch = contentOverrides[course.id]
      return patch ? { ...course, ...patch } : course
    },
    [contentOverrides]
  )

  const updateContent = useCallback((courseId: string, patch: Partial<EditableCourseFields>) => {
    setContentOverrides((prev) => {
      const next = { ...prev, [courseId]: { ...(prev[courseId] ?? {}), ...patch } }
      saveContent(next)
      return next
    })
  }, [])

  return {
    getEntry, setStatus, toggleBadge, toggleFeatured, togglePremium, toggleTopRated,
    getContent, updateContent,
  }
}
