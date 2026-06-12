"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { DISCUSSIONS, COURSES, STUDENT_PROFILE } from "@/lib/data/courses"
import {
  MessageSquare, Pin, CheckCircle2, Eye, ChevronRight,
  Plus, Search, Filter, Send, ThumbsUp,
} from "lucide-react"

type CourseFilter = "all" | string

const mockReplies = [
  {
    id: "r1",
    author: "Sarah Chen",
    authorInitials: "SC",
    role: "instructor" as const,
    time: "2h ago",
    body: "Great question! Server Components are part of React itself, while getServerSideProps was a Next.js-specific API. With App Router, you simply make a component async and fetch data directly inside it — no need for a special export. The key difference is that Server Components run at request time or can be cached, and they live in the React tree rather than being a separate data layer.",
    likes: 12,
  },
  {
    id: "r2",
    author: "Jordan Lee",
    authorInitials: "JL",
    role: "student" as const,
    time: "1d ago",
    body: "To add to Sarah's answer — one practical difference is that Server Components can be nested anywhere in your component tree, not just at the page level. This makes co-location of data fetching with UI much cleaner.",
    likes: 5,
  },
  {
    id: "r3",
    author: "Alex Johnson",
    authorInitials: "AJ",
    role: "student" as const,
    time: "1d ago",
    body: "That makes sense! So it's more of an architectural shift. Does this mean we should avoid getServerSideProps entirely in new Next.js 15 projects?",
    likes: 2,
  },
]

export default function DiscussionsPage() {
  const p = STUDENT_PROFILE
  const [courseFilter, setCourseFilter] = useState<CourseFilter>("all")
  const [search, setSearch] = useState("")
  const [activeThread, setActiveThread] = useState(DISCUSSIONS[0])
  const [replyText, setReplyText] = useState("")
  const [showNewThread, setShowNewThread] = useState(false)

  const enrolledCourses = COURSES.filter((c) => c.progress !== undefined)

  const filtered = DISCUSSIONS.filter((d) => {
    if (courseFilter !== "all" && d.courseId !== courseFilter) return false
    if (search && !d.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const pinnedThreads = filtered.filter((d) => d.isPinned)
  const regularThreads = filtered.filter((d) => !d.isPinned)

  return (
    <DashboardLayout role="student" userName={p.name}>
      <div className="space-y-0 max-w-7xl h-[calc(100vh-80px)] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-white">Discussions</h1>
            <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>
              {DISCUSSIONS.length} threads across your courses
            </p>
          </div>
          <button
            onClick={() => setShowNewThread(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ backgroundColor: "#3B82F6", color: "#fff" }}
          >
            <Plus size={15} /> New Thread
          </button>
        </div>

        <div className="flex gap-4 flex-1 overflow-hidden min-h-0">

          {/* Left: Thread list */}
          <div className="w-80 flex-shrink-0 flex flex-col min-h-0">

            {/* Search */}
            <div className="relative mb-3 flex-shrink-0">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#64748B" }} />
              <input
                type="text"
                placeholder="Search discussions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none"
                style={{ backgroundColor: "#1E293B", border: "1px solid #334155", color: "#F8FAFC" }}
              />
            </div>

            {/* Course filter */}
            <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 flex-shrink-0" style={{ scrollbarWidth: "none" }}>
              <button
                onClick={() => setCourseFilter("all")}
                className="px-2.5 py-1 rounded-lg text-xs font-medium flex-shrink-0 transition-colors"
                style={{
                  backgroundColor: courseFilter === "all" ? "#3B82F6" : "#1E293B",
                  color: courseFilter === "all" ? "#fff" : "#94A3B8",
                  border: "1px solid #334155",
                }}
              >
                All Courses
              </button>
              {enrolledCourses.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCourseFilter(c.id)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium flex-shrink-0 transition-colors"
                  style={{
                    backgroundColor: courseFilter === c.id ? "#3B82F6" : "#1E293B",
                    color: courseFilter === c.id ? "#fff" : "#94A3B8",
                    border: "1px solid #334155",
                  }}
                >
                  {c.thumbnail} {c.title.split(" ").slice(0, 2).join(" ")}
                </button>
              ))}
            </div>

            {/* Thread list */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: "#334155 transparent" }}>
              {/* Pinned */}
              {pinnedThreads.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider px-1 mb-1.5" style={{ color: "#475569" }}>PINNED</p>
                  {pinnedThreads.map((thread) => {
                    const active = activeThread?.id === thread.id
                    return (
                      <button
                        key={thread.id}
                        className="w-full text-left rounded-xl p-3 mb-1.5 transition-all"
                        style={{
                          backgroundColor: active ? "#3B82F620" : "#1E293B",
                          border: `1px solid ${active ? "#3B82F6" : "#334155"}`,
                        }}
                        onClick={() => setActiveThread(thread)}
                      >
                        <div className="flex items-start gap-2">
                          <Pin size={12} className="flex-shrink-0 mt-0.5" style={{ color: "#3B82F6" }} />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white leading-snug line-clamp-2">{thread.title}</p>
                            <p className="text-xs mt-1" style={{ color: "#64748B" }}>
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
                  <p className="text-xs font-bold uppercase tracking-wider px-1 mb-1.5" style={{ color: "#475569" }}>ALL THREADS</p>
                )}
                {regularThreads.map((thread) => {
                  const active = activeThread?.id === thread.id
                  return (
                    <button
                      key={thread.id}
                      className="w-full text-left rounded-xl p-3 mb-1.5 transition-all"
                      style={{
                        backgroundColor: active ? "#3B82F620" : "#1E293B",
                        border: `1px solid ${active ? "#3B82F6" : "#334155"}`,
                      }}
                      onClick={() => setActiveThread(thread)}
                    >
                      <div className="flex items-start gap-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: "#3B82F6", color: "#fff", fontSize: 10 }}
                        >
                          {thread.authorAvatar}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1 mb-0.5">
                            {thread.isSolved && <CheckCircle2 size={11} style={{ color: "#10B981" }} />}
                            <p className="text-xs font-semibold text-white leading-snug line-clamp-2">{thread.title}</p>
                          </div>
                          <p className="text-xs truncate" style={{ color: "#64748B" }}>{thread.courseName}</p>
                          <p className="text-xs mt-0.5" style={{ color: "#475569" }}>
                            {thread.replies} replies · {thread.lastReplyAt}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })}

                {filtered.length === 0 && (
                  <div className="text-center py-8">
                    <MessageSquare size={28} className="mx-auto mb-2" style={{ color: "#334155" }} />
                    <p className="text-xs" style={{ color: "#475569" }}>No threads found</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Thread detail */}
          {activeThread ? (
            <div
              className="flex-1 rounded-2xl flex flex-col overflow-hidden"
              style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
            >
              {/* Thread header */}
              <div className="p-5 flex-shrink-0" style={{ borderBottom: "1px solid #334155" }}>
                <div className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: "#3B82F6", color: "#fff" }}
                  >
                    {activeThread.authorAvatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {activeThread.isPinned && <Pin size={13} style={{ color: "#3B82F6" }} />}
                      {activeThread.isSolved && (
                        <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#10B981" }}>
                          <CheckCircle2 size={12} /> Solved
                        </span>
                      )}
                    </div>
                    <h2 className="text-base font-bold text-white mb-1">{activeThread.title}</h2>
                    <div className="flex items-center gap-3 text-xs flex-wrap" style={{ color: "#64748B" }}>
                      <span>{activeThread.author} {activeThread.authorRole === "instructor" && "· Instructor"}</span>
                      <span>{activeThread.createdAt}</span>
                      <span className="flex items-center gap-1"><Eye size={11} /> {activeThread.views}</span>
                      <span className="flex items-center gap-1"><MessageSquare size={11} /> {activeThread.replies}</span>
                    </div>
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {activeThread.tags.map((tag) => (
                        <span key={tag} className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: "#334155", color: "#94A3B8" }}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: "#CBD5E1" }}>{activeThread.body}</p>
              </div>

              {/* Replies */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ scrollbarWidth: "thin", scrollbarColor: "#334155 transparent" }}>
                {mockReplies.map((reply) => (
                  <div key={reply.id} className="flex gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{
                        backgroundColor: reply.role === "instructor" ? "#3B82F6" : "#334155",
                        color: reply.role === "instructor" ? "#fff" : "#94A3B8",
                      }}
                    >
                      {reply.authorInitials}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-white">{reply.author}</span>
                        {reply.role === "instructor" && (
                          <span className="text-xs px-1.5 py-0.5 rounded font-semibold" style={{ backgroundColor: "#3B82F620", color: "#60A5FA" }}>
                            Instructor
                          </span>
                        )}
                        <span className="text-xs" style={{ color: "#475569" }}>{reply.time}</span>
                      </div>
                      <p className="text-sm leading-relaxed mb-2" style={{ color: "#CBD5E1" }}>{reply.body}</p>
                      <button className="flex items-center gap-1.5 text-xs" style={{ color: "#64748B" }}>
                        <ThumbsUp size={12} /> {reply.likes} likes
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply box */}
              <div className="p-4 flex-shrink-0" style={{ borderTop: "1px solid #334155" }}>
                <div className="flex gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: "#3B82F6", color: "#fff" }}
                  >
                    {p.avatar}
                  </div>
                  <div className="flex-1 flex gap-2">
                    <textarea
                      className="flex-1 rounded-xl px-3 py-2 text-sm resize-none outline-none"
                      style={{
                        backgroundColor: "#0F172A",
                        border: "1px solid #334155",
                        color: "#F8FAFC",
                        minHeight: 44,
                        maxHeight: 120,
                      }}
                      placeholder="Write a reply..."
                      rows={2}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onFocus={(e) => (e.target.style.borderColor = "#3B82F6")}
                      onBlur={(e) => (e.target.style.borderColor = "#334155")}
                    />
                    <button
                      disabled={!replyText.trim()}
                      className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0 disabled:opacity-40"
                      style={{ backgroundColor: "#3B82F6", color: "#fff" }}
                    >
                      <Send size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center rounded-2xl" style={{ backgroundColor: "#1E293B", border: "1px dashed #334155" }}>
              <div className="text-center">
                <MessageSquare size={36} className="mx-auto mb-3" style={{ color: "#334155" }} />
                <p className="text-sm" style={{ color: "#475569" }}>Select a thread to read</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
