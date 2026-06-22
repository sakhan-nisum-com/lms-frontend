"use client"

import { useMemo, useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { useTransactions } from "@/lib/hooks/useTransactions"
import type { TransactionStatus } from "@/lib/data/transactions"
import { Search, DollarSign, RotateCcw, AlertTriangle, Clock, Download, TrendingUp, TrendingDown } from "lucide-react"

const statusColors: Record<TransactionStatus, React.CSSProperties> = {
  completed: { backgroundColor: "#10B98120", color: "#34D399" },
  refunded: { backgroundColor: "#F59E0B20", color: "#FCD34D" },
  pending: { backgroundColor: "#3B82F620", color: "#60A5FA" },
  failed: { backgroundColor: "#EF444420", color: "#F87171" },
}

// Prior months are illustrative trend data; the current month is computed
// live from the transaction ledger so the chart reacts to refunds issued below.
const HISTORICAL_REVENUE = [
  { month: "Jan", value: 540 },
  { month: "Feb", value: 610 },
  { month: "Mar", value: 705 },
  { month: "Apr", value: 670 },
  { month: "May", value: 760 },
]
const HISTORICAL_LOSSES = [
  { month: "Jan", value: 62 },
  { month: "Feb", value: 48 },
  { month: "Mar", value: 91 },
  { month: "Apr", value: 73 },
  { month: "May", value: 55 },
]
const CURRENT_MONTH = "Jun"

export default function AdminTransactionsPage() {
  const { transactions, refund } = useTransactions()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | TransactionStatus>("all")

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false
      if (search && !t.userName.toLowerCase().includes(search.toLowerCase()) && !t.courseName.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [transactions, statusFilter, search])

  const completedTotal = transactions.filter((t) => t.status === "completed").reduce((s, t) => s + t.amount, 0)
  const refundedTotal = transactions.filter((t) => t.status === "refunded").reduce((s, t) => s + t.amount, 0)
  const failedTotal = transactions.filter((t) => t.status === "failed").reduce((s, t) => s + t.amount, 0)
  const pendingCount = transactions.filter((t) => t.status === "pending").length
  const failedCount = transactions.filter((t) => t.status === "failed").length
  const lossesTotal = refundedTotal + failedTotal

  const revenueTrend = [...HISTORICAL_REVENUE, { month: CURRENT_MONTH, value: completedTotal }]
  const lossesTrend = [...HISTORICAL_LOSSES, { month: CURRENT_MONTH, value: lossesTotal }]
  const maxRevenue = Math.max(...revenueTrend.map((r) => r.value), 1)
  const maxLoss = Math.max(...lossesTrend.map((l) => l.value), 1)

  const stats = [
    { label: "Net Revenue", value: `$${completedTotal.toLocaleString()}`, icon: DollarSign, color: "#10B981" },
    { label: "Losses (Refunds + Failed)", value: `$${lossesTotal.toLocaleString()}`, icon: TrendingDown, color: "#EF4444" },
    { label: "Pending", value: pendingCount, icon: Clock, color: "#3B82F6" },
    { label: "Failed Payments", value: failedCount, icon: AlertTriangle, color: "#F59E0B" },
  ]

  return (
    <DashboardLayout role="admin" userName="Morgan Patel">
      <div className="space-y-6 max-w-6xl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Payments</h1>
            <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>
              Every payment received, plus monthly revenue and losses trends.
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
            style={{ backgroundColor: "#334155", color: "#CBD5E1" }}
          >
            <Download size={15} /> Export CSV
          </button>
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

        {/* Revenue & losses trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="rounded-2xl p-5" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-white">Monthly Revenue</h2>
              <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#34D399" }}>
                <TrendingUp size={13} /> Received payments
              </span>
            </div>
            <div className="flex items-end justify-between gap-2" style={{ height: 110 }}>
              {revenueTrend.map((r) => (
                <div key={r.month} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-xs font-semibold" style={{ color: "#94A3B8" }}>${r.value.toLocaleString()}</span>
                  <div className="w-full rounded-md" style={{ height: `${(r.value / maxRevenue) * 75}px`, backgroundColor: r.month === CURRENT_MONTH ? "#10B981" : "#10B98180", minHeight: 4 }} />
                  <span className="text-xs" style={{ color: "#64748B" }}>{r.month}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl p-5" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-white">Monthly Losses</h2>
              <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#F87171" }}>
                <TrendingDown size={13} /> Refunds + failed
              </span>
            </div>
            <div className="flex items-end justify-between gap-2" style={{ height: 110 }}>
              {lossesTrend.map((l) => (
                <div key={l.month} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-xs font-semibold" style={{ color: "#94A3B8" }}>${l.value.toLocaleString()}</span>
                  <div className="w-full rounded-md" style={{ height: `${(l.value / maxLoss) * 75}px`, backgroundColor: l.month === CURRENT_MONTH ? "#EF4444" : "#EF444480", minHeight: 4 }} />
                  <span className="text-xs" style={{ color: "#64748B" }}>{l.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#64748B" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user or course..."
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg outline-none"
              style={{ backgroundColor: "#1E293B", border: "1px solid #334155", color: "#F8FAFC" }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | TransactionStatus)}
            className="px-3 py-2.5 rounded-lg text-sm outline-none"
            style={{ backgroundColor: "#1E293B", border: "1px solid #334155", color: "#F8FAFC" }}
          >
            <option value="all">All statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid #334155" }}>
                {["Transaction", "User", "Course", "Amount", "Method", "Date", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#64748B" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <tr
                  key={t.id}
                  className="transition-colors"
                  style={{ borderBottom: i < filtered.length - 1 ? "1px solid #334155" : "none" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#334155")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <td className="px-5 py-4 font-mono text-xs" style={{ color: "#64748B" }}>{t.id}</td>
                  <td className="px-5 py-4 font-medium text-white">{t.userName}</td>
                  <td className="px-5 py-4" style={{ color: "#94A3B8" }}>{t.courseName}</td>
                  <td className="px-5 py-4 font-semibold" style={{ color: t.status === "refunded" ? "#F87171" : "#F8FAFC" }}>
                    {t.status === "refunded" ? "-" : ""}${t.amount}
                  </td>
                  <td className="px-5 py-4 capitalize" style={{ color: "#94A3B8" }}>{t.method}</td>
                  <td className="px-5 py-4" style={{ color: "#94A3B8" }}>{t.date}</td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold capitalize" style={statusColors[t.status]}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {t.status === "completed" && (
                      <button
                        onClick={() => refund(t.id)}
                        className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg"
                        style={{ backgroundColor: "#F59E0B20", color: "#FCD34D" }}
                      >
                        <RotateCcw size={12} /> Refund
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm" style={{ color: "#475569" }}>
                    No transactions match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}
