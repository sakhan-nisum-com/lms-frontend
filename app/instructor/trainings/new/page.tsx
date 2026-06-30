"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  DollarSign,
  Film,
  FileText,
  Globe,
  GripVertical,
  ImageIcon,
  Link2,
  Lock,
  Paperclip,
  Pencil,
  Play,
  Plus,
  Save,
  Target,
  Trash2,
  Video,
  X,
  Zap,
} from "lucide-react"
import { InstructorPageShell } from "@/components/instructor/InstructorPageShell"
import type { AssignmentTemplate, AttachmentFile, KnowledgeCheckTemplate } from "@/lib/data/live-session"

// ── Types ────────────────────────────────────────────────────────────────────

type ActivityType = "workshop"

interface WorkshopActivity  {
  id: string; type: "workshop"; title: string
  scheduledAt?: string; meetUrl?: string
  sessionType: "live" | "recorded"
  videoUrl?: string
  checks: KnowledgeCheckTemplate[]
  assignments: AssignmentTemplate[]
}
type Activity = WorkshopActivity

interface AnyActivityPatch {
  title?: string
  scheduledAt?: string; meetUrl?: string
  sessionType?: "live" | "recorded"; videoUrl?: string
  checks?: KnowledgeCheckTemplate[]
  assignments?: AssignmentTemplate[]
}

interface Week { id: string; title: string; activities: Activity[] }

interface TrainingForm {
  trainingTitle: string
  weeks: Week[]
  accessMode: "public" | "private"
  expiresAt: string
  priceUsd: string
}

// ── Constants ─────────────────────────────────────────────────────────────────

const ACTIVITY_META: Record<ActivityType, { label: string; color: string; bg: string }> = {
  workshop: { label: "Live", color: "#10B981", bg: "#10B98115" },
}

const ADD_OPTIONS: { type: ActivityType; emoji: string; label: string; desc: string }[] = [
  { type: "workshop", emoji: "📅", label: "Live Workshop / Q&A", desc: "Schedule a Zoom or Google Meet session" },
]

const DEFAULT_FORM: TrainingForm = {
  trainingTitle: "Untitled Training Program",
  weeks: [
    { id: "w-1", title: "Week 1: Core Fundamentals", activities: [] },
    { id: "w-2", title: "Week 2: Applied Practice",  activities: [] },
  ],
  accessMode: "public",
  expiresAt: "",
  priceUsd: "",
}

function uid(p: string) {
  return `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
      {children}
    </label>
  )
}

function PanelCard({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return (
    <div
      className="rounded-2xl"
      style={{ backgroundColor: "var(--bg-surface)", border: `1px solid ${accent ?? "var(--border-default)"}` }}
    >
      {children}
    </div>
  )
}

function PanelHeader({ icon: Icon, iconColor, iconBg, title, action }: {
  icon: typeof Globe; iconColor: string; iconBg: string
  title: string; action?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--border-default)" }}>
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-6 h-6 rounded-lg" style={{ backgroundColor: iconBg }}>
          <Icon size={13} style={{ color: iconColor }} />
        </div>
        <p className="text-sm font-semibold text-[var(--text-primary)]">{title}</p>
      </div>
      {action}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function CreateTrainingPage() {
  const [form, setForm]               = useState<TrainingForm>(DEFAULT_FORM)
  const [selectedId, setSelectedId]   = useState<string | null>(null)
  const [dropdownWeekId, setDropdownWeekId] = useState<string | null>(null)
  const [editingWeekId, setEditingWeekId]   = useState<string | null>(null)
  const [editWeekTitle, setEditWeekTitle]   = useState("")
  const [titleEditing, setTitleEditing]     = useState(false)
  const [titleValue, setTitleValue]         = useState(DEFAULT_FORM.trainingTitle)
  const [token, setToken]             = useState("")
  const [copied, setCopied]           = useState(false)
  const expiryInputRef = useRef<HTMLInputElement>(null)

  // Knowledge check draft state (for adding checks to a workshop activity)
  const [checkDraft, setCheckDraft] = useState<{
    type: "mcq" | "descriptive"
    question: string
    options: [string, string, string, string]
    correctIndex: number
  } | null>(null)

  // Assignment draft state
  const [assignmentDraft, setAssignmentDraft] = useState<{
    title: string
    description: string
    dueDate: string
    maxPoints: string
    attachments: AttachmentFile[]
  } | null>(null)

  useEffect(() => {
    setToken(
      Array.from({ length: 16 }, () =>
        "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]
      ).join("")
    )
  }, [])

  const shareUrl = token ? `https://learnflow.app/t/${token}` : "Generating…"
  const hasExpiry = !!form.expiresAt
  const isExpired = hasExpiry && new Date(form.expiresAt) < new Date()
  const isActive  = hasExpiry && !isExpired

  // ── Derived: active activity ─────────────────────────────────────────────────
  const selectedActivity: Activity | null = (() => {
    for (const w of form.weeks) {
      const a = w.activities.find(a => a.id === selectedId)
      if (a) return a
    }
    return null
  })()

  // ── Week helpers ──────────────────────────────────────────────────────────────
  function updateWeeks(weeks: Week[]) { setForm(f => ({ ...f, weeks })) }

  function addWeek() {
    const n = form.weeks.length + 1
    updateWeeks([...form.weeks, { id: uid("w"), title: `Week ${n}: New Phase`, activities: [] }])
  }

  function removeWeek(wId: string) {
    updateWeeks(form.weeks.filter(w => w.id !== wId))
    setSelectedId(null)
  }

  function moveWeek(wId: string, dir: -1 | 1) {
    const idx = form.weeks.findIndex(w => w.id === wId)
    if (idx < 0) return
    const t = idx + dir
    if (t < 0 || t >= form.weeks.length) return
    const copy = [...form.weeks];
    [copy[idx], copy[t]] = [copy[t], copy[idx]]
    updateWeeks(copy)
  }

  function startEditWeek(id: string, title: string) { setEditingWeekId(id); setEditWeekTitle(title) }

  function commitWeekTitle() {
    if (!editingWeekId) return
    const val = editWeekTitle.trim()
    if (val) updateWeeks(form.weeks.map(w => w.id === editingWeekId ? { ...w, title: val } : w))
    setEditingWeekId(null)
  }

  // ── Activity helpers ──────────────────────────────────────────────────────────
  function addActivity(wId: string, type: ActivityType) {
    const id = uid("a")
    const activity: Activity = { id, type, title: "Live Workshop Session", scheduledAt: "", meetUrl: "", sessionType: "live", checks: [], assignments: [] }
    updateWeeks(form.weeks.map(w => w.id === wId ? { ...w, activities: [...w.activities, activity] } : w))
    setSelectedId(id)
    setDropdownWeekId(null)
  }

  function removeActivity(wId: string, aId: string) {
    updateWeeks(form.weeks.map(w => w.id === wId ? { ...w, activities: w.activities.filter(a => a.id !== aId) } : w))
    if (selectedId === aId) setSelectedId(null)
  }

  function moveActivity(wId: string, aId: string, dir: -1 | 1) {
    updateWeeks(form.weeks.map(w => {
      if (w.id !== wId) return w
      const idx = w.activities.findIndex(a => a.id === aId)
      if (idx < 0) return w
      const t = idx + dir
      if (t < 0 || t >= w.activities.length) return w
      const copy = [...w.activities];
      [copy[idx], copy[t]] = [copy[t], copy[idx]]
      return { ...w, activities: copy }
    }))
  }

  function patchActivity(aId: string, patch: AnyActivityPatch) {
    updateWeeks(form.weeks.map(w => ({
      ...w,
      activities: w.activities.map(a => a.id === aId ? { ...a, ...patch } as Activity : a),
    })))
  }

  // ── Knowledge check helpers ───────────────────────────────────────────────────
  function addCheckToCurrent(check: KnowledgeCheckTemplate) {
    if (!selectedActivity || selectedActivity.type !== "workshop") return
    const ws = selectedActivity as WorkshopActivity
    patchActivity(selectedActivity.id, { checks: [...ws.checks, check] })
    setCheckDraft(null)
  }

  function removeCheckFromCurrent(checkId: string) {
    if (!selectedActivity || selectedActivity.type !== "workshop") return
    const ws = selectedActivity as WorkshopActivity
    patchActivity(selectedActivity.id, { checks: ws.checks.filter(c => c.id !== checkId) })
  }

  function addAssignmentToCurrent(asgn: AssignmentTemplate) {
    if (!selectedActivity || selectedActivity.type !== "workshop") return
    const ws = selectedActivity as WorkshopActivity
    patchActivity(selectedActivity.id, { assignments: [...ws.assignments, asgn] })
    setAssignmentDraft(null)
  }

  function removeAssignmentFromCurrent(asgnId: string) {
    if (!selectedActivity || selectedActivity.type !== "workshop") return
    const ws = selectedActivity as WorkshopActivity
    patchActivity(selectedActivity.id, { assignments: ws.assignments.filter(a => a.id !== asgnId) })
  }

  // ── Open native date picker ───────────────────────────────────────────────────
  function openExpiryPicker() {
    const input = expiryInputRef.current
    if (!input) return
    if (typeof (input as unknown as { showPicker?: () => void }).showPicker === "function") {
      ;(input as unknown as { showPicker: () => void }).showPicker()
    } else {
      input.click()
    }
  }

  // ── Copy to clipboard ─────────────────────────────────────────────────────────
  function copyLink() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <InstructorPageShell
      title="Create Training"
      user={{ name: "Jane Smith", email: "jane@example.com" }}
      action={
        <div className="flex items-center gap-2">
          <Link
            href="/instructor/trainings"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <button
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-[var(--text-primary)] hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "var(--accent)" }}
          >
            <Save size={14} />
            <span className="hidden sm:inline">Save Training</span>
          </button>
        </div>
      }
    >
      {/* Editable training title */}
      <div className="mb-6">
        {titleEditing ? (
          <input
            autoFocus
            value={titleValue}
            onChange={e => setTitleValue(e.target.value)}
            onBlur={() => {
              setTitleEditing(false)
              setForm(f => ({ ...f, trainingTitle: titleValue.trim() || f.trainingTitle }))
            }}
            onKeyDown={e => {
              if (e.key === "Enter" || e.key === "Escape")
                (e.target as HTMLInputElement).blur()
            }}
            className="text-xl font-bold bg-transparent outline-none text-[var(--text-primary)] border-b-2"
            style={{ borderColor: "var(--accent)", minWidth: 320 }}
          />
        ) : (
          <div
            className="flex items-center gap-2 group cursor-text w-fit"
            onClick={() => { setTitleEditing(true); setTitleValue(form.trainingTitle) }}
          >
            <h2 className="text-xl font-bold text-[var(--text-primary)]">{form.trainingTitle}</h2>
            <Pencil
              size={13}
              className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              style={{ color: "var(--text-muted)" }}
            />
          </div>
        )}
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          Click the title to rename · Drag week and activity handles to reorder
        </p>
      </div>

      {/* Split pane */}
      <div className="flex gap-5 items-start">

        {/* ══════════ LEFT 65%: Timeline Canvas ══════════ */}
        <div className="flex-[0_0_63%] min-w-0 space-y-4">

          {form.weeks.map((week, wi) => (
            <PanelCard key={week.id}>
              {/* Week header */}
              <div
                className="flex items-center gap-3 px-4 py-3"
                style={{ borderBottom: week.activities.length > 0 ? "1px solid var(--border-default)" : "none" }}
              >
                <GripVertical size={14} style={{ color: "var(--border-default)", flexShrink: 0, cursor: "grab" }} />

                {/* Inline-editable title */}
                <div className="flex-1 min-w-0 group flex items-center gap-2">
                  {editingWeekId === week.id ? (
                    <input
                      autoFocus
                      value={editWeekTitle}
                      onChange={e => setEditWeekTitle(e.target.value)}
                      onBlur={commitWeekTitle}
                      onKeyDown={e => {
                        if (e.key === "Enter") commitWeekTitle()
                        if (e.key === "Escape") setEditingWeekId(null)
                      }}
                      className="flex-1 bg-transparent outline-none text-sm font-semibold text-[var(--text-primary)] border-b"
                      style={{ borderColor: "var(--accent)" }}
                    />
                  ) : (
                    <>
                      <span
                        className="text-sm font-semibold text-[var(--text-primary)] cursor-text truncate"
                        onClick={() => startEditWeek(week.id, week.title)}
                      >
                        {week.title}
                      </span>
                      <Pencil
                        size={11}
                        className="opacity-0 group-hover:opacity-100 flex-shrink-0 cursor-pointer transition-opacity"
                        style={{ color: "var(--text-muted)" }}
                        onClick={() => startEditWeek(week.id, week.title)}
                      />
                    </>
                  )}
                </div>

                <span className="text-xs flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                  {week.activities.length} {week.activities.length === 1 ? "activity" : "activities"}
                </span>

                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => moveWeek(week.id, -1)}
                    disabled={wi === 0}
                    className="p-1 rounded hover:bg-white/5 transition-colors disabled:opacity-20"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    <ChevronUp size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveWeek(week.id, 1)}
                    disabled={wi === form.weeks.length - 1}
                    className="p-1 rounded hover:bg-white/5 transition-colors disabled:opacity-20"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    <ChevronDown size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeWeek(week.id)}
                    className="p-1 rounded transition-colors"
                    style={{ color: "var(--text-tertiary)" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "var(--danger)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "var(--text-tertiary)")}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Activity rows */}
              {week.activities.map((activity, ai) => {
                const meta = ACTIVITY_META[activity.type]
                const isSelected = selectedId === activity.id
                return (
                  <div
                    key={activity.id}
                    onClick={() => setSelectedId(isSelected ? null : activity.id)}
                    className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-all"
                    style={{
                      borderLeft: `3px solid ${isSelected ? meta.color : "transparent"}`,
                      backgroundColor: isSelected ? `${meta.color}0D` : "transparent",
                      borderBottom: ai < week.activities.length - 1 ? "1px solid var(--bg-surface-muted)" : "none",
                    }}
                  >
                    <GripVertical size={12} style={{ color: "var(--border-default)", flexShrink: 0, cursor: "grab" }} />

                    {/* Type pill */}
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        color: meta.color,
                        backgroundColor: meta.bg,
                        border: `1px solid ${meta.color}30`,
                      }}
                    >
                      {meta.label}
                    </span>

                    {/* Title */}
                    <span className="text-sm text-[var(--text-primary)] flex-1 truncate">{activity.title}</span>

                    {/* Type-specific inline meta */}
                    {activity.type === "workshop" && (activity as WorkshopActivity).scheduledAt && (
                      <span className="text-xs flex-shrink-0 flex items-center gap-1" style={{ color: "var(--success)" }}>
                        <Calendar size={10} />
                        {new Date((activity as WorkshopActivity).scheduledAt!).toLocaleDateString()}
                      </span>
                    )}
                    {/* Reorder + delete (stop click propagating to row selection) */}
                    <div
                      className="flex items-center gap-0.5 flex-shrink-0"
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => moveActivity(week.id, activity.id, -1)}
                        disabled={ai === 0}
                        className="p-1 rounded hover:bg-white/5 transition-colors disabled:opacity-20"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        <ChevronUp size={11} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveActivity(week.id, activity.id, 1)}
                        disabled={ai === week.activities.length - 1}
                        className="p-1 rounded hover:bg-white/5 transition-colors disabled:opacity-20"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        <ChevronDown size={11} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeActivity(week.id, activity.id)}
                        className="p-1 rounded transition-colors"
                        style={{ color: "var(--text-tertiary)" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "var(--danger)")}
                        onMouseLeave={e => (e.currentTarget.style.color = "var(--text-tertiary)")}
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                )
              })}

              {/* Add Activity */}
              <div
                className="px-4 py-3 relative"
                style={{ borderTop: week.activities.length > 0 ? "1px solid var(--border-default)" : "none" }}
              >
                <button
                  type="button"
                  onClick={() => setDropdownWeekId(dropdownWeekId === week.id ? null : week.id)}
                  className="flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-80"
                  style={{ color: "var(--accent)" }}
                >
                  <Plus size={13} /> Add Activity
                </button>

                {dropdownWeekId === week.id && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownWeekId(null)} />
                    <div
                      className="absolute left-4 z-20 w-72 rounded-xl py-1.5 overflow-hidden"
                      style={{
                        top: "calc(100% + 4px)",
                        backgroundColor: "var(--bg-surface-muted)",
                        border: "1px solid var(--border-default)",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                      }}
                    >
                      {ADD_OPTIONS.map(opt => (
                        <button
                          key={opt.type}
                          type="button"
                          onClick={() => addActivity(week.id, opt.type)}
                          className="flex items-start gap-3 w-full px-4 py-3 text-left transition-colors hover:bg-white/5"
                        >
                          <span className="text-base flex-shrink-0 mt-0.5">{opt.emoji}</span>
                          <div>
                            <p className="text-xs font-semibold text-[var(--text-primary)]">{opt.label}</p>
                            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{opt.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </PanelCard>
          ))}

          {/* Add Week */}
          <button
            type="button"
            onClick={addWeek}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-medium transition-all"
            style={{ backgroundColor: "transparent", border: "1px dashed var(--border-default)", color: "var(--text-tertiary)" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)" }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-default)"; e.currentTarget.style.color = "var(--text-tertiary)" }}
          >
            <Plus size={14} /> Add Week / Phase
          </button>
        </div>

        {/* ══════════ RIGHT 35%: Context Panel ══════════ */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* ── Activity Editor (shows when activity selected) ── */}
          {selectedActivity && (() => {
            const meta = ACTIVITY_META[selectedActivity.type]
            const TypeIcon = Video
            return (
              <PanelCard accent={`${meta.color}50`}>
                <PanelHeader
                  icon={TypeIcon}
                  iconColor={meta.color}
                  iconBg={meta.bg}
                  title="Activity Editor"
                  action={
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ color: meta.color, backgroundColor: meta.bg, border: `1px solid ${meta.color}30` }}
                      >
                        {meta.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedId(null)}
                        className="p-1 rounded-lg hover:bg-white/5 transition-colors"
                        style={{ color: "var(--text-tertiary)" }}
                        title="Close editor"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  }
                />

                <div className="px-4 py-4 space-y-4">
                  {/* Shared: title */}
                  <div>
                    <FieldLabel>Title</FieldLabel>
                    <input
                      value={selectedActivity.title}
                      onChange={e => patchActivity(selectedActivity.id, { title: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                      onFocus={e => (e.currentTarget.style.borderColor = meta.color)}
                      onBlur={e => (e.currentTarget.style.borderColor = "var(--border-default)")}
                    />
                  </div>

                  {/* ─── Workshop: session type + url + checks ─── */}
                  {selectedActivity.type === "workshop" && (() => {
                    const ws = selectedActivity as WorkshopActivity
                    return (
                      <>
                        {/* Session type toggle */}
                        <div>
                          <FieldLabel>Session Type</FieldLabel>
                          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ backgroundColor: "var(--bg-surface-muted)" }}>
                            {([
                              { key: "live"     as const, Icon: Video, label: "Live Meeting" },
                              { key: "recorded" as const, Icon: Film,  label: "Pre-recorded" },
                            ]).map(({ key, Icon, label }) => (
                              <button
                                key={key}
                                type="button"
                                onClick={() => patchActivity(selectedActivity.id, { sessionType: key })}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors"
                                style={{
                                  backgroundColor: ws.sessionType === key ? "var(--success)" : "transparent",
                                  color: ws.sessionType === key ? "#fff" : "var(--text-tertiary)",
                                }}
                              >
                                <Icon size={12} /> {label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Date & Time */}
                        <div>
                          <FieldLabel>Date & Time</FieldLabel>
                          <input
                            type="datetime-local"
                            value={ws.scheduledAt ?? ""}
                            onChange={e => patchActivity(selectedActivity.id, { scheduledAt: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                            style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                            onFocus={e => (e.currentTarget.style.borderColor = "var(--success)")}
                            onBlur={e => (e.currentTarget.style.borderColor = "var(--border-default)")}
                          />
                        </div>

                        {/* Meeting URL (live) or Video URL (recorded) */}
                        {ws.sessionType !== "recorded" ? (
                          <div>
                            <FieldLabel>Meeting URL</FieldLabel>
                            <input
                              type="url"
                              value={ws.meetUrl ?? ""}
                              onChange={e => patchActivity(selectedActivity.id, { meetUrl: e.target.value })}
                              placeholder="https://zoom.us/j/… or meet.google.com/…"
                              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none placeholder-slate-600"
                              style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                              onFocus={e => (e.currentTarget.style.borderColor = "var(--success)")}
                              onBlur={e => (e.currentTarget.style.borderColor = "var(--border-default)")}
                            />
                            <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "var(--success)" }}>
                              <Link2 size={10} />
                              This link stays active for all sessions in the program — share it once.
                            </p>
                          </div>
                        ) : (
                          <div>
                            <FieldLabel>Video URL</FieldLabel>
                            <input
                              type="url"
                              value={ws.videoUrl ?? ""}
                              onChange={e => patchActivity(selectedActivity.id, { videoUrl: e.target.value })}
                              placeholder="https://youtube.com/watch?v=… or direct MP4 link"
                              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none placeholder-slate-600"
                              style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                              onFocus={e => (e.currentTarget.style.borderColor = "var(--success)")}
                              onBlur={e => (e.currentTarget.style.borderColor = "var(--border-default)")}
                            />
                            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>YouTube, Vimeo, or direct MP4 link.</p>
                          </div>
                        )}

                        {/* Knowledge Checks builder */}
                        <div style={{ borderTop: "1px solid var(--border-default)", paddingTop: 16 }}>
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Knowledge Checks</p>
                              <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>MCQ or descriptive questions pushed to students during the session</p>
                            </div>
                            {!checkDraft && (
                              <button
                                type="button"
                                onClick={() => setCheckDraft({ type: "mcq", question: "", options: ["", "", "", ""], correctIndex: 0 })}
                                className="flex items-center gap-1 text-xs font-semibold flex-shrink-0"
                                style={{ color: "var(--success)" }}
                              >
                                <Plus size={11} /> Add
                              </button>
                            )}
                          </div>

                          {/* Existing checks */}
                          {ws.checks.length > 0 && (
                            <div className="space-y-2 mb-3">
                              {ws.checks.map((check, ci) => (
                                <div
                                  key={check.id}
                                  className="flex items-start gap-2.5 p-2.5 rounded-xl"
                                  style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)" }}
                                >
                                  <span
                                    className="flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5"
                                    style={{ backgroundColor: check.type === "mcq" ? "#3B82F620" : "#8B5CF620", color: check.type === "mcq" ? "#60A5FA" : "#A78BFA" }}
                                  >
                                    {check.type === "mcq" ? "MCQ" : "DESC"}
                                  </span>
                                  <p className="flex-1 text-xs text-[var(--text-primary)] truncate">{check.question || `Check ${ci + 1}`}</p>
                                  <button
                                    type="button"
                                    onClick={() => removeCheckFromCurrent(check.id)}
                                    className="flex-shrink-0 p-0.5 rounded transition-colors"
                                    style={{ color: "var(--text-muted)" }}
                                    onMouseEnter={e => (e.currentTarget.style.color = "var(--danger)")}
                                    onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
                                  >
                                    <X size={11} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {ws.checks.length === 0 && !checkDraft && (
                            <p className="text-[10px] text-center py-3 rounded-xl" style={{ color: "var(--text-muted)", border: "1px dashed var(--border-default)" }}>
                              No checks yet — add MCQ or descriptive questions
                            </p>
                          )}

                          {/* New check form */}
                          {checkDraft && (
                            <div className="p-3 rounded-xl space-y-3" style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid #10B98140" }}>
                              {/* Type toggle */}
                              <div className="flex items-center gap-1 p-0.5 rounded-lg w-fit" style={{ backgroundColor: "var(--bg-surface)" }}>
                                {(["mcq", "descriptive"] as const).map(t => (
                                  <button
                                    key={t}
                                    type="button"
                                    onClick={() => setCheckDraft(d => d ? { ...d, type: t } : d)}
                                    className="px-2.5 py-1 rounded-md text-[10px] font-bold transition-colors"
                                    style={{
                                      backgroundColor: checkDraft.type === t ? "var(--success)" : "transparent",
                                      color: checkDraft.type === t ? "#fff" : "var(--text-tertiary)",
                                    }}
                                  >
                                    {t === "mcq" ? "MCQ" : "Descriptive"}
                                  </button>
                                ))}
                              </div>

                              {/* Question */}
                              <textarea
                                rows={2}
                                value={checkDraft.question}
                                onChange={e => setCheckDraft(d => d ? { ...d, question: e.target.value } : d)}
                                placeholder="Question text…"
                                className="w-full px-3 py-2 rounded-lg text-xs outline-none resize-none placeholder-slate-600"
                                style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                                onFocus={e => (e.currentTarget.style.borderColor = "var(--success)")}
                                onBlur={e => (e.currentTarget.style.borderColor = "var(--border-default)")}
                              />

                              {/* MCQ options */}
                              {checkDraft.type === "mcq" && (
                                <div className="space-y-1.5">
                                  {checkDraft.options.map((opt, oi) => (
                                    <div key={oi} className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => setCheckDraft(d => d ? { ...d, correctIndex: oi } : d)}
                                        className="flex-shrink-0 w-4 h-4 rounded-full border-2 transition-all"
                                        style={{
                                          borderColor: checkDraft.correctIndex === oi ? "var(--success)" : "var(--text-muted)",
                                          backgroundColor: checkDraft.correctIndex === oi ? "var(--success)" : "transparent",
                                        }}
                                        title="Mark as correct"
                                      />
                                      <span className="text-[10px] font-bold w-4 flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                                        {String.fromCharCode(65 + oi)}
                                      </span>
                                      <input
                                        value={opt}
                                        onChange={e => setCheckDraft(d => {
                                          if (!d) return d
                                          const opts = [...d.options] as [string,string,string,string]
                                          opts[oi] = e.target.value
                                          return { ...d, options: opts }
                                        })}
                                        placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                                        className="flex-1 bg-transparent outline-none text-xs placeholder-slate-600"
                                        style={{ color: checkDraft.correctIndex === oi ? "#6EE7B7" : "var(--text-secondary)", borderBottom: "1px solid var(--border-default)" }}
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}

                              <div className="flex items-center gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!checkDraft.question.trim()) return
                                    addCheckToCurrent({
                                      id: uid("ck"),
                                      type: checkDraft.type,
                                      question: checkDraft.question,
                                      options: checkDraft.type === "mcq" ? checkDraft.options : [],
                                      correctIndex: checkDraft.type === "mcq" ? checkDraft.correctIndex : undefined,
                                    })
                                  }}
                                  disabled={!checkDraft.question.trim()}
                                  className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-30"
                                  style={{ backgroundColor: "var(--success)", color: "#fff" }}
                                >
                                  Save Check
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setCheckDraft(null)}
                                  className="px-3 py-1.5 rounded-lg text-xs font-medium"
                                  style={{ backgroundColor: "var(--border-default)", color: "var(--text-secondary)" }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Assignments builder */}
                        <div style={{ borderTop: "1px solid var(--border-default)", paddingTop: 16 }}>
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Assignments</p>
                              <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>Students see these only after you publish them during the session</p>
                            </div>
                            {!assignmentDraft && (
                              <button
                                type="button"
                                onClick={() => setAssignmentDraft({ title: "", description: "", dueDate: "", maxPoints: "", attachments: [] })}
                                className="flex items-center gap-1 text-xs font-semibold flex-shrink-0"
                                style={{ color: "#8B5CF6" }}
                              >
                                <Plus size={11} /> Add
                              </button>
                            )}
                          </div>

                          {/* Existing assignments */}
                          {ws.assignments.length > 0 && (
                            <div className="space-y-2 mb-3">
                              {ws.assignments.map((asgn, ai) => (
                                <div
                                  key={asgn.id}
                                  className="flex items-start gap-2.5 p-2.5 rounded-xl"
                                  style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)" }}
                                >
                                  <span
                                    className="flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5"
                                    style={{ backgroundColor: "#8B5CF620", color: "#A78BFA" }}
                                  >
                                    {ai + 1}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-[var(--text-primary)] truncate">{asgn.title || `Assignment ${ai + 1}`}</p>
                                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                      {asgn.dueDate && (
                                        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                                          Due {new Date(asgn.dueDate).toLocaleDateString()}{asgn.maxPoints ? ` · ${asgn.maxPoints} pts` : ""}
                                        </p>
                                      )}
                                      {asgn.attachments && asgn.attachments.length > 0 && (
                                        <span className="flex items-center gap-1 text-[10px]" style={{ color: "#8B5CF6" }}>
                                          <Paperclip size={9} />
                                          {asgn.attachments.length} file{asgn.attachments.length > 1 ? "s" : ""}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeAssignmentFromCurrent(asgn.id)}
                                    className="flex-shrink-0 p-0.5 rounded transition-colors"
                                    style={{ color: "var(--text-muted)" }}
                                    onMouseEnter={e => (e.currentTarget.style.color = "var(--danger)")}
                                    onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
                                  >
                                    <X size={11} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {ws.assignments.length === 0 && !assignmentDraft && (
                            <p className="text-[10px] text-center py-3 rounded-xl" style={{ color: "var(--text-muted)", border: "1px dashed var(--border-default)" }}>
                              No assignments yet — add tasks for students to complete
                            </p>
                          )}

                          {/* New assignment form */}
                          {assignmentDraft && (
                            <div className="p-3 rounded-xl space-y-3" style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid #8B5CF640" }}>
                              <input
                                value={assignmentDraft.title}
                                onChange={e => setAssignmentDraft(d => d ? { ...d, title: e.target.value } : d)}
                                placeholder="Assignment title…"
                                className="w-full px-3 py-2 rounded-lg text-xs outline-none placeholder-slate-600"
                                style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                                onFocus={e => (e.currentTarget.style.borderColor = "#8B5CF6")}
                                onBlur={e => (e.currentTarget.style.borderColor = "var(--border-default)")}
                              />
                              <textarea
                                rows={2}
                                value={assignmentDraft.description}
                                onChange={e => setAssignmentDraft(d => d ? { ...d, description: e.target.value } : d)}
                                placeholder="Instructions or description…"
                                className="w-full px-3 py-2 rounded-lg text-xs outline-none resize-none placeholder-slate-600"
                                style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                                onFocus={e => (e.currentTarget.style.borderColor = "#8B5CF6")}
                                onBlur={e => (e.currentTarget.style.borderColor = "var(--border-default)")}
                              />
                              <div className="flex items-center gap-2">
                                <div className="flex-1">
                                  <p className="text-[10px] mb-1" style={{ color: "var(--text-muted)" }}>Due date</p>
                                  <input
                                    type="date"
                                    value={assignmentDraft.dueDate}
                                    onChange={e => setAssignmentDraft(d => d ? { ...d, dueDate: e.target.value } : d)}
                                    className="w-full px-2.5 py-1.5 rounded-lg text-xs outline-none"
                                    style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                                  />
                                </div>
                                <div className="w-20">
                                  <p className="text-[10px] mb-1" style={{ color: "var(--text-muted)" }}>Max pts</p>
                                  <input
                                    type="number"
                                    min={0}
                                    value={assignmentDraft.maxPoints}
                                    onChange={e => setAssignmentDraft(d => d ? { ...d, maxPoints: e.target.value } : d)}
                                    placeholder="100"
                                    className="w-full px-2.5 py-1.5 rounded-lg text-xs outline-none placeholder-slate-600"
                                    style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                                  />
                                </div>
                              </div>
                              {/* File attachments */}
                              <div>
                                <label
                                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg cursor-pointer transition-colors text-xs"
                                  style={{ border: "1px dashed var(--border-default)", color: "var(--text-tertiary)" }}
                                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#8B5CF6"; e.currentTarget.style.color = "#A78BFA" }}
                                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-default)"; e.currentTarget.style.color = "var(--text-tertiary)" }}
                                >
                                  <Paperclip size={12} />
                                  Attach files (image, PDF, text)
                                  <input
                                    type="file"
                                    multiple
                                    accept="image/*,.pdf,.txt,.md,.doc,.docx"
                                    className="hidden"
                                    onChange={e => {
                                      const files = Array.from(e.target.files ?? [])
                                      const newFiles: AttachmentFile[] = files.map(f => ({
                                        id: uid("att"),
                                        name: f.name,
                                        fileType: f.type.startsWith("image/") ? "image"
                                          : f.type === "application/pdf" ? "pdf"
                                          : (f.type.startsWith("text/") || f.name.endsWith(".md") || f.name.endsWith(".doc") || f.name.endsWith(".docx")) ? "text"
                                          : "other",
                                        size: f.size > 1024 * 1024
                                          ? `${(f.size / 1024 / 1024).toFixed(1)} MB`
                                          : `${Math.max(1, Math.round(f.size / 1024))} KB`,
                                      }))
                                      setAssignmentDraft(d => d ? { ...d, attachments: [...d.attachments, ...newFiles] } : d)
                                      e.target.value = ""
                                    }}
                                  />
                                </label>
                                {assignmentDraft.attachments.length > 0 && (
                                  <div className="mt-2 space-y-1">
                                    {assignmentDraft.attachments.map(f => (
                                      <div key={f.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg" style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)" }}>
                                        {f.fileType === "image"
                                          ? <ImageIcon size={11} style={{ color: "var(--success)", flexShrink: 0 }} />
                                          : f.fileType === "pdf"
                                          ? <FileText size={11} style={{ color: "var(--danger)", flexShrink: 0 }} />
                                          : <FileText size={11} style={{ color: "var(--accent)", flexShrink: 0 }} />}
                                        <span className="flex-1 text-[10px] truncate" style={{ color: "var(--text-secondary)" }}>{f.name}</span>
                                        <span className="text-[10px] flex-shrink-0" style={{ color: "var(--text-muted)" }}>{f.size}</span>
                                        <button
                                          type="button"
                                          onClick={() => setAssignmentDraft(d => d ? { ...d, attachments: d.attachments.filter(a => a.id !== f.id) } : d)}
                                          className="flex-shrink-0 p-0.5 rounded transition-colors"
                                          style={{ color: "var(--text-muted)" }}
                                          onMouseEnter={e => (e.currentTarget.style.color = "var(--danger)")}
                                          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
                                        >
                                          <X size={10} />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!assignmentDraft.title.trim()) return
                                    addAssignmentToCurrent({
                                      id: uid("asgn"),
                                      title: assignmentDraft.title,
                                      description: assignmentDraft.description,
                                      dueDate: assignmentDraft.dueDate || undefined,
                                      maxPoints: assignmentDraft.maxPoints ? Number(assignmentDraft.maxPoints) : undefined,
                                      attachments: assignmentDraft.attachments.length ? assignmentDraft.attachments : undefined,
                                    })
                                  }}
                                  disabled={!assignmentDraft.title.trim()}
                                  className="flex-1 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-30"
                                  style={{ backgroundColor: "#8B5CF6", color: "#fff" }}
                                >
                                  Save Assignment
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setAssignmentDraft(null)}
                                  className="px-3 py-1.5 rounded-lg text-xs font-medium"
                                  style={{ backgroundColor: "var(--border-default)", color: "var(--text-secondary)" }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Launch Session button */}
                        {(ws.meetUrl || ws.videoUrl) && (
                          <Link
                            href={`/instructor/live-session/${selectedActivity.id}`}
                            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-[var(--text-primary)] transition-opacity hover:opacity-90"
                            style={{ backgroundColor: "var(--success)", marginTop: 4 }}
                          >
                            <Play size={13} fill="#fff" /> Launch Session
                          </Link>
                        )}
                      </>
                    )
                  })()}

                </div>
              </PanelCard>
            )
          })()}

          {/* ── Access Link Engine ── */}
          <PanelCard>
            <PanelHeader icon={Globe} iconColor="var(--accent)" iconBg="#3B82F615" title="Access & Enrollment" />

            <div className="px-4 py-4 space-y-5">

              {/* Access mode radio cards */}
              <div>
                <FieldLabel>Access Mode</FieldLabel>
                <div className="space-y-2">
                  {([
                    { key: "public" as const,  Icon: Globe, label: "🌐  Public Subscription Link", desc: "Anyone with the link can discover and enroll" },
                    { key: "private" as const, Icon: Lock,  label: "🔒  Private / Invite-Only",    desc: "You control every seat — no open link" },
                  ] as const).map(({ key, Icon, label, desc }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, accessMode: key }))}
                      className="flex items-center gap-3 w-full p-3.5 rounded-xl text-left transition-all"
                      style={{
                        backgroundColor: "var(--bg-surface-muted)",
                        border: `1px solid ${form.accessMode === key ? "var(--accent)" : "var(--border-default)"}`,
                      }}
                    >
                      <div
                        className="w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all"
                        style={{
                          borderColor: form.accessMode === key ? "var(--accent)" : "var(--text-muted)",
                          backgroundColor: form.accessMode === key ? "var(--accent)" : "transparent",
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold" style={{ color: form.accessMode === key ? "#60A5FA" : "var(--text-secondary)" }}>
                          {label}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Public-only: token link + expiry + status */}
              {form.accessMode === "public" && (
                <>
                  {/* Shareable link + status */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <FieldLabel>Shareable Token Link</FieldLabel>
                      {/* Live status pill */}
                      <span
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 mb-1.5"
                        style={
                          isActive
                            ? { backgroundColor: "#10B98118", color: "#34D399" }
                            : isExpired
                            ? { backgroundColor: "#EF444418", color: "#F87171" }
                            : { backgroundColor: "#33415530", color: "var(--text-tertiary)" }
                        }
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: isActive ? "var(--success)" : isExpired ? "var(--danger)" : "var(--text-muted)" }}
                        />
                        {isActive ? "Active" : isExpired ? "Expired" : "No expiry set"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div
                        className="flex-1 flex items-center px-3 py-2.5 rounded-xl overflow-hidden"
                        style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)" }}
                      >
                        <span className="text-xs truncate" style={{ color: "var(--text-tertiary)" }}>
                          {shareUrl}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={copyLink}
                        disabled={!token}
                        className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold flex-shrink-0 transition-all disabled:opacity-40"
                        style={{
                          backgroundColor: copied ? "#10B98120" : "#3B82F620",
                          color: copied ? "var(--success)" : "#60A5FA",
                          border: `1px solid ${copied ? "#10B98140" : "#3B82F640"}`,
                        }}
                      >
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                        {copied ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>

                  {/* Expiry date-time picker */}
                  <div>
                    <FieldLabel>Link Expiry Date & Time</FieldLabel>
                    {/* Hidden native input — opened programmatically via showPicker() */}
                    <input
                      ref={expiryInputRef}
                      type="datetime-local"
                      value={form.expiresAt}
                      onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                      tabIndex={-1}
                      aria-hidden
                      style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 0, height: 0 }}
                    />
                    {/* Styled trigger row */}
                    <button
                      type="button"
                      onClick={openExpiryPicker}
                      className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-left transition-all"
                      style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)" }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--accent)")}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border-default)")}
                    >
                      <Calendar size={14} style={{ color: "var(--accent)", flexShrink: 0 }} />
                      <span className="flex-1 text-sm" style={{ color: form.expiresAt ? "var(--text-primary)" : "var(--text-muted)" }}>
                        {form.expiresAt
                          ? new Date(form.expiresAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
                          : "Pick expiry date & time…"}
                      </span>
                      {form.expiresAt && (
                        <span
                          onClick={e => { e.stopPropagation(); setForm(f => ({ ...f, expiresAt: "" })) }}
                          className="p-0.5 rounded hover:bg-white/10 transition-colors flex-shrink-0"
                          style={{ color: "var(--text-tertiary)" }}
                        >
                          <X size={12} />
                        </span>
                      )}
                    </button>
                    <p className="text-xs mt-1.5" style={{ color: isExpired ? "var(--danger)" : "var(--text-muted)" }}>
                      {isExpired
                        ? "⚠ This link has already expired."
                        : form.expiresAt
                        ? `Closes ${new Date(form.expiresAt).toLocaleString()}`
                        : "Leave blank for a permanent enrollment link."}
                    </p>
                  </div>
                </>
              )}

              {/* Pricing */}
              <div style={{ borderTop: "1px solid var(--border-default)", paddingTop: 20 }}>
                <FieldLabel>Cohort Fee (USD)</FieldLabel>
                <div
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                  style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)" }}
                  onFocusCapture={e => ((e.currentTarget as HTMLDivElement).style.borderColor = "var(--accent)")}
                  onBlurCapture={e => ((e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-default)")}
                >
                  <DollarSign size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                  <input
                    type="number"
                    min={0}
                    value={form.priceUsd}
                    onChange={e => setForm(f => ({ ...f, priceUsd: e.target.value }))}
                    placeholder="499"
                    className="flex-1 bg-transparent outline-none text-sm placeholder-slate-600"
                    style={{ color: "var(--text-primary)" }}
                  />
                  <span className="text-xs flex-shrink-0" style={{ color: "var(--text-muted)" }}>USD</span>
                </div>
                <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>
                  {form.priceUsd
                    ? `$${form.priceUsd} per cohort seat.`
                    : "Leave blank to offer this training at no cost."}
                </p>
              </div>
            </div>
          </PanelCard>
        </div>
      </div>
    </InstructorPageShell>
  )
}
