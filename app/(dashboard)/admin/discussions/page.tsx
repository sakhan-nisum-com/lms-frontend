"use client"

import { useMemo, useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { useDiscussions } from "@/lib/hooks/useDiscussions"
import { Search, MessageSquare, Pin, CheckCircle2, Trash2, Eye } from "lucide-react"

export default function AdminDiscussionsPage() {
  const { threads, togglePin, toggleSolved, deleteThread } = useDiscussions()
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "pinned" | "unsolved">("all")

  const filtered = useMemo(() => {
    return threads.filter((t) => {
      if (filter === "pinned" && !t.isPinned) return false
      if (filter === "unsolved" && t.isSolved) return false
      if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.author.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [threads, filter, search])

  const stats = [
    { label: "Total Threads", value: threads.length, icon: MessageSquare, color: "#3B82F6" },
    { label: "Pinned", value: threads.filter((t) => t.isPinned).length, icon: Pin, color: "#F59E0B" },
    { label: "Resolved", value: threads.filter((t) => t.isSolved).length, icon: CheckCircle2, color: "#10B981" },
    { label: "Total Views", value: threads.reduce((s, t) => s + t.views, 0).toLocaleString(), icon: Eye, color: "#8B5CF6" },
  ]

  return (
    <DashboardLayout role="admin" userName="Morgan Patel">
      <div className="space-y-6 max-w-6xl">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Discussions</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Moderate discussion threads across all courses and training tracks.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
              <div className="flex items-center justify-center w-10 h-10 rounded-xl mb-3" style={{ backgroundColor: `${color}20` }}>
                <Icon size={20} style={{ color }} />
              </div>
              <div className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{value}</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{label}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or author..."
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg outline-none"
              style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
            />
          </div>
          <div className="flex gap-1.5">
            {(["all", "pinned", "unsolved"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-3 py-2 rounded-lg text-xs font-semibold capitalize"
                style={{
                  backgroundColor: filter === f ? "var(--accent)" : "var(--bg-surface)",
                  color: filter === f ? "#fff" : "var(--text-secondary)",
                  border: "1px solid var(--border-default)",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map((t) => (
            <div key={t.id} className="rounded-2xl p-4 flex items-start gap-3 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
              <div
                className="flex items-center justify-center w-9 h-9 rounded-full text-xs font-bold text-white flex-shrink-0"
                style={{ backgroundColor: t.authorRole === "instructor" ? "#8B5CF6" : "var(--accent)" }}
              >
                {t.authorAvatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {t.isPinned && <Pin size={12} style={{ color: "var(--warning)" }} fill="#F59E0B" />}
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t.title}</p>
                  {t.isSolved && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold" style={{ backgroundColor: "#10B98120", color: "#34D399" }}>
                      Resolved
                    </span>
                  )}
                </div>
                <p className="text-xs mt-1 line-clamp-2" style={{ color: "var(--text-secondary)" }}>{t.body}</p>
                <p className="text-xs mt-1.5" style={{ color: "var(--text-tertiary)" }}>
                  {t.author} · {t.courseName ?? t.trainingName ?? "General"} · {t.replies} replies · {t.views} views · {t.createdAt}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => togglePin(t.id)}
                  title={t.isPinned ? "Unpin" : "Pin"}
                  className="flex items-center justify-center w-8 h-8 rounded-lg"
                  style={{ backgroundColor: t.isPinned ? "#F59E0B20" : "#33415560", color: t.isPinned ? "#FCD34D" : "var(--text-secondary)" }}
                >
                  <Pin size={14} />
                </button>
                <button
                  onClick={() => toggleSolved(t.id)}
                  title={t.isSolved ? "Mark unresolved" : "Mark resolved"}
                  className="flex items-center justify-center w-8 h-8 rounded-lg"
                  style={{ backgroundColor: t.isSolved ? "#10B98120" : "#33415560", color: t.isSolved ? "#34D399" : "var(--text-secondary)" }}
                >
                  <CheckCircle2 size={14} />
                </button>
                <button
                  onClick={() => deleteThread(t.id)}
                  title="Delete thread"
                  className="flex items-center justify-center w-8 h-8 rounded-lg"
                  style={{ backgroundColor: "#EF444420", color: "#F87171" }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="rounded-2xl p-10 text-center shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px dashed var(--border-default)" }}>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No discussion threads match these filters.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
