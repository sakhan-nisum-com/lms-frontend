"use client"

import { DashboardLayout } from "@/components/layout/DashboardLayout"
import Link from "next/link"
import { useTranslations } from "next-intl"
import {
  Users, BookOpen, DollarSign, ShieldAlert, ChevronRight,
  UserPlus, GraduationCap, AlertTriangle, CheckCircle2, ArrowUpRight,
} from "lucide-react"
import { usePlatformUsers } from "@/lib/hooks/usePlatformUsers"
import { useCourseModeration } from "@/lib/hooks/useCourseModeration"
import { COURSES } from "@/lib/data/courses"
import { TRAINING_TRACKS } from "@/lib/data/trainings"
import { TRANSACTIONS } from "@/lib/data/transactions"
import { AUDIT_LOG_SEED } from "@/lib/data/auditLog"

const WEEKLY_SIGNUPS = [4, 7, 5, 9, 6, 3, 8]
const WEEK_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const severityColors: Record<string, string> = {
  info: "#3B82F6",
  warning: "#F59E0B",
  critical: "#EF4444",
}

export default function AdminDashboardPage() {
  const t = useTranslations("adminDashboard")
  const { users } = usePlatformUsers()
  const { getEntry } = useCourseModeration()

  const students = users.filter((u) => u.role === "student")
  const tutors = users.filter((u) => u.role === "tutor")
  const admins = users.filter((u) => u.role === "admin")
  const pendingUsers = users.filter((u) => u.status === "pending")
  const suspendedUsers = users.filter((u) => u.status === "suspended")

  const pendingCourses = COURSES.filter((c) => getEntry(c.id).status === "pending-review")

  const completedTxns = TRANSACTIONS.filter((t) => t.status === "completed")
  const monthlyRevenue = completedTxns.reduce((sum, t) => sum + t.amount, 0)
  const refundedTxns = TRANSACTIONS.filter((t) => t.status === "refunded")

  const recentSignups = [...users]
    .sort((a, b) => (a.joinedDate < b.joinedDate ? 1 : -1))
    .slice(0, 5)
  const recentTransactions = TRANSACTIONS.slice(0, 5)
  const recentActivity = AUDIT_LOG_SEED.slice(0, 6)

  const stats = [
    { label: "Total Users", value: users.length.toLocaleString(), icon: Users, color: "#3B82F6", sub: `${students.length} students · ${tutors.length} tutors` },
    { label: "Active Courses", value: COURSES.length.toLocaleString(), icon: BookOpen, color: "#10B981", sub: `${TRAINING_TRACKS.length} training tracks` },
    { label: "Monthly Revenue", value: `$${monthlyRevenue.toLocaleString()}`, icon: DollarSign, color: "#F59E0B", sub: `${refundedTxns.length} refunds this month` },
    { label: "Needs Attention", value: (pendingUsers.length + pendingCourses.length + suspendedUsers.length).toString(), icon: ShieldAlert, color: "#EF4444", sub: `${pendingUsers.length} pending · ${suspendedUsers.length} suspended` },
  ]

  const maxSignup = Math.max(...WEEKLY_SIGNUPS)

  return (
    <DashboardLayout role="admin" userName="Morgan Patel">
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
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--accent)" }}
          >
            View Audit Log <ChevronRight size={16} />
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, color, sub }) => (
            <div
              key={label}
              className="rounded-2xl p-5 shadow-sm"
              style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
            >
              <div
                className="flex items-center justify-center w-10 h-10 rounded-xl mb-3"
                style={{ backgroundColor: `${color}20` }}
              >
                <Icon size={20} style={{ color }} />
              </div>
              <div className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{value}</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{label}</div>
              <div className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* Breakdown + signups */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
            <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Users by Role</h2>
            <div className="space-y-3">
              {[
                { label: "Students", count: students.length, color: "#3B82F6" },
                { label: "Tutors", count: tutors.length, color: "#8B5CF6" },
                { label: "Admins", count: admins.length, color: "#F59E0B" },
              ].map(({ label, count, color }) => (
                <div key={label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span style={{ color: "var(--text-secondary)" }}>{label}</span>
                    <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{count}</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ backgroundColor: "var(--border-default)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(count / users.length) * 100}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>New Signups (7 days)</h2>
              <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#34D399" }}>
                <ArrowUpRight size={13} /> +18%
              </span>
            </div>
            <div className="flex items-end justify-between gap-2" style={{ height: 80 }}>
              {WEEKLY_SIGNUPS.map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <div
                    className="w-full rounded-md"
                    style={{ height: `${(v / maxSignup) * 60}px`, backgroundColor: "var(--accent)", minHeight: 4 }}
                  />
                  <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>{WEEK_LABELS[i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Recent signups */}
          <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Recent Signups</h2>
              <Link href="/admin/users" className="text-xs font-medium" style={{ color: "var(--accent)" }}>
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {recentSignups.map((u) => (
                <div key={u.id} className="flex items-center gap-3">
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: "var(--border-default)" }}
                  >
                    {u.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>{u.name}</p>
                    <p className="text-xs capitalize" style={{ color: "var(--text-tertiary)" }}>{u.role} · {u.joinedDate}</p>
                  </div>
                  <UserPlus size={13} style={{ color: "var(--text-muted)" }} />
                </div>
              ))}
            </div>
          </div>

          {/* Recent transactions */}
          <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Recent Payments</h2>
              <Link href="/admin/transactions" className="text-xs font-medium" style={{ color: "var(--accent)" }}>
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {recentTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>{t.userName}</p>
                    <p className="text-xs truncate" style={{ color: "var(--text-tertiary)" }}>{t.courseName}</p>
                  </div>
                  <span
                    className="text-xs font-bold flex-shrink-0"
                    style={{ color: t.status === "refunded" ? "#F87171" : "#34D399" }}
                  >
                    {t.status === "refunded" ? "-" : ""}${t.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Recent Activity</h2>
              <Link href="/admin/audit-log" className="text-xs font-medium" style={{ color: "var(--accent)" }}>
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {recentActivity.map((a) => (
                <div key={a.id} className="flex items-start gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                    style={{ backgroundColor: severityColors[a.severity] }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs leading-snug" style={{ color: "var(--text-primary)" }}>
                      <span className="font-semibold">{a.actor}</span> {a.action.toLowerCase()}
                    </p>
                    <p className="text-xs truncate" style={{ color: "var(--text-tertiary)" }}>{a.target}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pending approvals */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Pending Approvals</h2>
          </div>
          {pendingUsers.length === 0 && pendingCourses.length === 0 ? (
            <div className="rounded-2xl p-8 text-center shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px dashed var(--border-default)" }}>
              <CheckCircle2 size={28} className="mx-auto mb-2" style={{ color: "var(--success)" }} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Nothing pending review right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingUsers.map((u) => (
                <div key={u.id} className="rounded-2xl p-4 flex items-center gap-3 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg" style={{ backgroundColor: "#F59E0B20" }}>
                    <UserPlus size={16} style={{ color: "var(--warning)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{u.name}</p>
                    <p className="text-xs capitalize" style={{ color: "var(--text-tertiary)" }}>{u.role} application awaiting review</p>
                  </div>
                  <Link href="/admin/users" className="text-xs font-semibold flex-shrink-0" style={{ color: "var(--accent)" }}>Review</Link>
                </div>
              ))}
              {pendingCourses.map((c) => (
                <div key={c.id} className="rounded-2xl p-4 flex items-center gap-3 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg" style={{ backgroundColor: "#8B5CF620" }}>
                    <GraduationCap size={16} style={{ color: "#8B5CF6" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{c.title}</p>
                    <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Course awaiting publish review</p>
                  </div>
                  <Link href="/admin/courses" className="text-xs font-semibold flex-shrink-0" style={{ color: "var(--accent)" }}>Review</Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {suspendedUsers.length > 0 && (
          <div className="rounded-2xl p-4 flex items-center gap-3 shadow-sm" style={{ backgroundColor: "#EF444410", border: "1px solid #EF444430" }}>
            <AlertTriangle size={18} style={{ color: "var(--danger)" }} />
            <p className="text-sm" style={{ color: "#FCA5A5" }}>
              {suspendedUsers.length} account{suspendedUsers.length > 1 ? "s" : ""} currently suspended.{" "}
              <Link href="/admin/users" className="font-semibold" style={{ color: "#F87171" }}>Review in Users →</Link>
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
