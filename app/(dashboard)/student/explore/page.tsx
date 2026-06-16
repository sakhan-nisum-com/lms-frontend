"use client"

import { useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { CourseThumbnail } from "@/components/CourseThumbnail"
import { COURSES, STUDENT_PROFILE } from "@/lib/data/courses"
import type { CourseCategory, CourseLevel } from "@/lib/data/courses"
import { usePurchases } from "@/lib/hooks/usePurchases"
import {
  Search, Star, Clock, Users, Filter, X, ChevronRight, TrendingUp, Zap,
} from "lucide-react"

type SortOption = "popular" | "rating" | "newest" | "price-low" | "price-high"

const categories: { label: string; value: CourseCategory | "all"; icon: string }[] = [
  { label: "All", value: "all", icon: "🎓" },
  { label: "Engineering", value: "Engineering", icon: "💻" },
  { label: "Data Science", value: "Data Science", icon: "📊" },
  { label: "Design", value: "Design", icon: "🎨" },
  { label: "Business", value: "Business", icon: "📈" },
  { label: "Security", value: "Security", icon: "🔒" },
  { label: "Compliance", value: "Compliance", icon: "📋" },
  { label: "Leadership", value: "Leadership", icon: "🎯" },
  { label: "Product", value: "Product", icon: "📱" },
]

const levelColors: Record<CourseLevel, string> = {
  Beginner: "#10B981",
  Intermediate: "#F59E0B",
  Advanced: "#EF4444",
}

const levels: CourseLevel[] = ["Beginner", "Intermediate", "Advanced"]

export default function ExplorePage() {
  const p = STUDENT_PROFILE
  const { isPurchased } = usePurchases()
  const enrolledIds = new Set(COURSES.filter((c) => c.progress !== undefined || isPurchased(c.id)).map((c) => c.id))
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<CourseCategory | "all">("all")
  const [selectedLevels, setSelectedLevels] = useState<Set<CourseLevel>>(new Set())
  const [sort, setSort] = useState<SortOption>("popular")
  const [showFreeOnly, setShowFreeOnly] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)

  const toggleLevel = (l: CourseLevel) =>
    setSelectedLevels((prev) => {
      const n = new Set(prev)
      n.has(l) ? n.delete(l) : n.add(l)
      return n
    })

  const filtered = COURSES
    .filter((c) => {
      if (query && !c.title.toLowerCase().includes(query.toLowerCase()) && !c.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))) return false
      if (category !== "all" && c.category !== category) return false
      if (selectedLevels.size > 0 && !selectedLevels.has(c.level)) return false
      if (showFreeOnly && c.price !== "Free") return false
      return true
    })
    .sort((a, b) => {
      if (sort === "popular") return b.studentsCount - a.studentsCount
      if (sort === "rating") return b.rating - a.rating
      if (sort === "newest") return a.id > b.id ? -1 : 1
      if (sort === "price-low") {
        const pa = a.price === "Free" ? 0 : a.price as number
        const pb = b.price === "Free" ? 0 : b.price as number
        return pa - pb
      }
      if (sort === "price-high") {
        const pa = a.price === "Free" ? 0 : a.price as number
        const pb = b.price === "Free" ? 0 : b.price as number
        return pb - pa
      }
      return 0
    })

  const featured = COURSES.filter((c) => c.studentsCount > 30000).slice(0, 3)
  const trending = COURSES.filter((c) => c.rating >= 4.8).slice(0, 4)

  const hasFilters = category !== "all" || selectedLevels.size > 0 || showFreeOnly || query

  return (
    <DashboardLayout role="student" userName={p.name}>
      <div className="space-y-6 max-w-7xl">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Explore Catalog</h1>
          <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>
            {COURSES.length} courses across engineering, data, compliance, design, and more
          </p>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#64748B" }} />
          <input
            type="text"
            placeholder="Search courses, topics, instructors..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm outline-none"
            style={{
              backgroundColor: "#1E293B",
              border: "1px solid #334155",
              color: "#F8FAFC",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#3B82F6")}
            onBlur={(e) => (e.target.style.borderColor = "#334155")}
          />
          {query && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2"
              onClick={() => setQuery("")}
            >
              <X size={15} style={{ color: "#64748B" }} />
            </button>
          )}
        </div>

        {/* Category tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {categories.map(({ label, value, icon }) => (
            <button
              key={value}
              onClick={() => setCategory(value as CourseCategory | "all")}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all flex-shrink-0"
              style={{
                backgroundColor: category === value ? "#3B82F6" : "#1E293B",
                color: category === value ? "#fff" : "#94A3B8",
                border: `1px solid ${category === value ? "#3B82F6" : "#334155"}`,
              }}
            >
              <span style={{ fontSize: 14 }}>{icon}</span> {label}
            </button>
          ))}
        </div>

        {/* Featured (only show when no filters active) */}
        {!hasFilters && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Zap size={16} style={{ color: "#F59E0B" }} fill="#F59E0B" />
              <h2 className="text-base font-bold text-white">Featured Courses</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featured.map((course) => (
                <Link
                  key={course.id}
                  href={`/student/courses/${course.id}`}
                  className="rounded-2xl overflow-hidden transition-all duration-150 group"
                  style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${course.thumbnailColor}60`)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#334155")}
                >
                  <CourseThumbnail course={course} locked={course.price !== "Free" && !enrolledIds.has(course.id)} />
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${course.thumbnailColor}20`, color: course.thumbnailColor }}
                      >
                        {course.category}
                      </span>
                      {enrolledIds.has(course.id) && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#10B98120", color: "#10B981" }}>Enrolled</span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1 line-clamp-2">{course.title}</h3>
                    <p className="text-xs mb-2" style={{ color: "#64748B" }}>{course.instructor}</p>
                    <div className="flex items-center justify-between text-xs" style={{ color: "#64748B" }}>
                      <span className="flex items-center gap-1">
                        <Star size={11} fill="#F59E0B" style={{ color: "#F59E0B" }} />
                        <strong className="text-white">{course.rating}</strong>
                        <span>({course.reviewCount.toLocaleString()})</span>
                      </span>
                      <span className="font-bold" style={{ color: course.price === "Free" ? "#10B981" : "#F8FAFC" }}>
                        {course.price === "Free" ? "Free" : `$${course.price}`}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Trending (only show when no filters) */}
        {!hasFilters && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={16} style={{ color: "#3B82F6" }} />
              <h2 className="text-base font-bold text-white">Trending Now</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {trending.map((course, i) => (
                <Link
                  key={course.id}
                  href={`/student/courses/${course.id}`}
                  className="rounded-xl p-3 flex items-center gap-3 transition-all"
                  style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
                >
                  <span className="text-lg font-black flex-shrink-0" style={{ color: "#334155" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-xl text-xl flex-shrink-0"
                    style={{ backgroundColor: `${course.thumbnailColor}15` }}
                  >
                    {course.thumbnail}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{course.title}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star size={10} fill="#F59E0B" style={{ color: "#F59E0B" }} />
                      <span className="text-xs" style={{ color: "#64748B" }}>{course.rating}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* All courses section */}
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-bold text-white">
                {hasFilters ? `Results` : "All Courses"}
                <span className="ml-2 text-sm font-normal" style={{ color: "#64748B" }}>({filtered.length})</span>
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {/* Filter button */}
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: filterOpen ? "#3B82F620" : "#1E293B",
                  color: filterOpen ? "#60A5FA" : "#94A3B8",
                  border: "1px solid #334155",
                }}
              >
                <Filter size={14} /> Filters
                {(selectedLevels.size > 0 || showFreeOnly) && (
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#3B82F6" }} />
                )}
              </button>

              {/* Sort */}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="px-3 py-2 rounded-lg text-sm outline-none"
                style={{ backgroundColor: "#1E293B", border: "1px solid #334155", color: "#94A3B8" }}
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Filter panel */}
          {filterOpen && (
            <div
              className="rounded-2xl p-4 mb-4 flex items-center gap-8 flex-wrap"
              style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#475569" }}>Level</p>
                <div className="flex gap-2">
                  {levels.map((l) => (
                    <button
                      key={l}
                      onClick={() => toggleLevel(l)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors"
                      style={{
                        backgroundColor: selectedLevels.has(l) ? `${levelColors[l]}30` : "#334155",
                        color: selectedLevels.has(l) ? levelColors[l] : "#94A3B8",
                        border: `1px solid ${selectedLevels.has(l) ? levelColors[l] : "transparent"}`,
                      }}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#475569" }}>Price</p>
                <button
                  onClick={() => setShowFreeOnly(!showFreeOnly)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors"
                  style={{
                    backgroundColor: showFreeOnly ? "#10B98130" : "#334155",
                    color: showFreeOnly ? "#10B981" : "#94A3B8",
                    border: `1px solid ${showFreeOnly ? "#10B981" : "transparent"}`,
                  }}
                >
                  Free Only
                </button>
              </div>
              {(selectedLevels.size > 0 || showFreeOnly) && (
                <button
                  className="ml-auto text-xs"
                  style={{ color: "#EF4444" }}
                  onClick={() => { setSelectedLevels(new Set()); setShowFreeOnly(false) }}
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {filtered.length === 0 ? (
            <div
              className="rounded-2xl p-12 text-center"
              style={{ backgroundColor: "#1E293B", border: "1px dashed #334155" }}
            >
              <Search size={36} className="mx-auto mb-3" style={{ color: "#334155" }} />
              <p className="text-sm font-medium text-white mb-1">No courses found</p>
              <p className="text-xs" style={{ color: "#64748B" }}>Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((course) => (
                <Link
                  key={course.id}
                  href={`/student/courses/${course.id}`}
                  className="rounded-2xl overflow-hidden flex flex-col transition-all duration-150"
                  style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${course.thumbnailColor}50`)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#334155")}
                >
                  <CourseThumbnail course={course} locked={course.price !== "Free" && !enrolledIds.has(course.id)} />
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ color: levelColors[course.level], backgroundColor: `${levelColors[course.level]}15` }}
                      >
                        {course.level}
                      </span>
                      {course.isMandatory && (
                        <span className="text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "#EF444420", color: "#EF4444" }}>Required</span>
                      )}
                      {enrolledIds.has(course.id) && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#10B98120", color: "#10B981" }}>Enrolled</span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-white mb-1 line-clamp-2">{course.title}</h3>
                    <p className="text-xs mb-3" style={{ color: "#64748B" }}>{course.instructor} · {course.instructorTitle.split("@")[1]?.trim() ?? course.instructorTitle}</p>

                    <p className="text-xs mb-3 line-clamp-2 flex-1" style={{ color: "#94A3B8" }}>{course.shortDesc}</p>

                    <div className="flex items-center gap-3 mb-3 text-xs" style={{ color: "#64748B" }}>
                      <span className="flex items-center gap-0.5">
                        <Star size={11} fill="#F59E0B" style={{ color: "#F59E0B" }} />
                        <strong className="text-white ml-0.5">{course.rating}</strong>
                        <span className="ml-0.5">({course.reviewCount.toLocaleString()})</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={11} />
                        {course.studentsCount >= 1000 ? `${(course.studentsCount / 1000).toFixed(0)}k` : course.studentsCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> {course.totalDuration}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold" style={{ color: course.price === "Free" ? "#10B981" : "#F8FAFC" }}>
                        {course.price === "Free" ? "Free" : `$${course.price}`}
                      </span>
                      <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#3B82F6" }}>
                        View details <ChevronRight size={13} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  )
}
