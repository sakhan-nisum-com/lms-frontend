"use client"

import { DashboardLayout } from "@/components/layout/DashboardLayout"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { analyticsApi, type AdminDashboardStats } from "@/lib/api/analytics"
import { usersApi, type AdminUser, auditLogApi, type AuditLogEntry } from "@/lib/api/admin"
import { paymentsApi, type ApiTransaction } from "@/lib/api/payments"
import { coursesApi, type ApiCourse } from "@/lib/api/courses"
import { authStore } from "@/lib/auth-store"
import {
  Users, BookOpen, DollarSign, ShieldAlert, ChevronRight,
  UserPlus, GraduationCap, CheckCircle2, ArrowUpRight, Loader2,
  Award, TrendingUp,
} from "lucide-react"

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
}

function actionColor(action: string) {
  const a = action.toUpperCase()
  if (a.includes("DELETE") || a.includes("REJECT") || a.includes("BAN")) return "#EF4444"
  if (a.includes("UPDATE") || a.includes("EDIT") || a.includes("SUSPEND")) return "#F59E0B"
  return "#3B82F6"
}

export default function AdminDashboardPage() {
  const t = useTranslations("adminDashboard")
  const user = authStore.getUser()

  const [stats, setStats] = useState<AdminDashboardStats | null>(null)
  const [recentUsers, setRecentUsers] = useState<AdminUser[]>([])
  const [recentPayments, setRecentPayments] = useState<ApiTransaction[]>([])
  const [recentActivity, setRecentActivity] = useState<AuditLogEntry[]>([])
  const [pendingCourses, setPendingCourses] = useState<ApiCourse[]>([])
  const [pendingUsers, setPendingUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      analyticsApi.adminDashboard(),
      usersApi.list({ page: 0, size: 5 }),
      paymentsApi.adminListAll(0, 5),
      auditLogApi.list(0, 6),
      coursesApi.list(0, 5, undefined, "PENDING_REVIEW"),
      usersApi.list({ status: "PENDING", page: 0, size: 5 }),
    ]).then(([s, u, p, a, pc, pu]) => {
      if (s.status === "fulfilled") setStats(s.value)
      if (u.status === "fulfilled") setRecentUsers(u.value.data)
      if (p.status === "fulfilled") setRecentPayments(p.value.data)
      if (a.status === "fulfilled") setRecentActivity(a.value.data)
      if (pc.status === "fulfilled") setPendingCourses(pc.value.data)
      if (pu.status === "fulfilled") setPendingUsers(pu.value.data)
      setLoading(false)
    })
  }, [])

  const statCards = [
    {
      label: "Total Users",
      value: stats ? stats.totalUsers.toLocaleString() : "—",
      icon: Users,
      color: "#3B82F6",
      sub: stats ? `${stats.totalStudents} students · ${stats.totalInstructors} instructors` : "Loading…",
    },
    {
      label: "Active Courses",
      value: stats ? stats.totalCourses.toLocaleString() : "—",
      icon: BookOpen,
      color: "#10B981",
      sub: stats ? `${stats.publishedCourses} published` : "Loading…",
    },
    {
      label: "Total Revenue",
      value: stats ? `$${Number(stats.totalRevenue).toLocaleString()}` : "—",
      icon: DollarSign,
      color: "#F59E0B",
      sub: stats ? `${stats.totalTransactions} transactions` : "Loading…",
    },
    {
      label: "Needs Attention",
      value: stats ? (stats.pendingCourses + pendingUsers.length).toString() : "—",
      icon: ShieldAlert,
      color: "#EF4444",
      sub: stats ? `${stats.pendingCourses} courses pending review` : "Loading…",
    },
  ]

  const roleBreakdown = stats
    ? [
        { label: "Students", count: stats.totalStudents, color: "#3B82F6" },
        { label: "Instructors", count: stats.totalInstructors, color: "#8B5CF6" },
        { label: "Admins", count: stats.totalAdmins, color: "#F59E0B" },
      ]
    : []

  return (
    <DashboardLayout role="admin" userName={user?.fullName ?? "Admin"}>
      <div className="space-y-8 max-w-6xl">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Admin Dashboard</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Platform-wide overview of users, content, and revenue.
            </p>
          </div>
          <Link
            href="/admin/audit-log"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--accent)" }}
          >
            View Audit Log <ChevronRight size={16} />
          </Link>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
            <Loader2 size={16} className="animate-spin" /> Loading live data…
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(({ label, value, icon: Icon, color, sub }) => (
            <div key={label} className="rounded-2xl p-5 shadow-sm"
              style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
              <div className="flex items-center justify-center w-10 h-10 rounded-xl mb-3"
                style={{ backgroundColor: `${color}20` }}>
                <Icon size={20} style={{ color }} />
              </div>
              <div className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{value}</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{label}</div>
              <div className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* Users by role + enrollment/cert summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="rounded-2xl p-5 shadow-sm"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
            <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Users by Role</h2>
            {!stats ? (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Loading…</p>
            ) : (
              <div className="space-y-3">
                {roleBreakdown.map(({ label, count, color }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
                      <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{count.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ backgroundColor: "var(--border-default)" }}>
                      <div className="h-full rounded-full"
                        style={{ width: stats.totalUsers > 0 ? `${(Number(count) / Number(stats.totalUsers)) * 100}%` : "0%", backgroundColor: color }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl p-5 shadow-sm"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Platform Activity</h2>
              <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#34D399" }}>
                <ArrowUpRight size={13} /> Live
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Total Enrollments", value: stats?.totalEnrollments ?? "—", icon: TrendingUp, color: "#3B82F6" },
                { label: "Certificates Issued", value: stats?.totalCertificates ?? "—", icon: Award, color: "#10B981" },
                { label: "Pending Review", value: stats?.pendingCourses ?? "—", icon: ShieldAlert, color: "#F59E0B" },
                { label: "Total Transactions", value: stats?.totalTransactions ?? "—", icon: DollarSign, color: "#8B5CF6" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="rounded-xl p-3"
                  style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)" }}>
                  <Icon size={14} style={{ color }} className="mb-1.5" />
                  <div className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                    {typeof value === "number" ? value.toLocaleString() : value}
                  </div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent data panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Recent signups */}
          <div className="rounded-2xl p-5 shadow-sm"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Recent Signups</h2>
              <Link href="/admin/users" className="text-xs font-medium" style={{ color: "var(--accent)" }}>View all</Link>
            </div>
            {recentUsers.length === 0 && !loading ? (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>No users yet.</p>
            ) : (
              <div className="space-y-3">
                {recentUsers.map((u) => (
                  <div key={u.id} className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: "var(--accent)" }}>
                      {initials(u.fullName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>{u.fullName}</p>
                      <p className="text-xs capitalize" style={{ color: "var(--text-tertiary)" }}>
                        {u.role.toLowerCase()} · {fmt(u.createdAt)}
                      </p>
                    </div>
                    <UserPlus size={13} style={{ color: "var(--text-muted)" }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent payments */}
          <div className="rounded-2xl p-5 shadow-sm"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Recent Payments</h2>
              <Link href="/admin/transactions" className="text-xs font-medium" style={{ color: "var(--accent)" }}>View all</Link>
            </div>
            {recentPayments.length === 0 && !loading ? (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>No payments yet.</p>
            ) : (
              <div className="space-y-3">
                {recentPayments.map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                        {t.userName ?? "Unknown"}
                      </p>
                      <p className="text-xs truncate" style={{ color: "var(--text-tertiary)" }}>
                        {t.courseName ?? t.description ?? "—"}
                      </p>
                    </div>
                    <span className="text-xs font-bold flex-shrink-0"
                      style={{ color: t.status === "REFUNDED" ? "#F87171" : "#34D399" }}>
                      {t.status === "REFUNDED" ? "-" : ""}${Number(t.amount).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent activity */}
          <div className="rounded-2xl p-5 shadow-sm"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Recent Activity</h2>
              <Link href="/admin/audit-log" className="text-xs font-medium" style={{ color: "var(--accent)" }}>View all</Link>
            </div>
            {recentActivity.length === 0 && !loading ? (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>No activity logged yet.</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((a) => (
                  <div key={a.id} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                      style={{ backgroundColor: actionColor(a.action) }} />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold leading-snug" style={{ color: "var(--text-primary)" }}>
                        {a.action.replace(/_/g, " ").toLowerCase()}
                      </p>
                      <p className="text-xs truncate" style={{ color: "var(--text-tertiary)" }}>
                        {a.details ?? a.entityType ?? fmt(a.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pending approvals */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Pending Approvals</h2>
          </div>
          {pendingCourses.length === 0 && pendingUsers.length === 0 ? (
            <div className="rounded-2xl p-8 text-center shadow-sm"
              style={{ backgroundColor: "var(--bg-surface)", border: "1px dashed var(--border-default)" }}>
              <CheckCircle2 size={28} className="mx-auto mb-2" style={{ color: "var(--success)" }} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Nothing pending review right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingUsers.map((u) => (
                <div key={u.id} className="rounded-2xl p-4 flex items-center gap-3 shadow-sm"
                  style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg" style={{ backgroundColor: "#F59E0B20" }}>
                    <UserPlus size={16} style={{ color: "var(--warning)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{u.fullName}</p>
                    <p className="text-xs capitalize" style={{ color: "var(--text-tertiary)" }}>
                      {u.role.toLowerCase()} account awaiting activation
                    </p>
                  </div>
                  <Link href="/admin/users" className="text-xs font-semibold flex-shrink-0" style={{ color: "var(--accent)" }}>
                    Review
                  </Link>
                </div>
              ))}
              {pendingCourses.map((c) => (
                <div key={c.id} className="rounded-2xl p-4 flex items-center gap-3 shadow-sm"
                  style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg" style={{ backgroundColor: "#8B5CF620" }}>
                    <GraduationCap size={16} style={{ color: "#8B5CF6" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{c.title}</p>
                    <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Course awaiting publish review</p>
                  </div>
                  <Link href="/admin/courses" className="text-xs font-semibold flex-shrink-0" style={{ color: "var(--accent)" }}>
                    Review
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  )
}
