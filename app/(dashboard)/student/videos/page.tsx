"use client"

import Link from "next/link"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Play, Clock, Eye, Search, Filter, Star, BookOpen, Bookmark, ChevronRight, TrendingUp, Flame } from "lucide-react"
import { useState } from "react"

const CATEGORIES = ["All", "React", "TypeScript", "System Design", "DevOps", "Security", "Data Science", "UI/UX", "Career"]

const CONTINUE_WATCHING = [
  { id: "v3", title: "Docker & Kubernetes for Developers", thumbnail: "🐳", progress: 62, duration: 110, watched: 68, instructor: "James Park", course: "DevOps Bootcamp" },
  { id: "v7", title: "CSS Grid & Flexbox Masterclass", thumbnail: "🎨", progress: 35, duration: 55, watched: 19, instructor: "Alex Torres", course: "CSS Fundamentals" },
  { id: "v1", title: "Next.js 14 App Router Full Tutorial", thumbnail: "⚛️", progress: 88, duration: 95, watched: 84, instructor: "Sarah Chen", course: "React Advanced" },
]

const VIDEOS = [
  { id: "v1", title: "Next.js 14 App Router Full Tutorial", thumbnail: "⚛️", duration: 95, views: 24800, rating: 4.9, instructor: "Sarah Chen", course: "React Advanced Patterns", category: "React", level: "Advanced", isFree: false, isTrending: true, isFeatured: true },
  { id: "v2", title: "TypeScript Generics Explained", thumbnail: "🔷", duration: 48, views: 18200, rating: 4.8, instructor: "James Park", course: "TypeScript Mastery", category: "TypeScript", level: "Intermediate", isFree: false, isTrending: true, isFeatured: false },
  { id: "v3", title: "Docker & Kubernetes for Developers", thumbnail: "🐳", duration: 110, views: 31400, rating: 4.7, instructor: "James Park", course: "DevOps Bootcamp", category: "DevOps", level: "Intermediate", isFree: true, isTrending: false, isFeatured: true },
  { id: "v4", title: "System Design: Design a URL Shortener", thumbnail: "🏗️", duration: 72, views: 42100, rating: 4.9, instructor: "Lisa Wang", course: "System Design Mastery", category: "System Design", level: "Advanced", isFree: false, isTrending: true, isFeatured: true },
  { id: "v5", title: "GraphQL Schema Design Best Practices", thumbnail: "📡", duration: 68, views: 9800, rating: 4.6, instructor: "Lisa Wang", course: "API Development", category: "React", level: "Intermediate", isFree: false, isTrending: false, isFeatured: false },
  { id: "v6", title: "GDPR Compliance for Engineers", thumbnail: "📋", duration: 41, views: 7600, rating: 4.5, instructor: "Emma Wilson", course: "GDPR Compliance", category: "Security", level: "Beginner", isFree: false, isTrending: false, isFeatured: false },
  { id: "v7", title: "CSS Grid & Flexbox Masterclass", thumbnail: "🎨", duration: 55, views: 15300, rating: 4.7, instructor: "Alex Torres", course: "CSS Fundamentals", category: "UI/UX", level: "Beginner", isFree: true, isTrending: false, isFeatured: false },
  { id: "v8", title: "Binary Trees & Graph Algorithms", thumbnail: "🌳", duration: 88, views: 22000, rating: 4.8, instructor: "Priya Sharma", course: "DSA Fundamentals", category: "Career", level: "Advanced", isFree: false, isTrending: true, isFeatured: false },
  { id: "v9", title: "Zero Trust Security Architecture", thumbnail: "🔐", duration: 64, views: 8900, rating: 4.6, instructor: "Marcus Reed", course: "Cybersecurity Fundamentals", category: "Security", level: "Advanced", isFree: false, isTrending: false, isFeatured: false },
  { id: "v10", title: "React State Management 2024", thumbnail: "⚛️", duration: 77, views: 19400, rating: 4.8, instructor: "Sarah Chen", course: "React Advanced Patterns", category: "React", level: "Intermediate", isFree: false, isTrending: true, isFeatured: true },
  { id: "v11", title: "Designing Scalable Data Pipelines", thumbnail: "📊", duration: 93, views: 11200, rating: 4.7, instructor: "Lisa Wang", course: "Data Engineering", category: "Data Science", level: "Advanced", isFree: false, isTrending: false, isFeatured: false },
  { id: "v12", title: "UX Research Methods & User Testing", thumbnail: "🎯", duration: 58, views: 6700, rating: 4.5, instructor: "Alex Torres", course: "UI/UX Foundations", category: "UI/UX", level: "Beginner", isFree: true, isTrending: false, isFeatured: false },
]

const LEVEL_COLORS: Record<string, string> = { Beginner: "#10B981", Intermediate: "#F59E0B", Advanced: "#EF4444" }

export default function VideosPage() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All")
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())

  const filtered = VIDEOS.filter((v) => {
    const matchesCat = category === "All" || v.category === category
    const matchesSearch = v.title.toLowerCase().includes(search.toLowerCase()) || v.instructor.toLowerCase().includes(search.toLowerCase())
    return matchesCat && matchesSearch
  })

  const featured = filtered.filter((v) => v.isFeatured)
  const trending = filtered.filter((v) => v.isTrending)

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Video Library</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              {VIDEOS.length} videos across {CATEGORIES.length - 1} categories
            </p>
          </div>
        </div>

        {/* Search + filter */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search videos, instructors..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
            />
          </div>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all"
              style={{
                backgroundColor: category === cat ? "var(--accent)" : "var(--bg-surface)",
                color: category === cat ? "#fff" : "var(--text-tertiary)",
                border: `1px solid ${category === cat ? "var(--accent)" : "var(--border-default)"}`,
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Continue watching */}
        {search === "" && category === "All" && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}><Play size={14} style={{ color: "var(--accent)" }} /> Continue Watching</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {CONTINUE_WATCHING.map((v) => (
                <Link key={v.id} href={`/student/videos/${v.id}`} className="rounded-xl overflow-hidden transition-all shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--text-muted)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-default)")}
                >
                  <div className="relative h-28 flex items-center justify-center text-4xl" style={{ backgroundColor: "#0F172A" }}>
                    {v.thumbnail}
                    {/* Progress bar at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: "#334155" }}>
                      <div className="h-full" style={{ width: `${v.progress}%`, backgroundColor: "var(--accent)" }} />
                    </div>
                    <div className="absolute top-2 right-2 text-xs font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: "#000000AA", color: "#94A3B8" }}>
                      {Math.floor(v.duration / 60)}:{String(v.duration % 60).padStart(2, "0")}
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-semibold line-clamp-2 leading-snug" style={{ color: "var(--text-primary)" }}>{v.title}</p>
                    <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>{v.watched} / {v.duration} min watched · {v.progress}%</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Trending */}
        {trending.length > 0 && search === "" && (
          <div>
            <h2 className="text-sm font-bold flex items-center gap-2 mb-3" style={{ color: "var(--text-primary)" }}><TrendingUp size={14} style={{ color: "var(--warning)" }} /> Trending Now</h2>
            <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
              {trending.map((v) => (
                <VideoCard key={v.id} video={v} saved={savedIds.has(v.id)} onSave={toggleSave} compact />
              ))}
            </div>
          </div>
        )}

        {/* All / Featured */}
        <div>
          <h2 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>
            {search || category !== "All" ? `Results (${filtered.length})` : "All Videos"}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((v) => (
              <VideoCard key={v.id} video={v} saved={savedIds.has(v.id)} onSave={toggleSave} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-16" style={{ color: "var(--text-tertiary)" }}>
              <p className="text-4xl mb-3">🎬</p>
              <p className="text-sm font-semibold">No videos found</p>
              <p className="text-xs mt-1">Try different keywords or category</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

function VideoCard({ video: v, saved, onSave, compact }: { video: typeof VIDEOS[0]; saved: boolean; onSave: (id: string) => void; compact?: boolean }) {
  return (
    <div
      className="rounded-xl overflow-hidden flex-shrink-0 transition-all shadow-sm"
      style={{
        backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)",
        width: compact ? 220 : "auto",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--text-muted)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-default)")}
    >
      <Link href={`/student/videos/${v.id}`} className="block">
        <div className="relative flex items-center justify-center text-4xl" style={{ height: compact ? 100 : 130, backgroundColor: "#0F172A" }}>
          {v.thumbnail}
          <div className="absolute top-2 left-2">
            {v.isFree ? (
              <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: "var(--success-bg)", color: "var(--success)" }}>FREE</span>
            ) : null}
          </div>
          <div className="absolute top-2 right-2 text-xs font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: "#000000AA", color: "#94A3B8" }}>
            {Math.floor(v.duration / 60)}:{String(v.duration % 60).padStart(2, "0")}
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity" style={{ backgroundColor: "#00000040" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--accent)" }}>
              <Play size={17} fill="#fff" color="#fff" />
            </div>
          </div>
        </div>
      </Link>
      <div className="p-3">
        <Link href={`/student/videos/${v.id}`} className="block">
          <p className="text-xs font-semibold line-clamp-2 leading-snug" style={{ color: "var(--text-primary)" }}>{v.title}</p>
        </Link>
        <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>{v.instructor}</p>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-tertiary)" }}>
            <span className="flex items-center gap-1"><Star size={11} fill="#F59E0B" color="#F59E0B" /> {v.rating}</span>
            <span className="flex items-center gap-1"><Eye size={11} /> {(v.views / 1000).toFixed(1)}k</span>
          </div>
          <button
            onClick={() => onSave(v.id)}
            style={{ background: "none", border: "none", cursor: "pointer", color: saved ? "var(--accent)" : "var(--text-tertiary)", padding: 0 }}
          >
            <Bookmark size={13} fill={saved ? "var(--accent)" : "none"} />
          </button>
        </div>
        {!compact && (
          <span className="inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${LEVEL_COLORS[v.level]}20`, color: LEVEL_COLORS[v.level] }}>
            {v.level}
          </span>
        )}
      </div>
    </div>
  )
}
