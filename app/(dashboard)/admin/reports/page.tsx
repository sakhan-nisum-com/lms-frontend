"use client"

import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { COURSES } from "@/lib/data/courses"
import { TRANSACTIONS } from "@/lib/data/transactions"
import { usePlatformUsers } from "@/lib/hooks/usePlatformUsers"
import { DollarSign, Users, GraduationCap, Star, TrendingUp } from "lucide-react"

const REVENUE_TREND = [
  { month: "Jan", value: 9200 },
  { month: "Feb", value: 10400 },
  { month: "Mar", value: 11800 },
  { month: "Apr", value: 10900 },
  { month: "May", value: 13200 },
  { month: "Jun", value: 14650 },
]

const USER_GROWTH = [
  { month: "Jan", value: 1180 },
  { month: "Feb", value: 1240 },
  { month: "Mar", value: 1310 },
  { month: "Apr", value: 1390 },
  { month: "May", value: 1470 },
  { month: "Jun", value: 1560 },
]

export default function AdminReportsPage() {
  const { users } = usePlatformUsers()

  const categoryBreakdown = COURSES.reduce<Record<string, number>>((acc, c) => {
    acc[c.category] = (acc[c.category] ?? 0) + c.studentsCount
    return acc
  }, {})
  const totalEnrollments = Object.values(categoryBreakdown).reduce((a, b) => a + b, 0)
  const sortedCategories = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])

  const avgRating = COURSES.reduce((s, c) => s + c.rating, 0) / COURSES.length
  const completedRevenue = TRANSACTIONS.filter((t) => t.status === "completed").reduce((s, t) => s + t.amount, 0)
  const topCourses = [...COURSES].sort((a, b) => b.studentsCount - a.studentsCount).slice(0, 5)

  const maxRevenue = Math.max(...REVENUE_TREND.map((r) => r.value))
  const maxUsers = Math.max(...USER_GROWTH.map((u) => u.value))

  const stats = [
    { label: "YTD Revenue", value: `$${(completedRevenue * 6.2).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: DollarSign, color: "#10B981" },
    { label: "Total Users", value: users.length, icon: Users, color: "#3B82F6" },
    { label: "Total Enrollments", value: totalEnrollments.toLocaleString(), icon: GraduationCap, color: "#8B5CF6" },
    { label: "Avg. Course Rating", value: avgRating.toFixed(1), icon: Star, color: "#F59E0B" },
  ]

  return (
    <DashboardLayout role="admin" userName="Morgan Patel">
      <div className="space-y-8 max-w-6xl">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports &amp; Analytics</h1>
          <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>
            Platform-wide performance across revenue, enrollment, and content.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-2xl p-5" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
              <div className="flex items-center justify-center w-10 h-10 rounded-xl mb-3" style={{ backgroundColor: `${color}20` }}>
                <Icon size={20} style={{ color }} />
              </div>
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-xs mt-0.5" style={{ color: "#64748B" }}>{label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="rounded-2xl p-5" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-white">Revenue Trend</h2>
              <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#34D399" }}>
                <TrendingUp size={13} /> +12.4%
              </span>
            </div>
            <div className="flex items-end justify-between gap-2" style={{ height: 110 }}>
              {REVENUE_TREND.map((r) => (
                <div key={r.month} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-xs font-semibold" style={{ color: "#94A3B8" }}>${(r.value / 1000).toFixed(1)}k</span>
                  <div className="w-full rounded-md" style={{ height: `${(r.value / maxRevenue) * 75}px`, backgroundColor: "#10B981", minHeight: 4 }} />
                  <span className="text-xs" style={{ color: "#64748B" }}>{r.month}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl p-5" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-white">User Growth</h2>
              <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#34D399" }}>
                <TrendingUp size={13} /> +6.1%
              </span>
            </div>
            <div className="flex items-end justify-between gap-2" style={{ height: 110 }}>
              {USER_GROWTH.map((u) => (
                <div key={u.month} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-xs font-semibold" style={{ color: "#94A3B8" }}>{u.value.toLocaleString()}</span>
                  <div className="w-full rounded-md" style={{ height: `${(u.value / maxUsers) * 75}px`, backgroundColor: "#3B82F6", minHeight: 4 }} />
                  <span className="text-xs" style={{ color: "#64748B" }}>{u.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="rounded-2xl p-5" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
            <h2 className="text-sm font-semibold text-white mb-4">Enrollment by Category</h2>
            <div className="space-y-3">
              {sortedCategories.map(([category, count]) => (
                <div key={category}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span style={{ color: "#94A3B8" }}>{category}</span>
                    <span className="font-semibold text-white">{count.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ backgroundColor: "#334155" }}>
                    <div className="h-full rounded-full" style={{ width: `${(count / totalEnrollments) * 100}%`, backgroundColor: "#8B5CF6" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
            <div className="px-5 py-4" style={{ borderBottom: "1px solid #334155" }}>
              <h2 className="text-sm font-semibold text-white">Top Performing Courses</h2>
            </div>
            <table className="w-full text-sm">
              <tbody>
                {topCourses.map((c, i) => (
                  <tr key={c.id} style={{ borderBottom: i < topCourses.length - 1 ? "1px solid #334155" : "none" }}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{c.thumbnail}</span>
                        <span className="text-white font-medium truncate">{c.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right" style={{ color: "#94A3B8" }}>{c.studentsCount.toLocaleString()} students</td>
                    <td className="px-5 py-3 text-right">
                      <span className="flex items-center justify-end gap-1" style={{ color: "#94A3B8" }}>
                        <Star size={12} fill="#F59E0B" style={{ color: "#F59E0B" }} /> {c.rating}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
