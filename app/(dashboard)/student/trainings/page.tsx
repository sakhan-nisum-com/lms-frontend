"use client"

import Link from "next/link"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import {
  BookOpen, Clock, CheckCircle, AlertTriangle, ChevronRight,
  Award, BarChart3, Lock, Play, Users, Star, Search, Filter,
  Shield, GraduationCap, Briefcase, Zap,
} from "lucide-react"
import { useState } from "react"

const TRAINING_TRACKS = [
  {
    id: "tt1",
    title: "Software Engineering Excellence",
    type: "enterprise",
    category: "Technical",
    icon: "💻",
    description: "Core technical skills required for all engineers: architecture, testing, code quality, and performance optimization.",
    courses: 8,
    totalHours: 42,
    completed: 5,
    isMandatory: false,
    deadline: null,
    progress: 62,
    level: "Intermediate",
    enrolledUsers: 1240,
    badge: "Engineering Pro",
    badgeColor: "#3B82F6",
  },
  {
    id: "tt2",
    title: "Information Security Awareness",
    type: "enterprise",
    category: "Compliance",
    icon: "🔐",
    description: "Mandatory annual security training covering phishing, data handling, access control, and incident reporting.",
    courses: 5,
    totalHours: 12,
    completed: 5,
    isMandatory: true,
    deadline: "2026-06-30",
    progress: 100,
    level: "All Levels",
    enrolledUsers: 4500,
    badge: "Security Certified",
    badgeColor: "#10B981",
  },
  {
    id: "tt3",
    title: "Data Privacy & GDPR",
    type: "enterprise",
    category: "Compliance",
    icon: "📋",
    description: "GDPR compliance requirements for all employees handling EU customer data. Certification required by Q2.",
    courses: 4,
    totalHours: 8,
    completed: 2,
    isMandatory: true,
    deadline: "2026-07-15",
    progress: 50,
    level: "All Levels",
    enrolledUsers: 3800,
    badge: "GDPR Compliant",
    badgeColor: "#8B5CF6",
  },
  {
    id: "tt4",
    title: "Leadership & Management Fundamentals",
    type: "enterprise",
    category: "Soft Skills",
    icon: "🧑‍💼",
    description: "Designed for senior ICs and managers: delegation, feedback, conflict resolution, and team performance.",
    courses: 6,
    totalHours: 24,
    completed: 1,
    isMandatory: false,
    deadline: null,
    progress: 17,
    level: "Advanced",
    enrolledUsers: 620,
    badge: "Leadership Ready",
    badgeColor: "#F59E0B",
  },
  {
    id: "tt5",
    title: "Frontend Web Development",
    type: "academic",
    category: "Technical",
    icon: "⚛️",
    description: "Comprehensive curriculum from HTML/CSS basics to advanced React, TypeScript, and modern build tooling.",
    courses: 12,
    totalHours: 68,
    completed: 9,
    isMandatory: false,
    deadline: null,
    progress: 75,
    level: "Beginner to Advanced",
    enrolledUsers: 2340,
    badge: "Frontend Dev",
    badgeColor: "#3B82F6",
  },
  {
    id: "tt6",
    title: "Cloud & Infrastructure",
    type: "academic",
    category: "Technical",
    icon: "☁️",
    description: "AWS, Azure, and GCP fundamentals plus Kubernetes, Terraform, and monitoring with real lab environments.",
    courses: 10,
    totalHours: 55,
    completed: 3,
    isMandatory: false,
    deadline: null,
    progress: 30,
    level: "Intermediate",
    enrolledUsers: 1890,
    badge: "Cloud Practitioner",
    badgeColor: "#06B6D4",
  },
  {
    id: "tt7",
    title: "Anti-Harassment & Workplace Ethics",
    type: "enterprise",
    category: "Compliance",
    icon: "🤝",
    description: "Annual mandatory training on workplace respect, discrimination prevention, and reporting procedures.",
    courses: 3,
    totalHours: 6,
    completed: 3,
    isMandatory: true,
    deadline: "2026-08-01",
    progress: 100,
    level: "All Levels",
    enrolledUsers: 4500,
    badge: "Ethics Certified",
    badgeColor: "#10B981",
  },
  {
    id: "tt8",
    title: "Data Science & Machine Learning",
    type: "academic",
    category: "Technical",
    icon: "🧠",
    description: "Python, statistical foundations, ML algorithms, and practical model deployment with MLflow and FastAPI.",
    courses: 14,
    totalHours: 80,
    completed: 0,
    isMandatory: false,
    deadline: null,
    progress: 0,
    level: "Intermediate",
    enrolledUsers: 1560,
    badge: "ML Engineer",
    badgeColor: "#8B5CF6",
  },
]

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Compliance: Shield,
  Technical: GraduationCap,
  "Soft Skills": Briefcase,
}

const TYPE_TABS = [
  { key: "all", label: "All Trainings" },
  { key: "enterprise", label: "Enterprise" },
  { key: "academic", label: "Academic" },
  { key: "mandatory", label: "Mandatory" },
  { key: "inprogress", label: "In Progress" },
]

export default function TrainingsPage() {
  const [tab, setTab] = useState("all")
  const [search, setSearch] = useState("")

  const mandatory = TRAINING_TRACKS.filter((t) => t.isMandatory)
  const overdue = mandatory.filter((t) => t.progress < 100 && t.deadline && new Date(t.deadline) < new Date("2026-07-01"))
  const completed = TRAINING_TRACKS.filter((t) => t.progress === 100).length
  const inProgress = TRAINING_TRACKS.filter((t) => t.progress > 0 && t.progress < 100).length

  const filtered = TRAINING_TRACKS.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase())
    if (!matchSearch) return false
    if (tab === "enterprise") return t.type === "enterprise"
    if (tab === "academic") return t.type === "academic"
    if (tab === "mandatory") return t.isMandatory
    if (tab === "inprogress") return t.progress > 0 && t.progress < 100
    return true
  })

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Training Programs</h1>
          <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>Enterprise compliance tracks and academic development programs</p>
        </div>

        {/* Mandatory alert */}
        {overdue.length > 0 && (
          <div className="rounded-xl p-4 flex items-start gap-3" style={{ backgroundColor: "#EF444410", border: "1px solid #EF444430" }}>
            <AlertTriangle size={18} style={{ color: "#EF4444", flexShrink: 0 }} />
            <div>
              <p className="text-sm font-bold" style={{ color: "#EF4444" }}>Mandatory Training Incomplete</p>
              <p className="text-xs mt-0.5" style={{ color: "#FCA5A5" }}>
                {overdue.map((t) => t.title).join(", ")} — deadline approaching. Complete to maintain compliance status.
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Programs", value: TRAINING_TRACKS.length, icon: BookOpen, color: "#3B82F6" },
            { label: "Completed", value: completed, icon: CheckCircle, color: "#10B981" },
            { label: "In Progress", value: inProgress, icon: BarChart3, color: "#F59E0B" },
            { label: "Mandatory Done", value: `${mandatory.filter((t) => t.progress === 100).length}/${mandatory.length}`, icon: Shield, color: "#8B5CF6" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-xl p-4 flex items-center gap-3" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}20` }}>
                <Icon size={16} style={{ color }} />
              </div>
              <div>
                <p className="text-lg font-black text-white">{value}</p>
                <p className="text-xs" style={{ color: "#94A3B8" }}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs + search */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid #334155" }}>
            {TYPE_TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="px-4 py-2 text-xs font-semibold whitespace-nowrap transition-colors"
                style={{ backgroundColor: tab === t.key ? "#3B82F6" : "#1E293B", color: tab === t.key ? "#fff" : "#64748B", borderRight: "1px solid #334155" }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-xs ml-auto">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#64748B" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search trainings..."
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl outline-none"
              style={{ backgroundColor: "#1E293B", border: "1px solid #334155", color: "#F8FAFC" }}
            />
          </div>
        </div>

        {/* Training track cards */}
        <div className="grid lg:grid-cols-2 gap-5">
          {filtered.map((track) => {
            const isComplete = track.progress === 100
            const CategoryIcon = CATEGORY_ICONS[track.category] || BookOpen
            const daysLeft = track.deadline
              ? Math.ceil((new Date(track.deadline).getTime() - Date.now()) / 86400000)
              : null

            return (
              <div
                key={track.id}
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
                    ) : track.progress > 0 ? (
                      <Link
                        href={`/student/courses`}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white"
                        style={{ backgroundColor: "#3B82F6" }}
                      >
                        <Play size={12} /> Continue
                      </Link>
                    ) : (
                      <button
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white"
                        style={{ backgroundColor: track.isMandatory ? "#EF4444" : "#3B82F6" }}
                      >
                        <Zap size={12} /> Start Training
                      </button>
                    )}
                    <Link
                      href="/student/courses"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
                      style={{ backgroundColor: "#334155", color: "#94A3B8" }}
                    >
                      View Courses <ChevronRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16" style={{ color: "#64748B" }}>
            <p className="text-4xl mb-3">🎓</p>
            <p className="text-sm font-semibold">No training programs found</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
