"use client"

import { use } from "react"
import Link from "next/link"
import { INSTRUCTORS, getInstructorById, getInstructorCourses, getInstructorStats } from "@/lib/data/instructors"
import { CourseThumbnail } from "@/components/CourseThumbnail"
import { usePurchases } from "@/lib/hooks/usePurchases"
import { Star, Users, BookOpen, ChevronRight, ChevronLeft } from "lucide-react"

export default function InstructorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const instructor = getInstructorById(id)
  const { isPurchased } = usePurchases()

  if (!instructor) {
    return (
      <main style={{ minHeight: "calc(100vh - var(--app-header-height, 150px))", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ textAlign: "center" }}>
          <h1 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Instructor not found</h1>
          <Link href="/instructors" style={{ color: "var(--accent)", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>← Back to instructors</Link>
        </div>
      </main>
    )
  }

  const courses = getInstructorCourses(instructor)
  const stats = getInstructorStats(instructor)
  const others = INSTRUCTORS.filter((i) => i.id !== instructor.id).slice(0, 4)

  return (
    <main style={{ backgroundColor: "var(--bg-canvas)", color: "var(--text-primary)", minHeight: "calc(100vh - var(--app-header-height, 150px))" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px 64px" }}>

        {/* Breadcrumb */}
        <Link href="/instructors" className="flex items-center gap-1.5 text-xs w-fit mb-5" style={{ color: "var(--text-tertiary)", textDecoration: "none" }}>
          <ChevronLeft size={14} /> Back to Instructors
        </Link>

        {/* Hero */}
        <div className="rounded-2xl p-6 relative overflow-hidden mb-6 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: `radial-gradient(circle, ${instructor.color}20 0%, transparent 70%)`, transform: "translate(30%, -30%)" }}
          />
          <div className="flex flex-col sm:flex-row items-start gap-5 relative">
            <div
              className="flex items-center justify-center w-24 h-24 rounded-full text-3xl font-bold text-white flex-shrink-0"
              style={{ backgroundColor: instructor.color }}
            >
              {instructor.avatar}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>{instructor.name}</h1>
              <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>{instructor.title}</p>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-secondary)", maxWidth: 600 }}>{instructor.bio}</p>
              <div className="flex items-center gap-5 flex-wrap text-sm" style={{ color: "var(--text-tertiary)" }}>
                <span className="flex items-center gap-1.5">
                  <Star size={14} fill="#F59E0B" style={{ color: "#F59E0B" }} />
                  <strong style={{ color: "var(--text-primary)" }}>{stats.rating}</strong> instructor rating
                </span>
                <span className="flex items-center gap-1.5">
                  <Users size={14} /> {stats.studentsCount.toLocaleString()} students
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen size={14} /> {stats.coursesCount} {stats.coursesCount === 1 ? "course" : "courses"}
                </span>
              </div>
              <div className="flex gap-1.5 flex-wrap mt-4">
                {instructor.expertise.map((tag) => (
                  <span key={tag} className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: `${instructor.color}15`, color: instructor.color }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Courses */}
        <h2 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>Courses by {instructor.name}</h2>
        {courses.length === 0 ? (
          <div className="rounded-2xl p-10 text-center" style={{ backgroundColor: "var(--bg-surface)", border: "1px dashed var(--border-default)" }}>
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>No published courses yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => {
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
                    <h3 className="text-sm font-bold mb-1 line-clamp-2" style={{ color: "var(--text-primary)" }}>{course.title}</h3>
                    <p className="text-xs mb-3 line-clamp-2 flex-1" style={{ color: "var(--text-secondary)" }}>{course.shortDesc}</p>
                    <div className="flex items-center gap-3 mb-3 text-xs" style={{ color: "var(--text-tertiary)" }}>
                      <span className="flex items-center gap-0.5">
                        <Star size={11} fill="#F59E0B" style={{ color: "#F59E0B" }} />
                        <strong className="ml-0.5" style={{ color: "var(--text-primary)" }}>{course.rating}</strong>
                        <span className="ml-0.5">({course.reviewCount.toLocaleString()})</span>
                      </span>
                      <span className="flex items-center gap-1"><Users size={11} /> {course.studentsCount >= 1000 ? `${(course.studentsCount / 1000).toFixed(0)}k` : course.studentsCount}</span>
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

        {/* Other instructors */}
        {others.length > 0 && (
          <div className="mt-12 pt-8" style={{ borderTop: "1px solid var(--border-default)" }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-tertiary)" }}>Other instructors</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {others.map((o) => (
                <Link
                  key={o.id}
                  href={`/instructors/${o.id}`}
                  className="flex items-center gap-2.5 p-3 rounded-xl transition-colors"
                  style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)", textDecoration: "none" }}
                >
                  <div
                    className="flex items-center justify-center w-9 h-9 rounded-full text-xs font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: o.color }}
                  >
                    {o.avatar}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>{o.name}</p>
                    <p className="text-xs truncate" style={{ color: "var(--text-tertiary)" }}>{o.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
