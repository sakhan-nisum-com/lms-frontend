"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { GraduationCap, Search, Menu, X, ChevronDown, BookOpen, GraduationCap as TrainingIcon, Clock } from "lucide-react"
import { COURSES } from "@/lib/data/courses"
import type { Course, CourseCategory } from "@/lib/data/courses"
import { CATEGORIES } from "@/lib/data/categories"
import { TRAINING_TRACKS } from "@/lib/data/trainings"
import { usePurchases } from "@/lib/hooks/usePurchases"
import { useTrainingEnrollments } from "@/lib/hooks/useTrainingEnrollments"

const PROMO_HEIGHT = 40
const MAIN_HEADER_HEIGHT = 64
const CATEGORY_BAR_HEIGHT = 46
const MAX_LEARNING_PREVIEW = 5

interface LearningItem {
  id: string
  href: string
  title: string
  meta: string
  progress: number
  type: "course" | "training"
  color: string
}

export function SiteHeader() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [promoOpen, setPromoOpen] = useState(true)
  const [openCategory, setOpenCategory] = useState<CourseCategory | null>(null)
  const [learningOpen, setLearningOpen] = useState(false)
  const searchRef = useRef<HTMLFormElement>(null)
  const learningRef = useRef<HTMLDivElement>(null)
  const { isPurchased } = usePurchases()
  const { isEnrolled } = useTrainingEnrollments()

  useEffect(() => {
    const height = (promoOpen ? PROMO_HEIGHT : 0) + MAIN_HEADER_HEIGHT + CATEGORY_BAR_HEIGHT
    document.documentElement.style.setProperty("--app-header-height", `${height}px`)
  }, [promoOpen])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false)
      if (learningRef.current && !learningRef.current.contains(e.target as Node)) setLearningOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push("/student/explore")
  }

  const query = search.trim().toLowerCase()
  const searchResults = query
    ? COURSES.filter((c) =>
        c.title.toLowerCase().includes(query) ||
        c.instructor.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query) ||
        c.tags.some((t) => t.toLowerCase().includes(query))
      ).slice(0, 6)
    : []

  const myCourses: LearningItem[] = COURSES
    .filter((c) => c.progress !== undefined || isPurchased(c.id))
    .map((c) => ({
      id: c.id,
      href: `/student/courses/${c.id}`,
      title: c.title,
      meta: c.instructor,
      progress: c.progress ?? 0,
      type: "course",
      color: c.thumbnailColor,
    }))

  const myTrainings: LearningItem[] = TRAINING_TRACKS
    .filter((t) => t.enrolled || isEnrolled(t.id))
    .map((t) => ({
      id: t.id,
      href: `/student/trainings/${t.id}`,
      title: t.title,
      meta: `${t.courses} modules`,
      progress: t.progress,
      type: "training",
      color: t.badgeColor,
    }))

  const myLearning = [...myCourses, ...myTrainings]
  const learningPreview = myLearning.slice(0, MAX_LEARNING_PREVIEW)

  return (
    <>
      {/* ── PROMO BANNER ── */}
      {promoOpen && (
        <div style={{ position: "sticky", top: 0, zIndex: 52, height: PROMO_HEIGHT, backgroundColor: "#1d3a5f" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", height: "100%", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#f8fafc", textAlign: "center" }}>
              3 days left! Get started with courses from $9.99
            </span>
            <Link href="/register" style={{ fontSize: 13, fontWeight: 700, color: "#7dd3fc", textDecoration: "underline", flexShrink: 0 }}>
              Claim offer
            </Link>
            <button
              onClick={() => setPromoOpen(false)}
              aria-label="Dismiss promo"
              style={{ position: "absolute", right: 24, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#f8fafc", display: "flex" }}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── MAIN HEADER ── */}
      <header
        style={{
          position: "sticky", top: promoOpen ? PROMO_HEIGHT : 0, zIndex: 51,
          backgroundColor: "#0f172a",
          borderBottom: "1px solid #1e293b",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", height: MAIN_HEADER_HEIGHT, display: "flex", alignItems: "center", gap: 24 }}>

          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", flexShrink: 0 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GraduationCap size={18} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 18, color: "#f8fafc" }}>LearnFlow</span>
          </Link>

          {/* Primary links */}
          <nav className="hidden md:flex" style={{ alignItems: "center", gap: 16, flexShrink: 0 }}>
            <Link href="/student/explore" style={{ color: "#cbd5e1", fontSize: 13.5, fontWeight: 600, textDecoration: "none" }}>
              Find Courses
            </Link>
            <Link href="/instructors" style={{ color: "#cbd5e1", fontSize: 13.5, fontWeight: 600, textDecoration: "none" }}>
              Instructors
            </Link>
            <Link href="/student/certificates" style={{ color: "#cbd5e1", fontSize: 13.5, fontWeight: 600, textDecoration: "none" }}>
              Get Certified
            </Link>
          </nav>

          {/* Search bar */}
          <form ref={searchRef} onSubmit={submitSearch} className="hidden sm:flex" style={{ flex: 1, maxWidth: 560, position: "relative" }}>
            <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              type="text"
              placeholder="Search for anything"
              style={{
                width: "100%", padding: "10px 14px 10px 38px", borderRadius: 100,
                backgroundColor: "#1e293b", border: "1px solid #334155", color: "#f8fafc", fontSize: 14, outline: "none",
              }}
            />
            {searchOpen && query && (
              <SearchDropdown results={searchResults} query={search} onSelect={() => setSearchOpen(false)} />
            )}
          </form>

          {/* Right nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: 18, marginLeft: "auto", flexShrink: 0 }}>
            <div ref={learningRef} className="hidden sm:block" style={{ position: "relative", flexShrink: 0 }}>
              <button
                onClick={() => setLearningOpen(!learningOpen)}
                className="flex items-center gap-1"
                style={{ fontSize: 13.5, fontWeight: 600, color: "#cbd5e1", background: "none", border: "none", cursor: "pointer", padding: "8px 0" }}
              >
                My Learning
                <ChevronDown size={13} style={{ transform: learningOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
              </button>
              {learningOpen && (
                <div
                  style={{
                    position: "absolute", top: "calc(100% + 8px)", right: 0, width: 320, borderRadius: 14,
                    backgroundColor: "#1e293b", border: "1px solid #334155", boxShadow: "0 16px 40px rgba(0,0,0,0.45)",
                    overflow: "hidden", zIndex: 70,
                  }}
                >
                  {learningPreview.length === 0 ? (
                    <div style={{ padding: "24px 18px", textAlign: "center" }}>
                      <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 10 }}>You haven&apos;t enrolled in anything yet.</p>
                      <Link
                        href="/student/explore"
                        onClick={() => setLearningOpen(false)}
                        style={{ fontSize: 13, fontWeight: 700, color: "#3b82f6", textDecoration: "none" }}
                      >
                        Explore courses →
                      </Link>
                    </div>
                  ) : (
                    <>
                      {learningPreview.map((item) => (
                        <Link
                          key={`${item.type}-${item.id}`}
                          href={item.href}
                          onClick={() => setLearningOpen(false)}
                          className="flex items-center gap-3"
                          style={{ padding: "10px 14px", borderBottom: "1px solid #33415560", textDecoration: "none" }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#334155")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        >
                          <div
                            className="flex items-center justify-center flex-shrink-0"
                            style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: `${item.color}20` }}
                          >
                            {item.type === "course" ? (
                              <BookOpen size={14} style={{ color: item.color }} />
                            ) : (
                              <TrainingIcon size={14} style={{ color: item.color }} />
                            )}
                          </div>
                          <span style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#f8fafc", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {item.title}
                            </span>
                            <span style={{ display: "block", fontSize: 11.5, color: "#64748b" }}>{item.meta} · {item.progress}% complete</span>
                          </span>
                        </Link>
                      ))}
                      <Link
                        href="/student/my-learning"
                        onClick={() => setLearningOpen(false)}
                        className="flex items-center justify-center gap-1.5"
                        style={{ padding: "12px", fontSize: 12.5, fontWeight: 700, color: "#3b82f6", textDecoration: "none" }}
                      >
                        <Clock size={13} /> View My Learning
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
            <Link href="/#business" className="hidden lg:inline" style={{ color: "#cbd5e1", fontSize: 13.5, fontWeight: 600, textDecoration: "none" }}>
              LearnFlow Business
            </Link>
            <Link href="/instructor/register" className="hidden lg:inline" style={{ color: "#cbd5e1", fontSize: 13.5, fontWeight: 600, textDecoration: "none" }}>
              Teach on LearnFlow
            </Link>
            <Link href="/login" className="hidden sm:inline" style={{ color: "#cbd5e1", fontSize: 13.5, fontWeight: 600, textDecoration: "none" }}>
              Log in
            </Link>
            <Link href="/register" style={{
              backgroundColor: "transparent", color: "#f8fafc", fontSize: 13.5, fontWeight: 700,
              padding: "8px 16px", borderRadius: 8, textDecoration: "none", border: "1px solid #475569",
            }}>
              Sign up
            </Link>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden" style={{ background: "none", border: "none", color: "#e2e8f0", cursor: "pointer" }}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </nav>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden" style={{ borderTop: "1px solid #1e293b", padding: "12px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
            <Link href="/student/explore" onClick={() => setMobileOpen(false)} style={{ color: "#cbd5e1", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Find Courses</Link>
            <Link href="/student/my-learning" onClick={() => setMobileOpen(false)} style={{ color: "#cbd5e1", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>My Learning</Link>
            <Link href="/instructors" onClick={() => setMobileOpen(false)} style={{ color: "#cbd5e1", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Instructors</Link>
            <Link href="/student/certificates" onClick={() => setMobileOpen(false)} style={{ color: "#cbd5e1", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Get Certified</Link>
            <Link href="/#business" onClick={() => setMobileOpen(false)} style={{ color: "#cbd5e1", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>LearnFlow Business</Link>
            <Link href="/instructor/register" onClick={() => setMobileOpen(false)} style={{ color: "#cbd5e1", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Teach on LearnFlow</Link>
            <Link href="/login" onClick={() => setMobileOpen(false)} style={{ color: "#cbd5e1", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Log in</Link>
          </div>
        )}
      </header>

      {/* ── CATEGORY NAV BAR ── */}
      <div
        className="hidden lg:block"
        style={{
          position: "sticky", top: (promoOpen ? PROMO_HEIGHT : 0) + MAIN_HEADER_HEIGHT, zIndex: 50,
          backgroundColor: "#0f172a", borderBottom: "1px solid #1e293b", height: CATEGORY_BAR_HEIGHT,
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", height: "100%" }}>
          <div className="flex gap-6 h-full items-center">
            {CATEGORIES.map((c) => (
              <div
                key={c.value}
                className="relative h-full flex-shrink-0 flex items-center"
                onMouseEnter={() => setOpenCategory(c.value)}
                onMouseLeave={() => setOpenCategory(null)}
              >
                <Link
                  href={`/courses/${c.slug}`}
                  className="flex items-center gap-1"
                  style={{ fontSize: 13.5, fontWeight: 600, color: "#cbd5e1", textDecoration: "none", whiteSpace: "nowrap" }}
                >
                  {c.label}
                  <ChevronDown size={13} style={{ transform: openCategory === c.value ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
                </Link>
                {openCategory === c.value && (
                  <div
                    style={{
                      position: "absolute", top: "100%", left: 0, minWidth: 230, borderRadius: 12,
                      backgroundColor: "#1e293b", border: "1px solid #334155", boxShadow: "0 16px 40px rgba(0,0,0,0.45)",
                      padding: 8, zIndex: 60,
                    }}
                  >
                    {c.subcategories.map((sub) => (
                      <Link
                        key={sub}
                        href={`/courses/${c.slug}`}
                        onClick={() => setOpenCategory(null)}
                        style={{ display: "block", padding: "9px 12px", borderRadius: 8, color: "#cbd5e1", fontSize: 13, textDecoration: "none" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#334155")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        {sub}
                      </Link>
                    ))}
                    <div style={{ borderTop: "1px solid #334155", margin: "4px 4px 0" }}>
                      <Link
                        href={`/courses/${c.slug}`}
                        onClick={() => setOpenCategory(null)}
                        style={{ display: "block", padding: "9px 12px", borderRadius: 8, color: "#3b82f6", fontSize: 13, fontWeight: 700, textDecoration: "none" }}
                      >
                        View all {c.label} →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

function SearchDropdown({ results, query, onSelect }: { results: Course[]; query: string; onSelect: () => void }) {
  return (
    <div
      style={{
        position: "absolute", left: 0, right: 0, top: "calc(100% + 8px)", borderRadius: 14,
        backgroundColor: "#1e293b", border: "1px solid #334155", boxShadow: "0 16px 40px rgba(0,0,0,0.45)",
        overflow: "hidden", zIndex: 70, textAlign: "left",
      }}
    >
      {results.length === 0 ? (
        <p style={{ padding: "20px 16px", fontSize: 13, color: "#64748b", textAlign: "center" }}>
          No courses found for &ldquo;{query}&rdquo;
        </p>
      ) : (
        <>
          {results.map((c) => (
            <Link
              key={c.id}
              href={`/student/courses/${c.id}`}
              onClick={onSelect}
              className="flex items-center gap-3"
              style={{ padding: "10px 14px", borderBottom: "1px solid #33415560", textDecoration: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#334155")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <span style={{ fontSize: 20, flexShrink: 0 }}>{c.thumbnail}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: "#f8fafc", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {c.title}
                </span>
                <span style={{ display: "block", fontSize: 12, color: "#64748b" }}>{c.instructor} · {c.category}</span>
              </span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: c.price === "Free" ? "#10B981" : "#f8fafc", flexShrink: 0 }}>
                {c.price === "Free" ? "Free" : `$${c.price}`}
              </span>
            </Link>
          ))}
          <Link
            href="/student/explore"
            onClick={onSelect}
            className="block text-center"
            style={{ padding: "10px", fontSize: 12.5, fontWeight: 700, color: "#3b82f6", textDecoration: "none" }}
          >
            See all results in catalog →
          </Link>
        </>
      )}
    </div>
  )
}
