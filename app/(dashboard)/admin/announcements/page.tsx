"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { useAnnouncements } from "@/lib/hooks/useAnnouncements"
import type { AnnouncementAudience, AnnouncementPriority } from "@/lib/data/announcements"
import { Plus, Megaphone, Pin, Trash2, AlertTriangle } from "lucide-react"

const audienceLabels: Record<AnnouncementAudience, string> = {
  all: "Everyone",
  students: "Students",
  tutors: "Tutors",
}

export default function AdminAnnouncementsPage() {
  const { announcements, createAnnouncement, togglePin, deleteAnnouncement } = useAnnouncements()
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [audience, setAudience] = useState<AnnouncementAudience>("all")
  const [priority, setPriority] = useState<AnnouncementPriority>("normal")

  const resetForm = () => {
    setTitle("")
    setBody("")
    setAudience("all")
    setPriority("normal")
  }

  const handleCreate = () => {
    if (!title.trim() || !body.trim()) return
    createAnnouncement({ title: title.trim(), body: body.trim(), audience, priority, author: "Morgan Patel" })
    resetForm()
    setShowForm(false)
  }

  const sorted = [...announcements].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    return a.publishedAt < b.publishedAt ? 1 : -1
  })

  return (
    <DashboardLayout role="admin" userName="Morgan Patel">
      <div className="space-y-6 max-w-5xl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Announcements</h1>
            <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>
              Publish site-wide notices to students, tutors, or everyone.
            </p>
          </div>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: "#3B82F6" }}
          >
            <Plus size={16} /> {showForm ? "Cancel" : "New Announcement"}
          </button>
        </div>

        {showForm && (
          <div className="rounded-2xl p-5 space-y-4" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: "#94A3B8" }}>Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Scheduled maintenance window"
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ backgroundColor: "#0F172A", border: "1px solid #334155", color: "#F8FAFC" }}
              />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: "#94A3B8" }}>Message</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={3}
                placeholder="What do learners and instructors need to know?"
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
                style={{ backgroundColor: "#0F172A", border: "1px solid #334155", color: "#F8FAFC" }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "#94A3B8" }}>Audience</label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value as AnnouncementAudience)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: "#0F172A", border: "1px solid #334155", color: "#F8FAFC" }}
                >
                  <option value="all">Everyone</option>
                  <option value="students">Students only</option>
                  <option value="tutors">Tutors only</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "#94A3B8" }}>Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as AnnouncementPriority)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: "#0F172A", border: "1px solid #334155", color: "#F8FAFC" }}
                >
                  <option value="normal">Normal</option>
                  <option value="high">High priority</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { resetForm(); setShowForm(false) }}
                className="px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: "#334155", color: "#94A3B8" }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!title.trim() || !body.trim()}
                className="px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40"
                style={{ backgroundColor: "#3B82F6", color: "#fff" }}
              >
                Publish
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {sorted.length === 0 ? (
            <div className="rounded-2xl p-10 text-center" style={{ backgroundColor: "#1E293B", border: "1px dashed #334155" }}>
              <Megaphone size={32} className="mx-auto mb-3" style={{ color: "#334155" }} />
              <p className="text-sm" style={{ color: "#475569" }}>No announcements yet.</p>
            </div>
          ) : sorted.map((a) => (
            <div key={a.id} className="rounded-2xl p-5" style={{ backgroundColor: "#1E293B", border: `1px solid ${a.priority === "high" ? "#F59E0B40" : "#334155"}` }}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className="flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: a.priority === "high" ? "#F59E0B20" : "#3B82F620" }}
                  >
                    {a.priority === "high" ? (
                      <AlertTriangle size={16} style={{ color: "#F59E0B" }} />
                    ) : (
                      <Megaphone size={16} style={{ color: "#3B82F6" }} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {a.pinned && <Pin size={12} style={{ color: "#F59E0B" }} fill="#F59E0B" />}
                      <p className="text-sm font-bold text-white">{a.title}</p>
                      <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold" style={{ backgroundColor: "#33415560", color: "#94A3B8" }}>
                        {audienceLabels[a.audience]}
                      </span>
                    </div>
                    <p className="text-sm mt-1.5" style={{ color: "#94A3B8" }}>{a.body}</p>
                    <p className="text-xs mt-2" style={{ color: "#64748B" }}>{a.author} · {a.publishedAt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => togglePin(a.id)}
                    title={a.pinned ? "Unpin" : "Pin"}
                    className="flex items-center justify-center w-8 h-8 rounded-lg"
                    style={{ backgroundColor: a.pinned ? "#F59E0B20" : "#33415560", color: a.pinned ? "#FCD34D" : "#94A3B8" }}
                  >
                    <Pin size={14} />
                  </button>
                  <button
                    onClick={() => deleteAnnouncement(a.id)}
                    title="Delete"
                    className="flex items-center justify-center w-8 h-8 rounded-lg"
                    style={{ backgroundColor: "#EF444420", color: "#F87171" }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
