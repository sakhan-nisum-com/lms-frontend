"use client"

import { useState, useEffect, useCallback } from "react"
import { ANNOUNCEMENT_SEED } from "@/lib/data/announcements"
import type { Announcement, AnnouncementAudience, AnnouncementPriority } from "@/lib/data/announcements"

const STORAGE_KEY = "lms_announcements"

function load(): Announcement[] {
  if (typeof window === "undefined") return ANNOUNCEMENT_SEED
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Announcement[]) : ANNOUNCEMENT_SEED
  } catch {
    return ANNOUNCEMENT_SEED
  }
}

function save(items: Announcement[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

type NewAnnouncementInput = {
  title: string
  body: string
  audience: AnnouncementAudience
  priority: AnnouncementPriority
  author: string
}

// Site-wide announcements managed by admins, client-side only —
// same pattern as useStudyGroups / useDiscussions.
export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(ANNOUNCEMENT_SEED)

  useEffect(() => {
    setAnnouncements(load())
  }, [])

  const createAnnouncement = useCallback((input: NewAnnouncementInput) => {
    const id = `ann-${Date.now()}`
    const announcement: Announcement = {
      ...input,
      id,
      publishedAt: new Date().toISOString().slice(0, 10),
      pinned: false,
    }
    setAnnouncements((prev) => {
      const next = [announcement, ...prev]
      save(next)
      return next
    })
    return id
  }, [])

  const togglePin = useCallback((id: string) => {
    setAnnouncements((prev) => {
      const next = prev.map((a) => (a.id === id ? { ...a, pinned: !a.pinned } : a))
      save(next)
      return next
    })
  }, [])

  const deleteAnnouncement = useCallback((id: string) => {
    setAnnouncements((prev) => {
      const next = prev.filter((a) => a.id !== id)
      save(next)
      return next
    })
  }, [])

  return { announcements, createAnnouncement, togglePin, deleteAnnouncement }
}
