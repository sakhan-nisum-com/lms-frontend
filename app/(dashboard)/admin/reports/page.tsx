"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { analyticsApi, type AdminDashboardStats } from "@/lib/api/analytics"
import { coursesApi, type ApiCourse } from "@/lib/api/courses"
import { usersApi } from "@/lib/api/admin"
import { authStore } from "@/lib/auth-store"
import { DollarSign, Users, GraduationCap, Star, TrendingUp, Loader2 } from "lucide-react"

export default function AdminReportsPage() {
  const [liveStats, setLiveStats] = useState<AdminDashboardStats | null>(null)
  const [topCourses, setTopCourses] = useState<ApiCourse[]>([])
  const [totalUsers, setTotalUsers] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const user = authStore.getUser()

  useEffect(() => {
    async function load() {
      setLoading(true)
      await Promise.allSettled([
        analyticsApi.adminDashboard().then(setLiveStats).catch(() => {}),
        coursesApi.list(0, 100).then((res) => {
          const sorted = [...res.data].sort((a, b) => b.studentsCount - a.studentsCount)
          setTopCourses(sorted.slice(0, 5))
        }).catch(() => {}),
        usersApi.list({ page: 0, size: 1 }).then((res) => setTotalUsers(res.totalElements)).catch(() => {}),
      ])
      setLoading(false)
    }
    load()
  }, [])

  const stats = [
    { label: "Total Revenue", value: liveStats?.totalRevenue != null ? `$${liveStats.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : "—", icon: DollarSign, color: "#10B981" },
    { label: "Total Users", value: totalUsers ?? liveStats?.totalUsers ?? "—", icon: Users, color: "#3B82F6" },
    { label: "Total Enrollments", value: liveStats?.totalEnrollments?.toLocaleString() ?? "—", icon: GraduationCap, color: "#8B5CF6" },
    { label: "Total Courses", value: liveStats?.totalCourses ?? "—", icon: Star, color: "#F59E0B" },
  ]

  // Build enrollment-by-category from top courses data
  const categoryMap = topCourses.reduce<Record<string, number>>((acc, c) => {
    const cat = c.category ?? "Other"
    acc[cat] = (acc[cat] ?? 0) + c.studentsCount
    return acc
  }, {})
  const totalEnrollments = Object.values(categoryMap).reduce((a, b) => a + b, 0) || 1
  const sortedCategories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])

  return (
    <DashboardLayout role="admin" userName={user?.fullName ?? "Admin"}>
      <div className="space-y-8 max-w-6xl">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Reports &amp; Analytics</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Platform-wide performance across revenue, enrollment, and content.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={28} className="animate-spin" style={{ color: "var(--text-muted)" }} />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl mb-3" style={{ backgroundColor: `${color}20` }}>
                    <Icon size={20} style={{ color }} />
                  </div>
                  <div className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{value}</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Enrollment by Category */}
              <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Enrollment by Category</h2>
                {sortedCategories.length === 0 ? (
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>No data yet.</p>
                ) : (
                  <div className="space-y-3">
                    {sortedCategories.map(([category, count]) => (
                      <div key={category}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span style={{ color: "var(--text-secondary)" }}>{category}</span>
                          <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{count.toLocaleString()}</span>
                        </div>
                        <div className="h-1.5 rounded-full" style={{ backgroundColor: "var(--border-default)" }}>
                          <div className="h-full rounded-full" style={{ width: `${(count / totalEnrollments) * 100}%`, backgroundColor: "#8B5CF6" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Courses */}
              <div className="rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-default)" }}>
                  <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Top Performing Courses</h2>
                  <TrendingUp size={14} style={{ color: "#34D399" }} />
                </div>
                {topCourses.length === 0 ? (
                  <p className="text-xs p-5" style={{ color: "var(--text-muted)" }}>No courses yet.</p>
                ) : (
                  <table className="w-full text-sm">
                    <tbody>
                      {topCourses.map((c, i) => (
                        <tr key={c.id} style={{ borderBottom: i < topCourses.length - 1 ? "1px solid var(--border-default)" : "none" }}>
                          <td className="px-5 py-3">
                            <span className="font-medium truncate block max-w-[180px]" style={{ color: "var(--text-primary)" }}>{c.title}</span>
                            <span className="text-xs" style={{ color: "var(--text-muted)" }}>{c.category ?? "Uncategorized"}</span>
                          </td>
                          <td className="px-5 py-3 text-right text-xs" style={{ color: "var(--text-secondary)" }}>{c.studentsCount.toLocaleString()} students</td>
                          <td className="px-5 py-3 text-right">
                            <span className="flex items-center justify-end gap-1 text-xs" style={{ color: "var(--warning)" }}>
                              <Star size={11} fill="#F59E0B" /> {c.rating.toFixed(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Extra stats from live data */}
            {liveStats && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Published Courses", value: liveStats.publishedCourses, color: "#3B82F6" },
                  { label: "Pending Review", value: liveStats.pendingCourses, color: "#F59E0B" },
                  { label: "Certificates Issued", value: liveStats.totalCertificates, color: "#10B981" },
                  { label: "Total Transactions", value: liveStats.totalTransactions, color: "#8B5CF6" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                    <div className="text-xl font-bold" style={{ color }}>{value}</div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{label}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
