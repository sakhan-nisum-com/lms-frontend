"use client"

import { useState, use } from "react"
import Link from "next/link"
import { COURSES } from "@/lib/data/courses"
import type { CourseLevel } from "@/lib/data/courses"
import { CATEGORIES, getCategoryBySlug } from "@/lib/data/categories"
import { CourseThumbnail } from "@/components/CourseThumbnail"
import { usePurchases } from "@/lib/hooks/usePurchases"
import { Star, Clock, Users, ChevronRight, ChevronDown, ChevronUp } from "lucide-react"

type SortOption = "popular" | "rating" | "newest" | "price-low" | "price-high"
type PriceFilter = "all" | "paid" | "free"

const levelColors: Record<CourseLevel, string> = {
  Beginner: "#10B981",
  Intermediate: "#F59E0B",
  Advanced: "#EF4444",
}

const LEVELS: CourseLevel[] = ["Beginner", "Intermediate", "Advanced"]
const RATING_OPTIONS = [4.5, 4.0, 3.5, 3.0]
const DURATION_OPTIONS: { key: string; label: string; test: (hours: number) => boolean }[] = [
  { key: "short", label: "0-3 Hours", test: (h) => h <= 3 },
  { key: "medium", label: "3-9 Hours", test: (h) => h > 3 && h <= 9 },
  { key: "long", label: "9-17 Hours", test: (h) => h > 9 && h <= 17 },
  { key: "extra-long", label: "17+ Hours", test: (h) => h > 17 },
]

function parseHours(duration: string): number {
  const match = duration.match(/(\d+)h\s*(\d+)?/)
  if (!match) return 0
  const hours = Number(match[1] ?? 0)
  const minutes = Number(match[2] ?? 0)
  return hours + minutes / 60
}

export default function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = use(params)
  const categoryMeta = getCategoryBySlug(slug)

  const { isPurchased } = usePurchases()
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set())
  const [selectedLevels, setSelectedLevels] = useState<Set<CourseLevel>>(new Set())
  const [minRating, setMinRating] = useState<number | null>(null)
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all")
  const [selectedDurations, setSelectedDurations] = useState<Set<string>>(new Set())
  const [sort, setSort] = useState<SortOption>("popular")
  const [topicsExpanded, setTopicsExpanded] = useState(false)

  if (!categoryMeta) {
    return (
      <main style={{ minHeight: "calc(100vh - var(--app-header-height, 150px))", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ textAlign: "center" }}>
          <h1 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Category not found</h1>
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>We couldn&apos;t find that course category.</p>
          <Link href="/" style={{ color: "var(--accent)", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>← Back to home</Link>
        </div>
      </main>
    )
  }

  const categoryCourses = COURSES.filter((c) => c.category === categoryMeta.value)
  const topics = [...new Set(categoryCourses.flatMap((c) => c.tags))].sort()
  const visibleTopics = topicsExpanded ? topics : topics.slice(0, 8)

  const toggleInSet = <T,>(set: Set<T>, value: T, setter: (s: Set<T>) => void) => {
    const next = new Set(set)
    if (next.has(value)) {
      next.delete(value)
    } else {
      next.add(value)
    }
    setter(next)
  }

  const filtered = categoryCourses
    .filter((c) => {
      if (selectedTopics.size > 0 && !c.tags.some((t) => selectedTopics.has(t))) return false
      if (selectedLevels.size > 0 && !selectedLevels.has(c.level)) return false
      if (minRating !== null && c.rating < minRating) return false
      if (priceFilter === "paid" && c.price === "Free") return false
      if (priceFilter === "free" && c.price !== "Free") return false
      if (selectedDurations.size > 0) {
        const hours = parseHours(c.totalDuration)
        const matches = DURATION_OPTIONS.some((d) => selectedDurations.has(d.key) && d.test(hours))
        if (!matches) return false
      }
      return true
    })
    .sort((a, b) => {
      if (sort === "popular") return b.studentsCount - a.studentsCount
      if (sort === "rating") return b.rating - a.rating
      if (sort === "newest") return a.id > b.id ? -1 : 1
      const pa = a.price === "Free" ? 0 : (a.price as number)
      const pb = b.price === "Free" ? 0 : (b.price as number)
      return sort === "price-low" ? pa - pb : pb - pa
    })

  const hasFilters = selectedTopics.size > 0 || selectedLevels.size > 0 || minRating !== null || priceFilter !== "all" || selectedDurations.size > 0

  const clearFilters = () => {
    setSelectedTopics(new Set())
    setSelectedLevels(new Set())
    setMinRating(null)
    setPriceFilter("all")
    setSelectedDurations(new Set())
  }

  return (
    <main style={{ backgroundColor: "var(--bg-canvas)", color: "var(--text-primary)", minHeight: "calc(100vh - var(--app-header-height, 150px))" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 24px 64px" }}>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs mb-4" style={{ color: "var(--text-tertiary)" }}>
          <Link href="/" style={{ color: "var(--text-tertiary)", textDecoration: "none" }}>Home</Link>
          <ChevronRight size={12} />
          <span style={{ color: "var(--text-secondary)" }}>{categoryMeta.label}</span>
        </div>

        {/* Page header */}
        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>{categoryMeta.label} Courses</h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          {categoryCourses.length} courses to build in-demand {categoryMeta.label.toLowerCase()} skills, taught by real-world experts.
        </p>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── SIDEBAR FILTERS ── */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Filter</h2>
              {hasFilters && (
                <button onClick={clearFilters} className="text-xs font-semibold" style={{ color: "var(--accent)" }}>
                  Clear all
                </button>
              )}
            </div>

            {/* Topic */}
            {topics.length > 0 && (
              <div className="mb-6 pb-6" style={{ borderBottom: "1px solid var(--border-default)" }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-tertiary)" }}>Topic</p>
                <div className="space-y-2.5">
                  {visibleTopics.map((topic) => (
                    <label key={topic} className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTopics.has(topic)}
                        onChange={() => toggleInSet(selectedTopics, topic, setSelectedTopics)}
                        className="w-4 h-4 rounded"
                        style={{ accentColor: "#3b82f6" }}
                      />
                      <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{topic}</span>
                    </label>
                  ))}
                </div>
                {topics.length > 8 && (
                  <button
                    onClick={() => setTopicsExpanded(!topicsExpanded)}
                    className="flex items-center gap-1 mt-3 text-xs font-semibold"
                    style={{ color: "var(--accent)" }}
                  >
                    {topicsExpanded ? <>Show less <ChevronUp size={13} /></> : <>Show more <ChevronDown size={13} /></>}
                  </button>
                )}
              </div>
            )}

            {/* Level */}
            <div className="mb-6 pb-6" style={{ borderBottom: "1px solid var(--border-default)" }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-tertiary)" }}>Level</p>
              <div className="space-y-2.5">
                {LEVELS.map((level) => (
                  <label key={level} className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedLevels.has(level)}
                      onChange={() => toggleInSet(selectedLevels, level, setSelectedLevels)}
                      className="w-4 h-4 rounded"
                      style={{ accentColor: levelColors[level] }}
                    />
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{level}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div className="mb-6 pb-6" style={{ borderBottom: "1px solid var(--border-default)" }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-tertiary)" }}>Rating</p>
              <div className="space-y-2.5">
                {RATING_OPTIONS.map((r) => (
                  <label key={r} className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="radio"
                      name="rating"
                      checked={minRating === r}
                      onChange={() => setMinRating(minRating === r ? null : r)}
                      className="w-4 h-4"
                      style={{ accentColor: "#f59e0b" }}
                    />
                    <span className="flex items-center gap-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                      <Star size={12} fill="#F59E0B" style={{ color: "#F59E0B" }} /> {r.toFixed(1)} & up
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="mb-6 pb-6" style={{ borderBottom: "1px solid var(--border-default)" }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-tertiary)" }}>Price</p>
              <div className="space-y-2.5">
                {([["all", "All"], ["paid", "Paid"], ["free", "Free"]] as [PriceFilter, string][]).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      checked={priceFilter === key}
                      onChange={() => setPriceFilter(key)}
                      className="w-4 h-4"
                      style={{ accentColor: "#3b82f6" }}
                    />
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-tertiary)" }}>Video Duration</p>
              <div className="space-y-2.5">
                {DURATION_OPTIONS.map((d) => (
                  <label key={d.key} className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedDurations.has(d.key)}
                      onChange={() => toggleInSet(selectedDurations, d.key, setSelectedDurations)}
                      className="w-4 h-4 rounded"
                      style={{ accentColor: "#3b82f6" }}
                    />
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{d.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* ── RESULTS ── */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                {filtered.length} {filtered.length === 1 ? "result" : "results"}
              </p>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="px-3 py-2 rounded-lg text-sm outline-none"
                style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-2xl p-12 text-center" style={{ backgroundColor: "var(--bg-surface)", border: "1px dashed var(--border-default)" }}>
                <p className="text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>No courses match your filters</p>
                <p className="text-xs mb-4" style={{ color: "var(--text-tertiary)" }}>Try removing a filter to see more results.</p>
                {hasFilters && (
                  <button onClick={clearFilters} className="text-xs font-semibold" style={{ color: "var(--accent)" }}>
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((course) => {
                  const owned = course.progress !== undefined || isPurchased(course.id)
                  return (
                    <Link
                      key={course.id}
                      href={`/student/courses/${course.id}`}
                      className="rounded-2xl overflow-hidden flex flex-col transition-all duration-150 shadow-sm"
                      style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${course.thumbnailColor}50`)}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-default)")}
                    >
                      <CourseThumbnail course={course} locked={course.price !== "Free" && !owned} />
                      <div className="p-4 flex flex-col flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span
                            className="text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{ color: levelColors[course.level], backgroundColor: `${levelColors[course.level]}15` }}
                          >
                            {course.level}
                          </span>
                          {owned && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--success-bg)", color: "var(--success)" }}>Enrolled</span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold mb-1 line-clamp-2" style={{ color: "var(--text-primary)" }}>{course.title}</h3>
                        <p className="text-xs mb-3" style={{ color: "var(--text-tertiary)" }}>{course.instructor}</p>
                        <p className="text-xs mb-3 line-clamp-2 flex-1" style={{ color: "var(--text-secondary)" }}>{course.shortDesc}</p>
                        <div className="flex items-center gap-3 mb-3 text-xs" style={{ color: "var(--text-tertiary)" }}>
                          <span className="flex items-center gap-0.5">
                            <Star size={11} fill="#F59E0B" style={{ color: "#F59E0B" }} />
                            <strong className="ml-0.5" style={{ color: "var(--text-primary)" }}>{course.rating}</strong>
                            <span className="ml-0.5">({course.reviewCount.toLocaleString()})</span>
                          </span>
                          <span className="flex items-center gap-1"><Users size={11} /> {course.studentsCount >= 1000 ? `${(course.studentsCount / 1000).toFixed(0)}k` : course.studentsCount}</span>
                          <span className="flex items-center gap-1"><Clock size={11} /> {course.totalDuration}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-base font-bold" style={{ color: course.price === "Free" ? "var(--success)" : "var(--text-primary)" }}>
                            {course.price === "Free" ? "Free" : `$${course.price}`}
                          </span>
                          <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--accent)" }}>
                            View details <ChevronRight size={13} />
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── OTHER CATEGORIES ── */}
        <div className="mt-12 pt-8" style={{ borderTop: "1px solid var(--border-default)" }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-tertiary)" }}>Browse other categories</p>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.filter((c) => c.slug !== categoryMeta.slug).map((c) => (
              <Link
                key={c.slug}
                href={`/courses/${c.slug}`}
                className="text-sm font-semibold px-3.5 py-2 rounded-xl transition-colors"
                style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-secondary)", textDecoration: "none" }}
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
