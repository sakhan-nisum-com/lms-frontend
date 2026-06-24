"use client"

import { useState, useEffect, useCallback } from "react"
import { DISCUSSIONS } from "@/lib/data/courses"
import type { DiscussionThread } from "@/lib/data/courses"

const STORAGE_KEY = "lms_discussions"

function load(): DiscussionThread[] {
  if (typeof window === "undefined") return DISCUSSIONS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as DiscussionThread[]) : DISCUSSIONS
  } catch {
    return DISCUSSIONS
  }
}

function save(threads: DiscussionThread[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(threads))
}

type NewThreadInput = Pick<
  DiscussionThread,
  "title" | "body" | "author" | "authorAvatar" | "authorRole" | "tags" | "courseId" | "courseName" | "trainingId" | "trainingName"
>

// Tracks discussion threads client-side, no backend — same pattern as
// usePurchases / useStudyGroups. Lets a student start a new thread tied to
// a specific course or training, on top of the seeded ones.
export function useDiscussions() {
  const [threads, setThreads] = useState<DiscussionThread[]>(DISCUSSIONS)

  useEffect(() => {
    setThreads(load())
  }, [])

  const createThread = useCallback((input: NewThreadInput) => {
    const id = `d-${Date.now()}`
    const today = new Date().toISOString().slice(0, 10)
    const thread: DiscussionThread = {
      ...input,
      id,
      createdAt: today,
      replies: 0,
      views: 0,
      isPinned: false,
      isSolved: false,
      lastReplyAt: today,
      lastReplyBy: input.author,
    }
    setThreads((prev) => {
      const next = [thread, ...prev]
      save(next)
      return next
    })
    return id
  }, [])

  const togglePin = useCallback((id: string) => {
    setThreads((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, isPinned: !t.isPinned } : t))
      save(next)
      return next
    })
  }, [])

  const toggleSolved = useCallback((id: string) => {
    setThreads((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, isSolved: !t.isSolved } : t))
      save(next)
      return next
    })
  }, [])

  const deleteThread = useCallback((id: string) => {
    setThreads((prev) => {
      const next = prev.filter((t) => t.id !== id)
      save(next)
      return next
    })
  }, [])

  return { threads, createThread, togglePin, toggleSolved, deleteThread }
}
