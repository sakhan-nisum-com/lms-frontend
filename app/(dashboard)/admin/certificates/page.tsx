"use client"

import { useCallback, useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import {
  certificatesApi,
  type ApiCertificate,
  type ApiPendingCertificate,
} from "@/lib/api/certificates"
import { authStore } from "@/lib/auth-store"
import {
  Search, Award, ShieldCheck, Ban, ExternalLink, Loader2,
  ChevronLeft, ChevronRight, Plus, X, UserCircle, BookOpen, Clock,
} from "lucide-react"

type Tab = "issued" | "pending"

export default function AdminCertificatesPage() {
  const user = authStore.getUser()
  const [tab, setTab] = useState<Tab>("issued")

  // ── Issued certificates ──────────────────────────────────────────────────
  const [certs, setCerts]             = useState<ApiCertificate[]>([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState("")
  const [page, setPage]               = useState(0)
  const [totalPages, setTotalPages]   = useState(1)
  const [totalElements, setTotalElements] = useState(0)

  // ── Pending certificates ─────────────────────────────────────────────────
  const [pending, setPending]           = useState<ApiPendingCertificate[]>([])
  const [pendingLoading, setPendingLoading] = useState(false)
  const [pendingPage, setPendingPage]   = useState(0)
  const [pendingTotalPages, setPendingTotalPages] = useState(1)
  const [pendingTotalElements, setPendingTotalElements] = useState(0)
  const [issuingId, setIssuingId]       = useState<string | null>(null) // "studentId:courseId"

  // ── Shared ───────────────────────────────────────────────────────────────
  const [actionId, setActionId]   = useState<string | null>(null)
  const [toast, setToast]         = useState<{ text: string; ok: boolean } | null>(null)
  const [issueModal, setIssueModal] = useState(false)
  const [issueStudentId, setIssueStudentId] = useState("")
  const [issueCourseId, setIssueCourseId]   = useState("")
  const [issueLoading, setIssueLoading]     = useState(false)

  function showToast(text: string, ok: boolean) {
    setToast({ text, ok })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Load issued certs ────────────────────────────────────────────────────
  const loadIssued = useCallback(async () => {
    setLoading(true)
    try {
      const res = await certificatesApi.adminList(search || undefined, page, 20)
      setCerts(res.data)
      setTotalPages(res.totalPages || 1)
      setTotalElements(res.totalElements)
    } catch { setCerts([]) }
    finally { setLoading(false) }
  }, [search, page])

  // ── Load pending certs ───────────────────────────────────────────────────
  const loadPending = useCallback(async () => {
    setPendingLoading(true)
    try {
      const res = await certificatesApi.adminListPending(pendingPage, 20)
      setPending(res.data)
      setPendingTotalPages(res.totalPages || 1)
      setPendingTotalElements(res.totalElements)
    } catch { setPending([]) }
    finally { setPendingLoading(false) }
  }, [pendingPage])

  useEffect(() => { if (tab === "issued") loadIssued() }, [loadIssued, tab])
  useEffect(() => { if (tab === "pending") loadPending() }, [loadPending, tab])
  useEffect(() => { setPage(0) }, [search])

  async function revoke(id: string) {
    setActionId(id)
    try {
      await certificatesApi.adminRevoke(id)
      setCerts((prev) => prev.filter((c) => c.id !== id))
      setTotalElements((n) => n - 1)
      showToast("Certificate revoked.", true)
    } catch {
      showToast("Failed to revoke certificate.", false)
    } finally { setActionId(null) }
  }

  async function issue() {
    if (!issueStudentId.trim() || !issueCourseId.trim()) return
    setIssueLoading(true)
    try {
      const cert = await certificatesApi.adminIssue(issueStudentId.trim(), issueCourseId.trim())
      setCerts((prev) => [cert, ...prev])
      setTotalElements((n) => n + 1)
      setIssueModal(false)
      setIssueStudentId("")
      setIssueCourseId("")
      showToast(`Certificate issued to ${cert.studentName}.`, true)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to issue certificate."
      showToast(msg, false)
    } finally { setIssueLoading(false) }
  }

  async function issuePending(p: ApiPendingCertificate) {
    const key = `${p.studentId}:${p.courseId}`
    setIssuingId(key)
    try {
      const cert = await certificatesApi.adminIssue(p.studentId, p.courseId)
      setPending((prev) => prev.filter((x) => !(x.studentId === p.studentId && x.courseId === p.courseId)))
      setPendingTotalElements((n) => n - 1)
      setCerts((prev) => [cert, ...prev])
      setTotalElements((n) => n + 1)
      showToast(`Certificate issued to ${p.studentName}.`, true)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to issue certificate."
      showToast(msg, false)
    } finally { setIssuingId(null) }
  }

  const validCount = certs.filter((c) => c.grade > 0).length

  const TABS: { key: Tab; label: string; count?: number }[] = [
    { key: "issued",  label: "Issued",  count: totalElements },
    { key: "pending", label: "Pending", count: pendingTotalElements },
  ]

  return (
    <DashboardLayout role="admin" userName={user?.fullName ?? "Admin"}>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg"
          style={{ backgroundColor: toast.ok ? "#10B98120" : "#EF444420", color: toast.ok ? "#10B981" : "#EF4444", border: `1px solid ${toast.ok ? "#10B98140" : "#EF444440"}` }}>
          {toast.text}
        </div>
      )}

      {/* Issue modal */}
      {issueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
          <div className="w-full max-w-md rounded-2xl p-6 space-y-4"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#3B82F620" }}>
                  <Award size={18} style={{ color: "#3B82F6" }} />
                </div>
                <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Issue Certificate</h3>
              </div>
              <button onClick={() => setIssueModal(false)} style={{ color: "var(--text-muted)" }}>
                <X size={16} />
              </button>
            </div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Admin override — bypasses course completion requirement. Enter the exact UUIDs.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                  Student ID (UUID)
                </label>
                <div className="relative">
                  <UserCircle size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                  <input
                    value={issueStudentId}
                    onChange={(e) => setIssueStudentId(e.target.value)}
                    placeholder="e.g. 3fa85f64-5717-4562-b3fc-2c963f66afa6"
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl text-xs outline-none font-mono"
                    style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                  Course ID (UUID)
                </label>
                <div className="relative">
                  <BookOpen size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                  <input
                    value={issueCourseId}
                    onChange={(e) => setIssueCourseId(e.target.value)}
                    placeholder="e.g. fc2d0789-555e-4d86-b253-419b8b84e760"
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl text-xs outline-none font-mono"
                    style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <button onClick={() => setIssueModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: "var(--bg-surface-muted)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}>
                Cancel
              </button>
              <button
                onClick={issue}
                disabled={!issueStudentId.trim() || !issueCourseId.trim() || issueLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{ backgroundColor: "#3B82F6" }}>
                {issueLoading ? <Loader2 size={14} className="animate-spin" /> : <Award size={14} />}
                Issue Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Certificates</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Manage issued certificates and review students awaiting issuance.
            </p>
          </div>
          <button onClick={() => setIssueModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: "#3B82F6" }}>
            <Plus size={15} /> Issue Certificate
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Issued",   value: totalElements,        icon: Award,       color: "#3B82F6" },
            { label: "Active",         value: validCount,           icon: ShieldCheck,  color: "#10B981" },
            { label: "Awaiting Issue", value: pendingTotalElements, icon: Clock,        color: "#F59E0B" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-2xl p-5 shadow-sm flex items-center gap-4"
              style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${color}20` }}>
                <Icon size={20} style={{ color }} />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{value}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl w-fit"
          style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)" }}>
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={tab === t.key
                ? { backgroundColor: "var(--bg-surface)", color: "var(--text-primary)", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }
                : { color: "var(--text-muted)" }}>
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-md font-mono"
                  style={{ backgroundColor: t.key === "pending" ? "#F59E0B20" : "var(--bg-surface-muted)", color: t.key === "pending" ? "#F59E0B" : "var(--text-muted)" }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── ISSUED TAB ── */}
        {tab === "issued" && (
          <>
            {/* Search */}
            <div className="relative max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by student, course, or credential…"
                className="w-full pl-8 pr-3 py-2 rounded-xl text-xs outline-none"
                style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
              />
            </div>

            <div className="rounded-2xl overflow-hidden shadow-sm"
              style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
              {loading ? (
                <div className="flex items-center justify-center py-24">
                  <Loader2 size={28} className="animate-spin" style={{ color: "var(--text-muted)" }} />
                </div>
              ) : certs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <Award size={36} className="mb-3" style={{ color: "var(--text-muted)" }} />
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>No certificates found.</p>
                </div>
              ) : (
                <>
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border-default)" }}>
                        {["Credential ID", "Student", "Course", "Instructor", "Grade", "Issued", "Actions"].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                            style={{ color: "var(--text-tertiary)" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {certs.map((c, i) => (
                        <tr key={c.id}
                          style={{ borderBottom: i < certs.length - 1 ? "1px solid var(--border-default)" : "none" }}
                          className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3.5">
                            <a
                              href={c.verificationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 font-mono text-xs hover:underline"
                              style={{ color: "var(--accent)" }}>
                              {c.credentialId} <ExternalLink size={10} />
                            </a>
                          </td>
                          <td className="px-4 py-3.5">
                            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{c.studentName}</p>
                            <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{c.studentId.slice(0, 8)}…</p>
                          </td>
                          <td className="px-4 py-3.5">
                            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{c.courseName}</p>
                          </td>
                          <td className="px-4 py-3.5 text-xs" style={{ color: "var(--text-muted)" }}>
                            {c.instructorName}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-sm font-semibold" style={{ color: "#10B981" }}>{c.grade}%</span>
                          </td>
                          <td className="px-4 py-3.5 text-xs" style={{ color: "var(--text-muted)" }}>
                            {new Date(c.issuedAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3.5">
                            <button
                              onClick={() => revoke(c.id)}
                              disabled={actionId === c.id}
                              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg disabled:opacity-50 transition-colors"
                              style={{ backgroundColor: "#EF444420", color: "#F87171" }}>
                              {actionId === c.id
                                ? <Loader2 size={11} className="animate-spin" />
                                : <Ban size={11} />}
                              Revoke
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3"
                      style={{ borderTop: "1px solid var(--border-default)" }}>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{totalElements} certificates</p>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
                          className="p-1.5 rounded-lg disabled:opacity-30" style={{ color: "var(--text-secondary)" }}>
                          <ChevronLeft size={15} />
                        </button>
                        <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                          Page {page + 1} of {totalPages}
                        </span>
                        <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                          className="p-1.5 rounded-lg disabled:opacity-30" style={{ color: "var(--text-secondary)" }}>
                          <ChevronRight size={15} />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}

        {/* ── PENDING TAB ── */}
        {tab === "pending" && (
          <div className="rounded-2xl overflow-hidden shadow-sm"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
            {pendingLoading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 size={28} className="animate-spin" style={{ color: "var(--text-muted)" }} />
              </div>
            ) : pending.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24">
                <Clock size={36} className="mb-3" style={{ color: "var(--text-muted)" }} />
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>All caught up!</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>No completed students are waiting for a certificate.</p>
              </div>
            ) : (
              <>
                <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border-default)", backgroundColor: "#F59E0B10" }}>
                  <p className="text-xs font-medium" style={{ color: "#F59E0B" }}>
                    {pendingTotalElements} student{pendingTotalElements !== 1 ? "s" : ""} completed a course and {pendingTotalElements !== 1 ? "are" : "is"} waiting for a certificate
                  </p>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border-default)" }}>
                      {["Student", "Course", "Instructor", "Completed", "Action"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                          style={{ color: "var(--text-tertiary)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pending.map((p, i) => {
                      const key = `${p.studentId}:${p.courseId}`
                      return (
                        <tr key={key}
                          style={{ borderBottom: i < pending.length - 1 ? "1px solid var(--border-default)" : "none" }}
                          className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3.5">
                            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{p.studentName}</p>
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{p.studentEmail}</p>
                          </td>
                          <td className="px-4 py-3.5">
                            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{p.courseTitle}</p>
                            <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{p.courseId.slice(0, 8)}…</p>
                          </td>
                          <td className="px-4 py-3.5 text-xs" style={{ color: "var(--text-muted)" }}>
                            {p.instructorName}
                          </td>
                          <td className="px-4 py-3.5 text-xs" style={{ color: "var(--text-muted)" }}>
                            {new Date(p.completedAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3.5">
                            <button
                              onClick={() => issuePending(p)}
                              disabled={issuingId === key}
                              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg text-white disabled:opacity-50 transition-colors"
                              style={{ backgroundColor: "#3B82F6" }}>
                              {issuingId === key
                                ? <Loader2 size={11} className="animate-spin" />
                                : <Award size={11} />}
                              Issue
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                {pendingTotalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3"
                    style={{ borderTop: "1px solid var(--border-default)" }}>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{pendingTotalElements} pending</p>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setPendingPage((p) => Math.max(0, p - 1))} disabled={pendingPage === 0}
                        className="p-1.5 rounded-lg disabled:opacity-30" style={{ color: "var(--text-secondary)" }}>
                        <ChevronLeft size={15} />
                      </button>
                      <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                        Page {pendingPage + 1} of {pendingTotalPages}
                      </span>
                      <button onClick={() => setPendingPage((p) => Math.min(pendingTotalPages - 1, p + 1))} disabled={pendingPage >= pendingTotalPages - 1}
                        className="p-1.5 rounded-lg disabled:opacity-30" style={{ color: "var(--text-secondary)" }}>
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
