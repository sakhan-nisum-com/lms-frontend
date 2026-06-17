"use client"

import { use } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { TRAINING_TRACKS, CATEGORY_ICONS, DEFAULT_CATEGORY_ICON } from "@/lib/data/trainings"
import { useTrainingProgress } from "@/lib/hooks/useTrainingProgress"
import { useTrainingEnrollments } from "@/lib/hooks/useTrainingEnrollments"
import {
  ChevronLeft, ChevronRight, BookOpen, Clock, Users, Award, Shield,
  CheckCircle2, Circle, PlayCircle, HelpCircle, Zap,
} from "lucide-react"

const moduleTypeIcon = (type: string, size = 16) => {
  switch (type) {
    case "quiz": return <HelpCircle size={size} style={{ color: "#8B5CF6" }} />
    case "assessment": return <Award size={size} style={{ color: "#F59E0B" }} />
    default: return <PlayCircle size={size} style={{ color: "#3B82F6" }} />
  }
}

export default function TrainingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const track = TRAINING_TRACKS.find((t) => t.id === id) ?? TRAINING_TRACKS[0]
  const { isComplete, markComplete } = useTrainingProgress(track.id)
  const { isEnrolled, enroll } = useTrainingEnrollments()

  const owned = track.enrolled || isEnrolled(track.id)
  const isDone = (moduleId: string, staticDone: boolean) => staticDone || isComplete(moduleId)

  const totalModules = track.modules.length
  const completedModules = track.modules.filter((m) => isDone(m.id, m.completed)).length
  const progressPct = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : track.progress
  const trackDone = progressPct === 100

  const daysLeft = track.deadline
    ? Math.ceil((new Date(track.deadline).getTime() - Date.now()) / 86400000)
    : null

  const CategoryIcon = CATEGORY_ICONS[track.category] || DEFAULT_CATEGORY_ICON

  const toggleModule = (moduleId: string, done: boolean) => {
    if (!owned) enroll(track.id)
    markComplete(moduleId, done)
  }

  const handleEnroll = () => enroll(track.id)

  return (
    <DashboardLayout role="student">
      <div className="max-w-4xl space-y-6">

        {/* Breadcrumb */}
        <Link href="/student/trainings" className="flex items-center gap-1.5 text-sm w-fit" style={{ color: "#64748B" }}>
          <ChevronLeft size={15} /> Back to Trainings
        </Link>

        {/* Hero */}
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
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize" style={{ backgroundColor: track.type === "enterprise" ? "#3B82F615" : "#8B5CF615", color: track.type === "enterprise" ? "#60A5FA" : "#A78BFA" }}>
                      {track.type}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1" style={{ backgroundColor: "#334155", color: "#94A3B8" }}>
                      <CategoryIcon size={10} /> {track.category}
                    </span>
                    {track.isMandatory && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1" style={{ backgroundColor: "#EF444420", color: "#EF4444" }}>
                        <Shield size={10} /> Required
                      </span>
                    )}
                    {trackDone && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1" style={{ backgroundColor: "#10B98120", color: "#10B981" }}>
                        <CheckCircle2 size={10} /> Complete
                      </span>
                    )}
                  </div>
                  <h1 className="text-xl font-bold text-white mb-2">{track.title}</h1>
                  <p className="text-sm leading-relaxed" style={{ color: "#94A3B8" }}>{track.description}</p>

                  <div className="flex items-center gap-5 flex-wrap mt-4 text-sm" style={{ color: "#64748B" }}>
                    <span className="flex items-center gap-1.5"><BookOpen size={14} /> {totalModules} modules</span>
                    <span className="flex items-center gap-1.5"><Clock size={14} /> {track.totalHours}h total</span>
                    <span className="flex items-center gap-1.5"><Users size={14} /> {track.enrolledUsers.toLocaleString()} enrolled</span>
                    <span className="flex items-center gap-1.5">{track.level}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right panel */}
            <div className="lg:w-72 rounded-xl p-5 flex-shrink-0" style={{ backgroundColor: "#0F172A", border: "1px solid #334155" }}>
              <div className="flex items-center gap-2 mb-4 p-2.5 rounded-xl" style={{ backgroundColor: "#1E293B" }}>
                <Award size={14} style={{ color: track.badgeColor, flexShrink: 0 }} />
                <span className="text-xs font-semibold" style={{ color: track.badgeColor }}>Earn: {track.badge}</span>
              </div>

              {owned ? (
                <>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1" style={{ color: "#64748B" }}>
                      <span>{completedModules}/{totalModules} modules</span>
                      <span style={{ color: trackDone ? "#10B981" : "#94A3B8" }}>{progressPct}% complete</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ backgroundColor: "#334155" }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%`, backgroundColor: trackDone ? "#10B981" : track.isMandatory ? "#EF4444" : "#3B82F6" }}
                      />
                    </div>
                    {daysLeft !== null && !trackDone && (
                      <p className="text-xs mt-1.5" style={{ color: daysLeft < 30 ? "#EF4444" : "#F59E0B" }}>
                        {daysLeft}d left to complete
                      </p>
                    )}
                  </div>
                  {trackDone ? (
                    <Link
                      href="/student/certificates"
                      className="block w-full text-center py-3 rounded-xl text-sm font-bold"
                      style={{ backgroundColor: "#10B981", color: "#fff" }}
                    >
                      <Award size={16} className="inline mr-2" /> View Certificate
                    </Link>
                  ) : (
                    <p className="text-xs text-center" style={{ color: "#64748B" }}>
                      Mark modules complete below as you go
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="text-xs mb-3" style={{ color: "#94A3B8" }}>
                    You haven&apos;t started this training yet.
                  </p>
                  <button
                    onClick={handleEnroll}
                    className="block w-full text-center py-3 rounded-xl text-sm font-bold"
                    style={{ backgroundColor: track.isMandatory ? "#EF4444" : "#3B82F6", color: "#fff" }}
                  >
                    <Zap size={16} className="inline mr-2" /> Start Training
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Modules */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid #334155" }}>
            <h2 className="text-sm font-bold text-white">Training Content</h2>
            <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>{totalModules} modules · {track.totalHours}h total</p>
          </div>
          <div className="divide-y" style={{ borderColor: "#334155" }}>
            {track.modules.map((m, i) => {
              const done = isDone(m.id, m.completed)
              return (
                <div key={m.id} className="flex items-center gap-3 px-5 py-3.5" style={{ backgroundColor: i % 2 === 0 ? "#1A2535" : "#1E293B" }}>
                  <button onClick={() => toggleModule(m.id, !done)} className="flex-shrink-0">
                    {done ? <CheckCircle2 size={18} style={{ color: "#10B981" }} /> : <Circle size={18} style={{ color: "#475569" }} />}
                  </button>
                  <div className="flex-shrink-0 w-5 flex items-center justify-center">
                    {moduleTypeIcon(m.type)}
                  </div>
                  <span
                    className="flex-1 text-sm"
                    style={{ color: done ? "#64748B" : "#CBD5E1", textDecoration: done ? "line-through" : "none" }}
                  >
                    {m.title}
                  </span>
                  <span className="text-xs flex-shrink-0" style={{ color: "#475569" }}>{m.duration}</span>
                  <button
                    onClick={() => toggleModule(m.id, !done)}
                    className="text-xs px-2.5 py-1 rounded-lg flex-shrink-0 font-semibold"
                    style={{ backgroundColor: done ? "#10B98115" : "#3B82F620", color: done ? "#10B981" : "#60A5FA" }}
                  >
                    {done ? "Mark Incomplete" : "Mark Complete"}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {!trackDone && (
          <div className="flex items-center justify-between">
            <span />
            <Link href="/student/trainings" className="flex items-center gap-1.5 text-sm font-medium" style={{ color: "#3B82F6" }}>
              Explore other trainings <ChevronRight size={15} />
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
