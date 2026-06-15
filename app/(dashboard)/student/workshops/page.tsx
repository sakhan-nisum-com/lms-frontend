"use client"

import Link from "next/link"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Calendar, Clock, Users, MapPin, Star, ChevronRight, Search, Wrench, CheckCircle, Tag } from "lucide-react"
import { useState, useEffect } from "react"

const WORKSHOPS = [
  {
    id: "ws1",
    title: "Build a Production-Ready Next.js App",
    subtitle: "Full-stack workshop with real deployment",
    thumbnail: "⚛️",
    instructor: "Sarah Chen",
    instructorAvatar: "SC",
    instructorTitle: "Senior Engineer @ Vercel",
    date: "2026-06-20",
    time: "10:00 AM",
    endTime: "4:00 PM",
    duration: "6 hours",
    attendees: 38,
    maxAttendees: 50,
    price: 49,
    level: "Intermediate",
    format: "Virtual",
    tags: ["Next.js", "React", "TypeScript", "Deployment"],
    rating: 4.9,
    reviewCount: 214,
    registered: true,
    agenda: ["Setup & project scaffold", "Server Components deep dive", "Database integration with Prisma", "Auth with NextAuth.js", "Deployment to Vercel"],
  },
  {
    id: "ws2",
    title: "System Design Intensive",
    subtitle: "Design 3 real systems from scratch with live review",
    thumbnail: "🏗️",
    instructor: "Lisa Wang",
    instructorAvatar: "LW",
    instructorTitle: "Staff Engineer @ Stripe",
    date: "2026-06-22",
    time: "9:00 AM",
    endTime: "5:00 PM",
    duration: "8 hours",
    attendees: 24,
    maxAttendees: 30,
    price: 79,
    level: "Advanced",
    format: "Virtual",
    tags: ["System Design", "Architecture", "Interview"],
    rating: 4.8,
    reviewCount: 156,
    registered: false,
    agenda: ["URL Shortener design", "Chat application at scale", "Ride-sharing backend", "Whiteboard review sessions"],
  },
  {
    id: "ws3",
    title: "Figma to Code: UI Engineering",
    subtitle: "Bridge the gap between design and implementation",
    thumbnail: "🎨",
    instructor: "Alex Torres",
    instructorAvatar: "AT",
    instructorTitle: "Design Engineer @ Airbnb",
    date: "2026-06-25",
    time: "1:00 PM",
    endTime: "5:00 PM",
    duration: "4 hours",
    attendees: 61,
    maxAttendees: 100,
    price: 29,
    level: "Beginner",
    format: "Virtual",
    tags: ["Figma", "CSS", "UI", "Design Systems"],
    rating: 4.7,
    reviewCount: 89,
    registered: false,
    agenda: ["Reading Figma specs", "CSS custom properties & tokens", "Responsive layout strategies", "Accessibility audit walkthrough"],
  },
  {
    id: "ws4",
    title: "DevOps Bootcamp: CI/CD Pipelines",
    subtitle: "Configure GitHub Actions, Docker, and K8s from zero",
    thumbnail: "🐳",
    instructor: "James Park",
    instructorAvatar: "JP",
    instructorTitle: "Platform Engineer @ Cloudflare",
    date: "2026-07-03",
    time: "10:00 AM",
    endTime: "4:00 PM",
    duration: "6 hours",
    attendees: 19,
    maxAttendees: 40,
    price: 59,
    level: "Intermediate",
    format: "Virtual",
    tags: ["Docker", "Kubernetes", "GitHub Actions", "DevOps"],
    rating: 4.8,
    reviewCount: 103,
    registered: false,
    agenda: ["GitHub Actions workflows", "Dockerizing applications", "Kubernetes basics", "Blue/green deployments", "Monitoring & alerting"],
  },
  {
    id: "ws5",
    title: "Ethical Hacking & Penetration Testing",
    subtitle: "Hands-on lab with CTF-style challenges",
    thumbnail: "🔐",
    instructor: "Marcus Reed",
    instructorAvatar: "MR",
    instructorTitle: "Security Researcher",
    date: "2026-07-10",
    time: "2:00 PM",
    endTime: "6:00 PM",
    duration: "4 hours",
    attendees: 33,
    maxAttendees: 50,
    price: 39,
    level: "Advanced",
    format: "Virtual",
    tags: ["Security", "CTF", "Pentesting", "OWASP"],
    rating: 4.9,
    reviewCount: 178,
    registered: false,
    agenda: ["OWASP Top 10 overview", "SQLi & XSS exploitation", "Burp Suite walkthrough", "CTF challenge lab"],
  },
]

const LEVEL_COLORS: Record<string, string> = { Beginner: "#10B981", Intermediate: "#F59E0B", Advanced: "#EF4444" }

function Countdown({ target }: { target: string }) {
  const [timeLeft, setTimeLeft] = useState("")
  useEffect(() => {
    const calc = () => {
      const diff = new Date(target).getTime() - Date.now()
      if (diff <= 0) { setTimeLeft("Started!"); return }
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      setTimeLeft(d > 0 ? `${d}d ${h}h` : `${h}h ${m}m`)
    }
    calc()
    const t = setInterval(calc, 60000)
    return () => clearInterval(t)
  }, [target])
  return <span>{timeLeft}</span>
}

export default function WorkshopsPage() {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "registered" | "upcoming">("all")
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set(["ws1"]))

  const filtered = WORKSHOPS.filter((w) => {
    const matchesSearch = w.title.toLowerCase().includes(search.toLowerCase()) || w.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    const matchesFilter = filter === "all" || (filter === "registered" && registeredIds.has(w.id))
    return matchesSearch && matchesFilter
  })

  const register = (id: string) => {
    setRegisteredIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Workshops</h1>
          <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>Intensive hands-on sessions with expert instructors</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Upcoming", value: WORKSHOPS.length, color: "#3B82F6" },
            { label: "Registered", value: registeredIds.size, color: "#10B981" },
            { label: "Completed", value: 2, color: "#F59E0B" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl p-4 text-center" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
              <p className="text-2xl font-black" style={{ color }}>{value}</p>
              <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Filters + search */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid #334155" }}>
            {(["all", "registered", "upcoming"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-4 py-2 text-xs font-semibold capitalize transition-colors"
                style={{ backgroundColor: filter === f ? "#3B82F6" : "#1E293B", color: filter === f ? "#fff" : "#64748B", borderRight: "1px solid #334155" }}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-xs ml-auto">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#64748B" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search workshops..."
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl outline-none"
              style={{ backgroundColor: "#1E293B", border: "1px solid #334155", color: "#F8FAFC" }}
            />
          </div>
        </div>

        {/* Workshop cards */}
        <div className="grid lg:grid-cols-2 gap-5">
          {filtered.map((ws) => {
            const isRegistered = registeredIds.has(ws.id)
            const spotsLeft = ws.maxAttendees - ws.attendees
            const fillPct = Math.round((ws.attendees / ws.maxAttendees) * 100)

            return (
              <div key={ws.id} className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#1E293B", border: `1px solid ${isRegistered ? "#3B82F630" : "#334155"}` }}>
                {/* Top */}
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-2xl" style={{ backgroundColor: "#0F172A" }}>
                      {ws.thumbnail}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {isRegistered && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1" style={{ backgroundColor: "#10B98120", color: "#10B981" }}>
                            <CheckCircle size={10} /> Registered
                          </span>
                        )}
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${LEVEL_COLORS[ws.level]}20`, color: LEVEL_COLORS[ws.level] }}>
                          {ws.level}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white leading-snug">{ws.title}</h3>
                      <p className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>{ws.subtitle}</p>
                    </div>
                  </div>

                  {/* Instructor */}
                  <div className="flex items-center gap-3 mt-4 p-3 rounded-xl" style={{ backgroundColor: "#0F172A" }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ backgroundColor: "#3B82F6" }}>
                      {ws.instructorAvatar}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">{ws.instructor}</p>
                      <p className="text-xs" style={{ color: "#64748B" }}>{ws.instructorTitle}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-1">
                      <Star size={11} fill="#F59E0B" color="#F59E0B" />
                      <span className="text-xs font-semibold text-white">{ws.rating}</span>
                      <span className="text-xs" style={{ color: "#64748B" }}>({ws.reviewCount})</span>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs" style={{ color: "#94A3B8" }}>
                    <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(ws.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    <span className="flex items-center gap-1.5"><Clock size={12} /> {ws.time} – {ws.endTime}</span>
                    <span className="flex items-center gap-1.5"><Wrench size={12} /> {ws.duration}</span>
                    <span className="flex items-center gap-1.5"><MapPin size={12} /> {ws.format}</span>
                  </div>

                  {/* Tags */}
                  <div className="flex gap-1.5 flex-wrap mt-3">
                    {ws.tags.map((tag) => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#3B82F610", color: "#60A5FA", border: "1px solid #3B82F625" }}>{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Capacity bar */}
                <div style={{ borderTop: "1px solid #334155", padding: "10px 20px" }}>
                  <div className="flex items-center justify-between text-xs mb-1.5" style={{ color: "#64748B" }}>
                    <span className="flex items-center gap-1"><Users size={11} /> {ws.attendees}/{ws.maxAttendees} seats</span>
                    <span style={{ color: spotsLeft <= 5 ? "#EF4444" : "#94A3B8" }}>
                      {spotsLeft <= 5 ? `⚠️ Only ${spotsLeft} left!` : `${spotsLeft} spots available`}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ backgroundColor: "#334155" }}>
                    <div className="h-full rounded-full" style={{ width: `${fillPct}%`, backgroundColor: fillPct > 85 ? "#EF4444" : "#3B82F6" }} />
                  </div>
                </div>

                {/* Footer */}
                <div style={{ borderTop: "1px solid #334155", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <div>
                    <p className="text-xl font-black text-white">${ws.price}</p>
                    <p className="text-xs" style={{ color: "#64748B" }}>
                      Starts in <span style={{ color: "#F59E0B", fontWeight: 700 }}><Countdown target={`${ws.date}T${ws.time === "10:00 AM" ? "10:00" : ws.time === "9:00 AM" ? "09:00" : ws.time === "1:00 PM" ? "13:00" : ws.time === "2:00 PM" ? "14:00" : "10:00"}:00`} /></span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/student/workshops/${ws.id}`}
                      className="px-3 py-2 rounded-xl text-xs font-semibold"
                      style={{ backgroundColor: "#334155", color: "#94A3B8" }}
                    >
                      Details
                    </Link>
                    <button
                      onClick={() => register(ws.id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold"
                      style={{
                        backgroundColor: isRegistered ? "#10B98120" : "#3B82F6",
                        color: isRegistered ? "#10B981" : "#fff",
                        border: isRegistered ? "1px solid #10B98140" : "none",
                      }}
                    >
                      {isRegistered ? "✓ Registered" : "Register Now"}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16" style={{ color: "#64748B" }}>
            <p className="text-4xl mb-3">🔧</p>
            <p className="text-sm font-semibold">No workshops found</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
