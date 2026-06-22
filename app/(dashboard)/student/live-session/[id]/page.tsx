"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  ChevronLeft,
  Hand,
  PanelRight,
  PanelRightClose,
  PhoneOff,
  Timer,
  Users,
  Video,
} from "lucide-react"
import { LiveChatPanel } from "@/components/live/LiveChatPanel"
import { SCHEDULE_EVENTS, type ScheduleEvent } from "@/lib/data/courses"
import { isZoomLink, parseZoomMeetingNumber, MOCK_PARTICIPANTS } from "@/lib/data/live-session"

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatElapsed(s: number): string {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const pad = (n: number) => String(n).padStart(2, "0")
  if (h > 0) return `${h}:${pad(m)}:${pad(sec)}`
  return `${pad(m)}:${pad(sec)}`
}

// ── Fallback when iframe is blocked ──────────────────────────────────────────

function IframeFallback({ event }: { event: ScheduleEvent }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 px-8">
      <div
        className="flex items-center justify-center w-16 h-16 rounded-2xl"
        style={{ backgroundColor: "#F59E0B18", border: "1px solid #F59E0B30" }}
      >
        <AlertTriangle size={30} style={{ color: "#F59E0B" }} />
      </div>
      <div className="text-center max-w-xs">
        <p className="text-base font-bold text-white">Waiting for host</p>
        <p className="text-sm mt-2 leading-relaxed" style={{ color: "#64748B" }}>
          The session hasn&apos;t started yet, or your browser blocked the embedded Zoom client.
        </p>
      </div>
      {event.meetLink && (
        <a
          href={event.meetLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ backgroundColor: "#3B82F6" }}
        >
          <Video size={14} /> Open in Zoom App
        </a>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function LiveSessionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const event = SCHEDULE_EVENTS.find((e) => e.id === id)
  const meetingNumber = event?.meetLink ? parseZoomMeetingNumber(event.meetLink) : null

  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [handRaised, setHandRaised] = useState(false)
  const [chatVisible, setChatVisible] = useState(true)
  const [iframeError, setIframeError] = useState(false)
  const [reaction, setReaction] = useState<string | null>(null)

  const participantCount = MOCK_PARTICIPANTS.length

  // Elapsed timer
  useEffect(() => {
    const start = Date.now()
    const iv = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - start) / 1000))
    }, 1000)
    return () => clearInterval(iv)
  }, [])

  // Auto-clear emoji reaction after 2s
  useEffect(() => {
    if (!reaction) return
    const t = setTimeout(() => setReaction(null), 2000)
    return () => clearTimeout(t)
  }, [reaction])

  // Not a valid Zoom session
  if (!event || !event.meetLink || !isZoomLink(event.meetLink)) {
    return (
      <div
        className="flex items-center justify-center h-screen flex-col gap-4"
        style={{ backgroundColor: "#0F172A" }}
      >
        <div
          className="flex items-center justify-center w-14 h-14 rounded-2xl"
          style={{ backgroundColor: "#334155" }}
        >
          <Video size={26} style={{ color: "#64748B" }} />
        </div>
        <p className="text-base font-bold text-white">Session not found</p>
        <p className="text-sm" style={{ color: "#64748B" }}>
          This session doesn&apos;t exist or doesn&apos;t have a Zoom link.
        </p>
        <Link
          href="/student/schedule"
          className="flex items-center gap-1.5 text-sm font-medium mt-2"
          style={{ color: "#3B82F6" }}
        >
          <ChevronLeft size={14} /> Back to Schedule
        </Link>
      </div>
    )
  }

  const zoomSrc = meetingNumber
    ? `https://zoom.us/wc/join/${meetingNumber}?prefer=1`
    : null

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{ height: "100svh", backgroundColor: "#0F172A" }}
    >
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header
        className="flex items-center justify-between px-4 flex-shrink-0 gap-4"
        style={{ height: 56, backgroundColor: "#1E293B", borderBottom: "1px solid #334155", position: "relative", zIndex: 10 }}
      >
        {/* Back */}
        <Link
          href="/student/schedule"
          className="flex items-center gap-1 text-sm flex-shrink-0"
          style={{ color: "#94A3B8" }}
        >
          <ChevronLeft size={15} />
          <span className="hidden sm:inline">Schedule</span>
        </Link>

        {/* Title + live badge */}
        <div className="flex items-center gap-3 min-w-0 flex-1 justify-center">
          <span
            className="flex-shrink-0 flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: "#10B98120", color: "#10B981" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: "#10B981" }}
            />
            LIVE
          </span>
          <div className="min-w-0 hidden sm:block">
            <p className="text-sm font-bold text-white truncate">{event.title}</p>
            <p className="text-xs truncate" style={{ color: "#64748B" }}>{event.courseName}</p>
          </div>
        </div>

        {/* Timer + participants */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="flex items-center gap-1.5 text-sm font-mono" style={{ color: "#94A3B8" }}>
            <Timer size={13} style={{ color: "#3B82F6" }} />
            {formatElapsed(elapsedSeconds)}
          </div>
          <div className="flex items-center gap-1.5 text-sm" style={{ color: "#94A3B8" }}>
            <Users size={13} style={{ color: "#3B82F6" }} />
            {participantCount}
          </div>
        </div>
      </header>

      {/* ── Content row ─────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Zoom iframe */}
        <div className="flex-1 relative overflow-hidden" style={{ backgroundColor: "#0A0F1E" }}>
          {zoomSrc && !iframeError ? (
            <iframe
              src={zoomSrc}
              title="Zoom Meeting"
              allow="camera; microphone; display-capture; fullscreen; autoplay"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
              style={{ border: "none" }}
              onError={() => setIframeError(true)}
            />
          ) : (
            <IframeFallback event={event} />
          )}

          {/* Floating emoji reaction */}
          {reaction && (
            <div
              className="absolute bottom-20 left-1/2 text-5xl pointer-events-none select-none"
              style={{ animation: "fadeUp 2s ease-out forwards" }}
            >
              {reaction}
            </div>
          )}
        </div>

        {/* Chat panel */}
        {chatVisible && (
          <div
            className="flex-shrink-0 overflow-hidden"
            style={{
              width: 360,
              borderLeft: "1px solid #334155",
              backgroundColor: "#1E293B",
            }}
          >
            <LiveChatPanel
              sessionTitle={event.title}
              participantCount={participantCount}
              onClose={() => setChatVisible(false)}
            />
          </div>
        )}
      </div>

      {/* ── Bottom toolbar ───────────────────────────────────────────────────── */}
      <footer
        className="flex items-center justify-between px-4 sm:px-6 flex-shrink-0 gap-2"
        style={{ height: 56, backgroundColor: "#1E293B", borderTop: "1px solid #334155", position: "relative", zIndex: 10 }}
      >
        {/* Raise Hand */}
        <button
          type="button"
          onClick={() => setHandRaised((h) => !h)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all flex-shrink-0"
          style={{
            backgroundColor: handRaised ? "#F59E0B20" : "#334155",
            color: handRaised ? "#F59E0B" : "#94A3B8",
            border: `1px solid ${handRaised ? "#F59E0B40" : "transparent"}`,
          }}
        >
          <Hand size={14} />
          <span className="hidden sm:inline">{handRaised ? "Lower Hand" : "Raise Hand"}</span>
        </button>

        {/* Emoji reactions */}
        <div className="flex items-center gap-1">
          {["👍", "❤️", "😂", "🎉", "🔥"].map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setReaction(emoji)}
              className="text-xl flex items-center justify-center rounded-lg transition-transform hover:scale-125 active:scale-110 select-none"
              style={{ width: 36, height: 36, backgroundColor: "#334155" }}
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Chat toggle + Leave */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => setChatVisible((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              backgroundColor: chatVisible ? "#3B82F620" : "#334155",
              color: chatVisible ? "#60A5FA" : "#94A3B8",
            }}
          >
            {chatVisible ? <PanelRightClose size={14} /> : <PanelRight size={14} />}
            <span className="hidden sm:inline">Chat</span>
          </button>
          <Link
            href="/student/schedule"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold"
            style={{ backgroundColor: "#EF444420", color: "#F87171" }}
          >
            <PhoneOff size={14} />
            <span className="hidden sm:inline">Leave</span>
          </Link>
        </div>
      </footer>
    </div>
  )
}