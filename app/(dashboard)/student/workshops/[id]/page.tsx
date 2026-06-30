"use client"

import { use, useState } from "react"
import Link from "next/link"
import {
  Calendar, Clock, Users, Star, ChevronLeft, Share2, Wrench,
  MapPin, CheckCircle2, Circle, Terminal, ExternalLink, Send,
  Mic2, Trophy, Flag, Award, Video, Building2,
} from "lucide-react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { KIND_META } from "@/components/WorkshopCard"
import { WorkshopPaymentModal } from "@/components/WorkshopPaymentModal"
import { PhaseTimeline } from "@/components/workshop/PhaseTimeline"
import { AssignmentTab } from "@/components/workshop/AssignmentTab"
import { PeerReviewTab } from "@/components/workshop/PeerReviewTab"
import { LiveSessionTab } from "@/components/workshop/LiveSessionTab"
import { ProgressTab } from "@/components/workshop/ProgressTab"
import { RecommendedSection } from "@/components/RecommendedSection"
import type { RecommendedItem } from "@/components/RecommendedSection"
import { WORKSHOPS } from "@/lib/data/workshops"
import type { Workshop } from "@/lib/data/workshops"
import { WORKSHOP_INTERIORS } from "@/lib/data/workshopInterior"
import { useWorkshopRegistrations } from "@/lib/hooks/useWorkshopRegistrations"

type Tab = "overview" | "assignment" | "peer-review" | "live" | "progress"

const TABS: { id: Tab; label: string; badge?: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "assignment", label: "Assignment", badge: "Due Jun 20" },
  { id: "peer-review", label: "Peer Reviews", badge: "3 due" },
  { id: "live", label: "Live Session" },
  { id: "progress", label: "Progress & Grades" },
]

const LEVEL_COLORS: Record<string, string> = {
  Beginner: "#10B981",
  Intermediate: "#F59E0B",
  Advanced: "#EF4444",
}

export default function WorkshopDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const ws = WORKSHOPS.find((w) => w.id === id) ?? WORKSHOPS[0]
  const interior = WORKSHOP_INTERIORS[ws.id] ?? WORKSHOP_INTERIORS["ws1"]
  const { isRegistered, toggleRegistration } = useWorkshopRegistrations()
  const registered = isRegistered(ws.id)

  const [activeTab, setActiveTab] = useState<Tab>("overview")
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [doneExercises, setDoneExercises] = useState<Set<string>>(new Set())
  const [question, setQuestion] = useState("")
  const [submittedQuestion, setSubmittedQuestion] = useState<string | null>(null)

  const toggleExercise = (exId: string) =>
    setDoneExercises((prev) => {
      const next = new Set(prev)
      next.has(exId) ? next.delete(exId) : next.add(exId)
      return next
    })

  const handleRegisterClick = () => {
    if (registered) toggleRegistration(ws.id)
    else setShowPaymentModal(true)
  }

  const spotsLeft = ws.maxAttendees - ws.attendees
  const fillPct = Math.round((ws.attendees / ws.maxAttendees) * 100)
  const kindMeta = KIND_META[ws.kind]
  const KindIcon = kindMeta.icon

  const toRecommendedItem = (w: Workshop): RecommendedItem => ({
    id: w.id,
    href: `/student/workshops/${w.id}`,
    thumbnail: w.thumbnail,
    thumbnailColor: KIND_META[w.kind].color,
    title: w.title,
    meta: w.instructor,
    rating: w.rating,
    reviewCount: w.reviewCount,
    priceLabel: w.price === 0 ? "Free" : `$${w.price}`,
  })

  const alsoBought = [...WORKSHOPS]
    .filter((w) => w.id !== ws.id)
    .sort((a, b) => b.attendees - a.attendees)
    .slice(0, 4)
    .map(toRecommendedItem)

  const alsoBoughtIds = new Set(alsoBought.map((w) => w.id))
  const recommended = [...WORKSHOPS]
    .filter((w) => w.id !== ws.id && !alsoBoughtIds.has(w.id))
    .sort((a, b) => {
      const aMatch = a.kind === ws.kind || a.tags.some((t) => ws.tags.includes(t)) ? 1 : 0
      const bMatch = b.kind === ws.kind || b.tags.some((t) => ws.tags.includes(t)) ? 1 : 0
      if (aMatch !== bMatch) return bMatch - aMatch
      return b.rating - a.rating
    })
    .slice(0, 4)
    .map(toRecommendedItem)

  return (
    <DashboardLayout role="student">
      <div className="max-w-5xl space-y-5">

        {/* Back + Share */}
        <div className="flex items-center justify-between">
          <Link href="/student/workshops" className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-tertiary)" }}>
            <ChevronLeft size={15} /> Back to Workshops
          </Link>
          <button className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ backgroundColor: "var(--bg-surface)", color: "var(--text-tertiary)", border: "1px solid var(--border-default)" }}>
            <Share2 size={12} /> Share
          </button>
        </div>

        {/* Hero */}
        <div className="rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
          <div className="p-6 relative" style={{ background: "linear-gradient(135deg, var(--bg-surface-muted) 0%, var(--bg-surface) 100%)" }}>
            <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none" style={{ background: `radial-gradient(circle, ${kindMeta.color}18 0%, transparent 70%)`, transform: "translate(20%,-30%)" }} />
            <div className="flex items-start gap-5 flex-wrap relative">
              <div className="text-5xl flex-shrink-0 w-16 h-16 flex items-center justify-center rounded-2xl" style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)" }}>
                {ws.thumbnail}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1" style={{ backgroundColor: `${kindMeta.color}18`, color: kindMeta.color }}>
                    <KindIcon size={11} /> {kindMeta.label}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${LEVEL_COLORS[ws.level]}20`, color: LEVEL_COLORS[ws.level] }}>
                    {ws.level}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--accent-subtle)", color: "var(--accent)" }}>
                    {ws.format}
                  </span>
                  {registered && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1" style={{ backgroundColor: "var(--success-bg)", color: "var(--success)" }}>
                      <CheckCircle2 size={10} /> Registered
                    </span>
                  )}
                </div>
                <h1 className="text-xl font-black leading-tight" style={{ color: "var(--text-primary)" }}>{ws.title}</h1>
                <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{ws.subtitle}</p>
                <div className="flex items-center gap-4 mt-3 text-xs flex-wrap" style={{ color: "var(--text-tertiary)" }}>
                  <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(ws.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {ws.time} – {ws.endTime}</span>
                  <span className="flex items-center gap-1"><Wrench size={12} /> {ws.duration}</span>
                  <span className="flex items-center gap-1"><Users size={12} /> {ws.attendees} registered</span>
                  <span className="flex items-center gap-1"><Star size={12} fill="#F59E0B" color="#F59E0B" /> {ws.rating} ({ws.reviewCount})</span>
                </div>
              </div>
              {/* Hero CTA */}
              <div className="flex-shrink-0 text-right hidden md:block">
                <p className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>{ws.price === 0 ? "Free" : `$${ws.price}`}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--danger)" }}>Only {spotsLeft} spots left</p>
                <button
                  onClick={handleRegisterClick}
                  className="mt-3 px-6 py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{ backgroundColor: registered ? "var(--success)" : "var(--accent)" }}
                >
                  {registered ? "✓ Registered!" : ws.price > 0 ? `Register — $${ws.price}` : "Register Free"}
                </button>
              </div>
            </div>
          </div>
          {/* Capacity bar */}
          <div style={{ padding: "0 24px 16px" }}>
            <div className="flex justify-between text-xs mb-1.5" style={{ color: "var(--text-tertiary)" }}>
              <span>{ws.attendees}/{ws.maxAttendees} seats filled</span>
              <span style={{ color: spotsLeft <= 5 ? "var(--danger)" : "var(--text-secondary)" }}>
                {spotsLeft <= 5 ? `⚠️ Only ${spotsLeft} left!` : `${spotsLeft} spots available`}
              </span>
            </div>
            <div className="h-1.5 rounded-full" style={{ backgroundColor: "var(--border-default)" }}>
              <div className="h-full rounded-full" style={{ width: `${fillPct}%`, backgroundColor: fillPct > 85 ? "var(--danger)" : "var(--accent)" }} />
            </div>
          </div>
        </div>

        {/* Phase Timeline */}
        <PhaseTimeline interior={interior} />

        {/* Tab Nav */}
        <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold flex-shrink-0 transition-colors"
              style={{
                backgroundColor: activeTab === tab.id ? "var(--accent)" : "var(--bg-surface)",
                color: activeTab === tab.id ? "#fff" : "var(--text-tertiary)",
                border: `1px solid ${activeTab === tab.id ? "var(--accent)" : "var(--border-default)"}`,
              }}
            >
              {tab.label}
              {tab.badge && (
                <span
                  className="text-xs px-1.5 py-0 rounded-full"
                  style={{
                    backgroundColor: activeTab === tab.id ? "rgba(255,255,255,0.2)" : "var(--border-default)",
                    color: activeTab === tab.id ? "#fff" : "var(--text-secondary)",
                    fontSize: 10,
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Tab: Overview ── */}
        {activeTab === "overview" && (
          <div className="grid lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              {/* About */}
              <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                <h2 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>About This {kindMeta.label}</h2>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{ws.description}</p>
                <div className="flex gap-1.5 flex-wrap mt-4">
                  {ws.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--accent-subtle)", color: "var(--accent)", border: "1px solid var(--border-default)" }}>{tag}</span>
                  ))}
                </div>
              </div>

              {/* Lab */}
              {ws.kind === "lab" && (
                <>
                  <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                    <h2 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}><Terminal size={15} style={{ color: "var(--success)" }} /> Environment & Setup</h2>
                    <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--text-secondary)" }}>{ws.environment}</p>
                    <div className="flex items-center gap-2 p-3 rounded-xl" style={{ backgroundColor: "var(--bg-surface-muted)" }}>
                      <ExternalLink size={13} style={{ color: "var(--text-tertiary)", flexShrink: 0 }} />
                      <span className="text-xs font-mono" style={{ color: "var(--accent)" }}>{ws.repoUrl}</span>
                    </div>
                  </div>
                  <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Hands-on Exercises</h2>
                      <span className="text-xs font-semibold" style={{ color: "var(--success)" }}>{doneExercises.size}/{ws.exercises?.length ?? 0} done</span>
                    </div>
                    <div className="space-y-2">
                      {ws.exercises?.map((ex) => {
                        const done = doneExercises.has(ex.id)
                        return (
                          <button key={ex.id} onClick={() => toggleExercise(ex.id)} className="w-full flex items-center gap-3 p-3 rounded-xl text-left" style={{ backgroundColor: "var(--bg-surface-muted)" }}>
                            {done ? <CheckCircle2 size={16} style={{ color: "var(--success)", flexShrink: 0 }} /> : <Circle size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />}
                            <span className="text-xs flex-1" style={{ color: done ? "var(--text-tertiary)" : "var(--text-secondary)", textDecoration: done ? "line-through" : "none" }}>{ex.title}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* In-person */}
              {ws.kind === "in-person" && ws.venue && (
                <>
                  <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                    <h2 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}><MapPin size={15} style={{ color: "var(--warning)" }} /> Venue</h2>
                    <div className="rounded-xl p-4 mb-3" style={{ backgroundColor: "var(--bg-surface-muted)" }}>
                      <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{ws.venue.name}</p>
                      <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{ws.venue.address}, {ws.venue.city}</p>
                      {ws.venue.room && <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{ws.venue.room}</p>}
                    </div>
                    <div className="rounded-xl flex items-center justify-center text-xs" style={{ height: 140, backgroundColor: "var(--bg-surface-muted)", color: "var(--text-muted)", border: "1px dashed var(--border-default)" }}>Map preview</div>
                  </div>
                  <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                    <h2 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>What to Bring</h2>
                    <div className="space-y-2">
                      {ws.whatToBring?.map((item) => (
                        <div key={item} className="flex items-start gap-2">
                          <span style={{ color: "var(--warning)", flexShrink: 0, marginTop: 1, fontSize: 14 }}>·</span>
                          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Panel */}
              {ws.kind === "panel" && (
                <>
                  <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                    <h2 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}><Mic2 size={15} style={{ color: "#8B5CF6" }} /> Speaker Lineup</h2>
                    <div className="space-y-3">
                      {ws.speakers?.map((s) => (
                        <div key={s.name} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: "var(--bg-surface-muted)" }}>
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ backgroundColor: "#8B5CF6" }}>{s.avatar}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{s.name}</p>
                            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{s.title}</p>
                          </div>
                          <span className="text-xs text-right flex-shrink-0" style={{ color: "#A78BFA", maxWidth: 140 }}>{s.topic}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                    <h2 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>Ask the Panel</h2>
                    <div className="flex items-center gap-2 mb-4">
                      <input value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (() => { if (!question.trim()) return; setSubmittedQuestion(question.trim()); setQuestion("") })()} placeholder="Type your question…" className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none" style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }} />
                      <button onClick={() => { if (!question.trim()) return; setSubmittedQuestion(question.trim()); setQuestion("") }} className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0" style={{ backgroundColor: "var(--accent)" }}>
                        <Send size={14} color="#fff" />
                      </button>
                    </div>
                    {submittedQuestion && (
                      <div className="flex items-center gap-2 p-2.5 rounded-xl mb-4 text-xs" style={{ backgroundColor: "var(--success-bg)", color: "var(--success)" }}>
                        <CheckCircle2 size={13} /> Submitted: &ldquo;{submittedQuestion}&rdquo;
                      </div>
                    )}
                    <div className="space-y-2">
                      {ws.sampleQuestions?.map((q) => (
                        <p key={q} className="text-xs p-2.5 rounded-xl" style={{ backgroundColor: "var(--bg-surface-muted)", color: "var(--text-secondary)" }}>{q}</p>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Hackathon */}
              {ws.kind === "hackathon" && (
                <>
                  <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                    <h2 className="text-sm font-bold mb-4" style={{ color: "var(--text-primary)" }}>Event Timeline</h2>
                    <div className="space-y-2">
                      {ws.milestones?.map((m) => (
                        <div key={m.title} className="flex items-center gap-4 p-3 rounded-xl" style={{ backgroundColor: "var(--bg-surface-muted)" }}>
                          <span className="text-xs font-semibold w-20 flex-shrink-0" style={{ color: "#EC4899" }}>{m.time}</span>
                          <span className="text-xs flex-1" style={{ color: "var(--text-primary)" }}>{m.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                    <h2 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}><Trophy size={15} style={{ color: "#EC4899" }} /> Prizes</h2>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {ws.prizes?.map((p) => (
                        <div key={p.place} className="p-3 rounded-xl" style={{ backgroundColor: "var(--bg-surface-muted)" }}>
                          <p className="text-xs font-bold" style={{ color: "#EC4899" }}>{p.place}</p>
                          <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{p.reward}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                    <h2 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}><Flag size={15} style={{ color: "var(--accent)" }} /> Judging Criteria</h2>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {ws.judgingCriteria?.map((c) => (
                        <div key={c} className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                          <CheckCircle2 size={13} style={{ color: "var(--success)", flexShrink: 0 }} /> {c}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Live */}
              {ws.kind === "live" && (
                <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                  <h2 className="text-sm font-bold mb-4" style={{ color: "var(--text-primary)" }}>Workshop Agenda</h2>
                  <div className="space-y-2">
                    {ws.agenda.map((item, i) => (
                      <div key={item} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: "var(--bg-surface-muted)" }}>
                        <span className="text-xs font-black w-6 flex-shrink-0" style={{ color: "var(--border-default)" }}>{String(i + 1).padStart(2, "0")}</span>
                        <span className="text-xs flex-1" style={{ color: "var(--text-primary)" }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="rounded-2xl p-5 sticky top-4 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                <p className="text-3xl font-black mb-1" style={{ color: "var(--text-primary)" }}>{ws.price === 0 ? "Free" : `$${ws.price}`}</p>
                <p className="text-xs mb-4" style={{ color: "var(--danger)" }}>⚠️ Only {spotsLeft} of {ws.maxAttendees} spots left</p>
                <button
                  onClick={handleRegisterClick}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white mb-3"
                  style={{ backgroundColor: registered ? "var(--success)" : "var(--accent)" }}
                >
                  {registered ? "✓ You're Registered!" : ws.price === 0 ? "Register — Free" : `Register — $${ws.price}`}
                </button>
                <div className="mt-3 space-y-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                  {[
                    { icon: Calendar, text: new Date(ws.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) },
                    { icon: Clock, text: ws.time + " – " + ws.endTime },
                    { icon: Wrench, text: ws.duration + " live session" },
                    { icon: ws.kind === "in-person" ? MapPin : Users, text: ws.kind === "in-person" && ws.venue ? ws.venue.city : ws.format },
                    { icon: Users, text: `${ws.attendees} already registered` },
                  ].map(({ icon: Icon, text }, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <Icon size={12} style={{ flexShrink: 0 }} /><span>{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                <h3 className="text-xs font-bold mb-3" style={{ color: "var(--text-primary)" }}>
                  {ws.kind === "hackathon" ? "Hosted By" : ws.kind === "panel" ? "Moderator" : "Instructor"}
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ backgroundColor: "var(--accent)" }}>{ws.instructorAvatar}</div>
                  <div>
                    <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{ws.instructor}</p>
                    <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{ws.instructorTitle}</p>
                  </div>
                </div>
              </div>

              {ws.kind === "hackathon" && (
                <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                  <h3 className="text-xs font-bold mb-2 flex items-center gap-2" style={{ color: "var(--text-primary)" }}><Award size={13} style={{ color: "#EC4899" }} /> Find a Team</h3>
                  <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--text-secondary)" }}>Flying solo? We&apos;ll match you with other registered builders before kickoff.</p>
                  <button className="w-full py-2 rounded-xl text-xs font-semibold" style={{ backgroundColor: "var(--border-default)", color: "var(--text-secondary)" }}>Join Team Matching</button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "assignment" && <AssignmentTab interior={interior} />}
        {activeTab === "peer-review" && <PeerReviewTab interior={interior} />}
        {activeTab === "live" && <LiveSessionTab interior={interior} />}
        {activeTab === "progress" && <ProgressTab interior={interior} />}

        {/* Students also bought + Recommended */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RecommendedSection title="Students Also Bought" items={alsoBought} />
          <RecommendedSection title="Recommended For You" items={recommended} />
        </div>
      </div>

      {showPaymentModal && (
        <WorkshopPaymentModal
          workshop={ws}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => { toggleRegistration(ws.id); setShowPaymentModal(false) }}
        />
      )}
    </DashboardLayout>
  )
}
