"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { announcementsApi, type ApiAnnouncement, type CreateAnnouncementRequest } from "@/lib/api/admin"
import { authStore } from "@/lib/auth-store"
import { Plus, Megaphone, Trash2, AlertTriangle, Loader2 } from "lucide-react"

const PRIORITY_STYLES: Record<string, { color: string; bg: string; borderColor: string }> = {
  NORMAL:   { color: "#60A5FA", bg: "#3B82F618", borderColor: "var(--border-default)" },
  HIGH:     { color: "#FCD34D", bg: "#F59E0B18", borderColor: "#F59E0B40" },
  CRITICAL: { color: "#F87171", bg: "#EF444418", borderColor: "#EF444440" },
}

const AUDIENCE_LABELS: Record<string, string> = {
  ALL: "Everyone", STUDENTS: "Students Only", INSTRUCTORS: "Instructors Only",
}

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState<ApiAnnouncement[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const user = authStore.getUser()

  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [audience, setAudience] = useState<"ALL" | "STUDENTS" | "INSTRUCTORS">("ALL")
  const [priority, setPriority] = useState<"NORMAL" | "HIGH" | "CRITICAL">("NORMAL")

  useEffect(() => {
    announcementsApi.list().then((res) => setItems(res.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  async function create() {
    if (!title.trim() || !body.trim()) return
    setCreating(true)
    try {
      const req: CreateAnnouncementRequest = { title: title.trim(), body: body.trim(), audience, priority }
      const created = await announcementsApi.create(req)
      setItems((prev) => [created, ...prev])
      setTitle(""); setBody(""); setAudience("ALL"); setPriority("NORMAL")
      setShowForm(false)
    } catch { /* toast in future */ } finally { setCreating(false) }
  }

  async function remove(id: string) {
    setDeleting(true)
    try {
      await announcementsApi.delete(id)
      setItems((prev) => prev.filter((a) => a.id !== id))
      setDeleteId(null)
    } catch {} finally { setDeleting(false) }
  }

  return (
    <DashboardLayout role="admin" userName={user?.fullName ?? "Admin"}>
      <div className="space-y-6 max-w-5xl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Announcements</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Broadcast messages to students, instructors, or everyone.
            </p>
          </div>
          <button onClick={() => setShowForm((s) => !s)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: showForm ? "#64748B" : "var(--accent)" }}>
            <Plus size={15} /> {showForm ? "Cancel" : "New Announcement"}
          </button>
        </div>

        {showForm && (
          <div className="rounded-2xl p-5 space-y-4 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>New Announcement</p>
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text-secondary)" }}>Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Announcement title…"
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }} />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text-secondary)" }}>Message</label>
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder="Write your announcement…"
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
                style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text-secondary)" }}>Audience</label>
                <select value={audience} onChange={(e) => setAudience(e.target.value as typeof audience)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}>
                  <option value="ALL">Everyone</option>
                  <option value="STUDENTS">Students Only</option>
                  <option value="INSTRUCTORS">Instructors Only</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text-secondary)" }}>Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value as typeof priority)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: "var(--border-default)", color: "var(--text-secondary)" }}>
                Cancel
              </button>
              <button onClick={create} disabled={!title.trim() || !body.trim() || creating}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
                style={{ backgroundColor: "var(--accent)", color: "#fff" }}>
                {creating && <Loader2 size={13} className="animate-spin" />}
                Publish
              </button>
            </div>
          </div>
        )}

        {/* Delete confirm */}
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "#00000080" }}>
            <div className="rounded-2xl p-6 w-full max-w-md" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
              <h3 className="text-base font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Delete Announcement?</h3>
              <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>This cannot be undone.</p>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setDeleteId(null)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{ backgroundColor: "var(--border-default)", color: "var(--text-secondary)" }}>
                  Cancel
                </button>
                <button onClick={() => remove(deleteId)} disabled={deleting}
                  className="px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
                  style={{ backgroundColor: "#EF4444", color: "#fff" }}>
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={28} className="animate-spin" style={{ color: "var(--text-muted)" }} />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl p-10 text-center" style={{ border: "1px dashed var(--border-default)" }}>
            <Megaphone size={32} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>No announcements yet. Create one above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((a) => {
              const ps = PRIORITY_STYLES[a.priority] ?? PRIORITY_STYLES.NORMAL
              return (
                <div key={a.id} className="rounded-2xl p-5 shadow-sm"
                  style={{ backgroundColor: "var(--bg-surface)", border: `1px solid ${ps.borderColor}` }}>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0"
                        style={{ backgroundColor: ps.bg }}>
                        {a.priority !== "NORMAL"
                          ? <AlertTriangle size={16} style={{ color: ps.color }} />
                          : <Megaphone size={16} style={{ color: ps.color }} />
                        }
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                            style={{ backgroundColor: ps.bg, color: ps.color }}>
                            {a.priority}
                          </span>
                          <span className="text-xs px-1.5 py-0.5 rounded-full"
                            style={{ backgroundColor: "#33415550", color: "var(--text-secondary)" }}>
                            {AUDIENCE_LABELS[a.audience] ?? a.audience}
                          </span>
                        </div>
                        <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{a.title}</p>
                        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{a.body}</p>
                        <p className="text-xs mt-2" style={{ color: "var(--text-tertiary)" }}>
                          {new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => setDeleteId(a.id)}
                      className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
                      style={{ backgroundColor: "#EF444418", color: "#F87171" }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
