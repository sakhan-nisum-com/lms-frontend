import Link from "next/link"
import { BookOpen, Clock, Users, Award, Play, Zap, CheckCircle, Shield, ChevronRight } from "lucide-react"
import type { TrainingTrack } from "@/lib/data/trainings"
import { CATEGORY_ICONS, DEFAULT_CATEGORY_ICON } from "@/lib/data/trainings"

export function TrainingCard({ track }: { track: TrainingTrack }) {
  const isComplete = track.progress === 100
  const CategoryIcon = CATEGORY_ICONS[track.category] || DEFAULT_CATEGORY_ICON
  const daysLeft = track.deadline
    ? Math.ceil((new Date(track.deadline).getTime() - Date.now()) / 86400000)
    : null

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all"
      style={{
        backgroundColor: "#1E293B",
        border: `1px solid ${track.isMandatory && !isComplete ? "#EF444330" : isComplete ? "#10B98130" : "#334155"}`,
      }}
    >
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="text-3xl flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl" style={{ backgroundColor: "#0F172A" }}>
            {track.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
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
              {isComplete && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1" style={{ backgroundColor: "#10B98120", color: "#10B981" }}>
                  <CheckCircle size={10} /> Complete
                </span>
              )}
              {!track.enrolled && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#33415540", color: "#94A3B8" }}>
                  Not Enrolled
                </span>
              )}
            </div>
            <h3 className="text-sm font-bold text-white leading-snug">{track.title}</h3>
          </div>
        </div>

        <p className="text-xs mt-3 leading-relaxed" style={{ color: "#64748B" }}>{track.description}</p>

        {/* Meta */}
        <div className="flex items-center gap-4 mt-3 text-xs" style={{ color: "#64748B" }}>
          <span className="flex items-center gap-1"><BookOpen size={11} /> {track.courses} courses</span>
          <span className="flex items-center gap-1"><Clock size={11} /> {track.totalHours}h total</span>
          <span className="flex items-center gap-1"><Users size={11} /> {track.enrolledUsers.toLocaleString()} enrolled</span>
        </div>

        {/* Badge */}
        <div className="flex items-center gap-2 mt-3 p-2.5 rounded-xl" style={{ backgroundColor: "#0F172A" }}>
          <Award size={14} style={{ color: track.badgeColor, flexShrink: 0 }} />
          <span className="text-xs font-semibold" style={{ color: track.badgeColor }}>Earn: {track.badge}</span>
        </div>
      </div>

      {/* Progress */}
      {track.enrolled && (
        <div style={{ borderTop: "1px solid #334155", padding: "12px 20px" }}>
          <div className="flex items-center justify-between text-xs mb-2">
            <span style={{ color: "#64748B" }}>{track.completed}/{track.courses} courses done</span>
            <span style={{ color: isComplete ? "#10B981" : track.isMandatory ? "#EF4444" : "#3B82F6", fontWeight: 700 }}>
              {track.progress}%
              {daysLeft !== null && !isComplete && (
                <span style={{ color: daysLeft < 30 ? "#EF4444" : "#F59E0B" }}> · {daysLeft}d left</span>
              )}
            </span>
          </div>
          <div className="h-2 rounded-full" style={{ backgroundColor: "#334155" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${track.progress}%`,
                backgroundColor: isComplete ? "#10B981" : track.isMandatory ? "#EF4444" : "#3B82F6",
              }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ borderTop: "1px solid #334155", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <span className="text-xs" style={{ color: "#475569" }}>{track.level}</span>
        <div className="flex gap-2">
          {isComplete ? (
            <Link
              href="/student/certificates"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold"
              style={{ backgroundColor: "#10B98120", color: "#10B981", border: "1px solid #10B98140" }}
            >
              <Award size={12} /> View Certificate
            </Link>
          ) : track.enrolled && track.progress > 0 ? (
            <Link
              href={`/student/trainings/${track.id}`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white"
              style={{ backgroundColor: "#3B82F6" }}
            >
              <Play size={12} /> Continue
            </Link>
          ) : (
            <Link
              href={`/student/trainings/${track.id}`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white"
              style={{ backgroundColor: track.isMandatory ? "#EF4444" : "#3B82F6" }}
            >
              <Zap size={12} /> Start Training
            </Link>
          )}
          <Link
            href={`/student/trainings/${track.id}`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
            style={{ backgroundColor: "#334155", color: "#94A3B8" }}
          >
            View Content <ChevronRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  )
}
