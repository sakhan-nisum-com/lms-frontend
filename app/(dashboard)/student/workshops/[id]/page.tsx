"use client"

import { use, useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import {
  Calendar, Clock, Users, MapPin, Star, ChevronLeft, CheckCircle,
  Download, Share2, Wrench, ChevronDown, ChevronUp, Video,
} from "lucide-react"

const WS = {
  id: "ws1",
  title: "Build a Production-Ready Next.js App",
  subtitle: "Full-stack workshop with real deployment to Vercel",
  thumbnail: "⚛️",
  instructor: "Sarah Chen",
  instructorAvatar: "SC",
  instructorTitle: "Senior Engineer @ Vercel",
  instructorBio: "Sarah has 8+ years of experience building production React applications. She's a Next.js core contributor and has trained 2,000+ developers worldwide.",
  date: "June 20, 2026",
  time: "10:00 AM – 4:00 PM UTC",
  duration: "6 hours",
  attendees: 38,
  maxAttendees: 50,
  price: 49,
  level: "Intermediate",
  format: "Virtual (Zoom)",
  rating: 4.9,
  reviewCount: 214,
  description: "In this intensive 6-hour workshop, you'll go from a blank repository to a fully deployed, production-grade Next.js application. We'll cover server components, database integration with Prisma, authentication, and CI/CD deployment — all in one day. You'll leave with a portfolio-ready project and hands-on experience with the latest patterns.",
  requirements: ["Basic React knowledge", "Familiarity with JavaScript/TypeScript", "Node.js installed", "VS Code or similar editor"],
  whatYouLearn: [
    "Structure a Next.js 14 project with App Router",
    "Build server components and streaming UIs",
    "Integrate PostgreSQL with Prisma ORM",
    "Implement auth with NextAuth.js",
    "Deploy to Vercel with preview environments",
    "Write integration tests with Playwright",
  ],
  agenda: [
    { time: "10:00 AM", title: "Setup & Project Scaffold", duration: "45 min", description: "Clone starter repo, understand folder structure, configure TypeScript and ESLint." },
    { time: "10:45 AM", title: "Server Components Deep Dive", duration: "60 min", description: "Understand RSC vs client components, streaming with Suspense, and data fetching patterns." },
    { time: "11:45 AM", title: "Break", duration: "15 min", description: "" },
    { time: "12:00 PM", title: "Database Integration with Prisma", duration: "75 min", description: "Schema design, migrations, seeding, and server-side queries with proper error handling." },
    { time: "1:15 PM", title: "Lunch Break", duration: "30 min", description: "" },
    { time: "1:45 PM", title: "Auth with NextAuth.js", duration: "60 min", description: "OAuth providers, JWT sessions, protected routes, and role-based access control." },
    { time: "2:45 PM", title: "Deployment & CI/CD", duration: "45 min", description: "GitHub Actions pipeline, Vercel previews, environment variables, and monitoring." },
    { time: "3:30 PM", title: "Testing & Q&A", duration: "30 min", description: "Playwright e2e tests + open Q&A and code review." },
  ],
  materials: [
    { name: "Workshop Starter Repo", type: "GitHub" },
    { name: "Slide Deck (PDF)", type: "PDF" },
    { name: "Prisma Cheat Sheet", type: "PDF" },
    { name: "NextAuth.js Config Templates", type: "ZIP" },
  ],
  reviews: [
    { user: "James P.", avatar: "JP", rating: 5, text: "Best workshop I've attended. The pace was perfect and Sarah explains complex topics simply.", date: "Jun 2026" },
    { user: "Priya S.", avatar: "PS", rating: 5, text: "Walked in knowing basic React, left with a full deployed app. Worth every penny.", date: "May 2026" },
    { user: "Alex T.", avatar: "AT", rating: 4, text: "Excellent content. Could use a bit more time on the auth section but overall incredible.", date: "May 2026" },
  ],
}

export default function WorkshopDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [registered, setRegistered] = useState(false)
  const [expandedAgenda, setExpandedAgenda] = useState<number | null>(null)
  const spotsLeft = WS.maxAttendees - WS.attendees

  return (
    <DashboardLayout role="student">
      <div className="max-w-4xl space-y-6">

        {/* Back */}
        <Link href="/student/workshops" className="flex items-center gap-1.5 text-sm w-fit" style={{ color: "#64748B" }}>
          <ChevronLeft size={15} /> Back to Workshops
        </Link>

        {/* Hero */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
          <div className="p-6 relative" style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)" }}>
            <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none" style={{ background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)", transform: "translate(20%,-30%)" }} />
            <div className="flex items-start gap-5 relative">
              <div className="text-5xl flex-shrink-0 w-16 h-16 flex items-center justify-center rounded-2xl" style={{ backgroundColor: "#0F172A", border: "1px solid #334155" }}>
                {WS.thumbnail}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#F59E0B20", color: "#F59E0B" }}>{WS.level}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#3B82F615", color: "#60A5FA" }}>{WS.format}</span>
                </div>
                <h1 className="text-xl font-black text-white leading-tight">{WS.title}</h1>
                <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>{WS.subtitle}</p>

                <div className="flex items-center gap-4 mt-3 text-xs flex-wrap" style={{ color: "#64748B" }}>
                  <span className="flex items-center gap-1"><Calendar size={12} /> {WS.date}</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {WS.time}</span>
                  <span className="flex items-center gap-1"><Users size={12} /> {WS.attendees}/{WS.maxAttendees} registered</span>
                  <span className="flex items-center gap-1"><Star size={12} fill="#F59E0B" color="#F59E0B" /> {WS.rating} ({WS.reviewCount} reviews)</span>
                </div>
              </div>

              {/* Price + CTA */}
              <div className="flex-shrink-0 text-right hidden md:block">
                <p className="text-3xl font-black text-white">${WS.price}</p>
                <p className="text-xs mt-0.5" style={{ color: "#EF4444" }}>Only {spotsLeft} spots left</p>
                <button
                  onClick={() => setRegistered(!registered)}
                  className="mt-3 px-6 py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{ backgroundColor: registered ? "#10B981" : "#3B82F6" }}
                >
                  {registered ? "✓ Registered!" : "Register Now"}
                </button>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ padding: "0 24px 16px" }}>
            <div className="h-1.5 rounded-full" style={{ backgroundColor: "#334155" }}>
              <div className="h-full rounded-full" style={{ width: `${Math.round((WS.attendees / WS.maxAttendees) * 100)}%`, backgroundColor: "#3B82F6" }} />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left — main content */}
          <div className="lg:col-span-2 space-y-6">

            {/* About */}
            <div className="rounded-2xl p-5" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
              <h2 className="text-sm font-bold text-white mb-3">About This Workshop</h2>
              <p className="text-sm leading-relaxed" style={{ color: "#94A3B8" }}>{WS.description}</p>
            </div>

            {/* What you'll learn */}
            <div className="rounded-2xl p-5" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
              <h2 className="text-sm font-bold text-white mb-4">What You'll Learn</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {WS.whatYouLearn.map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <CheckCircle size={14} style={{ color: "#10B981", flexShrink: 0, marginTop: 1 }} />
                    <span className="text-xs leading-relaxed" style={{ color: "#CBD5E1" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Agenda */}
            <div className="rounded-2xl p-5" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
              <h2 className="text-sm font-bold text-white mb-4">Workshop Agenda</h2>
              <div className="space-y-2">
                {WS.agenda.map((item, i) => {
                  const isBreak = item.title.includes("Break")
                  const expanded = expandedAgenda === i
                  return (
                    <div key={i} style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #334155", backgroundColor: "#0F172A" }}>
                      <button
                        onClick={() => !isBreak && setExpandedAgenda(expanded ? null : i)}
                        className="w-full flex items-center gap-4 p-3 text-left"
                        style={{ cursor: isBreak ? "default" : "pointer", backgroundColor: "transparent" }}
                      >
                        <span className="text-xs w-16 flex-shrink-0 font-semibold" style={{ color: "#3B82F6" }}>{item.time}</span>
                        <span className="flex-1 text-xs font-semibold text-white">{item.title}</span>
                        <span className="text-xs flex-shrink-0" style={{ color: "#64748B" }}>{item.duration}</span>
                        {!isBreak && (expanded ? <ChevronUp size={13} style={{ color: "#64748B", flexShrink: 0 }} /> : <ChevronDown size={13} style={{ color: "#64748B", flexShrink: 0 }} />)}
                      </button>
                      {expanded && item.description && (
                        <div style={{ padding: "0 12px 12px 60px" }}>
                          <p className="text-xs leading-relaxed" style={{ color: "#64748B" }}>{item.description}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Reviews */}
            <div className="rounded-2xl p-5" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-white">Reviews</h2>
                <div className="flex items-center gap-1.5">
                  <Star size={14} fill="#F59E0B" color="#F59E0B" />
                  <span className="text-sm font-bold text-white">{WS.rating}</span>
                  <span className="text-xs" style={{ color: "#64748B" }}>({WS.reviewCount})</span>
                </div>
              </div>
              <div className="space-y-4">
                {WS.reviews.map((r) => (
                  <div key={r.user} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ backgroundColor: "#334155" }}>{r.avatar}</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-white">{r.user}</span>
                        <span className="text-xs" style={{ color: "#475569" }}>{r.date}</span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={10} fill={i < r.rating ? "#F59E0B" : "none"} color="#F59E0B" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: "#94A3B8" }}>{r.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* CTA card */}
            <div className="rounded-2xl p-5 sticky top-4" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
              <p className="text-3xl font-black text-white mb-1">${WS.price}</p>
              <p className="text-xs mb-4" style={{ color: "#EF4444" }}>⚠️ Only {spotsLeft} of {WS.maxAttendees} spots left</p>
              <button
                onClick={() => setRegistered(!registered)}
                className="w-full py-3 rounded-xl text-sm font-bold text-white mb-3"
                style={{ backgroundColor: registered ? "#10B981" : "#3B82F6" }}
              >
                {registered ? "✓ You're Registered!" : "Register Now — $" + WS.price}
              </button>
              <button className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2" style={{ backgroundColor: "#334155", color: "#94A3B8" }}>
                <Share2 size={14} /> Share Workshop
              </button>

              <div className="mt-4 space-y-2 text-xs" style={{ color: "#94A3B8" }}>
                {[
                  { icon: Calendar, text: WS.date },
                  { icon: Clock, text: WS.time },
                  { icon: Wrench, text: WS.duration + " live session" },
                  { icon: Video, text: WS.format },
                  { icon: Users, text: `${WS.attendees} already registered` },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2.5">
                    <Icon size={12} style={{ flexShrink: 0 }} />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructor */}
            <div className="rounded-2xl p-5" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
              <h3 className="text-xs font-bold text-white mb-3">Instructor</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: "#3B82F6" }}>{WS.instructorAvatar}</div>
                <div>
                  <p className="text-xs font-bold text-white">{WS.instructor}</p>
                  <p className="text-xs" style={{ color: "#64748B" }}>{WS.instructorTitle}</p>
                </div>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "#94A3B8" }}>{WS.instructorBio}</p>
            </div>

            {/* Materials */}
            <div className="rounded-2xl p-5" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
              <h3 className="text-xs font-bold text-white mb-3">Workshop Materials</h3>
              <div className="space-y-2">
                {WS.materials.map((m) => (
                  <button key={m.name} className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left" style={{ backgroundColor: "#0F172A" }}>
                    <Download size={13} style={{ color: "#64748B", flexShrink: 0 }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{m.name}</p>
                      <p className="text-xs" style={{ color: "#475569" }}>{m.type}</p>
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-xs mt-3" style={{ color: "#475569" }}>Materials unlocked after registration</p>
            </div>

            {/* Requirements */}
            <div className="rounded-2xl p-5" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
              <h3 className="text-xs font-bold text-white mb-3">Prerequisites</h3>
              <div className="space-y-2">
                {WS.requirements.map((req) => (
                  <div key={req} className="flex items-start gap-2">
                    <span style={{ color: "#3B82F6", flexShrink: 0, marginTop: 1, fontSize: 14 }}>·</span>
                    <span className="text-xs" style={{ color: "#94A3B8" }}>{req}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
