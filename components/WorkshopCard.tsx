"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Calendar, Clock, Users, MapPin, Star, Wrench, CheckCircle,
  Video, Terminal, Mic2, Trophy, Building2,
} from "lucide-react"
import type { Workshop, WorkshopKind } from "@/lib/data/workshops"

const LEVEL_COLORS: Record<string, string> = { Beginner: "#10B981", Intermediate: "#F59E0B", Advanced: "#EF4444" }

const TIME_24H: Record<string, string> = {
  "10:00 AM": "10:00", "9:00 AM": "09:00", "11:00 AM": "11:00",
  "1:00 PM": "13:00", "2:00 PM": "14:00", "6:00 PM": "18:00",
}

export const KIND_META: Record<WorkshopKind, { label: string; icon: React.ElementType; color: string }> = {
  live: { label: "Live Workshop", icon: Video, color: "#3B82F6" },
  lab: { label: "Hands-on Lab", icon: Terminal, color: "#10B981" },
  "in-person": { label: "In-Person", icon: Building2, color: "#F59E0B" },
  panel: { label: "Panel Discussion", icon: Mic2, color: "#8B5CF6" },
  hackathon: { label: "Hackathon", icon: Trophy, color: "#EC4899" },
}

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

interface WorkshopCardProps {
  workshop: Workshop
  isRegistered: boolean
  onToggleRegister: () => void
  onBuyOrRegister?: () => void
}

export function WorkshopCard({ workshop: ws, isRegistered, onToggleRegister, onBuyOrRegister }: WorkshopCardProps) {
  const spotsLeft = ws.maxAttendees - ws.attendees
  const fillPct = Math.round((ws.attendees / ws.maxAttendees) * 100)
  const kindMeta = KIND_META[ws.kind]
  const KindIcon = kindMeta.icon
  const locationLabel = ws.kind === "in-person" && ws.venue ? ws.venue.city : ws.format

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: `1px solid ${isRegistered ? "#3B82F630" : "var(--border-default)"}` }}>
      {/* Top */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="text-4xl flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-2xl" style={{ backgroundColor: "var(--bg-surface-muted)" }}>
            {ws.thumbnail}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1" style={{ backgroundColor: `${kindMeta.color}18`, color: kindMeta.color }}>
                <KindIcon size={10} /> {kindMeta.label}
              </span>
              {isRegistered && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1" style={{ backgroundColor: "#10B98120", color: "#10B981" }}>
                  <CheckCircle size={10} /> Registered
                </span>
              )}
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${LEVEL_COLORS[ws.level]}20`, color: LEVEL_COLORS[ws.level] }}>
                {ws.level}
              </span>
            </div>
            <h3 className="text-sm font-bold leading-snug" style={{ color: "var(--text-primary)" }}>{ws.title}</h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{ws.subtitle}</p>
          </div>
        </div>

        {/* Instructor */}
        <div className="flex items-center gap-3 mt-4 p-3 rounded-xl" style={{ backgroundColor: "var(--bg-surface-muted)" }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ backgroundColor: "var(--accent)" }}>
            {ws.instructorAvatar}
          </div>
          <div>
            <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{ws.instructor}</p>
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{ws.instructorTitle}</p>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <Star size={11} fill="#F59E0B" color="#F59E0B" />
            <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{ws.rating}</span>
            <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>({ws.reviewCount})</span>
          </div>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 gap-2 mt-4 text-xs" style={{ color: "var(--text-secondary)" }}>
          <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(ws.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
          <span className="flex items-center gap-1.5"><Clock size={12} /> {ws.time} – {ws.endTime}</span>
          <span className="flex items-center gap-1.5"><Wrench size={12} /> {ws.duration}</span>
          <span className="flex items-center gap-1.5"><MapPin size={12} /> {locationLabel}</span>
        </div>

        {/* Kind-specific teaser */}
        {ws.kind === "panel" && ws.speakers && (
          <p className="text-xs mt-3" style={{ color: "#A78BFA" }}>🎙️ {ws.speakers.length} speakers on the panel</p>
        )}
        {ws.kind === "hackathon" && ws.prizes && (
          <p className="text-xs mt-3" style={{ color: "#EC4899" }}>🏆 Top prize: {ws.prizes[0].reward}</p>
        )}
        {ws.kind === "lab" && ws.exercises && (
          <p className="text-xs mt-3" style={{ color: "var(--success)" }}>💻 {ws.exercises.length} hands-on exercises</p>
        )}

        {/* Tags */}
        <div className="flex gap-1.5 flex-wrap mt-3">
          {ws.tags.map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#3B82F610", color: "#60A5FA", border: "1px solid #3B82F625" }}>{tag}</span>
          ))}
        </div>
      </div>

      {/* Capacity bar */}
      <div style={{ borderTop: "1px solid var(--border-default)", padding: "10px 20px" }}>
        <div className="flex items-center justify-between text-xs mb-1.5" style={{ color: "var(--text-tertiary)" }}>
          <span className="flex items-center gap-1"><Users size={11} /> {ws.attendees}/{ws.maxAttendees} seats</span>
          <span style={{ color: spotsLeft <= 5 ? "var(--danger)" : "var(--text-secondary)" }}>
            {spotsLeft <= 5 ? `⚠️ Only ${spotsLeft} left!` : `${spotsLeft} spots available`}
          </span>
        </div>
        <div className="h-1.5 rounded-full" style={{ backgroundColor: "var(--border-default)" }}>
          <div className="h-full rounded-full" style={{ width: `${fillPct}%`, backgroundColor: fillPct > 85 ? "var(--danger)" : "var(--accent)" }} />
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid var(--border-default)", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div>
          <p className="text-xl font-black" style={{ color: "var(--text-primary)" }}>{ws.price === 0 ? "Free" : `$${ws.price}`}</p>
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            Starts in <span style={{ color: "var(--warning)", fontWeight: 700 }}><Countdown target={`${ws.date}T${TIME_24H[ws.time] ?? "10:00"}:00`} /></span>
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/student/workshops/${ws.id}`}
            className="px-3 py-2 rounded-xl text-xs font-semibold"
            style={{ backgroundColor: "var(--border-default)", color: "var(--text-secondary)" }}
          >
            Details
          </Link>
          <button
            onClick={isRegistered ? onToggleRegister : (onBuyOrRegister ?? onToggleRegister)}
            className="px-4 py-2 rounded-xl text-xs font-bold"
            style={{
              backgroundColor: isRegistered ? "#10B98120" : "var(--accent)",
              color: isRegistered ? "#10B981" : "#fff",
              border: isRegistered ? "1px solid #10B98140" : "none",
            }}
          >
            {isRegistered ? "✓ Registered" : ws.price > 0 ? `Register — $${ws.price}` : "Register Free"}
          </button>
        </div>
      </div>
    </div>
  )
}
