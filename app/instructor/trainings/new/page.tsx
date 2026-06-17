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
  Flag,
  Globe,
  GripVertical,
  Link2,
  Lock,
  Pencil,
  Plus,
  Save,
  Search,
  Target,
  Trash2,
  Video,
  X,
} from "lucide-react"
import { InstructorPageShell } from "@/components/instructor/InstructorPageShell"
import { INSTRUCTOR_COURSES } from "@/lib/data/instructor-courses"

// ── Types ────────────────────────────────────────────────────────────────────

type ActivityType = "course" | "workshop" | "milestone"

interface CourseActivity   { id: string; type: "course";    title: string; courseId?: number; sectionId?: string }
interface WorkshopActivity { id: string; type: "workshop";  title: string; scheduledAt?: string; meetUrl?: string }
interface MilestoneActivity{ id: string; type: "milestone"; title: string; description?: string; dueDate?: string }
type Activity = CourseActivity | WorkshopActivity | MilestoneActivity

interface AnyActivityPatch {
  title?: string; courseId?: number; sectionId?: string
  scheduledAt?: string; meetUrl?: string; description?: string; dueDate?: string
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
  course:    { label: "Module",    color: "#3B82F6", bg: "#3B82F615" },
  workshop:  { label: "Live",      color: "#10B981", bg: "#10B98115" },
  milestone: { label: "Milestone", color: "#8B5CF6", bg: "#8B5CF615" },
}

const ADD_OPTIONS: { type: ActivityType; emoji: string; label: string; desc: string }[] = [
  { type: "course",    emoji: "🔗", label: "Link Course Module",    desc: "Attach a published course or specific section" },
  { type: "workshop",  emoji: "📅", label: "Live Workshop / Q&A",   desc: "Schedule a Zoom or Google Meet session"       },
  { type: "milestone", emoji: "🚀", label: "Milestone / Assignment", desc: "Capstone project or practical submission"     },
]

const PUBLISHED = INSTRUCTOR_COURSES.filter(c => c.status === "published")

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
    <label className="block text-xs font-semibold mb-1.5" style={{ color: "#94A3B8" }}>
      {children}
    </label>
  )
}

function PanelCard({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return (
    <div
      className="rounded-2xl"
      style={{ backgroundColor: "#1E293B", border: `1px solid ${accent ?? "#334155"}` }}
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
    <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid #334155" }}>
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-6 h-6 rounded-lg" style={{ backgroundColor: iconBg }}>
          <Icon size={13} style={{ color: iconColor }} />
        </div>
        <p className="text-sm font-semibold text-white">{title}</p>
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
  const [courseSearch, setCourseSearch]     = useState("")
  const [token, setToken]             = useState("")
  const [copied, setCopied]           = useState(false)
  const expiryInputRef = useRef<HTMLInputElement>(null)

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
    let activity: Activity
    if (type === "course") {
      const first = PUBLISHED[0]
      activity = { id, type, title: first?.title ?? "Linked Course", courseId: first?.id }
    } else if (type === "workshop") {
      activity = { id, type, title: "Live Workshop Session", scheduledAt: "", meetUrl: "" }
    } else {
      activity = { id, type, title: "Capstone Milestone", description: "", dueDate: "" }
    }
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
            style={{ backgroundColor: "#1E293B", border: "1px solid #334155", color: "#CBD5E1" }}
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <button
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#3B82F6" }}
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
            className="text-xl font-bold bg-transparent outline-none text-white border-b-2"
            style={{ borderColor: "#3B82F6", minWidth: 320 }}
          />
        ) : (
          <div
            className="flex items-center gap-2 group cursor-text w-fit"
            onClick={() => { setTitleEditing(true); setTitleValue(form.trainingTitle) }}
          >
            <h2 className="text-xl font-bold text-white">{form.trainingTitle}</h2>
            <Pencil
              size={13}
              className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              style={{ color: "#475569" }}
            />
          </div>
        )}
        <p className="text-xs mt-1" style={{ color: "#475569" }}>
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
                style={{ borderBottom: week.activities.length > 0 ? "1px solid #334155" : "none" }}
              >
                <GripVertical size={14} style={{ color: "#334155", flexShrink: 0, cursor: "grab" }} />

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
                      className="flex-1 bg-transparent outline-none text-sm font-semibold text-white border-b"
                      style={{ borderColor: "#3B82F6" }}
                    />
                  ) : (
                    <>
                      <span
                        className="text-sm font-semibold text-white cursor-text truncate"
                        onClick={() => startEditWeek(week.id, week.title)}
                      >
                        {week.title}
                      </span>
                      <Pencil
                        size={11}
                        className="opacity-0 group-hover:opacity-100 flex-shrink-0 cursor-pointer transition-opacity"
                        style={{ color: "#475569" }}
                        onClick={() => startEditWeek(week.id, week.title)}
                      />
                    </>
                  )}
                </div>

                <span className="text-xs flex-shrink-0" style={{ color: "#475569" }}>
                  {week.activities.length} {week.activities.length === 1 ? "activity" : "activities"}
                </span>

                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => moveWeek(week.id, -1)}
                    disabled={wi === 0}
                    className="p-1 rounded hover:bg-white/5 transition-colors disabled:opacity-20"
                    style={{ color: "#64748B" }}
                  >
                    <ChevronUp size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveWeek(week.id, 1)}
                    disabled={wi === form.weeks.length - 1}
                    className="p-1 rounded hover:bg-white/5 transition-colors disabled:opacity-20"
                    style={{ color: "#64748B" }}
                  >
                    <ChevronDown size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeWeek(week.id)}
                    className="p-1 rounded transition-colors"
                    style={{ color: "#64748B" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#EF4444")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#64748B")}
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
                      borderBottom: ai < week.activities.length - 1 ? "1px solid #0F172A" : "none",
                    }}
                  >
                    <GripVertical size={12} style={{ color: "#334155", flexShrink: 0, cursor: "grab" }} />

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
                    <span className="text-sm text-white flex-1 truncate">{activity.title}</span>

                    {/* Type-specific inline meta */}
                    {activity.type === "workshop" && (activity as WorkshopActivity).scheduledAt && (
                      <span className="text-xs flex-shrink-0 flex items-center gap-1" style={{ color: "#10B981" }}>
                        <Calendar size={10} />
                        {new Date((activity as WorkshopActivity).scheduledAt!).toLocaleDateString()}
                      </span>
                    )}
                    {activity.type === "milestone" && (activity as MilestoneActivity).dueDate && (
                      <span className="text-xs flex-shrink-0 flex items-center gap-1" style={{ color: "#8B5CF6" }}>
                        <Flag size={10} />
                        Due {new Date((activity as MilestoneActivity).dueDate!).toLocaleDateString()}
                      </span>
                    )}
                    {activity.type === "course" && (activity as CourseActivity).courseId && (
                      <span className="text-xs flex-shrink-0" style={{ color: "#3B82F6" }}>
                        {INSTRUCTOR_COURSES.find(c => c.id === (activity as CourseActivity).courseId)?.category ?? ""}
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
                        style={{ color: "#64748B" }}
                      >
                        <ChevronUp size={11} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveActivity(week.id, activity.id, 1)}
                        disabled={ai === week.activities.length - 1}
                        className="p-1 rounded hover:bg-white/5 transition-colors disabled:opacity-20"
                        style={{ color: "#64748B" }}
                      >
                        <ChevronDown size={11} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeActivity(week.id, activity.id)}
                        className="p-1 rounded transition-colors"
                        style={{ color: "#64748B" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "#EF4444")}
                        onMouseLeave={e => (e.currentTarget.style.color = "#64748B")}
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
                style={{ borderTop: week.activities.length > 0 ? "1px solid #334155" : "none" }}
              >
                <button
                  type="button"
                  onClick={() => setDropdownWeekId(dropdownWeekId === week.id ? null : week.id)}
                  className="flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-80"
                  style={{ color: "#3B82F6" }}
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
                        backgroundColor: "#0F172A",
                        border: "1px solid #334155",
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
                            <p className="text-xs font-semibold text-white">{opt.label}</p>
                            <p className="text-xs mt-0.5" style={{ color: "#475569" }}>{opt.desc}</p>
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
            style={{ backgroundColor: "transparent", border: "1px dashed #334155", color: "#64748B" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#3B82F6"; e.currentTarget.style.color = "#3B82F6" }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#334155"; e.currentTarget.style.color = "#64748B" }}
          >
            <Plus size={14} /> Add Week / Phase
          </button>
        </div>

        {/* ══════════ RIGHT 35%: Context Panel ══════════ */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* ── Activity Editor (shows when activity selected) ── */}
          {selectedActivity && (() => {
            const meta = ACTIVITY_META[selectedActivity.type]
            const TypeIcon = selectedActivity.type === "course" ? Link2
              : selectedActivity.type === "workshop" ? Video : Flag
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
                        style={{ color: "#64748B" }}
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
                      style={{ backgroundColor: "#0F172A", border: "1px solid #334155", color: "#F8FAFC" }}
                      onFocus={e => (e.currentTarget.style.borderColor = meta.color)}
                      onBlur={e => (e.currentTarget.style.borderColor = "#334155")}
                    />
                  </div>

                  {/* ─── Course: searchable picker + section select ─── */}
                  {selectedActivity.type === "course" && (
                    <>
                      <div>
                        <FieldLabel>Published Course</FieldLabel>
                        <div
                          className="flex items-center gap-2 px-3 py-2 rounded-xl mb-2"
                          style={{ backgroundColor: "#0F172A", border: "1px solid #334155" }}
                        >
                          <Search size={12} style={{ color: "#475569" }} />
                          <input
                            value={courseSearch}
                            onChange={e => setCourseSearch(e.target.value)}
                            placeholder="Search your courses…"
                            className="bg-transparent outline-none text-xs flex-1 placeholder-slate-600"
                            style={{ color: "#F8FAFC" }}
                          />
                        </div>
                        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-0.5">
                          {PUBLISHED
                            .filter(c => c.title.toLowerCase().includes(courseSearch.toLowerCase()))
                            .map(c => {
                              const active = (selectedActivity as CourseActivity).courseId === c.id
                              return (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => {
                                    patchActivity(selectedActivity.id, { courseId: c.id, title: c.title })
                                    setCourseSearch("")
                                  }}
                                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-all"
                                  style={{
                                    backgroundColor: active ? "#3B82F615" : "#0F172A",
                                    border: `1px solid ${active ? "#3B82F640" : "#1E293B"}`,
                                  }}
                                >
                                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-white truncate">{c.title}</p>
                                    <p className="text-xs mt-0.5" style={{ color: "#475569" }}>{c.category}</p>
                                  </div>
                                  {active && <Check size={12} style={{ color: "#3B82F6", flexShrink: 0 }} />}
                                </button>
                              )
                            })}
                          {PUBLISHED.filter(c => c.title.toLowerCase().includes(courseSearch.toLowerCase())).length === 0 && (
                            <p className="text-xs text-center py-3" style={{ color: "#475569" }}>No matching courses</p>
                          )}
                        </div>
                      </div>

                      {/* Section select */}
                      {(selectedActivity as CourseActivity).courseId && (() => {
                        const course = INSTRUCTOR_COURSES.find(c => c.id === (selectedActivity as CourseActivity).courseId)
                        if (!course?.sections.length) return null
                        return (
                          <div>
                            <FieldLabel>
                              Focus Section{" "}
                              <span style={{ color: "#475569", fontWeight: 400 }}>(optional)</span>
                            </FieldLabel>
                            <select
                              value={(selectedActivity as CourseActivity).sectionId ?? ""}
                              onChange={e => patchActivity(selectedActivity.id, { sectionId: e.target.value || undefined })}
                              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none appearance-none"
                              style={{ backgroundColor: "#0F172A", border: "1px solid #334155", color: "#F8FAFC" }}
                            >
                              <option value="">All sections</option>
                              {course.sections.map(s => (
                                <option key={s.id} value={s.id}>{s.title}</option>
                              ))}
                            </select>
                          </div>
                        )
                      })()}
                    </>
                  )}

                  {/* ─── Workshop: datetime + meeting URL ─── */}
                  {selectedActivity.type === "workshop" && (
                    <>
                      <div>
                        <FieldLabel>Date & Time</FieldLabel>
                        <input
                          type="datetime-local"
                          value={(selectedActivity as WorkshopActivity).scheduledAt ?? ""}
                          onChange={e => patchActivity(selectedActivity.id, { scheduledAt: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                          style={{ backgroundColor: "#0F172A", border: "1px solid #334155", color: "#F8FAFC" }}
                          onFocus={e => (e.currentTarget.style.borderColor = "#10B981")}
                          onBlur={e => (e.currentTarget.style.borderColor = "#334155")}
                        />
                      </div>
                      <div>
                        <FieldLabel>Meeting URL</FieldLabel>
                        <input
                          type="url"
                          value={(selectedActivity as WorkshopActivity).meetUrl ?? ""}
                          onChange={e => patchActivity(selectedActivity.id, { meetUrl: e.target.value })}
                          placeholder="https://meet.google.com/… or zoom.us/…"
                          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none placeholder-slate-600"
                          style={{ backgroundColor: "#0F172A", border: "1px solid #334155", color: "#F8FAFC" }}
                          onFocus={e => (e.currentTarget.style.borderColor = "#10B981")}
                          onBlur={e => (e.currentTarget.style.borderColor = "#334155")}
                        />
                        <p className="text-xs mt-1" style={{ color: "#475569" }}>
                          Paste a Zoom, Google Meet, or Teams link.
                        </p>
                      </div>
                    </>
                  )}

                  {/* ─── Milestone: description + due date ─── */}
                  {selectedActivity.type === "milestone" && (
                    <>
                      <div>
                        <FieldLabel>Submission Brief</FieldLabel>
                        <textarea
                          rows={3}
                          value={(selectedActivity as MilestoneActivity).description ?? ""}
                          onChange={e => patchActivity(selectedActivity.id, { description: e.target.value })}
                          placeholder="Describe what learners need to submit…"
                          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none placeholder-slate-600"
                          style={{ backgroundColor: "#0F172A", border: "1px solid #334155", color: "#F8FAFC" }}
                          onFocus={e => (e.currentTarget.style.borderColor = "#8B5CF6")}
                          onBlur={e => (e.currentTarget.style.borderColor = "#334155")}
                        />
                      </div>
                      <div>
                        <FieldLabel>Due Date</FieldLabel>
                        <input
                          type="date"
                          value={(selectedActivity as MilestoneActivity).dueDate ?? ""}
                          onChange={e => patchActivity(selectedActivity.id, { dueDate: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                          style={{ backgroundColor: "#0F172A", border: "1px solid #334155", color: "#F8FAFC" }}
                          onFocus={e => (e.currentTarget.style.borderColor = "#8B5CF6")}
                          onBlur={e => (e.currentTarget.style.borderColor = "#334155")}
                        />
                      </div>
                    </>
                  )}
                </div>
              </PanelCard>
            )
          })()}

          {/* ── Access Link Engine ── */}
          <PanelCard>
            <PanelHeader icon={Globe} iconColor="#3B82F6" iconBg="#3B82F615" title="Access & Enrollment" />

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
                        backgroundColor: "#0F172A",
                        border: `1px solid ${form.accessMode === key ? "#3B82F6" : "#334155"}`,
                      }}
                    >
                      <div
                        className="w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all"
                        style={{
                          borderColor: form.accessMode === key ? "#3B82F6" : "#475569",
                          backgroundColor: form.accessMode === key ? "#3B82F6" : "transparent",
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold" style={{ color: form.accessMode === key ? "#60A5FA" : "#CBD5E1" }}>
                          {label}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "#475569" }}>{desc}</p>
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
                            : { backgroundColor: "#33415530", color: "#64748B" }
                        }
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: isActive ? "#10B981" : isExpired ? "#EF4444" : "#475569" }}
                        />
                        {isActive ? "Active" : isExpired ? "Expired" : "No expiry set"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div
                        className="flex-1 flex items-center px-3 py-2.5 rounded-xl overflow-hidden"
                        style={{ backgroundColor: "#0F172A", border: "1px solid #334155" }}
                      >
                        <span className="text-xs truncate" style={{ color: "#64748B" }}>
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
                          color: copied ? "#10B981" : "#60A5FA",
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
                      style={{ backgroundColor: "#0F172A", border: "1px solid #334155" }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = "#3B82F6")}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = "#334155")}
                    >
                      <Calendar size={14} style={{ color: "#3B82F6", flexShrink: 0 }} />
                      <span className="flex-1 text-sm" style={{ color: form.expiresAt ? "#F8FAFC" : "#475569" }}>
                        {form.expiresAt
                          ? new Date(form.expiresAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
                          : "Pick expiry date & time…"}
                      </span>
                      {form.expiresAt && (
                        <span
                          onClick={e => { e.stopPropagation(); setForm(f => ({ ...f, expiresAt: "" })) }}
                          className="p-0.5 rounded hover:bg-white/10 transition-colors flex-shrink-0"
                          style={{ color: "#64748B" }}
                        >
                          <X size={12} />
                        </span>
                      )}
                    </button>
                    <p className="text-xs mt-1.5" style={{ color: isExpired ? "#EF4444" : "#475569" }}>
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
              <div style={{ borderTop: "1px solid #334155", paddingTop: 20 }}>
                <FieldLabel>Cohort Fee (USD)</FieldLabel>
                <div
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                  style={{ backgroundColor: "#0F172A", border: "1px solid #334155" }}
                  onFocusCapture={e => ((e.currentTarget as HTMLDivElement).style.borderColor = "#3B82F6")}
                  onBlurCapture={e => ((e.currentTarget as HTMLDivElement).style.borderColor = "#334155")}
                >
                  <DollarSign size={13} style={{ color: "#475569", flexShrink: 0 }} />
                  <input
                    type="number"
                    min={0}
                    value={form.priceUsd}
                    onChange={e => setForm(f => ({ ...f, priceUsd: e.target.value }))}
                    placeholder="499"
                    className="flex-1 bg-transparent outline-none text-sm placeholder-slate-600"
                    style={{ color: "#F8FAFC" }}
                  />
                  <span className="text-xs flex-shrink-0" style={{ color: "#475569" }}>USD</span>
                </div>
                <p className="text-xs mt-1.5" style={{ color: "#475569" }}>
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
