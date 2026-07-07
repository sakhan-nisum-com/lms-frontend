"use client"

import { useState, useEffect, useCallback } from "react"
import { DISCUSSIONS } from "@/lib/data/courses"
import type { DiscussionThread } from "@/lib/data/courses"
import { discussionsApi, type ApiDiscussionThread } from "@/lib/api/discussions"

function apiThreadToLocal(t: ApiDiscussionThread): DiscussionThread {
  const initials = t.authorName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
  return {
    id: t.id,
    title: t.title,
    body: t.body,
    author: t.authorName,
    authorAvatar: initials,
    authorRole: (t.authorRole?.toLowerCase() ?? "student") as DiscussionThread["authorRole"],
    tags: t.tags ?? [],
    courseId: t.courseId ?? undefined,
    courseName: undefined,
    trainingId: undefined,
    trainingName: undefined,
    createdAt: t.createdAt.slice(0, 10),
    replies: t.replyCount,
    views: t.viewCount ?? 0,
    isPinned: t.isPinned ?? t.pinned ?? false,
    isSolved: t.isSolved ?? false,
    lastReplyAt: t.lastReplyAt?.slice(0, 10) ?? t.createdAt.slice(0, 10),
    lastReplyBy: t.lastReplyByName ?? t.authorName,
  }
}

type NewThreadInput = Pick<
  DiscussionThread,
  "title" | "body" | "author" | "authorAvatar" | "authorRole" | "tags" | "courseId" | "courseName" | "trainingId" | "trainingName"
>

export function useDiscussions() {
  const [threads, setThreads] = useState<DiscussionThread[]>(DISCUSSIONS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    discussionsApi.list(undefined, 0, 100)
      .then((page) => {
        if (page.data.length > 0) setThreads(page.data.map(apiThreadToLocal))
      })
      .catch(() => {
        // Fall back to seeded mock data — backend not yet connected
      })
      .finally(() => setLoading(false))
  }, [])

  const createThread = useCallback(async (input: NewThreadInput): Promise<string> => {
    try {
      const created = await discussionsApi.create({
        courseId: input.courseId,
        title: input.title,
        body: input.body,
        tags: input.tags,
      })
      const local = apiThreadToLocal(created)
      setThreads((prev) => [local, ...prev])
      return created.id
    } catch {
      // Optimistic local fallback
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
      setThreads((prev) => [thread, ...prev])
      return id
    }
  }, [])

  const togglePin = useCallback((id: string) => {
    discussionsApi.pin(id).catch(() => {})
    setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, isPinned: !t.isPinned } : t)))
  }, [])

  const toggleSolved = useCallback((id: string) => {
    setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, isSolved: !t.isSolved } : t)))
  }, [])

  const deleteThread = useCallback((id: string) => {
    discussionsApi.delete(id).catch(() => {})
    setThreads((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { threads, loading, createThread, togglePin, toggleSolved, deleteThread }
}
