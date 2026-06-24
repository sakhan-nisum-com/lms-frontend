"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { COURSES } from "@/lib/data/courses"
import type { CourseCategory } from "@/lib/data/courses"
import { useCourseModeration } from "@/lib/hooks/useCourseModeration"
import type { CourseStatus, CourseBadge } from "@/lib/hooks/useCourseModeration"
import { Search, Star, BookOpen, CheckCircle2, Clock, EyeOff, FileEdit, Sparkles, Crown, Trophy, Pencil, ChevronLeft, ChevronRight } from "lucide-react"

const PAGE_SIZE = 8

const statusColors: Record<CourseStatus, React.CSSProperties> = {
  published: { backgroundColor: "#10B98120", color: "#34D399" },
  draft: { backgroundColor: "#64748B20", color: "#94A3B8" },
  "pending-review": { backgroundColor: "#F59E0B20", color: "#FCD34D" },
  unpublished: { backgroundColor: "#EF444420", color: "#F87171" },
}

const badgeMeta: Record<CourseBadge, { icon: React.ElementType; color: string; label: string }> = {
  featured: { icon: Sparkles, color: "#F59E0B", label: "Featured" },
  premium: { icon: Crown, color: "#A78BFA", label: "Premium" },
  topRated: { icon: Trophy, color: "#06B6D4", label: "Top Rated" },
}

export default function AdminCoursesPage() {
  const { getEntry, setStatus, toggleBadge, getContent } = useCourseModeration()
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<"all" | CourseCategory>("all")
  const [statusFilter, setStatusFilter] = useState<"all" | CourseStatus>("all")
  const [page, setPage] = useState(1)

  const categories = useMemo(() => Array.from(new Set(COURSES.map((c) => c.category))), [])

  const filtered = useMemo(() => {
    return COURSES.filter((c) => {
      const entry = getEntry(c.id)
      const content = getContent(c)
      if (categoryFilter !== "all" && content.category !== categoryFilter) return false
      if (statusFilter !== "all" && entry.status !== statusFilter) return false
      if (search && !content.title.toLowerCase().includes(search.toLowerCase()) && !content.instructor.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [categoryFilter, statusFilter, search, getEntry, getContent])

  useEffect(() => {
    setPage(1)
  }, [search, categoryFilter, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const rangeStart = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(safePage * PAGE_SIZE, filtered.length)

  const publishedCount = COURSES.filter((c) => getEntry(c.id).status === "published").length
  const pendingCount = COURSES.filter((c) => getEntry(c.id).status === "pending-review").length
  const draftCount = COURSES.filter((c) => getEntry(c.id).status === "draft" || getEntry(c.id).status === "unpublished").length

  const stats = [
    { label: "Total Courses", value: COURSES.length, icon: BookOpen, color: "#3B82F6" },
    { label: "Published", value: publishedCount, icon: CheckCircle2, color: "#10B981" },
    { label: "Pending Review", value: pendingCount, icon: Clock, color: "#F59E0B" },
    { label: "Draft / Unpublished", value: draftCount, icon: EyeOff, color: "#64748B" },
  ]

  return (
    <DashboardLayout role="admin" userName="Morgan Patel">
      <div className="space-y-6 max-w-6xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Courses</h1>
          <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>
            Review, publish, and merchandise courses across the catalog.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-2xl p-5" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
              <div className="flex items-center justify-center w-10 h-10 rounded-xl mb-3" style={{ backgroundColor: `${color}20` }}>
                <Icon size={20} style={{ color }} />
              </div>
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-xs mt-0.5" style={{ color: "#64748B" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#64748B" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or instructor..."
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg outline-none"
              style={{ backgroundColor: "#1E293B", border: "1px solid #334155", color: "#F8FAFC" }}
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as "all" | CourseCategory)}
            className="px-3 py-2.5 rounded-lg text-sm outline-none"
            style={{ backgroundColor: "#1E293B", border: "1px solid #334155", color: "#F8FAFC" }}
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | CourseStatus)}
            className="px-3 py-2.5 rounded-lg text-sm outline-none"
            style={{ backgroundColor: "#1E293B", border: "1px solid #334155", color: "#F8FAFC" }}
          >
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="pending-review">Pending Review</option>
            <option value="draft">Draft</option>
            <option value="unpublished">Unpublished</option>
          </select>
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid #334155" }}>
                {["Course", "Instructor", "Students", "Rating", "Price", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#64748B" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((c, i) => {
                const entry = getEntry(c.id)
                const content = getContent(c)
                return (
                  <tr
                    key={c.id}
                    className="transition-colors"
                    style={{ borderBottom: i < paginated.length - 1 ? "1px solid #334155" : "none" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#334155")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex items-center justify-center w-9 h-9 rounded-lg text-base flex-shrink-0"
                          style={{ backgroundColor: `${c.thumbnailColor}20` }}
                        >
                          {c.thumbnail}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <Link href={`/admin/courses/${c.id}`} className="font-medium text-white truncate hover:underline">
                              {content.title}
                            </Link>
                            {(["featured", "premium", "topRated"] as CourseBadge[]).filter((b) => entry[b]).map((b) => {
                              const Icon = badgeMeta[b].icon
                              return <Icon key={b} size={12} style={{ color: badgeMeta[b].color }} />
                            })}
                          </div>
                          <p className="text-xs" style={{ color: "#64748B" }}>{content.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4" style={{ color: "#94A3B8" }}>{content.instructor}</td>
                    <td className="px-5 py-4" style={{ color: "#94A3B8" }}>{c.studentsCount.toLocaleString()}</td>
                    <td className="px-5 py-4" style={{ color: "#94A3B8" }}>
                      <span className="flex items-center gap-1">
                        <Star size={13} fill="#F59E0B" style={{ color: "#F59E0B" }} />
                        {c.rating}
                      </span>
                    </td>
                    <td className="px-5 py-4" style={{ color: "#94A3B8" }}>
                      {content.price === "Free" ? "Free" : `$${content.price}`}
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={entry.status}
                        onChange={(e) => setStatus(c.id, e.target.value as CourseStatus)}
                        className="px-2 py-1 rounded-full text-xs font-semibold outline-none border-none"
                        style={statusColors[entry.status]}
                      >
                        <option value="published">Published</option>
                        <option value="pending-review">Pending Review</option>
                        <option value="draft">Draft</option>
                        <option value="unpublished">Unpublished</option>
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        {(["featured", "premium", "topRated"] as CourseBadge[]).map((b) => {
                          const { icon: Icon, color, label } = badgeMeta[b]
                          const active = entry[b]
                          return (
                            <button
                              key={b}
                              onClick={() => toggleBadge(c.id, b)}
                              title={`${active ? "Remove" : "Mark"} ${label}`}
                              className="flex items-center justify-center w-7 h-7 rounded-lg"
                              style={{ backgroundColor: active ? `${color}20` : "#33415560", color: active ? color : "#64748B" }}
                            >
                              <Icon size={13} />
                            </button>
                          )
                        })}
                        <Link
                          href={`/admin/courses/${c.id}`}
                          title="Edit course details"
                          className="flex items-center justify-center w-7 h-7 rounded-lg"
                          style={{ backgroundColor: "#33415560", color: "#94A3B8" }}
                        >
                          <Pencil size={13} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm" style={{ color: "#475569" }}>
                    No courses match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {filtered.length > 0 && (
            <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: "1px solid #334155" }}>
              <p className="text-xs" style={{ color: "#64748B" }}>
                Showing {rangeStart}–{rangeEnd} of {filtered.length} courses
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="flex items-center justify-center w-8 h-8 rounded-lg disabled:opacity-40"
                  style={{ backgroundColor: "#33415560", color: "#94A3B8" }}
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="text-xs font-medium" style={{ color: "#94A3B8" }}>
                  Page {safePage} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="flex items-center justify-center w-8 h-8 rounded-lg disabled:opacity-40"
                  style={{ backgroundColor: "#33415560", color: "#94A3B8" }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl p-4 flex items-center gap-3" style={{ backgroundColor: "#1E293B", border: "1px dashed #334155" }}>
          <FileEdit size={16} style={{ color: "#475569" }} />
          <p className="text-xs" style={{ color: "#64748B" }}>
            Status, Featured, Premium, and Top Rated changes are saved instantly and reflected for all learners browsing the catalog.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
