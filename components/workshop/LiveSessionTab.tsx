"use client"

import { useState, useRef, useEffect } from "react"
import {
  Video, Users, MessageCircle, ExternalLink, Mic, MicOff,
  Monitor, Square, Send, Grid3x3, Maximize2, QrCode,
} from "lucide-react"
import type { WorkshopInteriorData } from "@/lib/data/workshopInterior"

const PLATFORM_COLORS: Record<string, string> = {
  zoom: "#2D8CFF",
  teams: "#6264A7",
  webex: "#00BEF0",
  "google-meet": "#00897B",
}

const PLATFORM_LABELS: Record<string, string> = {
  zoom: "Zoom",
  teams: "Microsoft Teams",
  webex: "Webex",
  "google-meet": "Google Meet",
}

interface Props {
  interior: WorkshopInteriorData
}

export function LiveSessionTab({ interior }: Props) {
  const { liveSession } = interior
  const platformColor = PLATFORM_COLORS[liveSession.platform]

  const [micOn, setMicOn] = useState(false)
  const [chatInput, setChatInput] = useState("")
  const [messages, setMessages] = useState(liveSession.chatMessages)
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages])

  const sendMessage = () => {
    if (!chatInput.trim()) return
    setMessages((prev) => [
      ...prev,
      {
        id: `m${Date.now()}`,
        sender: "You",
        senderRole: "student",
        message: chatInput.trim(),
        timestamp: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
        isInstructor: false,
      },
    ])
    setChatInput("")
  }

  return (
    <div className="space-y-5">
      {/* Session card */}
      <div
        className="rounded-2xl p-5"
        style={{ backgroundColor: "#1E293B", border: `1px solid ${platformColor}40` }}
      >
        <div className="flex items-start gap-4 flex-wrap">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${platformColor}20` }}
          >
            <Video size={22} style={{ color: platformColor }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${platformColor}20`, color: platformColor }}
              >
                {PLATFORM_LABELS[liveSession.platform]}
              </span>
              {liveSession.recordingAvailable && (
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#10B98115", color: "#10B981" }}>
                  ● Recording Available
                </span>
              )}
            </div>
            <h2 className="text-sm font-bold text-white">Live Lab Session</h2>
            <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>
              {new Date(liveSession.scheduledDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              {" · "}{liveSession.scheduledTime} · {liveSession.duration} · Hosted by {liveSession.host}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setMicOn((v) => !v)}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: micOn ? "#EF444420" : "#334155", border: `1px solid ${micOn ? "#EF444440" : "#475569"}` }}
            >
              {micOn ? <Mic size={14} style={{ color: "#EF4444" }} /> : <MicOff size={14} style={{ color: "#64748B" }} />}
            </button>
            <a
              href={liveSession.joinUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ backgroundColor: platformColor }}
            >
              <ExternalLink size={13} /> Join Session
            </a>
          </div>
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-2 mt-4 pt-4" style={{ borderTop: "1px solid #334155" }}>
          {[
            { icon: Grid3x3, label: "Gallery View" },
            { icon: Monitor, label: "Share Screen" },
            { icon: Maximize2, label: "Full Screen" },
            { icon: Square, label: "Stop" },
          ].map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
              style={{ backgroundColor: "#0F172A", color: "#64748B", border: "1px solid #334155" }}
            >
              <Icon size={11} /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Breakout Rooms */}
      <div className="rounded-2xl p-5" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white">Breakout Rooms</h2>
          <span className="text-xs" style={{ color: "#64748B" }}>
            {liveSession.breakoutRooms.length} rooms active
          </span>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {liveSession.breakoutRooms.map((room) => {
            const isFull = room.participants >= room.capacity
            return (
              <div
                key={room.id}
                className="rounded-xl p-4"
                style={{ backgroundColor: "#0F172A", border: `1px solid ${isFull ? "#EF444430" : "#334155"}` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white">{room.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>{room.topic}</p>
                    <p className="text-xs mt-1.5" style={{ color: "#64748B" }}>
                      Host: <span style={{ color: "#94A3B8" }}>{room.host}</span>
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1" style={{ color: isFull ? "#EF4444" : "#10B981" }}>
                      <Users size={11} />
                      <span className="text-xs font-bold">{room.participants}/{room.capacity}</span>
                    </div>
                    <button
                      disabled={isFull}
                      className="mt-2 px-3 py-1.5 rounded-lg text-xs font-semibold"
                      style={{
                        backgroundColor: isFull ? "#334155" : `${platformColor}20`,
                        color: isFull ? "#475569" : platformColor,
                        cursor: isFull ? "not-allowed" : "pointer",
                      }}
                    >
                      {isFull ? "Full" : "Join"}
                    </button>
                  </div>
                </div>
                {/* Capacity bar */}
                <div className="mt-3 h-1 rounded-full" style={{ backgroundColor: "#334155" }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(room.participants / room.capacity) * 100}%`, backgroundColor: isFull ? "#EF4444" : platformColor }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Collaborative Whiteboard */}
      <div className="rounded-2xl p-5" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-white">Collaborative Whiteboard</h2>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#F59E0B15", color: "#F59E0B" }}>
            🟡 Live — 12 collaborators
          </span>
        </div>

        {/* Whiteboard placeholder */}
        <div
          className="rounded-xl relative overflow-hidden"
          style={{ height: 240, backgroundColor: "#0F172A", border: "1px solid #334155" }}
        >
          {/* Sticky notes */}
          {[
            { x: "8%", y: "12%", color: "#F59E0B", text: "Use Server Components\nfor data fetching!", rotation: "-2deg" },
            { x: "30%", y: "22%", color: "#10B981", text: "Prisma singleton\npattern = key!", rotation: "1.5deg" },
            { x: "58%", y: "10%", color: "#8B5CF6", text: "NextAuth middleware\nin next.config.js", rotation: "-1deg" },
            { x: "18%", y: "58%", color: "#3B82F6", text: "Edge runtime\n≠ Node.js", rotation: "2deg" },
            { x: "45%", y: "52%", color: "#EC4899", text: "Deploy env vars\nin Vercel dashboard", rotation: "-1.5deg" },
            { x: "70%", y: "55%", color: "#F59E0B", text: "app/ router > pages/\nfor new projects", rotation: "1deg" },
          ].map((note, i) => (
            <div
              key={i}
              className="absolute p-2.5 rounded text-xs font-semibold shadow-lg"
              style={{
                left: note.x,
                top: note.y,
                backgroundColor: `${note.color}25`,
                border: `1px solid ${note.color}60`,
                color: note.color,
                transform: `rotate(${note.rotation})`,
                whiteSpace: "pre-line",
                maxWidth: 130,
                lineHeight: 1.3,
              }}
            >
              {note.text}
            </div>
          ))}

          {/* Grid lines */}
          <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.04 }}>
            <defs>
              <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M 24 0 L 0 0 0 24" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Open button */}
          <a
            href="#"
            className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{ backgroundColor: "#334155", color: "#94A3B8" }}
          >
            <ExternalLink size={11} /> Open in {liveSession.whiteboardLabel.split(" — ")[1] ?? "Miro"}
          </a>
        </div>
      </div>

      {/* Live Q&A Chat */}
      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
        <div
          className="px-5 py-3 flex items-center justify-between"
          style={{ backgroundColor: "#0F172A", borderBottom: "1px solid #334155" }}
        >
          <div className="flex items-center gap-2">
            <MessageCircle size={14} style={{ color: "#3B82F6" }} />
            <h2 className="text-sm font-bold text-white">Live Q&A Chat</h2>
          </div>
          <span className="text-xs" style={{ color: "#64748B" }}>{messages.length} messages</span>
        </div>

        {/* Messages */}
        <div
          ref={chatRef}
          className="overflow-y-auto"
          style={{ height: 260, padding: "12px 20px", scrollbarWidth: "thin" }}
        >
          <div className="space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex items-start gap-2.5 ${msg.sender === "You" ? "flex-row-reverse" : ""}`}>
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: msg.isInstructor ? "#3B82F620" : msg.sender === "You" ? "#8B5CF620" : "#334155", color: msg.isInstructor ? "#60A5FA" : msg.sender === "You" ? "#A78BFA" : "#94A3B8" }}
                >
                  {msg.sender.charAt(0)}
                </div>
                <div className={`flex-1 ${msg.sender === "You" ? "items-end" : "items-start"} flex flex-col`}>
                  <div className="flex items-center gap-2 mb-0.5" style={{ flexDirection: msg.sender === "You" ? "row-reverse" : "row" }}>
                    <span className="text-xs font-semibold" style={{ color: msg.isInstructor ? "#60A5FA" : "#94A3B8" }}>
                      {msg.sender}
                    </span>
                    {msg.isInstructor && (
                      <span className="text-xs px-1.5 py-0 rounded-full" style={{ backgroundColor: "#3B82F615", color: "#60A5FA" }}>Instructor</span>
                    )}
                    <span className="text-xs" style={{ color: "#334155" }}>{msg.timestamp}</span>
                  </div>
                  <div
                    className="text-xs leading-relaxed px-3 py-2 rounded-xl max-w-xs"
                    style={{
                      backgroundColor: msg.isInstructor ? "#3B82F615" : msg.sender === "You" ? "#8B5CF620" : "#0F172A",
                      color: "#CBD5E1",
                    }}
                  >
                    {msg.message}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Input */}
        <div
          className="flex items-center gap-2 px-4 py-3"
          style={{ borderTop: "1px solid #334155", backgroundColor: "#0F172A" }}
        >
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask a question or share a note..."
            className="flex-1 px-3 py-2 rounded-xl text-xs outline-none"
            style={{ backgroundColor: "#1E293B", border: "1px solid #334155", color: "#F8FAFC" }}
          />
          <button
            onClick={sendMessage}
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "#3B82F6" }}
          >
            <Send size={13} color="#fff" />
          </button>
        </div>
      </div>

      {/* Attendance QR */}
      <div className="rounded-2xl p-5" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#10B98115" }}>
            <QrCode size={22} style={{ color: "#10B981" }} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">Session Attendance Check-in</p>
            <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>Scan the QR code displayed by your instructor or click below to register your attendance digitally.</p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white flex-shrink-0"
            style={{ backgroundColor: "#10B981" }}
          >
            <QrCode size={12} /> Check In
          </button>
        </div>
      </div>
    </div>
  )
}
