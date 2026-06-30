"use client"

import { useState } from "react"
import Link from "next/link"
import { INSTRUCTORS, getInstructorStats } from "@/lib/data/instructors"
import { Search, Star, Users, BookOpen } from "lucide-react"

export default function InstructorsPage() {
  const [query, setQuery] = useState("")

  const q = query.trim().toLowerCase()
  const filtered = INSTRUCTORS.filter((i) =>
    !q ||
    i.name.toLowerCase().includes(q) ||
    i.title.toLowerCase().includes(q) ||
    i.expertise.some((e) => e.toLowerCase().includes(q))
  )

  return (
    <main style={{ backgroundColor: "var(--bg-canvas)", color: "var(--text-primary)", minHeight: "calc(100vh - var(--app-header-height, 150px))" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 24px 64px" }}>

        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Our Instructors</h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          {INSTRUCTORS.length} expert instructors teaching real-world skills across engineering, data, design, business, and more.
        </p>

        {/* Search */}
        <div className="relative mb-8" style={{ maxWidth: 420 }}>
          <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search instructors or expertise…"
            className="w-full outline-none"
            style={{
              padding: "10px 14px 10px 38px", borderRadius: 100, fontSize: 14,
              backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-primary)",
            }}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl p-12 text-center" style={{ backgroundColor: "var(--bg-surface)", border: "1px dashed var(--border-default)" }}>
            <p className="text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>No instructors found</p>
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Try a different search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((instructor) => {
              const stats = getInstructorStats(instructor)
              return (
                <Link
                  key={instructor.id}
                  href={`/instructors/${instructor.id}`}
                  className="rounded-2xl p-5 transition-all duration-150 shadow-sm"
                  style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)", textDecoration: "none" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${instructor.color}60`)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-default)")}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="flex items-center justify-center w-14 h-14 rounded-full text-base font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: instructor.color }}
                    >
                      {instructor.avatar}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>{instructor.name}</p>
                      <p className="text-xs truncate" style={{ color: "var(--text-tertiary)" }}>{instructor.title}</p>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed mb-4 line-clamp-2" style={{ color: "var(--text-secondary)" }}>{instructor.bio}</p>
                  <div className="flex items-center gap-3 mb-3 text-xs" style={{ color: "var(--text-tertiary)" }}>
                    <span className="flex items-center gap-1">
                      <Star size={11} fill="#F59E0B" style={{ color: "#F59E0B" }} />
                      <strong style={{ color: "var(--text-primary)" }}>{stats.rating}</strong>
                    </span>
                    <span className="flex items-center gap-1"><Users size={11} /> {stats.studentsCount >= 1000 ? `${(stats.studentsCount / 1000).toFixed(0)}k` : stats.studentsCount}</span>
                    <span className="flex items-center gap-1"><BookOpen size={11} /> {stats.coursesCount} {stats.coursesCount === 1 ? "course" : "courses"}</span>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {instructor.expertise.map((tag) => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${instructor.color}15`, color: instructor.color }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
