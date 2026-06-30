"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { useAnnouncements } from "@/lib/hooks/useAnnouncements"
import type { AnnouncementAudience, AnnouncementPriority } from "@/lib/data/announcements"
import { Plus, Megaphone, Pin, Trash2, AlertTriangle } from "lucide-react"

export default function AdminAnnouncementsPage() {
  const t = useTranslations("adminAnnouncements")
  const tCommon = useTranslations("common")
  const { announcements, createAnnouncement, togglePin, deleteAnnouncement } = useAnnouncements()

  const audienceLabels: Record<AnnouncementAudience, string> = {
    all: t("audienceEveryone"),
    students: t("audienceStudents"),
    tutors: t("audienceTutors"),
  }
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
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{t("title")}</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              {t("subtitle")}
            </p>
          </div>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--accent)" }}
          >
            <Plus size={16} /> {showForm ? tCommon("cancel") : t("newAnnouncement")}
          </button>
        </div>

        {showForm && (
          <div className="rounded-2xl p-5 space-y-4 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text-secondary)" }}>{t("titleLabel")}</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("titlePlaceholder")}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
              />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text-secondary)" }}>{t("message")}</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={3}
                placeholder={t("messagePlaceholder")}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
                style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text-secondary)" }}>{t("audience")}</label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value as AnnouncementAudience)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                >
                  <option value="all">{t("audienceAll")}</option>
                  <option value="students">{t("audienceStudentsOnly")}</option>
                  <option value="tutors">{t("audienceTutorsOnly")}</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text-secondary)" }}>{t("priority")}</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as AnnouncementPriority)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                >
                  <option value="normal">{t("priorityNormal")}</option>
                  <option value="high">{t("priorityHigh")}</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { resetForm(); setShowForm(false) }}
                className="px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: "var(--border-default)", color: "var(--text-secondary)" }}
              >
                {tCommon("cancel")}
              </button>
              <button
                onClick={handleCreate}
                disabled={!title.trim() || !body.trim()}
                className="px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40"
                style={{ backgroundColor: "var(--accent)", color: "#fff" }}
              >
                {t("publish")}
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {sorted.length === 0 ? (
            <div className="rounded-2xl p-10 text-center shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px dashed var(--border-default)" }}>
              <Megaphone size={32} className="mx-auto mb-3" style={{ color: "var(--border-default)" }} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>{t("emptyTitle")}</p>
            </div>
          ) : sorted.map((a) => (
            <div key={a.id} className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: `1px solid ${a.priority === "high" ? "#F59E0B40" : "var(--border-default)"}` }}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className="flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: a.priority === "high" ? "#F59E0B20" : "#3B82F620" }}
                  >
                    {a.priority === "high" ? (
                      <AlertTriangle size={16} style={{ color: "var(--warning)" }} />
                    ) : (
                      <Megaphone size={16} style={{ color: "var(--accent)" }} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {a.pinned && <Pin size={12} style={{ color: "var(--warning)" }} fill="#F59E0B" />}
                      <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{a.title}</p>
                      <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold" style={{ backgroundColor: "#33415560", color: "var(--text-secondary)" }}>
                        {audienceLabels[a.audience]}
                      </span>
                    </div>
                    <p className="text-sm mt-1.5" style={{ color: "var(--text-secondary)" }}>{a.body}</p>
                    <p className="text-xs mt-2" style={{ color: "var(--text-tertiary)" }}>{a.author} · {a.publishedAt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => togglePin(a.id)}
                    title={a.pinned ? t("unpin") : t("pin")}
                    className="flex items-center justify-center w-8 h-8 rounded-lg"
                    style={{ backgroundColor: a.pinned ? "#F59E0B20" : "#33415560", color: a.pinned ? "#FCD34D" : "var(--text-secondary)" }}
                  >
                    <Pin size={14} />
                  </button>
                  <button
                    onClick={() => deleteAnnouncement(a.id)}
                    title={t("delete")}
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
