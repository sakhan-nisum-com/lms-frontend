"use client"

import { use, useState } from "react"
import Link from "next/link"
import {
  Play, Pause, Volume2, Settings, Maximize2, ChevronLeft,
  ChevronRight, Clock, Eye, Star, ThumbsUp, Bookmark,
  List, MessageSquare, Download, Share2, CheckCircle,
} from "lucide-react"

const VIDEO = {
  id: "v1",
  title: "Next.js 14 App Router Full Tutorial",
  instructor: "Sarah Chen",
  instructorAvatar: "SC",
  course: "React Advanced Patterns",
  duration: 95,
  views: 24800,
  rating: 4.9,
  likes: 1840,
  thumbnail: "⚛️",
  description: "A comprehensive walkthrough of Next.js 14's App Router — covering layouts, server components, data fetching patterns, loading UI, error boundaries, and route groups. By the end you'll confidently build production-grade applications.",
  tags: ["Next.js", "App Router", "React", "Server Components"],
  publishedAt: "Jun 10, 2026",
}

const PLAYLIST = [
  { id: "v10", title: "React State Management 2024", duration: 77, completed: true, thumbnail: "⚛️" },
  { id: "v1", title: "Next.js 14 App Router Full Tutorial", duration: 95, completed: false, thumbnail: "⚛️", active: true },
  { id: "v5", title: "GraphQL Schema Design Best Practices", duration: 68, completed: false, thumbnail: "📡" },
  { id: "v2", title: "TypeScript Generics Explained", duration: 48, completed: false, thumbnail: "🔷" },
  { id: "v11", title: "Designing Scalable Data Pipelines", duration: 93, completed: false, thumbnail: "📊" },
]

const TRANSCRIPT = [
  { time: "0:00", text: "Welcome to the Next.js 14 App Router tutorial. Today we'll cover everything you need to build production apps." },
  { time: "1:45", text: "Let's start with the basics — what is the App Router and how does it differ from the Pages Router?" },
  { time: "4:12", text: "Server Components are the heart of the App Router. They run on the server and send HTML to the client, reducing JavaScript bundle size." },
  { time: "8:30", text: "Now let's look at layouts. In Next.js 14, layouts wrap your pages and persist across navigation." },
  { time: "14:22", text: "Data fetching in Server Components is straightforward — just use async/await directly in your component." },
  { time: "20:05", text: "Loading UI with Suspense gives users instant feedback while data loads in the background." },
  { time: "28:40", text: "Error boundaries let you gracefully handle errors without crashing the entire page." },
  { time: "35:15", text: "Route groups use parentheses to organize routes without affecting the URL structure." },
  { time: "48:00", text: "Let's build a real example — a blog with dynamic routes, ISR, and nested layouts." },
  { time: "72:30", text: "Finally, deployment — Next.js apps deploy seamlessly to Vercel, but also work on any Node.js server." },
]

const COMMENTS = [
  { id: "cm1", user: "James P.", avatar: "JP", text: "Best Next.js tutorial I've seen. The Suspense section alone saved me days of debugging.", time: "2d ago", likes: 48 },
  { id: "cm2", user: "Priya S.", avatar: "PS", text: "Finally understand the difference between server and client components. Thank you!", time: "3d ago", likes: 31 },
  { id: "cm3", user: "Maria K.", avatar: "MK", text: "Could you do a follow-up on caching strategies? That's still confusing to me.", time: "4d ago", likes: 22 },
]

export default function VideoPlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(38)
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [sidePanel, setSidePanel] = useState<"playlist" | "transcript" | "comments">("playlist")
  const [commentText, setCommentText] = useState("")

  return (
    <div style={{ height: "100vh", backgroundColor: "#0A0F1A", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* Topbar */}
      <div style={{ height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", backgroundColor: "#111827", borderBottom: "1px solid #1F2937", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/student/videos" style={{ display: "flex", alignItems: "center", gap: 5, color: "#94A3B8", textDecoration: "none", fontSize: 13 }}>
            <ChevronLeft size={15} /> Video Library
          </Link>
          <span style={{ color: "#334155" }}>›</span>
          <span style={{ fontSize: 13, color: "#CBD5E1", fontWeight: 600 }}>{VIDEO.title}</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href={`/student/courses/c1`} style={{ fontSize: 12, color: "#3B82F6", textDecoration: "none", padding: "5px 10px", borderRadius: 8, border: "1px solid #3B82F630", backgroundColor: "#3B82F610" }}>
            Go to Course →
          </Link>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Player + info */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Video player */}
          <div style={{ position: "relative", backgroundColor: "#000", aspectRatio: "16/9", maxHeight: "60vh", flexShrink: 0 }}>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 72 }}>{VIDEO.thumbnail}</div>
              <p style={{ fontSize: 14, color: "#475569" }}>Video content — {VIDEO.title}</p>
            </div>

            {/* Play button overlay */}
            <button
              onClick={() => setPlaying(!playing)}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              {!playing && (
                <div style={{ width: 64, height: 64, borderRadius: "50%", backgroundColor: "#3B82F6CC", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Play size={26} fill="#fff" color="#fff" style={{ marginLeft: 4 }} />
                </div>
              )}
            </button>

            {/* Controls */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "8px 12px", background: "linear-gradient(transparent, #000000CC)" }}>
              {/* Progress */}
              <div
                style={{ height: 3, backgroundColor: "#ffffff30", borderRadius: 2, marginBottom: 10, cursor: "pointer", position: "relative" }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  setProgress(Math.round(((e.clientX - rect.left) / rect.width) * 100))
                }}
              >
                <div style={{ height: "100%", width: `${progress}%`, backgroundColor: "#3B82F6", borderRadius: 2, position: "relative" }}>
                  <span style={{ position: "absolute", right: -4, top: "50%", transform: "translateY(-50%)", width: 10, height: 10, borderRadius: "50%", backgroundColor: "#3B82F6", border: "2px solid #fff" }} />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => setPlaying(!playing)} style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", padding: 0 }}>
                    {playing ? <Pause size={18} /> : <Play size={18} />}
                  </button>
                  <span style={{ fontSize: 11, color: "#ffffffCC" }}>
                    {Math.floor((progress / 100) * VIDEO.duration)}:{String(Math.floor((((progress / 100) * VIDEO.duration) % 1) * 60)).padStart(2, "0")} / {Math.floor(VIDEO.duration / 60)}:{String(VIDEO.duration % 60).padStart(2, "0")}
                  </span>
                  <Volume2 size={15} color="#fff" />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Settings size={15} color="#ffffffAA" style={{ cursor: "pointer" }} />
                  <Maximize2 size={15} color="#ffffffAA" style={{ cursor: "pointer" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Video info */}
          <div style={{ flex: 1, overflowY: "auto", padding: 16, scrollbarWidth: "thin", scrollbarColor: "#334155 transparent" }}>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: "#F8FAFC", lineHeight: 1.3, marginBottom: 10 }}>{VIDEO.title}</h1>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "#64748B" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Eye size={13} /> {VIDEO.views.toLocaleString()} views</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Star size={13} fill="#F59E0B" color="#F59E0B" /> {VIDEO.rating}</span>
                <span>{VIDEO.publishedAt}</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setLiked(!liked)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 10, border: `1px solid ${liked ? "#3B82F640" : "#334155"}`, backgroundColor: liked ? "#3B82F620" : "transparent", color: liked ? "#60A5FA" : "#94A3B8", fontSize: 12, cursor: "pointer" }}>
                  <ThumbsUp size={13} fill={liked ? "#60A5FA" : "none"} /> {VIDEO.likes + (liked ? 1 : 0)}
                </button>
                <button onClick={() => setSaved(!saved)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 10, border: `1px solid ${saved ? "#3B82F640" : "#334155"}`, backgroundColor: saved ? "#3B82F620" : "transparent", color: saved ? "#60A5FA" : "#94A3B8", fontSize: 12, cursor: "pointer" }}>
                  <Bookmark size={13} fill={saved ? "#60A5FA" : "none"} /> Save
                </button>
                <button style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 10, border: "1px solid #334155", backgroundColor: "transparent", color: "#94A3B8", fontSize: 12, cursor: "pointer" }}>
                  <Share2 size={13} /> Share
                </button>
              </div>
            </div>

            {/* Instructor */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px", borderRadius: 12, backgroundColor: "#1E293B", border: "1px solid #334155", marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#3B82F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff" }}>
                {VIDEO.instructorAvatar}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#F8FAFC" }}>{VIDEO.instructor}</p>
                <p style={{ fontSize: 12, color: "#64748B" }}>{VIDEO.course}</p>
              </div>
            </div>

            <p style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.7, marginBottom: 14 }}>{VIDEO.description}</p>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {VIDEO.tags.map((tag) => (
                <span key={tag} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, backgroundColor: "#3B82F615", color: "#60A5FA", border: "1px solid #3B82F630" }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ width: 340, display: "flex", flexDirection: "column", backgroundColor: "#111827", borderLeft: "1px solid #1F2937", flexShrink: 0 }}>
          {/* Panel tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid #1F2937", flexShrink: 0 }}>
            {(["playlist", "transcript", "comments"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setSidePanel(p)}
                style={{ flex: 1, padding: "11px 4px", fontSize: 11, fontWeight: 600, textTransform: "capitalize", border: "none", cursor: "pointer", backgroundColor: "transparent", color: sidePanel === p ? "#60A5FA" : "#475569", borderBottom: `2px solid ${sidePanel === p ? "#3B82F6" : "transparent"}` }}
              >
                {p === "playlist" ? <><List size={12} style={{ display: "inline", marginRight: 4 }} />Playlist</> : p === "transcript" ? "Transcript" : "Comments"}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "thin", scrollbarColor: "#334155 transparent" }}>
            {sidePanel === "playlist" && (
              <div>
                {PLAYLIST.map((v, i) => (
                  <Link
                    key={v.id}
                    href={`/student/videos/${v.id}`}
                    style={{
                      display: "flex", gap: 10, padding: "10px 12px", textDecoration: "none",
                      backgroundColor: v.active ? "#3B82F615" : "transparent",
                      borderLeft: `3px solid ${v.active ? "#3B82F6" : "transparent"}`,
                      borderBottom: "1px solid #1F2937",
                    }}
                    onMouseEnter={(e) => { if (!v.active) e.currentTarget.style.backgroundColor = "#1F2937" }}
                    onMouseLeave={(e) => { if (!v.active) e.currentTarget.style.backgroundColor = "transparent" }}
                  >
                    <div style={{ width: 52, height: 36, borderRadius: 6, backgroundColor: "#0F172A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, position: "relative" }}>
                      {v.thumbnail}
                      {v.completed && (
                        <div style={{ position: "absolute", inset: 0, borderRadius: 6, backgroundColor: "#00000080", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <CheckCircle size={16} color="#10B981" />
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: v.active ? "#60A5FA" : "#CBD5E1", lineHeight: 1.4, marginBottom: 3 }} className="line-clamp-2">{i + 1}. {v.title}</p>
                      <span style={{ fontSize: 10, color: "#475569" }}>{v.duration} min</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {sidePanel === "transcript" && (
              <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 1 }}>
                {TRANSCRIPT.map((line, i) => (
                  <div
                    key={i}
                    style={{ padding: "8px 10px", borderRadius: 8, cursor: "pointer" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1F2937")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#3B82F6", display: "block", marginBottom: 3 }}>{line.time}</span>
                    <p style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.5 }}>{line.text}</p>
                  </div>
                ))}
              </div>
            )}

            {sidePanel === "comments" && (
              <div style={{ padding: 12 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment…"
                    rows={2}
                    style={{ flex: 1, padding: "8px 10px", borderRadius: 10, border: "1px solid #374151", backgroundColor: "#0F172A", color: "#F8FAFC", fontSize: 12, outline: "none", resize: "none" }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {COMMENTS.map((c) => (
                    <div key={c.id} style={{ display: "flex", gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: "#334155", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#94A3B8", flexShrink: 0 }}>
                        {c.avatar}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#F8FAFC" }}>{c.user}</span>
                          <span style={{ fontSize: 10, color: "#475569" }}>{c.time}</span>
                        </div>
                        <p style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.5, marginTop: 3 }}>{c.text}</p>
                        <button style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 4, background: "none", border: "none", cursor: "pointer", fontSize: 10, color: "#475569" }}>
                          <ThumbsUp size={10} /> {c.likes}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
