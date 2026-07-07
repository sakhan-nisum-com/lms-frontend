"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { COURSES, STUDENT_PROFILE } from "@/lib/data/courses"
import { TRAINING_TRACKS } from "@/lib/data/trainings"
import { usePurchases } from "@/lib/hooks/usePurchases"
import { useTrainingEnrollments } from "@/lib/hooks/useTrainingEnrollments"
import { useDiscussions } from "@/lib/hooks/useDiscussions"
import { discussionsApi, type ApiDiscussionReply } from "@/lib/api/discussions"
import { NewThreadModal } from "@/components/discussions/NewThreadModal"
import type { DiscussionThread } from "@/lib/data/courses"
import {
  MessageSquare, Pin, CheckCircle2, Eye,
  Plus, Search, Send, ThumbsUp,
} from "lucide-react"

// "all" | "course:<id>" | "training:<id>"
type Scope = "all" | `course:${string}` | `training:${string}`

export default function DiscussionsPage() {
  return (
    <Suspense fallback={null}>
      <DiscussionsContent />
    </Suspense>
  )
}

function DiscussionsContent() {
  const p = STUDENT_PROFILE
  const { isPurchased } = usePurchases()
  const { isEnrolled } = useTrainingEnrollments()
  const { threads, createThread } = useDiscussions()
  const searchParams = useSearchParams()
  const requestedScope = searchParams.get("scope") as Scope | null
  const [scope, setScope] = useState<Scope>(requestedScope ?? "all")
  const [search, setSearch] = useState("")
  const [activeThread, setActiveThread] = useState<DiscussionThread | null>(null)
  const [replyText, setReplyText] = useState("")
  const [replying, setReplying] = useState(false)
  const [showNewThread, setShowNewThread] = useState(searchParams.get("new") === "1")

  // Per-thread replies fetched from API
  const [replies, setReplies] = useState<ApiDiscussionReply[]>([])
  const [repliesLoading, setRepliesLoading] = useState(false)

  // Set initial active thread once threads are loaded
  useEffect(() => {
    if (!activeThread && threads.length > 0) setActiveThread(threads[0])
  }, [threads, activeThread])

  // Load replies when switching threads
  useEffect(() => {
    if (!activeThread) return
    setReplies([])
    setRepliesLoading(true)
    discussionsApi.listReplies(activeThread.id)
      .then(setReplies)
      .catch(() => {})
      .finally(() => setRepliesLoading(false))
  }, [activeThread?.id])

  const enrolledCourses = COURSES.filter((c) => c.progress !== undefined || isPurchased(c.id))
  const enrolledTrainings = TRAINING_TRACKS.filter((t) => t.enrolled || isEnrolled(t.id))

  const filtered = threads.filter((d) => {
    if (scope.startsWith("course:") && d.courseId !== scope.slice("course:".length)) return false
    if (scope.startsWith("training:") && d.trainingId !== scope.slice("training:".length)) return false
    if (search && !d.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const pinnedThreads = filtered.filter((d) => d.isPinned)
  const regularThreads = filtered.filter((d) => !d.isPinned)

  async function handleCreateThread(threadScope: string, title: string, body: string, tags: string[]) {
    const isCourse = threadScope.startsWith("course:")
    const scopeId = threadScope.slice(threadScope.indexOf(":") + 1)
    const course = isCourse ? COURSES.find((c) => c.id === scopeId) : undefined
    const training = !isCourse ? TRAINING_TRACKS.find((t) => t.id === scopeId) : undefined

    const newId = await createThread({
      title,
      body,
      tags,
      author: p.name,
      authorAvatar: p.avatar,
      authorRole: "student",
      ...(course ? { courseId: course.id, courseName: course.title } : {}),
      ...(training ? { trainingId: training.id, trainingName: training.title } : {}),
    })

    const newThread: DiscussionThread = {
      id: newId as string,
      title,
      body,
      tags,
      author: p.name,
      authorAvatar: p.avatar,
      authorRole: "student",
      createdAt: new Date().toISOString().slice(0, 10),
      replies: 0,
      views: 0,
      isPinned: false,
      isSolved: false,
      lastReplyAt: new Date().toISOString().slice(0, 10),
      lastReplyBy: p.name,
      ...(course ? { courseId: course.id, courseName: course.title } : {}),
      ...(training ? { trainingId: training.id, trainingName: training.title } : {}),
    }

    setScope(threadScope as Scope)
    setShowNewThread(false)
    setActiveThread(newThread)
    setReplies([])
  }

  async function handleSendReply() {
    if (!replyText.trim() || !activeThread) return
    setReplying(true)
    try {
      const reply = await discussionsApi.createReply(activeThread.id, replyText.trim())
      setReplies((prev) => [...prev, reply])
      setActiveThread((t) => t ? { ...t, replies: t.replies + 1 } : t)
      setReplyText("")
    } catch {
      // Optimistic local display even if API failed
      const localReply: ApiDiscussionReply = {
        id: `local-${Date.now()}`,
        threadId: activeThread.id,
        authorId: "local",
        authorName: p.name,
        authorRole: "STUDENT",
        body: replyText.trim(),
        acceptedAnswer: false,
        isInstructorAnswer: false,
        likeCount: 0,
        likedByMe: false,
        createdAt: new Date().toISOString(),
      }
      setReplies((prev) => [...prev, localReply])
      setReplyText("")
    } finally {
      setReplying(false)
    }
  }

  function handleLikeReply(replyId: string) {
    discussionsApi.likeReply(replyId).catch(() => {})
    setReplies((prev) =>
      prev.map((r) =>
        r.id === replyId
          ? { ...r, likeCount: r.likedByMe ? (r.likeCount ?? 0) - 1 : (r.likeCount ?? 0) + 1, likedByMe: !r.likedByMe }
          : r
      )
    )
  }

  function formatTime(dateStr: string): string {
    const date = new Date(dateStr)
    const now = Date.now()
    const diff = now - date.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  function getInitials(name: string): string {
    return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
  }

  return (
    <DashboardLayout role="student" userName={p.name}>
      <div className="space-y-0 max-w-7xl h-[calc(100vh-80px)] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Discussions</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              {threads.length} threads across your courses and trainings
            </p>
          </div>
          <button
            onClick={() => setShowNewThread(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ backgroundColor: "var(--accent)", color: "#fff" }}
          >
            <Plus size={15} /> New Thread
          </button>
        </div>

        <div className="flex gap-4 flex-1 overflow-hidden min-h-0">

          {/* Left: Thread list */}
          <div className="w-80 flex-shrink-0 flex flex-col min-h-0">

            {/* Search */}
            <div className="relative mb-3 flex-shrink-0">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-tertiary)" }} />
              <input
                type="text"
                placeholder="Search discussions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none"
                style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
              />
            </div>

            {/* Course / Training selector */}
            <div className="mb-3 flex-shrink-0">
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value as Scope)}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
              >
                <option value="all">All Courses &amp; Trainings</option>
                {enrolledCourses.length > 0 && (
                  <optgroup label="Courses">
                    {enrolledCourses.map((c) => (
                      <option key={c.id} value={`course:${c.id}`}>{c.title}</option>
                    ))}
                  </optgroup>
                )}
                {enrolledTrainings.length > 0 && (
                  <optgroup label="Trainings">
                    {enrolledTrainings.map((t) => (
                      <option key={t.id} value={`training:${t.id}`}>{t.title}</option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            {/* Thread list */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: "var(--border-default) transparent" }}>
              {/* Pinned */}
              {pinnedThreads.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider px-1 mb-1.5" style={{ color: "var(--text-muted)" }}>PINNED</p>
                  {pinnedThreads.map((thread) => {
                    const active = activeThread?.id === thread.id
                    return (
                      <button
                        key={thread.id}
                        className="w-full text-left rounded-xl p-3 mb-1.5 transition-all"
                        style={{
                          backgroundColor: active ? "#3B82F620" : "var(--bg-surface)",
                          border: `1px solid ${active ? "var(--accent)" : "var(--border-default)"}`,
                        }}
                        onClick={() => setActiveThread(thread)}
                      >
                        <div className="flex items-start gap-2">
                          <Pin size={12} className="flex-shrink-0 mt-0.5" style={{ color: "var(--accent)" }} />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold leading-snug line-clamp-2" style={{ color: "var(--text-primary)" }}>{thread.title}</p>
                            <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
                              {thread.replies} replies · {thread.views} views
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Regular threads */}
              <div>
                {pinnedThreads.length > 0 && (
                  <p className="text-xs font-bold uppercase tracking-wider px-1 mb-1.5" style={{ color: "var(--text-muted)" }}>ALL THREADS</p>
                )}
                {regularThreads.map((thread) => {
                  const active = activeThread?.id === thread.id
                  return (
                    <button
                      key={thread.id}
                      className="w-full text-left rounded-xl p-3 mb-1.5 transition-all"
                      style={{
                        backgroundColor: active ? "#3B82F620" : "var(--bg-surface)",
                        border: `1px solid ${active ? "var(--accent)" : "var(--border-default)"}`,
                      }}
                      onClick={() => setActiveThread(thread)}
                    >
                      <div className="flex items-start gap-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: "var(--accent)", color: "#fff", fontSize: 10 }}
                        >
                          {thread.authorAvatar}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1 mb-0.5">
                            {thread.isSolved && <CheckCircle2 size={11} style={{ color: "var(--success)" }} />}
                            <p className="text-xs font-semibold leading-snug line-clamp-2" style={{ color: "var(--text-primary)" }}>{thread.title}</p>
                          </div>
                          <p className="text-xs truncate" style={{ color: "var(--text-tertiary)" }}>{thread.courseName ?? thread.trainingName}</p>
                          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                            {thread.replies} replies · {thread.lastReplyAt}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })}

                {filtered.length === 0 && (
                  <div className="text-center py-8">
                    <MessageSquare size={28} className="mx-auto mb-2" style={{ color: "var(--border-default)" }} />
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>No threads found</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Thread detail */}
          {activeThread ? (
            <div
              className="flex-1 rounded-2xl flex flex-col overflow-hidden shadow-sm"
              style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
            >
              {/* Thread header */}
              <div className="p-5 flex-shrink-0" style={{ borderBottom: "1px solid var(--border-default)" }}>
                <div className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: "var(--accent)", color: "#fff" }}
                  >
                    {activeThread.authorAvatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {activeThread.isPinned && <Pin size={13} style={{ color: "var(--accent)" }} />}
                      {activeThread.isSolved && (
                        <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--success)" }}>
                          <CheckCircle2 size={12} /> Solved
                        </span>
                      )}
                    </div>
                    <h2 className="text-base font-bold mb-1" style={{ color: "var(--text-primary)" }}>{activeThread.title}</h2>
                    <div className="flex items-center gap-3 text-xs flex-wrap" style={{ color: "var(--text-tertiary)" }}>
                      <span>{activeThread.author} {activeThread.authorRole === "instructor" && "· Instructor"}</span>
                      <span>{activeThread.createdAt}</span>
                      <span className="flex items-center gap-1"><Eye size={11} /> {activeThread.views}</span>
                      <span className="flex items-center gap-1"><MessageSquare size={11} /> {activeThread.replies}</span>
                    </div>
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {activeThread.tags.map((tag) => (
                        <span key={tag} className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: "var(--border-default)", color: "var(--text-secondary)" }}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{activeThread.body}</p>
              </div>

              {/* Replies */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ scrollbarWidth: "thin", scrollbarColor: "var(--border-default) transparent" }}>
                {repliesLoading ? (
                  <div className="text-center py-8">
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Loading replies…</p>
                  </div>
                ) : replies.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>No replies yet — be the first to respond.</p>
                  </div>
                ) : replies.map((reply) => {
                  const isInstructor = reply.authorRole === "INSTRUCTOR"
                  const initials = getInitials(reply.authorName)
                  return (
                    <div
                      key={reply.id}
                      className="flex gap-3"
                      style={reply.isInstructorAnswer ? { padding: "12px", borderRadius: 12, border: "1px solid #3B82F640", backgroundColor: "#3B82F608" } : {}}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{
                          backgroundColor: isInstructor ? "var(--accent)" : "var(--border-default)",
                          color: isInstructor ? "#fff" : "var(--text-secondary)",
                        }}
                      >
                        {initials}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{reply.authorName}</span>
                          {isInstructor && (
                            <span className="text-xs px-1.5 py-0.5 rounded font-semibold" style={{ backgroundColor: "#3B82F620", color: "#60A5FA" }}>
                              Instructor
                            </span>
                          )}
                          {reply.isInstructorAnswer && (
                            <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded font-semibold" style={{ backgroundColor: "#10B98120", color: "var(--success)" }}>
                              <CheckCircle2 size={10} /> Accepted Answer
                            </span>
                          )}
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>{formatTime(reply.createdAt)}</span>
                        </div>
                        <p className="text-sm leading-relaxed mb-2" style={{ color: "var(--text-secondary)" }}>{reply.body}</p>
                        <button
                          onClick={() => handleLikeReply(reply.id)}
                          className="flex items-center gap-1.5 text-xs transition-colors"
                          style={{ color: reply.likedByMe ? "var(--accent)" : "var(--text-tertiary)" }}
                        >
                          <ThumbsUp size={12} fill={reply.likedByMe ? "var(--accent)" : "none"} /> {reply.likeCount} {reply.likeCount === 1 ? "like" : "likes"}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Reply box */}
              <div className="p-4 flex-shrink-0" style={{ borderTop: "1px solid var(--border-default)" }}>
                <div className="flex gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: "var(--accent)", color: "#fff" }}
                  >
                    {p.avatar}
                  </div>
                  <div className="flex-1 flex gap-2">
                    <textarea
                      className="flex-1 rounded-xl px-3 py-2 text-sm resize-none outline-none"
                      style={{
                        backgroundColor: "var(--bg-surface-muted)",
                        border: "1px solid var(--border-default)",
                        color: "var(--text-primary)",
                        minHeight: 44,
                        maxHeight: 120,
                      }}
                      placeholder="Write a reply..."
                      rows={2}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                      onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSendReply()
                      }}
                    />
                    <button
                      onClick={handleSendReply}
                      disabled={!replyText.trim() || replying}
                      className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0 disabled:opacity-40"
                      style={{ backgroundColor: "var(--accent)", color: "#fff" }}
                    >
                      <Send size={15} />
                    </button>
                  </div>
                </div>
                <p className="text-xs mt-1.5 ml-11" style={{ color: "var(--text-muted)" }}>⌘↵ to send</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center rounded-2xl" style={{ backgroundColor: "var(--bg-surface)", border: "1px dashed var(--border-default)" }}>
              <div className="text-center">
                <MessageSquare size={36} className="mx-auto mb-3" style={{ color: "var(--border-default)" }} />
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>Select a thread to read</p>
              </div>
            </div>
          )}
        </div>

        {showNewThread && (
          <NewThreadModal
            courses={enrolledCourses}
            trainings={enrolledTrainings}
            initialScope={scope}
            onClose={() => setShowNewThread(false)}
            onCreate={handleCreateThread}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
