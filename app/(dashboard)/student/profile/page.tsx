"use client"

import Link from "next/link"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { CERTIFICATES, COURSES, STUDENT_PROFILE } from "@/lib/data/courses"
import {
  Mail, Globe, Link2, Award, BookOpen,
  Clock, Flame, Star, TrendingUp, Edit2,
} from "lucide-react"

export default function ProfilePage() {
  const p = STUDENT_PROFILE
  const enrolledCourses = COURSES.filter((c) => c.progress !== undefined)
  const completed = enrolledCourses.filter((c) => c.progress === 100)

  return (
    <DashboardLayout role="student" userName={p.name}>
      <div className="max-w-4xl space-y-6">

        {/* Profile card */}
        <div
          className="rounded-2xl p-6 relative overflow-hidden shadow-sm"
          style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
        >
          <div
            className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)", transform: "translate(30%,-30%)" }}
          />
          <div className="flex items-start gap-5 relative">
            <div className="flex items-center justify-center w-20 h-20 rounded-2xl text-3xl font-black text-white flex-shrink-0" style={{ backgroundColor: "var(--accent)" }}>
              {p.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{p.name}</h1>
                  <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>{p.jobTitle} · {p.department}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{p.institution}</p>
                </div>
                <Link
                  href="/student/settings"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold flex-shrink-0"
                  style={{ backgroundColor: "var(--border-default)", color: "var(--text-secondary)" }}
                >
                  <Edit2 size={12} /> Edit Profile
                </Link>
              </div>

              <p className="text-sm mt-3 leading-relaxed" style={{ color: "var(--text-secondary)" }}>{p.bio}</p>

              <div className="flex items-center gap-4 mt-3 flex-wrap text-xs" style={{ color: "var(--text-tertiary)" }}>
                <span className="flex items-center gap-1"><Mail size={12} /> {p.email}</span>
                {p.linkedIn && <span className="flex items-center gap-1"><Link2 size={12} /> {p.linkedIn}</span>}
                {p.github && <span className="flex items-center gap-1"><Link2 size={12} /> {p.github}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Hours Learned", value: `${p.totalHours}h`, icon: Clock, color: "#3B82F6" },
            { label: "Courses Done", value: `${p.stats.completed}/${p.stats.enrolled}`, icon: BookOpen, color: "#10B981" },
            { label: "Certificates", value: p.stats.certificates, icon: Award, color: "#F59E0B" },
            { label: "Streak", value: `${p.streak}d`, icon: Flame, color: "#EF4444" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-xl p-4 flex items-center gap-3 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
              <div className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0" style={{ backgroundColor: `${color}20` }}>
                <Icon size={17} style={{ color }} />
              </div>
              <div>
                <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{value}</p>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Certificates */}
        <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Certificates</h2>
            <Link href="/student/certificates" className="text-xs" style={{ color: "var(--accent)" }}>View all →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {CERTIFICATES.map((cert) => (
              <div key={cert.id} className="rounded-xl p-3" style={{ backgroundColor: "var(--bg-surface-muted)", border: `1px solid ${cert.thumbnailColor}30` }}>
                <div className="text-2xl mb-2">{cert.thumbnail}</div>
                <p className="text-xs font-semibold line-clamp-2" style={{ color: "var(--text-primary)" }}>{cert.courseName}</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>Issued {cert.issuedDate}</p>
                <p className="text-xs font-bold mt-1" style={{ color: "#F59E0B" }}>{cert.grade}% grade</p>
              </div>
            ))}
          </div>
        </div>

        {/* Learning goal */}
        <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={15} style={{ color: "var(--accent)" }} />
            <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Learning Goal</h2>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{p.learningGoal}</p>
        </div>

      </div>
    </DashboardLayout>
  )
}
