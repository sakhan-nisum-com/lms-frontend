"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { CourseThumbnail } from "@/components/CourseThumbnail"
import { COURSES } from "@/lib/data/courses"
import type { Course, CourseCategory } from "@/lib/data/courses"
import { usePurchases } from "@/lib/hooks/usePurchases"
import {
  GraduationCap,
  Search,
  ChevronDown,
  Star,
  ArrowRight,
  CheckCircle2,
  Menu,
  X,
} from "lucide-react"

const CATEGORIES: { label: string; value: CourseCategory; icon: string }[] = [
  { label: "Engineering", value: "Engineering", icon: "💻" },
  { label: "Data Science", value: "Data Science", icon: "📊" },
  { label: "Design", value: "Design", icon: "🎨" },
  { label: "Business", value: "Business", icon: "📈" },
  { label: "Security", value: "Security", icon: "🔒" },
  { label: "Compliance", value: "Compliance", icon: "📋" },
  { label: "Leadership", value: "Leadership", icon: "🎯" },
  { label: "Product", value: "Product", icon: "📱" },
]

const SUGGESTED_SEARCHES = ["Python", "AWS Certification", "UX Design", "SQL", "Leadership", "Cybersecurity"]

const topCourses = [...COURSES].sort((a, b) => b.studentsCount - a.studentsCount).slice(0, 8)
const topRated = [...COURSES].sort((a, b) => b.rating - a.rating).slice(0, 8)
const engineeringCourses = COURSES.filter((c) => c.category === "Engineering")
const dataScienceCourses = COURSES.filter((c) => c.category === "Data Science")

export default function HomePage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [catOpen, setCatOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState<"header" | "hero" | null>(null)
  const catRef = useRef<HTMLDivElement>(null)
  const headerSearchRef = useRef<HTMLFormElement>(null)
  const heroSearchRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false)
      const target = e.target as Node
      const insideHeader = headerSearchRef.current?.contains(target)
      const insideHero = heroSearchRef.current?.contains(target)
      if (!insideHeader && !insideHero) setSearchOpen(null)
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

  return (
    <div style={{ backgroundColor: "#0f172a", color: "#f8fafc", minHeight: "100vh" }}>

      {/* ── HEADER ── */}
      <header
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
          backgroundColor: "#0f172a",
          borderBottom: "1px solid #1e293b",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", gap: 20 }}>

          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", flexShrink: 0 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GraduationCap size={18} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 18, color: "#f8fafc" }}>LearnFlow</span>
          </Link>

          {/* Categories dropdown */}
          <div ref={catRef} className="hidden md:block" style={{ position: "relative", flexShrink: 0 }}>
            <button
              onClick={() => setCatOpen(!catOpen)}
              style={{
                display: "flex", alignItems: "center", gap: 4, fontSize: 14, fontWeight: 600,
                color: "#e2e8f0", background: "none", border: "none", cursor: "pointer", padding: "8px 4px",
              }}
            >
              Categories <ChevronDown size={14} style={{ transform: catOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
            </button>
            {catOpen && (
              <div
                style={{
                  position: "absolute", top: 44, left: 0, width: 380, borderRadius: 12,
                  backgroundColor: "#1e293b", border: "1px solid #334155", boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
                  padding: 8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, zIndex: 60,
                }}
              >
                {CATEGORIES.map((c) => (
                  <Link
                    key={c.value}
                    href="/student/explore"
                    onClick={() => setCatOpen(false)}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 8, color: "#cbd5e1", fontSize: 13, textDecoration: "none" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#334155")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <span style={{ fontSize: 16 }}>{c.icon}</span> {c.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Search bar */}
          <form ref={headerSearchRef} onSubmit={submitSearch} className="hidden sm:flex" style={{ flex: 1, maxWidth: 560, position: "relative" }}>
            <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchOpen("header")}
              type="text"
              placeholder="Search for anything"
              style={{
                width: "100%", padding: "10px 14px 10px 38px", borderRadius: 100,
                backgroundColor: "#1e293b", border: "1px solid #334155", color: "#f8fafc", fontSize: 14, outline: "none",
              }}
            />
            {searchOpen === "header" && query && (
              <SearchDropdown results={searchResults} query={search} onSelect={() => setSearchOpen(null)} />
            )}
          </form>

          {/* Right nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: 18, marginLeft: "auto", flexShrink: 0 }}>
            <Link href="#business" className="hidden lg:inline" style={{ color: "#cbd5e1", fontSize: 13.5, fontWeight: 600, textDecoration: "none" }}>
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
            <Link href="/student/explore" onClick={() => setMobileOpen(false)} style={{ color: "#cbd5e1", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Categories</Link>
            <Link href="#business" onClick={() => setMobileOpen(false)} style={{ color: "#cbd5e1", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>LearnFlow Business</Link>
            <Link href="/instructor/register" onClick={() => setMobileOpen(false)} style={{ color: "#cbd5e1", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Teach on LearnFlow</Link>
            <Link href="/login" onClick={() => setMobileOpen(false)} style={{ color: "#cbd5e1", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Log in</Link>
          </div>
        )}
      </header>

      <main style={{ paddingTop: 64 }}>

        {/* ── PROMO STRIP ── */}
        <div style={{ backgroundColor: "#3b82f6" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "8px 24px", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>🎉 New learner offer — courses from $9.99</span>
            <Link href="/register" style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", textDecoration: "underline" }}>Claim offer →</Link>
          </div>
        </div>

        {/* ── HERO ── */}
        <section style={{ padding: "64px 24px 32px", textAlign: "center" }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <h1 style={{ fontSize: "clamp(34px, 5vw, 56px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em", color: "#f8fafc", marginBottom: 18 }}>
              Learn without limits
            </h1>
            <p style={{ fontSize: 17, color: "#94a3b8", lineHeight: 1.6, marginBottom: 32 }}>
              Explore {COURSES.length}+ courses taught by real-world experts across engineering, data, design, business, and more.
            </p>

            <form ref={heroSearchRef} onSubmit={submitSearch} style={{ position: "relative", maxWidth: 540, margin: "0 auto 20px" }}>
              <Search size={18} style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchOpen("hero")}
                type="text"
                placeholder="What do you want to learn?"
                style={{
                  width: "100%", padding: "16px 16px 16px 48px", borderRadius: 100,
                  backgroundColor: "#1e293b", border: "1px solid #334155", color: "#f8fafc", fontSize: 15, outline: "none",
                }}
              />
              <button type="submit" style={{
                position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)",
                backgroundColor: "#3b82f6", color: "#fff", fontWeight: 700, fontSize: 13.5,
                padding: "10px 20px", borderRadius: 100, border: "none", cursor: "pointer",
              }}>
                Search
              </button>
              {searchOpen === "hero" && query && (
                <SearchDropdown results={searchResults} query={search} onSelect={() => setSearchOpen(null)} />
              )}
            </form>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
              {SUGGESTED_SEARCHES.map((s) => (
                <Link key={s} href="/student/explore" style={{
                  fontSize: 12.5, color: "#94a3b8", border: "1px solid #334155", borderRadius: 100,
                  padding: "5px 12px", textDecoration: "none",
                }}>
                  {s}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── TRUST BAR ── */}
        <div style={{ borderTop: "1px solid #1e293b", borderBottom: "1px solid #1e293b", padding: "16px 24px" }}>
          <p style={{ textAlign: "center", fontSize: 13, color: "#64748b" }}>
            Trusted by <strong style={{ color: "#cbd5e1" }}>50,000+</strong> learners ·{" "}
            <strong style={{ color: "#cbd5e1" }}>{COURSES.length}+</strong> courses ·{" "}
            <strong style={{ color: "#cbd5e1" }}>98%</strong> satisfaction ·{" "}
            <strong style={{ color: "#cbd5e1" }}>200+</strong> enterprises
          </p>
        </div>

        {/* ── CATEGORY STRIP ── */}
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 24px 0" }}>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {CATEGORIES.map((c) => (
              <Link
                key={c.value}
                href="/student/explore"
                className="flex items-center gap-1.5 flex-shrink-0"
                style={{
                  fontSize: 13.5, fontWeight: 600, color: "#cbd5e1", backgroundColor: "#1e293b",
                  border: "1px solid #334155", borderRadius: 100, padding: "8px 16px", textDecoration: "none",
                }}
              >
                <span style={{ fontSize: 14 }}>{c.icon}</span> {c.label}
              </Link>
            ))}
          </div>
        </div>

        {/* ── COURSE ROWS ── */}
        <CourseRow title="Top courses right now" courses={topCourses} />
        <CourseRow title="Highest rated by learners" courses={topRated} />
        <CourseRow title="Top courses in Engineering" courses={engineeringCourses} />
        <CourseRow title="Top courses in Data Science" courses={dataScienceCourses} />

        {/* ── BUSINESS PITCH ── */}
        <section id="business" style={{ padding: "80px 24px", backgroundColor: "#0d1424" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }} className="grid-cols-1 lg:grid-cols-2">
            <div>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "#60a5fa", letterSpacing: "0.06em", textTransform: "uppercase" }}>LearnFlow Business</span>
              <h2 style={{ fontSize: 36, fontWeight: 800, color: "#f8fafc", letterSpacing: "-0.02em", margin: "12px 0 16px" }}>
                Learning that gets your whole team ahead
              </h2>
              <p style={{ color: "#94a3b8", fontSize: 15.5, lineHeight: 1.7, marginBottom: 28 }}>
                Give your organization unlimited access to our top-rated courses, real-time engagement analytics, and a dedicated customer success manager.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px" }}>
                {[
                  "Curated learning paths for every team",
                  "Real-time engagement & completion analytics",
                  "SSO, RBAC, and compliance reporting",
                  "Dedicated customer success manager",
                ].map((f) => (
                  <li key={f} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, fontSize: 14.5, color: "#cbd5e1" }}>
                    <CheckCircle2 size={17} color="#3b82f6" style={{ flexShrink: 0 }} /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                backgroundColor: "#3b82f6", color: "#fff", fontWeight: 700,
                fontSize: 14.5, padding: "13px 26px", borderRadius: 10, textDecoration: "none",
              }}>
                Get LearnFlow Business <ArrowRight size={16} />
              </Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {topRated.slice(0, 4).map((c) => (
                <div key={c.id} style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 16, padding: 20, textAlign: "center" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{c.thumbnail}</div>
                  <p style={{ fontSize: 12.5, fontWeight: 700, color: "#f8fafc", lineHeight: 1.4 }}>{c.title}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BECOME AN INSTRUCTOR ── */}
        <section id="teach" style={{ padding: "80px 24px" }}>
          <div style={{
            maxWidth: 1000, margin: "0 auto", borderRadius: 28, padding: "64px 48px",
            backgroundColor: "#1e293b", border: "1px solid #334155", textAlign: "center", position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              background: "radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.15) 0%, transparent 65%)",
            }} />
            <h2 style={{ fontSize: 36, fontWeight: 800, color: "#f8fafc", letterSpacing: "-0.02em", marginBottom: 16, position: "relative" }}>
              Turn what you know into an opportunity
            </h2>
            <p style={{ color: "#94a3b8", fontSize: 16, marginBottom: 40, maxWidth: 540, margin: "0 auto 40px", position: "relative" }}>
              Become an instructor and reach millions of learners — no matter your experience level.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 40, marginBottom: 40, flexWrap: "wrap", position: "relative" }}>
              {[
                { title: "Teach your way", desc: "Publish the course you want, your way." },
                { title: "Inspire learners", desc: "Help people learn new skills and grow." },
                { title: "Get rewarded", desc: "Earn money for each paid enrollment." },
              ].map((s) => (
                <div key={s.title} style={{ maxWidth: 200 }}>
                  <p style={{ fontSize: 14.5, fontWeight: 700, color: "#f8fafc", marginBottom: 6 }}>{s.title}</p>
                  <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>{s.desc}</p>
                </div>
              ))}
            </div>
            <Link href="/instructor/register" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              backgroundColor: "#3b82f6", color: "#fff", fontWeight: 700,
              fontSize: 15, padding: "14px 32px", borderRadius: 12, textDecoration: "none",
              boxShadow: "0 8px 32px rgba(59,130,246,0.35)", position: "relative",
            }}>
              Start teaching today <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid #1e293b", padding: "56px 24px 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 32, marginBottom: 40 }}>
            {[
              { heading: "LearnFlow Business", links: [{ label: "Get LearnFlow Business", href: "#business" }, { label: "Teach on LearnFlow", href: "/instructor/register" }, { label: "Get the app", href: "#" }] },
              { heading: "About", links: [{ label: "About us", href: "#" }, { label: "Careers", href: "#" }, { label: "Blog", href: "#" }, { label: "Investors", href: "#" }] },
              { heading: "Support", links: [{ label: "Contact us", href: "#" }, { label: "Help and support", href: "#" }, { label: "Affiliate", href: "#" }, { label: "Cookie settings", href: "#" }] },
              { heading: "Legal", links: [{ label: "Terms", href: "#" }, { label: "Privacy policy", href: "#" }, { label: "Sitemap", href: "#" }, { label: "Accessibility statement", href: "#" }] },
            ].map((col) => (
              <div key={col.heading}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#f8fafc", marginBottom: 14 }}>{col.heading}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {col.links.map((l) => (
                    <Link key={l.label} href={l.href} style={{ fontSize: 13, color: "#64748b", textDecoration: "none" }}>
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid #1e293b", paddingTop: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <GraduationCap size={18} color="#475569" />
              <span style={{ fontSize: 13, color: "#475569" }}>© 2026 LearnFlow, Inc.</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 13, color: "#64748b" }}>
              <span>🌐 English</span>
              <span>$ USD</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating)
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 1 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={11} fill={i < full ? "#F59E0B" : "none"} style={{ color: "#F59E0B" }} />
      ))}
    </div>
  )
}

function CourseCard({ course }: { course: Course }) {
  const isPaid = typeof course.price === "number"
  const original = isPaid ? Math.round((course.price as number) * 1.8) : null
  const { isPurchased } = usePurchases()
  const owned = course.progress !== undefined || isPurchased(course.id)

  return (
    <Link
      href={`/student/courses/${course.id}`}
      className="flex-shrink-0 flex flex-col transition-all duration-150"
      style={{ width: 230, borderRadius: 14, overflow: "hidden", backgroundColor: "#1E293B", border: "1px solid #334155" }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${course.thumbnailColor}60`)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#334155")}
    >
      <CourseThumbnail
        course={course}
        heightClass="h-[120px]"
        locked={isPaid && !owned}
        topLeftBadge={course.rating >= 4.8 ? (
          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, backgroundColor: "#FBBF24", color: "#1F2937" }}>
            Bestseller
          </span>
        ) : undefined}
      />
      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-sm font-bold text-white mb-1 line-clamp-2 leading-snug">{course.title}</h3>
        <p className="text-xs mb-2 truncate" style={{ color: "#64748B" }}>{course.instructor}</p>
        <div className="flex items-center gap-1 mb-2">
          <span className="text-xs font-bold" style={{ color: "#F59E0B" }}>{course.rating}</span>
          <Stars rating={course.rating} />
          <span className="text-xs" style={{ color: "#64748B" }}>({course.reviewCount.toLocaleString()})</span>
        </div>
        <div className="flex items-center gap-2 mt-auto">
          <span className="text-sm font-bold" style={{ color: course.price === "Free" ? "#10B981" : "#F8FAFC" }}>
            {course.price === "Free" ? "Free" : `$${course.price}`}
          </span>
          {original && <span className="text-xs line-through" style={{ color: "#475569" }}>${original}</span>}
        </div>
      </div>
    </Link>
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

function CourseRow({ title, courses }: { title: string; courses: Course[] }) {
  if (courses.length === 0) return null
  return (
    <section style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px 8px" }}>
      <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
        {courses.map((c) => (
          <CourseCard key={c.id} course={c} />
        ))}
      </div>
    </section>
  )
}
