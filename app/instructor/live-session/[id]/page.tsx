"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  ChevronLeft,
  Check,
  MessageSquare,
  Plus,
  Send,
  ThumbsUp,
  Timer,
  Users,
  Video,
  X,
} from "lucide-react"
import {
  INITIAL_INSTRUCTOR_QA,
  INITIAL_LIVE_ASSIGNMENTS,
  MOCK_ATTENDEES,
  type AssignmentTemplate,
  type AttendeeRecord,
  type InstructorQAItem,
  type LiveAssignment,
} from "@/lib/data/live-session"

// ── Helpers ───────────────────────────────────────────────────────────────────

function asgnUid() {
  return `asgn-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`
}

function formatElapsed(s: number): string {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const pad = (n: number) => String(n).padStart(2, "0")
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
}

// ── Zoom fallback ─────────────────────────────────────────────────────────────

function IframeFallback({ meetUrl }: { meetUrl?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 px-8 text-center">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "#F59E0B18", border: "1px solid #F59E0B30" }}>
        <AlertTriangle size={28} style={{ color: "#F59E0B" }} />
      </div>
      <div>
        <p className="text-base font-bold text-white">Waiting for host to start</p>
        <p className="text-sm mt-2 leading-relaxed" style={{ color: "#64748B" }}>
          The Zoom embed requires the meeting to be active. Open Zoom separately to launch the session.
        </p>
      </div>
      {meetUrl && (
        <a href={meetUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ backgroundColor: "#3B82F6" }}>
          <Video size={14} /> Open Zoom
        </a>
      )}
    </div>
  )
}

// ── Q&A Panel ─────────────────────────────────────────────────────────────────

function QAPanel({ items, onReply, onDismiss }: {
  items: InstructorQAItem[]
  onReply: (id: string, text: string) => void
  onDismiss: (id: string) => void
}) {
  const [replyId, setReplyId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")

  const sorted = [...items].sort((a, b) => {
    if (a.isAnswered !== b.isAnswered) return a.isAnswered ? 1 : -1
    return b.upvotes - a.upvotes
  })

  function submitReply(id: string) {
    if (!replyText.trim()) return
    onReply(id, replyText.trim())
    setReplyId(null)
    setReplyText("")
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {sorted.map((item) => (
          <div key={item.id} className="rounded-xl p-3" style={{ backgroundColor: "#0F172A", border: `1px solid ${item.isAnswered ? "#10B98130" : "#334155"}` }}>
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: item.askedByColor, fontSize: 9 }}>
                {item.askedByInitials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-semibold" style={{ color: item.askedByColor }}>{item.askedBy}</span>
                  <span className="text-[10px]" style={{ color: "#475569" }}>{formatTime(item.askedAt)}</span>
                  {item.isAnswered && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-0.5" style={{ backgroundColor: "#10B98120", color: "#10B981" }}>
                      <Check size={8} /> Answered
                    </span>
                  )}
                </div>
                <p className="text-xs text-white mt-1 leading-relaxed">{item.question}</p>
                {item.reply && (
                  <div className="mt-2 px-2.5 py-2 rounded-lg text-xs" style={{ backgroundColor: "#10B98110", color: "#6EE7B7", border: "1px solid #10B98130" }}>
                    <span className="font-semibold">You: </span>{item.reply}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="flex items-center gap-0.5 text-[10px]" style={{ color: "#475569" }}>
                  <ThumbsUp size={9} />{item.upvotes}
                </span>
                <button type="button" onClick={() => onDismiss(item.id)} className="p-0.5 rounded transition-colors" style={{ color: "#475569" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#EF4444")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#475569")}>
                  <X size={10} />
                </button>
              </div>
            </div>

            {!item.isAnswered && (
              replyId === item.id ? (
                <div className="mt-2.5 flex items-center gap-2">
                  <input
                    autoFocus
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") submitReply(item.id); if (e.key === "Escape") setReplyId(null) }}
                    placeholder="Type your reply…"
                    className="flex-1 px-2.5 py-1.5 rounded-lg text-xs outline-none placeholder-slate-600"
                    style={{ backgroundColor: "#1E293B", border: "1px solid #334155", color: "#F8FAFC" }}
                    onFocus={e => (e.currentTarget.style.borderColor = "#10B981")}
                    onBlur={e => (e.currentTarget.style.borderColor = "#334155")}
                  />
                  <button type="button" onClick={() => submitReply(item.id)} className="p-1.5 rounded-lg flex-shrink-0" style={{ backgroundColor: "#10B981", color: "#fff" }}>
                    <Send size={11} />
                  </button>
                  <button type="button" onClick={() => setReplyId(null)} className="p-1.5 rounded-lg flex-shrink-0" style={{ backgroundColor: "#334155", color: "#94A3B8" }}>
                    <X size={11} />
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => { setReplyId(item.id); setReplyText("") }}
                  className="mt-2 text-[10px] font-semibold" style={{ color: "#3B82F6" }}>
                  Reply →
                </button>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Assignments Panel ─────────────────────────────────────────────────────────

function AssignmentsPanel({ assignments, onPublish, onAdd }: {
  assignments: LiveAssignment[]
  onPublish: (id: string) => void
  onAdd: (asgn: AssignmentTemplate) => void
}) {
  const [showForm, setShowForm] = useState(false)
  const [formTitle, setFormTitle] = useState("")
  const [formDesc, setFormDesc] = useState("")
  const [formDue, setFormDue] = useState("")
  const [formPoints, setFormPoints] = useState("")

  function submitForm() {
    if (!formTitle.trim()) return
    onAdd({
      id: asgnUid(),
      title: formTitle.trim(),
      description: formDesc.trim(),
      dueDate: formDue || undefined,
      maxPoints: formPoints ? Number(formPoints) : undefined,
    })
    setShowForm(false)
    setFormTitle(""); setFormDesc(""); setFormDue(""); setFormPoints("")
  }

  const published = assignments.filter(a => a.status === "published")
  const hidden = assignments.filter(a => a.status === "hidden")

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-3 space-y-2">

        {/* Published */}
        {published.length > 0 && (
          <>
            <p className="text-[10px] font-bold uppercase tracking-wider px-1 mb-1" style={{ color: "#10B981" }}>
              Published ({published.length})
            </p>
            {published.map(a => (
              <div key={a.id} className="rounded-xl p-3" style={{ backgroundColor: "#0F172A", border: "1px solid #10B98130" }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white leading-snug">{a.title}</p>
                    <p className="text-[10px] mt-1 leading-relaxed line-clamp-2" style={{ color: "#64748B" }}>{a.description}</p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      {a.dueDate && (
                        <span className="flex items-center gap-1 text-[10px]" style={{ color: "#475569" }}>
                          <Calendar size={9} /> Due {new Date(a.dueDate).toLocaleDateString()}
                        </span>
                      )}
                      {a.maxPoints && (
                        <span className="text-[10px]" style={{ color: "#475569" }}>{a.maxPoints} pts</span>
                      )}
                    </div>
                  </div>
                  <span className="flex-shrink-0 flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg"
                    style={{ backgroundColor: "#10B98120", color: "#10B981" }}>
                    <Check size={9} /> Visible
                  </span>
                </div>
                {a.publishedAt && (
                  <p className="text-[10px] mt-2" style={{ color: "#334155" }}>
                    Published at {formatTime(a.publishedAt)}
                  </p>
                )}
              </div>
            ))}
          </>
        )}

        {/* Hidden / ready to publish */}
        {hidden.length > 0 && (
          <>
            <p className="text-[10px] font-bold uppercase tracking-wider px-1 mt-1 mb-1" style={{ color: "#475569" }}>
              Hidden ({hidden.length})
            </p>
            {hidden.map(a => (
              <div key={a.id} className="rounded-xl p-3" style={{ backgroundColor: "#0F172A", border: "1px solid #334155" }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white leading-snug">{a.title}</p>
                    <p className="text-[10px] mt-1 leading-relaxed line-clamp-2" style={{ color: "#64748B" }}>{a.description}</p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      {a.dueDate && (
                        <span className="flex items-center gap-1 text-[10px]" style={{ color: "#475569" }}>
                          <Calendar size={9} /> Due {new Date(a.dueDate).toLocaleDateString()}
                        </span>
                      )}
                      {a.maxPoints && (
                        <span className="text-[10px]" style={{ color: "#475569" }}>{a.maxPoints} pts</span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onPublish(a.id)}
                    className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-opacity hover:opacity-80"
                    style={{ backgroundColor: "#8B5CF6", color: "#fff" }}
                  >
                    Publish
                  </button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Empty state */}
        {assignments.length === 0 && !showForm && (
          <div className="text-center py-8 px-4">
            <p className="text-xs font-semibold text-white mb-1">No assignments yet</p>
            <p className="text-[10px] leading-relaxed" style={{ color: "#475569" }}>
              Create assignments here or add them when setting up the training — press Publish to show them to students.
            </p>
          </div>
        )}

        {/* New assignment form */}
        {showForm && (
          <div className="rounded-xl p-3 space-y-3" style={{ backgroundColor: "#0F172A", border: "1px solid #8B5CF640" }}>
            <p className="text-xs font-semibold" style={{ color: "#A78BFA" }}>New Assignment</p>
            <input
              autoFocus
              value={formTitle}
              onChange={e => setFormTitle(e.target.value)}
              placeholder="Assignment title…"
              className="w-full px-3 py-2 rounded-lg text-xs outline-none placeholder-slate-600"
              style={{ backgroundColor: "#1E293B", border: "1px solid #334155", color: "#F8FAFC" }}
              onFocus={e => (e.currentTarget.style.borderColor = "#8B5CF6")}
              onBlur={e => (e.currentTarget.style.borderColor = "#334155")}
            />
            <textarea
              rows={2}
              value={formDesc}
              onChange={e => setFormDesc(e.target.value)}
              placeholder="Instructions or description…"
              className="w-full px-3 py-2 rounded-lg text-xs outline-none resize-none placeholder-slate-600"
              style={{ backgroundColor: "#1E293B", border: "1px solid #334155", color: "#F8FAFC" }}
              onFocus={e => (e.currentTarget.style.borderColor = "#8B5CF6")}
              onBlur={e => (e.currentTarget.style.borderColor = "#334155")}
            />
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <p className="text-[10px] mb-1" style={{ color: "#475569" }}>Due date</p>
                <input
                  type="date"
                  value={formDue}
                  onChange={e => setFormDue(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg text-xs outline-none"
                  style={{ backgroundColor: "#1E293B", border: "1px solid #334155", color: "#F8FAFC" }}
                />
              </div>
              <div className="w-20">
                <p className="text-[10px] mb-1" style={{ color: "#475569" }}>Max pts</p>
                <input
                  type="number"
                  min={0}
                  value={formPoints}
                  onChange={e => setFormPoints(e.target.value)}
                  placeholder="100"
                  className="w-full px-2.5 py-1.5 rounded-lg text-xs outline-none placeholder-slate-600"
                  style={{ backgroundColor: "#1E293B", border: "1px solid #334155", color: "#F8FAFC" }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={submitForm}
                disabled={!formTitle.trim()}
                className="flex-1 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-30"
                style={{ backgroundColor: "#8B5CF6", color: "#fff" }}
              >
                Save &amp; Publish Later
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ backgroundColor: "#334155", color: "#94A3B8" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add button */}
      {!showForm && (
        <div className="flex-shrink-0 px-3 pb-3">
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-semibold transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#8B5CF620", color: "#A78BFA", border: "1px solid #8B5CF630" }}
          >
            <Plus size={12} /> New Assignment
          </button>
        </div>
      )}
    </div>
  )
}

// ── Attendance Panel ──────────────────────────────────────────────────────────

function AttendancePanel({ attendees }: { attendees: AttendeeRecord[] }) {
  const online = attendees.filter(a => a.isOnline).length

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 px-3 pt-3 pb-2">
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Online now",  value: online,                       color: "#10B981" },
            { label: "Left early",  value: attendees.length - online,    color: "#F59E0B" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl p-2.5 text-center" style={{ backgroundColor: "#0F172A", border: "1px solid #334155" }}>
              <p className="text-base font-bold" style={{ color }}>{value}</p>
              <p className="text-[10px] mt-0.5 leading-tight" style={{ color: "#475569" }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1.5">
        <p className="text-[10px] font-bold mb-2 uppercase tracking-wider" style={{ color: "#475569" }}>
          {attendees.length} enrolled
        </p>
        {attendees.map(a => (
          <div key={a.studentId} className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl" style={{ backgroundColor: "#0F172A", border: "1px solid #334155" }}>
            <div className="relative flex-shrink-0">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: a.studentColor, fontSize: 10 }}>
                {a.studentInitials}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                style={{ backgroundColor: a.isOnline ? "#10B981" : "#EF4444", borderColor: "#0F172A" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{a.studentName}</p>
              <p className="text-[10px]" style={{ color: "#475569" }}>Joined {a.joinedAt}</p>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: a.isOnline ? "#10B98115" : "#EF444415", color: a.isOnline ? "#10B981" : "#EF4444" }}>
              {a.isOnline ? "Online" : "Left"}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function InstructorLiveSessionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  const MOCK_MEET_URL = "https://zoom.us/j/987654321"
  const MOCK_MEETING_NUMBER = "987654321"
  const sessionTitle = "System Design Live Workshop"
  const sessionCourse = "Backend Engineering"

  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [panelVisible, setPanelVisible] = useState(true)
  const [iframeError, setIframeError] = useState(false)
  const [activeTab, setActiveTab] = useState<"qa" | "assignments" | "attendance">("assignments")
  const [qaItems, setQaItems] = useState<InstructorQAItem[]>(INITIAL_INSTRUCTOR_QA)
  const [assignments, setAssignments] = useState<LiveAssignment[]>(INITIAL_LIVE_ASSIGNMENTS)
  const [attendees] = useState<AttendeeRecord[]>(MOCK_ATTENDEES)

  // Elapsed timer
  useEffect(() => {
    const start = Date.now()
    const iv = setInterval(() => setElapsedSeconds(Math.floor((Date.now() - start) / 1000)), 1000)
    return () => clearInterval(iv)
  }, [])

  function publishAssignment(id: string) {
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, status: "published", publishedAt: new Date() } : a))
    setActiveTab("assignments")
  }

  function addAssignment(template: AssignmentTemplate) {
    setAssignments(prev => [...prev, { ...template, status: "hidden" }])
  }

  function replyQA(id: string, text: string) {
    setQaItems(prev => prev.map(q => q.id === id ? { ...q, isAnswered: true, reply: text } : q))
  }

  function dismissQA(id: string) {
    setQaItems(prev => prev.filter(q => q.id !== id))
  }

  const unansweredQA = qaItems.filter(q => !q.isAnswered).length
  const hiddenAssignments = assignments.filter(a => a.status === "hidden").length
  const onlineCount = attendees.filter(a => a.isOnline).length

  // suppress unused id warning
  void id

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: "100svh", backgroundColor: "#0F172A" }}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header
        className="flex items-center justify-between px-4 flex-shrink-0 gap-4"
        style={{ height: 56, backgroundColor: "#1E293B", borderBottom: "1px solid #334155" }}
      >
        <Link href="/instructor/trainings" className="flex items-center gap-1 text-sm flex-shrink-0" style={{ color: "#94A3B8" }}>
          <ChevronLeft size={15} />
          <span className="hidden sm:inline">Trainings</span>
        </Link>

        <div className="flex items-center gap-3 min-w-0 flex-1 justify-center">
          <span className="flex-shrink-0 flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: "#EF444420", color: "#F87171" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#EF4444" }} />
            LIVE
          </span>
          <div className="min-w-0 hidden sm:block">
            <p className="text-sm font-bold text-white truncate">{sessionTitle}</p>
            <p className="text-xs truncate" style={{ color: "#64748B" }}>{sessionCourse}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="flex items-center gap-1.5 text-sm font-mono" style={{ color: "#94A3B8" }}>
            <Timer size={13} style={{ color: "#3B82F6" }} />
            {formatElapsed(elapsedSeconds)}
          </div>
          <div className="flex items-center gap-1.5 text-sm" style={{ color: "#94A3B8" }}>
            <Users size={13} style={{ color: "#10B981" }} />
            <span style={{ color: "#10B981", fontWeight: 600 }}>{onlineCount}</span>
            <span style={{ color: "#475569" }}>/ {attendees.length}</span>
          </div>
        </div>
      </header>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Zoom iframe */}
        <div className="flex-1 relative overflow-hidden" style={{ backgroundColor: "#0A0F1E" }}>
          {!iframeError ? (
            <iframe
              src={`https://zoom.us/wc/join/${MOCK_MEETING_NUMBER}?prefer=1`}
              title="Zoom Session"
              allow="camera; microphone; display-capture; fullscreen; autoplay"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
              style={{ border: "none" }}
              onError={() => setIframeError(true)}
            />
          ) : (
            <IframeFallback meetUrl={MOCK_MEET_URL} />
          )}
        </div>

        {/* Right panel */}
        {panelVisible && (
          <div
            className="flex-shrink-0 flex flex-col overflow-hidden"
            style={{ width: 360, borderLeft: "1px solid #334155", backgroundColor: "#1E293B" }}
          >
            {/* Tab bar */}
            <div className="flex-shrink-0 flex items-center" style={{ height: 44, borderBottom: "1px solid #334155" }}>
              {([
                { key: "qa"          as const, label: "Q&A",         badge: unansweredQA > 0 ? unansweredQA : null,  badgeColor: "#EF4444", icon: MessageSquare },
                { key: "assignments" as const, label: "Assignments",  badge: hiddenAssignments > 0 ? hiddenAssignments : null, badgeColor: "#8B5CF6", icon: BookOpen },
                { key: "attendance"  as const, label: "Attendees",   badge: null,                                    badgeColor: "#10B981", icon: Users },
              ]).map(({ key, label, badge, badgeColor, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className="flex-1 h-full flex items-center justify-center gap-1.5 text-xs font-semibold transition-all"
                  style={{
                    color: activeTab === key ? "#F8FAFC" : "#64748B",
                    borderBottom: `2px solid ${activeTab === key ? "#3B82F6" : "transparent"}`,
                  }}
                >
                  <Icon size={12} />
                  {label}
                  {badge !== null && (
                    <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                      style={{ backgroundColor: badgeColor, color: "#fff" }}>
                      {badge}
                    </span>
                  )}
                </button>
              ))}
              <button type="button" onClick={() => setPanelVisible(false)} className="px-2 h-full flex items-center" style={{ color: "#475569" }}>
                <X size={13} />
              </button>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-hidden">
              {activeTab === "qa" && (
                <QAPanel items={qaItems} onReply={replyQA} onDismiss={dismissQA} />
              )}
              {activeTab === "assignments" && (
                <AssignmentsPanel assignments={assignments} onPublish={publishAssignment} onAdd={addAssignment} />
              )}
              {activeTab === "attendance" && (
                <AttendancePanel attendees={attendees} />
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Footer toolbar ───────────────────────────────────────────────────── */}
      <footer
        className="flex items-center justify-between px-4 sm:px-6 flex-shrink-0 gap-3"
        style={{ height: 52, backgroundColor: "#1E293B", borderTop: "1px solid #334155" }}
      >
        <div className="flex items-center gap-2">
          {!panelVisible && (
            <button type="button" onClick={() => setPanelVisible(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
              style={{ backgroundColor: "#3B82F620", color: "#60A5FA" }}>
              <MessageSquare size={13} /> Show Panel
            </button>
          )}
          {hiddenAssignments > 0 && (
            <button
              type="button"
              onClick={() => { setPanelVisible(true); setActiveTab("assignments") }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
              style={{ backgroundColor: "#8B5CF620", color: "#A78BFA" }}
            >
              <BookOpen size={13} />
              {hiddenAssignments} assignment{hiddenAssignments > 1 ? "s" : ""} ready to publish
            </button>
          )}
        </div>
        <Link
          href="/instructor/trainings"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ backgroundColor: "#EF444420", color: "#F87171" }}
        >
          End Session
        </Link>
      </footer>
    </div>
  )
}
