"use client"

import { use, useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { TRAINING_TRACKS, CATEGORY_ICONS, DEFAULT_CATEGORY_ICON } from "@/lib/data/trainings"
import type { KnowledgeCheck, TrainingTrack } from "@/lib/data/trainings"
import { useTrainingModeration } from "@/lib/hooks/useTrainingModeration"
import { useStudyGroups } from "@/lib/hooks/useStudyGroups"
import { useDiscussions } from "@/lib/hooks/useDiscussions"
import {
  ChevronLeft, ChevronRight, BookOpen, Clock, Users, Award, Shield,
  PlayCircle, HelpCircle, ClipboardCheck, ClipboardList, MessageSquare, Pencil,
} from "lucide-react"

const moduleTypeIcon = (type: string, size = 16) => {
  switch (type) {
    case "quiz": return <HelpCircle size={size} style={{ color: "#8B5CF6" }} />
    case "assessment": return <Award size={size} style={{ color: "#F59E0B" }} />
    default: return <PlayCircle size={size} style={{ color: "#3B82F6" }} />
  }
}

const TYPE_OPTIONS: TrainingTrack["type"][] = ["enterprise", "academic"]
const CATEGORY_OPTIONS: TrainingTrack["category"][] = ["Technical", "Compliance", "Soft Skills"]

export default function AdminTrainingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const track = TRAINING_TRACKS.find((t) => t.id === id) ?? TRAINING_TRACKS[0]
  const { getContent, updateContent, toggleMandatory, setDeadline } = useTrainingModeration()
  const { groups } = useStudyGroups()
  const { threads } = useDiscussions()
  const [expandedCheckId, setExpandedCheckId] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const content = getContent(track)
  const { isMandatory, deadline } = content

  const trainingGroups = groups.filter((g) => g.trainingId === track.id)
  const trainingDiscussions = threads.filter((d) => d.trainingId === track.id)
  const totalModules = track.modules.length
  const CategoryIcon = CATEGORY_ICONS[content.category] || DEFAULT_CATEGORY_ICON

  const [form, setForm] = useState(() => ({
    title: content.title,
    description: content.description,
    type: content.type,
    category: content.category,
    level: content.level,
    totalHours: String(content.totalHours),
    badge: content.badge,
  }))

  const startEditing = () => {
    setForm({
      title: content.title,
      description: content.description,
      type: content.type,
      category: content.category,
      level: content.level,
      totalHours: String(content.totalHours),
      badge: content.badge,
    })
    setIsEditing(true)
  }

  const handleSaveContent = () => {
    updateContent(track.id, {
      title: form.title.trim() || content.title,
      description: form.description.trim(),
      type: form.type,
      category: form.category,
      level: form.level.trim() || content.level,
      totalHours: Number(form.totalHours) || content.totalHours,
      badge: form.badge.trim() || content.badge,
    })
    setIsEditing(false)
  }

  return (
    <DashboardLayout role="admin" userName="Morgan Patel">
      <div className="max-w-4xl space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Link href="/admin/trainings" className="flex items-center gap-1.5 text-sm w-fit" style={{ color: "#64748B" }}>
            <ChevronLeft size={15} /> Back to Trainings
          </Link>
          {!isEditing && (
            <button
              onClick={startEditing}
              className="flex items-center gap-1.5 text-sm font-semibold px-3.5 py-2 rounded-lg"
              style={{ backgroundColor: "#3B82F6", color: "#fff" }}
            >
              <Pencil size={14} /> Edit Training
            </button>
          )}
        </div>

        {/* Edit form */}
        {isEditing && (
          <div className="rounded-2xl p-6 space-y-4" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
            <h2 className="text-base font-bold text-white">Edit Training Details</h2>

            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: "#94A3B8" }}>Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ backgroundColor: "#0F172A", border: "1px solid #334155", color: "#F8FAFC" }}
              />
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: "#94A3B8" }}>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
                style={{ backgroundColor: "#0F172A", border: "1px solid #334155", color: "#F8FAFC" }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "#94A3B8" }}>Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as TrainingTrack["type"] }))}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none capitalize"
                  style={{ backgroundColor: "#0F172A", border: "1px solid #334155", color: "#F8FAFC" }}
                >
                  {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "#94A3B8" }}>Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as TrainingTrack["category"] }))}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: "#0F172A", border: "1px solid #334155", color: "#F8FAFC" }}
                >
                  {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "#94A3B8" }}>Level</label>
                <input
                  value={form.level}
                  onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}
                  placeholder="e.g. Intermediate"
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: "#0F172A", border: "1px solid #334155", color: "#F8FAFC" }}
                />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "#94A3B8" }}>Total Hours</label>
                <input
                  value={form.totalHours}
                  onChange={(e) => setForm((f) => ({ ...f, totalHours: e.target.value }))}
                  placeholder="e.g. 42"
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: "#0F172A", border: "1px solid #334155", color: "#F8FAFC" }}
                />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "#94A3B8" }}>Badge Earned</label>
                <input
                  value={form.badge}
                  onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
                  placeholder="e.g. Engineering Pro"
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: "#0F172A", border: "1px solid #334155", color: "#F8FAFC" }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2" style={{ borderTop: "1px solid #334155" }}>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: "#334155", color: "#94A3B8" }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveContent}
                className="px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: "#3B82F6", color: "#fff" }}
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* Hero */}
        {!isEditing && (
        <div className="rounded-2xl p-6 relative overflow-hidden" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: `radial-gradient(circle, ${track.badgeColor}18 0%, transparent 70%)`, transform: "translate(30%, -30%)" }}
          />
          <div className="flex flex-col lg:flex-row gap-6 relative">
            <div className="flex-1">
              <div className="flex items-start gap-4">
                <div className="text-3xl flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-2xl" style={{ backgroundColor: "#0F172A" }}>
                  {track.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize" style={{ backgroundColor: content.type === "enterprise" ? "#3B82F615" : "#8B5CF615", color: content.type === "enterprise" ? "#60A5FA" : "#A78BFA" }}>
                      {content.type}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1" style={{ backgroundColor: "#334155", color: "#94A3B8" }}>
                      <CategoryIcon size={10} /> {content.category}
                    </span>
                    {isMandatory && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1" style={{ backgroundColor: "#EF444420", color: "#EF4444" }}>
                        <Shield size={10} /> Mandatory
                      </span>
                    )}
                  </div>
                  <h1 className="text-xl font-bold text-white mb-2">{content.title}</h1>
                  <p className="text-sm leading-relaxed" style={{ color: "#94A3B8" }}>{content.description}</p>

                  <div className="flex items-center gap-5 flex-wrap mt-4 text-sm" style={{ color: "#64748B" }}>
                    <span className="flex items-center gap-1.5"><BookOpen size={14} /> {totalModules} modules</span>
                    <span className="flex items-center gap-1.5"><Clock size={14} /> {content.totalHours}h total</span>
                    <span className="flex items-center gap-1.5"><Users size={14} /> {track.enrolledUsers.toLocaleString()} enrolled</span>
                    <span className="flex items-center gap-1.5">{content.level}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin moderation panel */}
            <div className="lg:w-72 rounded-xl p-5 flex-shrink-0 space-y-4" style={{ backgroundColor: "#0F172A", border: "1px solid #334155" }}>
              <div className="flex items-center gap-2 p-2.5 rounded-xl" style={{ backgroundColor: "#1E293B" }}>
                <Award size={14} style={{ color: track.badgeColor, flexShrink: 0 }} />
                <span className="text-xs font-semibold" style={{ color: track.badgeColor }}>Earns: {content.badge}</span>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1" style={{ color: "#64748B" }}>
                  <span>Avg. completion</span>
                  <span className="text-white font-semibold">{track.progress}%</span>
                </div>
                <div className="h-2 rounded-full" style={{ backgroundColor: "#334155" }}>
                  <div className="h-full rounded-full" style={{ width: `${track.progress}%`, backgroundColor: track.badgeColor }} />
                </div>
              </div>

              <button
                onClick={() => toggleMandatory(track.id, isMandatory)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-lg"
                style={{ backgroundColor: isMandatory ? "#EF444420" : "#334155", color: isMandatory ? "#F87171" : "#94A3B8" }}
              >
                {isMandatory ? "Mandatory" : "Optional"} — click to toggle
              </button>

              {isMandatory && (
                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: "#94A3B8" }}>Deadline</label>
                  <input
                    type="date"
                    value={deadline ?? ""}
                    onChange={(e) => setDeadline(track.id, e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg text-xs outline-none"
                    style={{ backgroundColor: "#1E293B", border: "1px solid #334155", color: "#F8FAFC" }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        )}

        {/* Modules */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid #334155" }}>
            <h2 className="text-sm font-bold text-white">Training Content</h2>
            <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>{totalModules} modules · {content.totalHours}h total</p>
          </div>
          <div className="divide-y" style={{ borderColor: "#334155" }}>
            {track.modules.map((m, i) => (
              <div key={m.id} className="flex items-center gap-3 px-5 py-3.5" style={{ backgroundColor: i % 2 === 0 ? "#1A2535" : "#1E293B" }}>
                <span className="text-xs flex-shrink-0 w-5 text-right" style={{ color: "#475569" }}>{i + 1}</span>
                <div className="flex-shrink-0 w-5 flex items-center justify-center">{moduleTypeIcon(m.type)}</div>
                <span className="flex-1 text-sm" style={{ color: "#CBD5E1" }}>{m.title}</span>
                <span className="text-xs capitalize flex-shrink-0" style={{ color: "#475569" }}>{m.type}</span>
                <span className="text-xs flex-shrink-0" style={{ color: "#475569" }}>{m.duration}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Knowledge Checks */}
        {track.knowledgeChecks.length > 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <ClipboardCheck size={16} style={{ color: "#3B82F6" }} /> Knowledge Checks
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>
                {track.knowledgeChecks.length} check{track.knowledgeChecks.length > 1 ? "s" : ""} · review question content below
              </p>
            </div>

            {track.knowledgeChecks.map((check) => {
              const expanded = expandedCheckId === check.id
              return (
                <div key={check.id} className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
                  <button
                    onClick={() => setExpandedCheckId(expanded ? null : check.id)}
                    className="w-full flex items-center justify-between gap-3 px-5 py-4 flex-wrap text-left"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">{check.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>
                        {check.questions.length} questions · Pass: {check.passingScore}%
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-lg flex-shrink-0" style={{ backgroundColor: "#334155", color: "#CBD5E1" }}>
                      {expanded ? "Hide" : "Preview"} Questions
                    </span>
                  </button>

                  {expanded && (
                    <div className="px-5 pb-5 space-y-4" style={{ borderTop: "1px solid #334155" }}>
                      {check.questions.map((q: KnowledgeCheck["questions"][number], i: number) => (
                        <div key={q.id} className="pt-4" style={{ borderTop: i === 0 ? "none" : "1px solid #1E293B" }}>
                          <p className="text-sm font-medium text-white mb-2">Q{i + 1}. {q.question}</p>
                          {q.type === "mcq" ? (
                            <div className="space-y-1.5">
                              {q.options.map((opt, idx) => (
                                <div
                                  key={idx}
                                  className="px-3 py-2 rounded-lg text-sm"
                                  style={{
                                    backgroundColor: idx === q.correctIndex ? "#10B98115" : "#0F172A",
                                    border: `1px solid ${idx === q.correctIndex ? "#10B98130" : "#334155"}`,
                                    color: idx === q.correctIndex ? "#34D399" : "#94A3B8",
                                  }}
                                >
                                  {idx === q.correctIndex && "✓ "}{opt}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs" style={{ color: "#34D399" }}>
                              Accepted answers: {q.acceptedAnswers.join(" / ")}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Assignments */}
        {track.assignments.length > 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <ClipboardList size={16} style={{ color: "#F59E0B" }} /> Assignments
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>
                {track.assignments.length} assignment{track.assignments.length > 1 ? "s" : ""} for this training
              </p>
            </div>
            {track.assignments.map((a) => (
              <div key={a.id} className="rounded-2xl p-5" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="text-sm font-semibold text-white">{a.title}</p>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 capitalize" style={{ backgroundColor: "#33415560", color: "#94A3B8" }}>
                    {a.submissionFormat}
                  </span>
                </div>
                <p className="text-sm mb-3" style={{ color: "#94A3B8" }}>{a.description}</p>
                <div className="flex items-center gap-4 text-xs" style={{ color: "#64748B" }}>
                  <span>Due {a.dueDate}</span>
                  <span>Max score: {a.maxScore}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Study groups (link out) */}
        <div className="rounded-2xl p-4 flex items-center justify-between gap-3" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
          <div className="flex items-center gap-2">
            <Users size={16} style={{ color: "#3B82F6" }} />
            <p className="text-sm" style={{ color: "#94A3B8" }}>
              {trainingGroups.length} study group{trainingGroups.length === 1 ? "" : "s"} for this training
            </p>
          </div>
          <Link href="/admin/study-groups" className="text-xs font-semibold flex-shrink-0" style={{ color: "#3B82F6" }}>Manage →</Link>
        </div>

        {/* Discussions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare size={16} style={{ color: "#3B82F6" }} /> Discussions
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>{trainingDiscussions.length} thread{trainingDiscussions.length === 1 ? "" : "s"} for this training</p>
            </div>
            <Link href="/admin/discussions" className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg flex-shrink-0" style={{ backgroundColor: "#334155", color: "#CBD5E1" }}>
              <MessageSquare size={13} /> Moderate Discussions
            </Link>
          </div>

          {trainingDiscussions.length === 0 ? (
            <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: "#1E293B", border: "1px dashed #334155" }}>
              <p className="text-sm" style={{ color: "#475569" }}>No discussions yet for this training.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {trainingDiscussions.map((d) => (
                <div key={d.id} className="rounded-2xl p-4" style={{ backgroundColor: "#1E293B", border: `1px solid ${d.isPinned ? "#3B82F640" : "#334155"}` }}>
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold flex-shrink-0" style={{ backgroundColor: "#3B82F6", color: "#fff" }}>{d.authorAvatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white">{d.title}</span>
                        {d.isPinned && <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: "#3B82F620", color: "#60A5FA" }}>Pinned</span>}
                        {d.isSolved && <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: "#10B98120", color: "#10B981" }}>Solved</span>}
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>{d.author} · {d.createdAt} · {d.replies} replies · {d.views} views</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end">
          <Link href="/admin/trainings" className="flex items-center gap-1.5 text-sm font-medium" style={{ color: "#3B82F6" }}>
            Back to all trainings <ChevronRight size={15} />
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
