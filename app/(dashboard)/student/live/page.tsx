"use client"

import Link from "next/link"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import {
  Radio, Users, Clock, Calendar, Play, Lock,
  ChevronRight, Search, Filter, Mic, MicOff,
} from "lucide-react"
import { useState } from "react"

const LIVE_SESSIONS = [
  {
    id: "live1",
    title: "React Server Components Deep Dive",
    instructor: "Sarah Chen",
    instructorAvatar: "SC",
    course: "React Advanced Patterns",
    scheduledAt: "2026-06-12T14:00:00",
    duration: 90,
    attendees: 142,
    maxAttendees: 200,
    status: "live",
    thumbnail: "⚛️",
    tags: ["React", "Server Components", "Next.js"],
    description: "Explore RSC architecture, streaming, and Suspense integration in production apps.",
  },
  {
    id: "live2",
    title: "TypeScript Generics Workshop",
    instructor: "James Park",
    instructorAvatar: "JP",
    course: "TypeScript Mastery",
    scheduledAt: "2026-06-12T15:30:00",
    duration: 60,
    attendees: 87,
    maxAttendees: 150,
    status: "live",
    thumbnail: "🔷",
    tags: ["TypeScript", "Generics", "Types"],
    description: "Hands-on workshop covering advanced generic patterns, conditional types, and mapped types.",
  },
  {
    id: "live3",
    title: "System Design Interview Prep",
    instructor: "Lisa Wang",
    instructorAvatar: "LW",
    course: "System Design Mastery",
    scheduledAt: "2026-06-12T17:00:00",
    duration: 120,
    attendees: 0,
    maxAttendees: 300,
    status: "upcoming",
    thumbnail: "🏗️",
    tags: ["System Design", "Interview", "Architecture"],
    description: "Practice designing large-scale distributed systems with real-world examples.",
  },
  {
    id: "live4",
    title: "Cybersecurity Threat Modeling",
    instructor: "Marcus Reed",
    instructorAvatar: "MR",
    course: "Cybersecurity Fundamentals",
    scheduledAt: "2026-06-13T10:00:00",
    duration: 90,
    attendees: 0,
    maxAttendees: 200,
    status: "upcoming",
    thumbnail: "🔐",
    tags: ["Security", "Threat Modeling", "STRIDE"],
    description: "Walk through STRIDE methodology and identify vulnerabilities in modern web applications.",
  },
  {
    id: "live5",
    title: "Data Structures & Algorithms AMA",
    instructor: "Priya Sharma",
    instructorAvatar: "PS",
    course: "DSA Fundamentals",
    scheduledAt: "2026-06-13T13:00:00",
    duration: 75,
    attendees: 0,
    maxAttendees: 250,
    status: "upcoming",
    thumbnail: "📊",
    tags: ["DSA", "Algorithms", "Interview"],
    description: "Open Q&A session covering common interview patterns, tree traversal, and dynamic programming.",
  },
]

const RECORDINGS = [
  {
    id: "rec1",
    title: "Next.js 14 App Router Full Tutorial",
    instructor: "Sarah Chen",
    instructorAvatar: "SC",
    course: "React Advanced Patterns",
    recordedAt: "2026-06-10",
    duration: 95,
    views: 1240,
    thumbnail: "⚛️",
    tags: ["Next.js", "App Router"],
  },
  {
    id: "rec2",
    title: "Building a Design System from Scratch",
    instructor: "Alex Torres",
    instructorAvatar: "AT",
    course: "UI/UX Foundations",
    recordedAt: "2026-06-09",
    duration: 82,
    views: 890,
    thumbnail: "🎨",
    tags: ["Design System", "CSS"],
  },
  {
    id: "rec3",
    title: "Docker & Kubernetes for Developers",
    instructor: "James Park",
    instructorAvatar: "JP",
    course: "DevOps Bootcamp",
    recordedAt: "2026-06-07",
    duration: 110,
    views: 2340,
    thumbnail: "🐳",
    tags: ["Docker", "Kubernetes", "DevOps"],
  },
  {
    id: "rec4",
    title: "GraphQL Schema Design Best Practices",
    instructor: "Lisa Wang",
    instructorAvatar: "LW",
    course: "API Development",
    recordedAt: "2026-06-05",
    duration: 68,
    views: 670,
    thumbnail: "📡",
    tags: ["GraphQL", "API", "Schema"],
  },
]

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
}

export default function LiveClassesPage() {
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState<"all" | "live" | "upcoming" | "recordings">("all")

  const liveSessions = LIVE_SESSIONS.filter((s) => s.status === "live")
  const upcomingToday = LIVE_SESSIONS.filter((s) => s.status === "upcoming" && s.scheduledAt.startsWith("2026-06-12"))
  const upcomingLater = LIVE_SESSIONS.filter((s) => s.status === "upcoming" && !s.scheduledAt.startsWith("2026-06-12"))

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Live Classes</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Join live sessions, watch replays, and learn in real-time
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
              style={{ backgroundColor: "#EF444420", color: "var(--danger)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" style={{ animation: "ping 1.2s ease-in-out infinite" }} />
              {liveSessions.length} LIVE NOW
            </div>
          </div>
        </div>

        {/* LIVE NOW BANNER */}
        {liveSessions.length > 0 && (
          <div
            className="rounded-2xl p-5 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #1a0a0a 0%, #2d1010 40%, var(--bg-surface) 100%)", border: "1px solid #EF444430" }}
          >
            <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none" style={{ background: "radial-gradient(circle, rgba(239,68,68,0.12) 0%, transparent 70%)", transform: "translate(20%,-30%)" }} />
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-red-500" style={{ animation: "ping 1s ease-in-out infinite" }} />
              <span className="text-xs font-black tracking-widest uppercase" style={{ color: "var(--danger)" }}>Live Now</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {liveSessions.map((s) => (
                <Link
                  key={s.id}
                  href={`/student/live/${s.id}`}
                  className="flex items-start gap-4 p-4 rounded-xl transition-all"
                  style={{ backgroundColor: "#ffffff08", border: "1px solid #EF444420" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#ffffff12")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff08")}
                >
                  <div className="text-3xl flex-shrink-0">{s.thumbnail}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{s.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{s.instructor}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: "var(--text-tertiary)" }}>
                      <span className="flex items-center gap-1"><Users size={11} /> {s.attendees} watching</span>
                      <span className="flex items-center gap-1"><Clock size={11} /> {s.duration} min</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0" style={{ backgroundColor: "var(--danger)" }}>
                    <Play size={14} fill="#fff" color="#fff" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Tabs + search */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-default)" }}>
            {(["all", "live", "upcoming", "recordings"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="px-4 py-2 text-xs font-semibold capitalize transition-colors"
                style={{
                  backgroundColor: tab === t ? "var(--accent)" : "var(--bg-surface)",
                  color: tab === t ? "#fff" : "var(--text-tertiary)",
                  borderRight: "1px solid var(--border-default)",
                }}
              >
                {t === "live" ? "🔴 Live" : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-xs ml-auto">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sessions..."
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl outline-none"
              style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
            />
          </div>
        </div>

        {/* Today's schedule */}
        {(tab === "all" || tab === "upcoming") && upcomingToday.length > 0 && (
          <div>
            <h2 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>Today's Schedule</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingToday.map((s) => (
                <SessionCard key={s.id} session={s} />
              ))}
            </div>
          </div>
        )}

        {/* Upcoming (other days) */}
        {(tab === "all" || tab === "upcoming") && upcomingLater.length > 0 && (
          <div>
            <h2 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>Coming Up</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingLater.map((s) => (
                <SessionCard key={s.id} session={s} />
              ))}
            </div>
          </div>
        )}

        {/* Recordings */}
        {(tab === "all" || tab === "recordings") && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Past Recordings</h2>
              <Link href="/student/videos" className="text-xs" style={{ color: "var(--accent)" }}>See all in Video Library →</Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4">
              {RECORDINGS.map((r) => (
                <Link
                  key={r.id}
                  href={`/student/videos/${r.id}`}
                  className="flex items-start gap-4 p-4 rounded-xl transition-all shadow-sm"
                  style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--text-muted)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-default)")}
                >
                  <div className="w-20 h-14 rounded-lg flex-shrink-0 flex items-center justify-center text-2xl" style={{ backgroundColor: "var(--bg-surface-muted)" }}>
                    {r.thumbnail}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold line-clamp-2 leading-snug" style={{ color: "var(--text-primary)" }}>{r.title}</p>
                    <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{r.instructor}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs" style={{ color: "var(--text-tertiary)" }}>
                      <span className="flex items-center gap-1"><Clock size={11} /> {r.duration} min</span>
                      <span className="flex items-center gap-1"><Play size={11} /> {r.views.toLocaleString()} views</span>
                      <span>{r.recordedAt}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes ping { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </DashboardLayout>
  )
}

function SessionCard({ session: s }: { session: typeof LIVE_SESSIONS[0] }) {
  const isLive = s.status === "live"
  const isFull = s.attendees >= s.maxAttendees
  const fillPct = Math.round((s.attendees / s.maxAttendees) * 100)

  return (
    <div className="rounded-xl p-4 space-y-3 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: `1px solid ${isLive ? "#EF444330" : "var(--border-default)"}` }}>
      <div className="flex items-start gap-3">
        <div className="text-3xl flex-shrink-0">{s.thumbnail}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {isLive && (
              <span className="text-xs font-black px-1.5 py-0.5 rounded" style={{ backgroundColor: "#EF444420", color: "var(--danger)", fontSize: 9, letterSpacing: "0.05em" }}>
                LIVE
              </span>
            )}
          </div>
          <p className="text-sm font-semibold mt-0.5 leading-snug" style={{ color: "var(--text-primary)" }}>{s.title}</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{s.instructor}</p>
        </div>
      </div>

      <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "var(--text-tertiary)" }}>{s.description}</p>

      <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-tertiary)" }}>
        {isLive ? (
          <span className="flex items-center gap-1 font-semibold" style={{ color: "var(--danger)" }}><Users size={11} /> {s.attendees} watching</span>
        ) : (
          <span className="flex items-center gap-1"><Calendar size={11} /> {formatDate(s.scheduledAt)} · {formatTime(s.scheduledAt)}</span>
        )}
        <span className="flex items-center gap-1"><Clock size={11} /> {s.duration} min</span>
      </div>

      {isLive ? (
        <Link
          href={`/student/live/${s.id}`}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ backgroundColor: "var(--danger)" }}
        >
          <Radio size={14} /> Join Live Session
        </Link>
      ) : (
        <button
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold"
          style={{ backgroundColor: "#3B82F620", color: "#60A5FA", border: "1px solid #3B82F630" }}
        >
          <Calendar size={14} /> Register — {formatTime(s.scheduledAt)}
        </button>
      )}
    </div>
  )
}
