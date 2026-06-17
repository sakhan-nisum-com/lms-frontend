"use client"

import { Suspense, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { CourseThumbnail } from "@/components/CourseThumbnail"
import { CERTIFICATES, COURSES, STUDENT_PROFILE } from "@/lib/data/courses"
import type { Certificate, Course } from "@/lib/data/courses"
import { usePurchases } from "@/lib/hooks/usePurchases"
import { useAllProgress } from "@/lib/hooks/useProgress"
import { getCourseProgress } from "@/lib/courseProgress"
import {
  Award, Download, Share2, CheckCircle2, GraduationCap, Star,
  Copy, Check, ChevronLeft,
} from "lucide-react"

function buildCertificate(course: typeof COURSES[0]): Certificate {
  const existing = CERTIFICATES.find((c) => c.courseId === course.id)
  if (existing) return existing
  const credentialId = `LF-${course.id.toUpperCase()}-${new Date().getFullYear()}`
  return {
    id: `cert-${course.id}`,
    courseId: course.id,
    courseName: course.title,
    instructorName: course.instructor,
    issuedDate: course.lastAccessed ?? new Date().toISOString().slice(0, 10),
    credentialId,
    skills: course.tags,
    category: course.category,
    thumbnail: course.thumbnail,
    thumbnailColor: course.thumbnailColor,
    verificationUrl: `https://learnflow.io/verify/${credentialId}`,
    grade: course.grade ?? 100,
  }
}

function CertificateDetail({
  cert, course, studentName, studentAvatar, copiedId, onCopy,
}: {
  cert: Certificate
  course: Course
  studentName: string
  studentAvatar: string
  copiedId: string | null
  onCopy: (id: string) => void
}) {
  const totalLessons = course.sections.reduce((s, sec) => s + sec.lessons.length, 0)
  const isPaid = typeof course.price === "number"
  const originalPrice = isPaid ? Math.round((course.price as number) * 1.8) : null
  const referenceNumber = String(COURSES.findIndex((c) => c.id === course.id) + 1).padStart(4, "0")

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">

      {/* Left: the certificate document */}
      <div>
        <div className="rounded-2xl p-8" style={{ backgroundColor: "#F8FAFC" }}>
          <div className="flex items-start justify-between mb-10 flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0" style={{ backgroundColor: "#3B82F6" }}>
                <GraduationCap size={16} color="#fff" />
              </div>
              <span className="font-bold text-base" style={{ color: "#0F172A" }}>LearnFlow</span>
            </div>
            <div className="text-right text-xs leading-relaxed" style={{ color: "#64748B" }}>
              <p className="flex items-center justify-end gap-1.5">
                Certificate no: <strong style={{ color: "#0F172A" }}>{cert.credentialId}</strong>
                <button onClick={() => onCopy(cert.credentialId)} className="inline-flex">
                  {copiedId === cert.credentialId ? <Check size={11} style={{ color: "#10B981" }} /> : <Copy size={11} style={{ color: "#94A3B8" }} />}
                </button>
              </p>
              <p>Certificate url: {cert.verificationUrl.replace("https://", "")}</p>
              <p>Reference Number: {referenceNumber}</p>
            </div>
          </div>

          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#64748B" }}>
            Certificate of Completion
          </p>
          <h2 className="text-3xl sm:text-4xl font-black leading-tight mb-6" style={{ color: "#0F172A" }}>
            {cert.courseName}
          </h2>
          <p className="text-sm mb-10" style={{ color: "#334155" }}>
            Instructors&nbsp; <strong style={{ color: "#0F172A" }}>{cert.instructorName}</strong>
          </p>

          <h3 className="text-2xl sm:text-3xl font-black mb-4" style={{ color: "#0F172A" }}>
            {studentName}
          </h3>
          <div className="flex items-center gap-8 text-sm flex-wrap" style={{ color: "#334155" }}>
            <p>Date&nbsp; <strong style={{ color: "#0F172A" }}>{cert.issuedDate}</strong></p>
            <p>Length&nbsp; <strong style={{ color: "#0F172A" }}>{course.totalDuration}</strong></p>
          </div>
        </div>

        <p className="text-xs leading-relaxed mt-4" style={{ color: "#64748B" }}>
          This certificate above verifies that {studentName} successfully completed the course {cert.courseName} on{" "}
          {cert.issuedDate} as taught by {cert.instructorName} on LearnFlow. The certificate indicates the entire
          course was completed as validated by the learner. The course length represents the total hours of video
          and lecture content across {totalLessons} lessons.
        </p>

        {/* Skills */}
        <div className="rounded-2xl p-5 mt-4" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
          <h3 className="text-sm font-bold text-white mb-3">Skills Demonstrated</h3>
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
      </div>

      {/* Right: recipient + course sidebar */}
      <div className="space-y-5">
        <div>
          <p className="text-xs font-semibold mb-2" style={{ color: "#64748B" }}>Certificate Recipient:</p>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white flex-shrink-0" style={{ backgroundColor: "#3B82F6" }}>
              {studentAvatar}
            </div>
            <span className="text-sm font-semibold text-white">{studentName}</span>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold mb-2" style={{ color: "#64748B" }}>About the Course:</p>
          <div className="rounded-xl overflow-hidden mb-3" style={{ border: "1px solid #334155" }}>
            <CourseThumbnail course={course} heightClass="h-28" />
          </div>
          <p className="text-sm font-bold text-white leading-snug mb-1">{course.title}</p>
          <p className="text-xs mb-2" style={{ color: "#64748B" }}>{course.instructor}</p>
          <div className="flex items-center gap-1 mb-1.5">
            <span className="text-xs font-bold" style={{ color: "#F59E0B" }}>{course.rating}</span>
            <Star size={11} fill="#F59E0B" style={{ color: "#F59E0B" }} />
            <span className="text-xs" style={{ color: "#64748B" }}>({course.reviewCount.toLocaleString()})</span>
          </div>
          <p className="text-xs mb-3" style={{ color: "#64748B" }}>
            {course.totalDuration} total · {totalLessons} lectures
          </p>
          {isPaid && (
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base font-bold text-white">${course.price}</span>
              {originalPrice && <span className="text-xs line-through" style={{ color: "#475569" }}>${originalPrice}</span>}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold"
            style={{ backgroundColor: "#1E293B", color: "#CBD5E1", border: "1px solid #334155" }}
          >
            <Download size={13} /> Download
          </button>
          <button
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold"
            style={{ backgroundColor: "#1E293B", color: "#CBD5E1", border: "1px solid #334155" }}
          >
            <Share2 size={13} /> Share
          </button>
        </div>

        <Link href={`/student/courses/${course.id}`} className="block text-xs font-semibold" style={{ color: "#3B82F6" }}>
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
  const { isPurchased } = usePurchases()
  const allProgress = useAllProgress()
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Reactive to the URL's ?course=<id> — unlike a one-time effect, this stays
  // correct across client-side navigations (e.g. back to /certificates with
  // the param removed) without needing the page to remount.
  const queryCourseId = useSearchParams().get("course")

  const enrolledCourses = COURSES.filter((c) => c.progress !== undefined || isPurchased(c.id))

  const certificates = useMemo(
    () =>
      enrolledCourses
        .filter((c) => c.certificateOffered && getCourseProgress(c, allProgress).isComplete)
        .map(buildCertificate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allProgress, isPurchased]
  )

  const inProgress = enrolledCourses
    .filter((c) => c.certificateOffered)
    .map((c) => ({ course: c, ...getCourseProgress(c, allProgress) }))
    .filter(({ isComplete, progressPct }) => !isComplete && progressPct > 0)

  const handleCopy = (credId: string) => {
    navigator.clipboard.writeText(credId).catch(() => {})
    setCopiedId(credId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // ── Single-course view: came from "Certificate" on a My Courses card ──
  if (queryCourseId) {
    const cert = certificates.find((c) => c.courseId === queryCourseId)
    const course = COURSES.find((c) => c.id === queryCourseId)

    return (
      <div className="space-y-6 max-w-5xl">
        <Link href="/student/certificates" className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#3B82F6" }}>
          <ChevronLeft size={13} /> All certificates
        </Link>

        {cert && course ? (
          <CertificateDetail cert={cert} course={course} studentName={p.name} studentAvatar={p.avatar} copiedId={copiedId} onCopy={handleCopy} />
        ) : (
          <div className="rounded-2xl p-10 text-center" style={{ backgroundColor: "#1E293B", border: "1px dashed #334155" }}>
            <Award size={32} className="mx-auto mb-3" style={{ color: "#334155" }} />
            <p className="text-sm font-medium text-white">
              {course ? `No certificate yet for "${course.title}"` : "Certificate not found"}
            </p>
            <p className="text-xs mt-1" style={{ color: "#64748B" }}>
              Finish every lesson in this course to earn its certificate.
            </p>
          </div>
        )}
      </div>
    )
  }

  // ── Full view: every certificate earned so far ──
  const selected = certificates.find((c) => c.id === selectedId) ?? certificates[0]
  const selectedCourse = selected ? COURSES.find((c) => c.id === selected.courseId) : undefined

  return (
    <div className="space-y-6 max-w-6xl">

      {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">My Certificates</h1>
          <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>
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
            <div key={label} className="rounded-xl p-4" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
              <p className="text-2xl font-bold" style={{ color }}>{value}</p>
              <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Certificate list */}
          <div className="space-y-3">
            {certificates.length === 0 && (
              <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: "#1E293B", border: "1px dashed #334155" }}>
                <Award size={28} className="mx-auto mb-2" style={{ color: "#334155" }} />
                <p className="text-sm font-medium text-white">No certificates yet</p>
                <p className="text-xs mt-1" style={{ color: "#64748B" }}>Finish every lesson in a course to earn its certificate.</p>
              </div>
            )}

            {certificates.map((cert) => (
              <button
                key={cert.id}
                className="w-full rounded-2xl p-4 text-left transition-all"
                style={{
                  backgroundColor: "#1E293B",
                  border: `1px solid ${selected?.id === cert.id ? cert.thumbnailColor + "60" : "#334155"}`,
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
                    <p className="text-sm font-bold text-white truncate">{cert.courseName}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>Issued {cert.issuedDate}</p>
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

            {/* In-progress towards certificate */}
            {inProgress.length > 0 && (
              <div
                className="rounded-2xl p-4 opacity-60"
                style={{ backgroundColor: "#1E293B", border: "1px dashed #334155" }}
              >
                <p className="text-xs font-semibold mb-2" style={{ color: "#64748B" }}>IN PROGRESS</p>
                {inProgress.map(({ course, progressPct }) => (
                  <div key={course.id} className="flex items-center gap-2 mb-2 last:mb-0">
                    <span>{course.thumbnail}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white truncate">{course.title}</p>
                      <div className="h-1 rounded-full mt-1" style={{ backgroundColor: "#334155" }}>
                        <div className="h-full rounded-full" style={{ width: `${progressPct}%`, backgroundColor: course.thumbnailColor }} />
                      </div>
                    </div>
                    <span className="text-xs flex-shrink-0" style={{ color: "#64748B" }}>{progressPct}%</span>
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
