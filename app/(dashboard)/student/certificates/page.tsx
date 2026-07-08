"use client"

import { Suspense, useMemo, useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { useLocale } from "next-intl"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { STUDENT_PROFILE } from "@/lib/data/courses"
import { usePurchases } from "@/lib/hooks/usePurchases"
import { useAllProgress } from "@/lib/hooks/useProgress"
import { useCertificates } from "@/lib/hooks/useCertificates"
import type { ApiCertificate } from "@/lib/api/certificates"
import { useMyEnrollments } from "@/lib/hooks/useMyEnrollments"
import {
  Award, GraduationCap, Copy, Check, X, Download, Share2, ExternalLink,
} from "lucide-react"

interface DisplayCert {
  id: string
  courseId: string
  courseName: string
  instructorName: string
  issuedDate: string
  credentialId: string
  verificationUrl: string
  grade: number
}

function certFromApi(ac: ApiCertificate, locale?: string): DisplayCert {
  const courseName = locale === "ar" && ac.courseNameAr ? ac.courseNameAr : ac.courseName
  return {
    id: ac.id,
    courseId: ac.courseId,
    courseName,
    instructorName: ac.instructorName,
    issuedDate: ac.issuedAt.slice(0, 10),
    credentialId: ac.credentialId,
    verificationUrl: ac.verificationUrl,
    grade: ac.grade,
  }
}

function CertificateModal({
  cert,
  studentName,
  onClose,
}: {
  cert: DisplayCert
  studentName: string
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(cert.credentialId).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex items-center justify-center w-8 h-8 rounded-full"
          style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "#fff" }}
        >
          <X size={16} />
        </button>

        {/* Certificate document */}
        <div className="p-10" style={{ backgroundColor: "#0F172A" }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-12 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ backgroundColor: "#3B82F6" }}>
                <GraduationCap size={16} color="#fff" />
              </div>
              <span className="font-bold text-base text-white">LearnFlow</span>
            </div>
            <div className="text-right text-xs" style={{ color: "#64748B" }}>
              <p className="flex items-center justify-end gap-1.5 mb-1">
                <span style={{ color: "#94A3B8" }}>Certificate no:</span>
                <strong className="text-white">{cert.credentialId}</strong>
                <button onClick={handleCopy} className="inline-flex ml-1">
                  {copied
                    ? <Check size={11} style={{ color: "#10B981" }} />
                    : <Copy size={11} style={{ color: "#64748B" }} />}
                </button>
              </p>
              <p style={{ color: "#64748B" }}>{cert.verificationUrl.replace("https://", "")}</p>
            </div>
          </div>

          {/* Body */}
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#64748B" }}>
            Certificate of Completion
          </p>
          <h2 className="text-3xl font-black leading-tight mb-6 text-white">
            {cert.courseName}
          </h2>
          <p className="text-sm mb-12" style={{ color: "#64748B" }}>
            Instructor&nbsp;
            <strong className="text-white">{cert.instructorName}</strong>
          </p>

          <h3 className="text-2xl font-black mb-4 text-white">{studentName}</h3>
          <div className="flex items-center gap-8 text-sm flex-wrap" style={{ color: "#64748B" }}>
            <p>Date&nbsp;<strong className="text-white">{cert.issuedDate}</strong></p>
            <p>Grade&nbsp;<strong className="text-white">{cert.grade}%</strong></p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center gap-3 px-6 py-4" style={{ backgroundColor: "#1E293B", borderTop: "1px solid #334155" }}>
          <button
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold"
            style={{ backgroundColor: "#334155", color: "#CBD5E1" }}
          >
            <Download size={13} /> Download
          </button>
          <button
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold"
            style={{ backgroundColor: "#334155", color: "#CBD5E1" }}
          >
            <Share2 size={13} /> Share
          </button>
          <a
            href={cert.verificationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold ml-auto"
            style={{ backgroundColor: "#3B82F620", color: "#60A5FA" }}
          >
            <ExternalLink size={13} /> Verify
          </a>
        </div>
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
  const [modalCert, setModalCert] = useState<DisplayCert | null>(null)
  const [earningCourseId, setEarningCourseId] = useState<string | null>(null)

  const locale = useLocale()
  const { certificates: apiCerts, loading: certsLoading, earnCertificate } = useCertificates()
  const { items: apiEnrollments, loading: enrollmentsLoading } = useMyEnrollments(Array.from(purchasedIds))

  // Auto-issue cert for any completed enrollment that doesn't have one yet
  const autoIssued = useRef(false)
  useEffect(() => {
    if (certsLoading || enrollmentsLoading || autoIssued.current) return
    autoIssued.current = true
    const existingCourseIds = new Set(apiCerts.map((c) => c.courseId))
    apiEnrollments.forEach(({ enrollment, course }) => {
      if (course.certificateOffered && enrollment.progressPct >= 100 && !existingCourseIds.has(course.id)) {
        earnCertificate(course.id)
      }
    })
  }, [certsLoading, enrollmentsLoading, apiCerts, apiEnrollments, earnCertificate])

  // Open modal for ?course= deep-link
  const queryCourseId = useSearchParams().get("course")
  useEffect(() => {
    if (!queryCourseId || certsLoading) return
    const cert = apiCerts.find((c) => c.courseId === queryCourseId)
    if (cert) setModalCert(certFromApi(cert))
  }, [queryCourseId, apiCerts, certsLoading])

  const certificates: DisplayCert[] = useMemo(
    () => (certsLoading ? [] : apiCerts.map((c) => certFromApi(c, locale))),
    [apiCerts, certsLoading, locale]
  )

  const certCourseIds = useMemo(() => new Set(certificates.map((c) => c.courseId)), [certificates])

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
          return { course, progressPct: enrollment.progressPct > 0 ? enrollment.progressPct : localPct }
        }),
    [apiEnrollments, allProgress]
  )

  async function handleEarn(courseId: string) {
    setEarningCourseId(courseId)
    await earnCertificate(courseId)
    setEarningCourseId(null)
  }

  return (
    <>
      {modalCert && (
        <CertificateModal
          cert={modalCert}
          studentName={p.name}
          onClose={() => setModalCert(null)}
        />
      )}

      <div className="space-y-6 max-w-4xl">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>My Certificates</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {certificates.length} earned · click any certificate to view
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Certificates Earned", value: certificates.length, color: "#F59E0B" },
            { label: "Avg Grade", value: certificates.length ? `${Math.round(certificates.reduce((s, c) => s + c.grade, 0) / certificates.length)}%` : "—", color: "#10B981" },
            { label: "In Progress", value: inProgress.length, color: "#3B82F6" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
              <p className="text-2xl font-bold" style={{ color }}>{value}</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Earned certificates grid */}
        {certificates.length === 0 && claimable.length === 0 && inProgress.length === 0 ? (
          <div className="rounded-2xl p-12 text-center" style={{ backgroundColor: "var(--bg-surface)", border: "1px dashed var(--border-default)" }}>
            <Award size={36} className="mx-auto mb-3" style={{ color: "var(--border-default)" }} />
            <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>No certificates yet</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>Complete all lessons in a course to earn its certificate.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {certificates.map((cert) => (
              <button
                key={cert.id}
                onClick={() => setModalCert(cert)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all"
                style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#3B82F640")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-default)")}
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-xl flex-shrink-0 text-xl"
                  style={{ backgroundColor: "#3B82F615" }}>
                  🎓
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{cert.courseName}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                    {cert.instructorName} · Issued {cert.issuedDate}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-semibold px-2 py-1 rounded-lg"
                    style={{ backgroundColor: "#10B98120", color: "var(--success)" }}>
                    {cert.grade}%
                  </span>
                  <Award size={15} style={{ color: "#F59E0B" }} />
                </div>
              </button>
            ))}

            {/* Claimable */}
            {claimable.map(({ course }) => (
              <div key={course.id}
                className="flex items-center gap-4 p-4 rounded-2xl"
                style={{ backgroundColor: "var(--bg-surface)", border: "1px solid #10B98130" }}>
                <div className="flex items-center justify-center w-12 h-12 rounded-xl flex-shrink-0 text-xl"
                  style={{ backgroundColor: "#10B98115" }}>
                  📚
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                    {locale === "ar" && course.titleAr ? course.titleAr : course.title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--success)" }}>Ready to claim</p>
                </div>
                <button
                  onClick={() => handleEarn(course.id)}
                  disabled={earningCourseId === course.id}
                  className="text-xs px-3 py-1.5 rounded-lg font-semibold disabled:opacity-50 flex-shrink-0"
                  style={{ backgroundColor: "var(--success)", color: "#fff" }}
                >
                  {earningCourseId === course.id ? "Claiming…" : "Claim"}
                </button>
              </div>
            ))}

            {/* In progress */}
            {inProgress.map(({ course, progressPct }) => (
              <div key={course.id}
                className="flex items-center gap-4 p-4 rounded-2xl opacity-60"
                style={{ backgroundColor: "var(--bg-surface)", border: "1px dashed var(--border-default)" }}>
                <div className="flex items-center justify-center w-12 h-12 rounded-xl flex-shrink-0 text-xl"
                  style={{ backgroundColor: "#3B82F615" }}>
                  📚
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                    {locale === "ar" && course.titleAr ? course.titleAr : course.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: "var(--border-default)" }}>
                      <div className="h-full rounded-full" style={{ width: `${progressPct}%`, backgroundColor: "#3B82F6" }} />
                    </div>
                    <span className="text-xs flex-shrink-0" style={{ color: "var(--text-tertiary)" }}>{progressPct}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
