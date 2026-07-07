"use client"

import { Suspense, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { STUDENT_PROFILE } from "@/lib/data/courses"
import { usePurchases } from "@/lib/hooks/usePurchases"
import { useAllProgress } from "@/lib/hooks/useProgress"
import { useCertificates } from "@/lib/hooks/useCertificates"
import type { ApiCertificate } from "@/lib/api/certificates"
import { useMyEnrollments } from "@/lib/hooks/useMyEnrollments"
import type { ApiCourse } from "@/lib/api/courses"
import {
  Award, Download, Share2, CheckCircle2, GraduationCap, Star,
  Copy, Check, ChevronLeft,
} from "lucide-react"

interface DisplayCert {
  id: string
  courseId: string
  courseName: string
  instructorName: string
  issuedDate: string
  credentialId: string
  skills: string[]
  category: string
  thumbnail: string
  thumbnailColor: string
  verificationUrl: string
  grade: number
}

function certFromApi(ac: ApiCertificate): DisplayCert {
  return {
    id: ac.id,
    courseId: ac.courseId,
    courseName: ac.courseName,
    instructorName: ac.instructorName,
    issuedDate: ac.issuedAt.slice(0, 10),
    credentialId: ac.credentialId,
    skills: [],
    category: "Engineering",
    thumbnail: "🎓",
    thumbnailColor: "#3B82F6",
    verificationUrl: ac.verificationUrl,
    grade: ac.grade,
  }
}

function CertificateDetail({
  cert,
  course,
  studentName,
  studentAvatar,
  copiedId,
  onCopy,
}: {
  cert: DisplayCert
  course: ApiCourse
  studentName: string
  studentAvatar: string
  copiedId: string | null
  onCopy: (id: string) => void
}) {
  const totalLessons = course.sections.reduce((s, sec) => s + sec.lessons.length, 0)
  const totalDuration = course.totalDurationSeconds
    ? `${Math.round(course.totalDurationSeconds / 3600)}h`
    : "—"

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
      {/* Left: the certificate document */}
      <div>
        <div className="rounded-2xl p-8" style={{ backgroundColor: "var(--text-primary)" }}>
          <div className="flex items-start justify-between mb-10 flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0" style={{ backgroundColor: "#3B82F6" }}>
                <GraduationCap size={16} color="#fff" />
              </div>
              <span className="font-bold text-base" style={{ color: "var(--bg-surface-muted)" }}>LearnFlow</span>
            </div>
            <div className="text-right text-xs leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
              <p className="flex items-center justify-end gap-1.5">
                Certificate no: <strong style={{ color: "var(--bg-surface-muted)" }}>{cert.credentialId}</strong>
                <button onClick={() => onCopy(cert.credentialId)} className="inline-flex">
                  {copiedId === cert.credentialId ? <Check size={11} style={{ color: "#10B981" }} /> : <Copy size={11} style={{ color: "var(--text-secondary)" }} />}
                </button>
              </p>
              <p>Certificate url: {cert.verificationUrl.replace("https://", "")}</p>
            </div>
          </div>

          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-tertiary)" }}>
            Certificate of Completion
          </p>
          <h2 className="text-3xl sm:text-4xl font-black leading-tight mb-6" style={{ color: "var(--bg-surface-muted)" }}>
            {cert.courseName}
          </h2>
          <p className="text-sm mb-10" style={{ color: "var(--border-default)" }}>
            Instructors&nbsp; <strong style={{ color: "var(--bg-surface-muted)" }}>{cert.instructorName}</strong>
          </p>

          <h3 className="text-2xl sm:text-3xl font-black mb-4" style={{ color: "var(--bg-surface-muted)" }}>
            {studentName}
          </h3>
          <div className="flex items-center gap-8 text-sm flex-wrap" style={{ color: "var(--border-default)" }}>
            <p>Date&nbsp; <strong style={{ color: "var(--bg-surface-muted)" }}>{cert.issuedDate}</strong></p>
            <p>Length&nbsp; <strong style={{ color: "var(--bg-surface-muted)" }}>{totalDuration}</strong></p>
          </div>
        </div>

        <p className="text-xs leading-relaxed mt-4" style={{ color: "var(--text-tertiary)" }}>
          This certificate above verifies that {studentName} successfully completed the course {cert.courseName} on{" "}
          {cert.issuedDate} as taught by {cert.instructorName} on LearnFlow. The certificate indicates the entire
          course was completed as validated by the learner. The course length represents the total hours of video
          and lecture content across {totalLessons} lessons.
        </p>

        {/* Skills */}
        {cert.skills.length > 0 && (
          <div className="rounded-2xl p-5 mt-4 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
            <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>Skills Demonstrated</h3>
            <div className="flex flex-wrap gap-2">
              {cert.skills.map((skill) => (
                <span
                  key={skill}
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg font-medium"
                  style={{ backgroundColor: `${cert.thumbnailColor}15`, color: cert.thumbnailColor }}
                >
                  <CheckCircle2 size={11} /> {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right: recipient + course sidebar */}
      <div className="space-y-5">
        <div>
          <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-tertiary)" }}>Certificate Recipient:</p>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white flex-shrink-0" style={{ backgroundColor: "var(--accent)" }}>
              {studentAvatar}
            </div>
            <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{studentName}</span>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-tertiary)" }}>About the Course:</p>
          {course.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={course.thumbnailUrl} alt={course.title} className="w-full h-28 object-cover rounded-xl mb-3" style={{ border: "1px solid var(--border-default)" }} />
          ) : (
            <div className="w-full h-28 rounded-xl mb-3 flex items-center justify-center text-4xl"
              style={{ backgroundColor: "#3B82F615", border: "1px solid var(--border-default)" }}>
              📚
            </div>
          )}
          <p className="text-sm font-bold leading-snug mb-1" style={{ color: "var(--text-primary)" }}>{course.title}</p>
          <p className="text-xs mb-2" style={{ color: "var(--text-tertiary)" }}>{cert.instructorName}</p>
          {course.rating > 0 && (
            <div className="flex items-center gap-1 mb-1.5">
              <span className="text-xs font-bold" style={{ color: "#F59E0B" }}>{course.rating.toFixed(1)}</span>
              <Star size={11} fill="#F59E0B" style={{ color: "#F59E0B" }} />
              <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>({course.reviewCount.toLocaleString()})</span>
            </div>
          )}
          <p className="text-xs mb-3" style={{ color: "var(--text-tertiary)" }}>
            {totalDuration} total · {totalLessons} lectures
          </p>
          {course.price > 0 && (
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base font-bold" style={{ color: "var(--text-primary)" }}>${course.price}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold"
            style={{ backgroundColor: "var(--bg-surface)", color: "#CBD5E1", border: "1px solid var(--border-default)" }}
          >
            <Download size={13} /> Download
          </button>
          <button
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold"
            style={{ backgroundColor: "var(--bg-surface)", color: "#CBD5E1", border: "1px solid var(--border-default)" }}
          >
            <Share2 size={13} /> Share
          </button>
        </div>

        <Link href={`/student/courses/${course.id}`} className="block text-xs font-semibold" style={{ color: "var(--accent)" }}>
          ← Back to course
        </Link>
      </div>
    </div>
  )
}

export default function CertificatesPage() {
  const p = STUDENT_PROFILE
  return (
    <DashboardLayout role="student" userName={p.name}>
      <Suspense fallback={null}>
        <CertificatesContent />
      </Suspense>
    </DashboardLayout>
  )
}

function CertificatesContent() {
  const p = STUDENT_PROFILE
  const { purchasedIds } = usePurchases()
  const allProgress = useAllProgress()
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [earningCourseId, setEarningCourseId] = useState<string | null>(null)

  const { certificates: apiCerts, loading: certsLoading, earnCertificate } = useCertificates()
  const { items: apiEnrollments } = useMyEnrollments(Array.from(purchasedIds))

  const queryCourseId = useSearchParams().get("course")

  // All display certificates come from the API
  const certificates: DisplayCert[] = useMemo(
    () => (certsLoading ? [] : apiCerts.map(certFromApi)),
    [apiCerts, certsLoading]
  )

  const certCourseIds = useMemo(() => new Set(certificates.map((c) => c.courseId)), [certificates])

  // Build a courseId → ApiCourse lookup from enrollments
  const courseMap = useMemo(
    () => new Map(apiEnrollments.map(({ course }) => [course.id, course])),
    [apiEnrollments]
  )

  // Claimable: 100% progress + certificateOffered + no cert yet
  const claimable = useMemo(
    () =>
      apiEnrollments.filter(({ enrollment, course }) => {
        const localIds = allProgress[course.id] ?? []
        const totalLessons = course.sections.reduce((n, s) => n + s.lessons.length, 0)
        const localPct = totalLessons > 0 ? Math.round((localIds.length / totalLessons) * 100) : 0
        const pct = enrollment.progressPct > 0 ? enrollment.progressPct : localPct
        return course.certificateOffered && pct >= 100 && !certCourseIds.has(course.id)
      }),
    [apiEnrollments, allProgress, certCourseIds]
  )

  // In-progress towards certificate (some progress but not complete)
  const inProgress = useMemo(
    () =>
      apiEnrollments
        .filter(({ enrollment, course }) => {
          const localIds = allProgress[course.id] ?? []
          const totalLessons = course.sections.reduce((n, s) => n + s.lessons.length, 0)
          const localPct = totalLessons > 0 ? Math.round((localIds.length / totalLessons) * 100) : 0
          const pct = enrollment.progressPct > 0 ? enrollment.progressPct : localPct
          return course.certificateOffered && pct > 0 && pct < 100
        })
        .map(({ enrollment, course }) => {
          const localIds = allProgress[course.id] ?? []
          const totalLessons = course.sections.reduce((n, s) => n + s.lessons.length, 0)
          const localPct = totalLessons > 0 ? Math.round((localIds.length / totalLessons) * 100) : 0
          return {
            course,
            progressPct: enrollment.progressPct > 0 ? enrollment.progressPct : localPct,
          }
        }),
    [apiEnrollments, allProgress]
  )

  async function handleEarnCertificate(courseId: string) {
    setEarningCourseId(courseId)
    await earnCertificate(courseId)
    setEarningCourseId(null)
  }

  const handleCopy = (credId: string) => {
    navigator.clipboard.writeText(credId).catch(() => {})
    setCopiedId(credId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // ── Single-course view: came from "Certificate" on a My Courses card ──
  if (queryCourseId) {
    const cert = certificates.find((c) => c.courseId === queryCourseId)
    const course = courseMap.get(queryCourseId)

    return (
      <div className="space-y-6 max-w-5xl">
        <Link href="/student/certificates" className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: "var(--accent)" }}>
          <ChevronLeft size={13} /> All certificates
        </Link>

        {cert && course ? (
          <CertificateDetail cert={cert} course={course} studentName={p.name} studentAvatar={p.avatar} copiedId={copiedId} onCopy={handleCopy} />
        ) : (
          <div className="rounded-2xl p-10 text-center" style={{ backgroundColor: "var(--bg-surface)", border: "1px dashed var(--border-default)" }}>
            <Award size={32} className="mx-auto mb-3" style={{ color: "var(--border-default)" }} />
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              {course ? `No certificate yet for "${course.title}"` : "Certificate not found"}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
              Finish every lesson in this course to earn its certificate.
            </p>
          </div>
        )}
      </div>
    )
  }

  // ── Full view: every certificate earned so far ──
  const selected = certificates.find((c) => c.id === selectedId) ?? certificates[0]
  const selectedCourse = selected ? courseMap.get(selected.courseId) : undefined

  return (
    <div className="space-y-6 max-w-6xl">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>My Certificates</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          {certificates.length} certificates earned · Verifiable credentials on your profile
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Certificates Earned", value: certificates.length, color: "#F59E0B" },
          { label: "Skills Demonstrated", value: certificates.reduce((s, c) => s + c.skills.length, 0), color: "#3B82F6" },
          { label: "Avg Grade", value: certificates.length ? `${Math.round(certificates.reduce((s, c) => s + c.grade, 0) / certificates.length)}%` : "—", color: "#10B981" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl p-4 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Certificate list */}
        <div className="space-y-3">
          {certificates.length === 0 && claimable.length === 0 && inProgress.length === 0 && (
            <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: "var(--bg-surface)", border: "1px dashed var(--border-default)" }}>
              <Award size={28} className="mx-auto mb-2" style={{ color: "var(--border-default)" }} />
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>No certificates yet</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>Finish every lesson in a course to earn its certificate.</p>
            </div>
          )}

          {certificates.map((cert) => (
            <button
              key={cert.id}
              className="w-full rounded-2xl p-4 text-left transition-all shadow-sm"
              style={{
                backgroundColor: "var(--bg-surface)",
                border: `1px solid ${selected?.id === cert.id ? cert.thumbnailColor + "60" : "var(--border-default)"}`,
              }}
              onClick={() => setSelectedId(cert.id)}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-12 h-12 rounded-xl text-2xl flex-shrink-0"
                  style={{ backgroundColor: `${cert.thumbnailColor}15` }}
                >
                  {cert.thumbnail}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>{cert.courseName}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>Issued {cert.issuedDate}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Award size={11} style={{ color: "#F59E0B" }} />
                    <span className="text-xs font-semibold" style={{ color: "#F59E0B" }}>{cert.grade}% grade</span>
                  </div>
                </div>
                {selected?.id === cert.id && (
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cert.thumbnailColor }} />
                )}
              </div>
            </button>
          ))}

          {/* Claimable certificates */}
          {claimable.length > 0 && (
            <div className="rounded-2xl p-4" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid #10B98140" }}>
              <p className="text-xs font-semibold mb-2" style={{ color: "var(--success)" }}>READY TO CLAIM</p>
              {claimable.map(({ course }) => (
                <div key={course.id} className="flex items-center gap-2 mb-2 last:mb-0">
                  <span>📚</span>
                  <p className="flex-1 text-xs truncate" style={{ color: "var(--text-primary)" }}>{course.title}</p>
                  <button
                    onClick={() => handleEarnCertificate(course.id)}
                    disabled={earningCourseId === course.id}
                    className="text-xs px-2.5 py-1 rounded-lg font-semibold disabled:opacity-50"
                    style={{ backgroundColor: "var(--success)", color: "#fff" }}
                  >
                    {earningCourseId === course.id ? "Claiming…" : "Claim"}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* In-progress towards certificate */}
          {inProgress.length > 0 && (
            <div
              className="rounded-2xl p-4 opacity-60"
              style={{ backgroundColor: "var(--bg-surface)", border: "1px dashed var(--border-default)" }}
            >
              <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-tertiary)" }}>IN PROGRESS</p>
              {inProgress.map(({ course, progressPct }) => (
                <div key={course.id} className="flex items-center gap-2 mb-2 last:mb-0">
                  <span>📚</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs truncate" style={{ color: "var(--text-primary)" }}>{course.title}</p>
                    <div className="h-1 rounded-full mt-1" style={{ backgroundColor: "var(--border-default)" }}>
                      <div className="h-full rounded-full" style={{ width: `${progressPct}%`, backgroundColor: "#3B82F6" }} />
                    </div>
                  </div>
                  <span className="text-xs flex-shrink-0" style={{ color: "var(--text-tertiary)" }}>{progressPct}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Certificate detail */}
        {selected && selectedCourse && (
          <div className="lg:col-span-2">
            <CertificateDetail cert={selected} course={selectedCourse} studentName={p.name} studentAvatar={p.avatar} copiedId={copiedId} onCopy={handleCopy} />
          </div>
        )}
      </div>

    </div>
  )
}
