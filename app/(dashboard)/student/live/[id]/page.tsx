"use client"

import { use, useState, useRef, useEffect } from "react"
import Link from "next/link"
import {
  Mic, MicOff, Video, VideoOff, Monitor, Hand, MessageSquare,
  Users, X, Send, ChevronLeft, Settings, Maximize2, Radio,
  Smile, MoreHorizontal, PhoneOff, Volume2, VolumeX,
} from "lucide-react"

const SESSION = {
  id: "live1",
  title: "React Server Components Deep Dive",
  instructor: "Sarah Chen",
  instructorAvatar: "SC",
  course: "React Advanced Patterns",
  attendees: 143,
}

const CHAT_MESSAGES = [
  { id: "c1", user: "James P.", avatar: "JP", text: "This is so helpful! Finally understand RSC boundaries.", time: "2:04 PM", isInstructor: false },
  { id: "c2", user: "Sarah Chen", avatar: "SC", text: "Great question! Server components run entirely on the server and never ship to the client.", time: "2:05 PM", isInstructor: true },
  { id: "c3", user: "Maria K.", avatar: "MK", text: "Can you show the error boundary example again?", time: "2:06 PM", isInstructor: false },
  { id: "c4", user: "Alex T.", avatar: "AT", text: "👍👍 Makes total sense now", time: "2:07 PM", isInstructor: false },
  { id: "c5", user: "Sarah Chen", avatar: "SC", text: "Sure, let me pull up that example. Sharing screen now…", time: "2:08 PM", isInstructor: true },
  { id: "c6", user: "Priya S.", avatar: "PS", text: "What about Suspense streaming? Is that related?", time: "2:09 PM", isInstructor: false },
  { id: "c7", user: "Dev M.", avatar: "DM", text: "Can we get the GitHub repo link?", time: "2:10 PM", isInstructor: false },
  { id: "c8", user: "Sarah Chen", avatar: "SC", text: "github.com/sarahchen/rsc-demo — I'll drop it in resources too", time: "2:11 PM", isInstructor: true },
]

const PARTICIPANTS = [
  { id: "p1", name: "Sarah Chen", avatar: "SC", role: "instructor", hand: false, muted: false },
  { id: "p2", name: "You", avatar: "AJ", role: "student", hand: false, muted: true },
  { id: "p3", name: "James Park", avatar: "JP", role: "student", hand: false, muted: true },
  { id: "p4", name: "Maria K.", avatar: "MK", role: "student", hand: true, muted: false },
  { id: "p5", name: "Priya S.", avatar: "PS", role: "student", hand: false, muted: true },
]

export default function LiveRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [micOn, setMicOn] = useState(false)
  const [camOn, setCamOn] = useState(false)
  const [handRaised, setHandRaised] = useState(false)
  const [panel, setPanel] = useState<"chat" | "participants" | null>("chat")
  const [chatInput, setChatInput] = useState("")
  const [messages, setMessages] = useState(CHAT_MESSAGES)
  const [muted, setMuted] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = () => {
    if (!chatInput.trim()) return
    setMessages((prev) => [...prev, {
      id: `c${Date.now()}`,
      user: "You",
      avatar: "AJ",
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      isInstructor: false,
    }])
    setChatInput("")
  }

  return (
    <div style={{ height: "100vh", backgroundColor: "#0A0F1A", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* Top bar */}
      <div style={{
        height: 52, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 16px", backgroundColor: "#111827", borderBottom: "1px solid #1F2937", flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/student/live" style={{ display: "flex", alignItems: "center", gap: 6, color: "#94A3B8", textDecoration: "none" }}>
            <ChevronLeft size={16} />
            <span style={{ fontSize: 13 }}>Back</span>
          </Link>
          <div style={{ width: 1, height: 16, backgroundColor: "#1F2937" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#EF4444", display: "inline-block", animation: "ping 1s ease-in-out infinite" }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC" }}>{SESSION.title}</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 8, backgroundColor: "#1F2937" }}>
            <Users size={13} color="#94A3B8" />
            <span style={{ fontSize: 12, color: "#94A3B8" }}>{SESSION.attendees}</span>
          </div>
          <button
            style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #374151", backgroundColor: "transparent", cursor: "pointer", color: "#94A3B8" }}
          >
            <Settings size={15} />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Video area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 16, gap: 12, overflow: "hidden" }}>

          {/* Main speaker */}
          <div style={{
            flex: 1, borderRadius: 16, overflow: "hidden", position: "relative",
            background: "linear-gradient(135deg, #0F172A 0%, #1a1f35 100%)",
            border: "2px solid #3B82F620",
          }}>
            {/* Mock screen share */}
            <div style={{
              position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
              flexDirection: "column", gap: 16,
            }}>
              <div style={{
                width: "80%", maxWidth: 600, backgroundColor: "#0D1117", borderRadius: 12,
                padding: 24, border: "1px solid #30363D",
              }}>
                <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
                  {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
                    <span key={c} style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: c, display: "inline-block" }} />
                  ))}
                </div>
                <pre style={{ fontSize: 12, color: "#8B949E", lineHeight: 1.7, margin: 0, fontFamily: "monospace" }}>
                  <span style={{ color: "#FF7B72" }}>// app/layout.tsx</span>{"\n"}
                  <span style={{ color: "#79C0FF" }}>import</span> <span style={{ color: "#F8FAFC" }}>{"{"}</span> <span style={{ color: "#FFA657" }}>Suspense</span> <span style={{ color: "#F8FAFC" }}>{"}"}</span> <span style={{ color: "#79C0FF" }}>from</span> <span style={{ color: "#A5D6FF" }}>'react'</span>{"\n\n"}
                  <span style={{ color: "#FF7B72" }}>// ✅ This runs ONLY on the server</span>{"\n"}
                  <span style={{ color: "#79C0FF" }}>async function</span> <span style={{ color: "#D2A8FF" }}>UserGreeting</span><span style={{ color: "#F8FAFC" }}>()</span> <span style={{ color: "#F8FAFC" }}>{"{"}</span>{"\n"}
                  {"  "}<span style={{ color: "#79C0FF" }}>const</span> user <span style={{ color: "#FF7B72" }}>=</span> <span style={{ color: "#79C0FF" }}>await</span> <span style={{ color: "#D2A8FF" }}>getUser</span>(){"\n"}
                  {"  "}<span style={{ color: "#79C0FF" }}>return</span> <span style={{ color: "#7EE787" }}>{`<p>Hello, {user.name}!</p>`}</span>{"\n"}
                  <span style={{ color: "#F8FAFC" }}>{"}"}</span>
                </pre>
              </div>
              <p style={{ fontSize: 12, color: "#475569" }}>Instructor is sharing screen</p>
            </div>

            {/* Instructor label */}
            <div style={{
              position: "absolute", bottom: 12, left: 12,
              display: "flex", alignItems: "center", gap: 8,
              backgroundColor: "#000000AA", borderRadius: 8, padding: "5px 10px",
            }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", backgroundColor: "#3B82F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff" }}>
                {SESSION.instructorAvatar}
              </div>
              <span style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>{SESSION.instructor}</span>
              <span style={{ fontSize: 9, color: "#60A5FA", fontWeight: 700, letterSpacing: "0.05em" }}>HOST</span>
              <Mic size={12} color="#10B981" />
            </div>

            {/* Recording badge */}
            <div style={{
              position: "absolute", top: 12, right: 12,
              display: "flex", alignItems: "center", gap: 5,
              backgroundColor: "#EF444430", borderRadius: 6, padding: "4px 8px",
            }}>
              <Radio size={11} color="#EF4444" />
              <span style={{ fontSize: 10, fontWeight: 700, color: "#EF4444" }}>RECORDING</span>
            </div>
          </div>

          {/* Participant tiles */}
          <div style={{ display: "flex", gap: 10, height: 100, flexShrink: 0 }}>
            {PARTICIPANTS.slice(1, 5).map((p) => (
              <div key={p.id} style={{
                width: 140, borderRadius: 12, flexShrink: 0,
                backgroundColor: "#111827", border: "1px solid #1F2937",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
                position: "relative",
              }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "#1E293B", border: "2px solid #334155", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#94A3B8" }}>
                  {p.avatar}
                </div>
                <span style={{ fontSize: 11, color: "#64748B" }}>{p.name}</span>
                {p.hand && (
                  <div style={{ position: "absolute", top: 6, right: 6, width: 18, height: 18, borderRadius: "50%", backgroundColor: "#F59E0B", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Hand size={10} color="#fff" />
                  </div>
                )}
                {p.muted && (
                  <div style={{ position: "absolute", bottom: 6, right: 6 }}>
                    <MicOff size={11} color="#EF4444" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Controls bar */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            padding: "10px 0", flexShrink: 0,
          }}>
            <ControlBtn active={micOn} onClick={() => setMicOn(!micOn)} danger={!micOn}>
              {micOn ? <Mic size={17} /> : <MicOff size={17} />}
            </ControlBtn>
            <ControlBtn active={camOn} onClick={() => setCamOn(!camOn)} danger={!camOn}>
              {camOn ? <Video size={17} /> : <VideoOff size={17} />}
            </ControlBtn>
            <ControlBtn active={false} onClick={() => setMuted(!muted)}>
              {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
            </ControlBtn>
            <ControlBtn active={handRaised} onClick={() => setHandRaised(!handRaised)} highlight>
              <Hand size={17} />
            </ControlBtn>
            <ControlBtn active={false} onClick={() => {}}>
              <Monitor size={17} />
            </ControlBtn>
            <ControlBtn active={panel === "chat"} onClick={() => setPanel(panel === "chat" ? null : "chat")}>
              <MessageSquare size={17} />
            </ControlBtn>
            <ControlBtn active={panel === "participants"} onClick={() => setPanel(panel === "participants" ? null : "participants")}>
              <Users size={17} />
            </ControlBtn>

            {/* Leave */}
            <button
              onClick={() => window.location.href = "/student/live"}
              style={{
                width: 44, height: 44, borderRadius: 12, border: "none",
                backgroundColor: "#EF4444", color: "#fff", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <PhoneOff size={17} />
            </button>
          </div>
        </div>

        {/* Side panel */}
        {panel && (
          <div style={{
            width: 320, display: "flex", flexDirection: "column",
            backgroundColor: "#111827", borderLeft: "1px solid #1F2937",
            flexShrink: 0,
          }}>
            {/* Panel header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderBottom: "1px solid #1F2937" }}>
              <div style={{ display: "flex", gap: 2 }}>
                <button
                  onClick={() => setPanel("chat")}
                  style={{ padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", backgroundColor: panel === "chat" ? "#3B82F6" : "transparent", color: panel === "chat" ? "#fff" : "#64748B" }}
                >
                  Chat
                </button>
                <button
                  onClick={() => setPanel("participants")}
                  style={{ padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", backgroundColor: panel === "participants" ? "#3B82F6" : "transparent", color: panel === "participants" ? "#fff" : "#64748B" }}
                >
                  People ({PARTICIPANTS.length})
                </button>
              </div>
              <button onClick={() => setPanel(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B" }}>
                <X size={15} />
              </button>
            </div>

            {panel === "chat" ? (
              <>
                {/* Messages */}
                <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 10, scrollbarWidth: "none" }}>
                  {messages.map((m) => (
                    <div key={m.id} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 9, fontWeight: 700, color: "#fff",
                        backgroundColor: m.isInstructor ? "#3B82F6" : "#334155",
                      }}>
                        {m.avatar}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: m.isInstructor ? "#60A5FA" : "#94A3B8" }}>{m.user}</span>
                          <span style={{ fontSize: 10, color: "#475569" }}>{m.time}</span>
                          {m.isInstructor && <span style={{ fontSize: 9, color: "#3B82F6", fontWeight: 700 }}>HOST</span>}
                        </div>
                        <p style={{ fontSize: 12, color: "#CBD5E1", marginTop: 2, lineHeight: 1.5, wordBreak: "break-word" }}>{m.text}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat input */}
                <div style={{ padding: 12, borderTop: "1px solid #1F2937", display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Type a message…"
                    style={{
                      flex: 1, padding: "8px 12px", borderRadius: 10, border: "1px solid #374151",
                      backgroundColor: "#0F172A", color: "#F8FAFC", fontSize: 12, outline: "none",
                    }}
                  />
                  <button
                    onClick={sendMessage}
                    style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: "#3B82F6", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <Send size={14} color="#fff" />
                  </button>
                </div>
              </>
            ) : (
              <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                {PARTICIPANTS.map((p) => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 10, backgroundColor: "#0F172A" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: p.role === "instructor" ? "#3B82F6" : "#334155", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff" }}>
                      {p.avatar}
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 12, color: "#F8FAFC", fontWeight: 600 }}>{p.name}</span>
                      {p.role === "instructor" && <span style={{ fontSize: 10, color: "#60A5FA", marginLeft: 6 }}>HOST</span>}
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      {p.hand && <Hand size={13} color="#F59E0B" />}
                      {p.muted ? <MicOff size={13} color="#EF4444" /> : <Mic size={13} color="#10B981" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`@keyframes ping { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </div>
  )
}

function ControlBtn({ children, active, onClick, danger, highlight }: { children: React.ReactNode; active: boolean; onClick: () => void; danger?: boolean; highlight?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 44, height: 44, borderRadius: 12, border: "1px solid",
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        backgroundColor: active ? (highlight ? "#F59E0B20" : "#3B82F620") : (danger ? "#EF444420" : "#1F2937"),
        borderColor: active ? (highlight ? "#F59E0B40" : "#3B82F640") : (danger ? "#EF444440" : "#374151"),
        color: active ? (highlight ? "#F59E0B" : "#60A5FA") : (danger ? "#EF4444" : "#94A3B8"),
      }}
    >
      {children}
    </button>
  )
}
