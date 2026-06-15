"use client"

import { useState } from "react"
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowDownToLine,
  ChevronDown,
  BookOpen,
} from "lucide-react"
import { InstructorPageShell } from "@/components/instructor/InstructorPageShell"

const TRANSACTIONS = [
  { id: "TXN-9841", date: "Jun 10, 2025", course: "React & TypeScript Masterclass", students: 14, amount: "$420.00",  status: "paid"    },
  { id: "TXN-9802", date: "Jun 5, 2025",  course: "Node.js REST API Development",   students: 9,  amount: "$270.00",  status: "paid"    },
  { id: "TXN-9771", date: "Jun 1, 2025",  course: "Advanced CSS & Animation",       students: 6,  amount: "$180.00",  status: "paid"    },
  { id: "TXN-9744", date: "May 28, 2025", course: "React & TypeScript Masterclass", students: 21, amount: "$630.00",  status: "paid"    },
  { id: "TXN-9710", date: "May 22, 2025", course: "GraphQL with Apollo",            students: 5,  amount: "$150.00",  status: "paid"    },
  { id: "TXN-9688", date: "May 15, 2025", course: "Node.js REST API Development",   students: 12, amount: "$360.00",  status: "paid"    },
  { id: "TXN-9650", date: "Jun 11, 2025", course: "React & TypeScript Masterclass", students: 8,  amount: "$240.00",  status: "pending" },
  { id: "TXN-9649", date: "Jun 11, 2025", course: "Node.js REST API Development",   students: 4,  amount: "$120.00",  status: "pending" },
  { id: "TXN-9648", date: "Jun 10, 2025", course: "Advanced CSS & Animation",       students: 3,  amount: "$90.00",   status: "pending" },
]

const MONTHLY = [
  { month: "Jan", revenue: 620  },
  { month: "Feb", revenue: 840  },
  { month: "Mar", revenue: 1100 },
  { month: "Apr", revenue: 980  },
  { month: "May", revenue: 1510 },
  { month: "Jun", revenue: 1840 },
]

const maxMonthly = Math.max(...MONTHLY.map((m) => m.revenue))

const BY_COURSE = [
  { name: "React & TypeScript Masterclass", revenue: 3612, pct: 100, color: "#3B82F6" },
  { name: "Node.js REST API Development",   revenue: 2628, pct: 73,  color: "#10B981" },
  { name: "Advanced CSS & Animation",       revenue: 1629, pct: 45,  color: "#F59E0B" },
  { name: "GraphQL with Apollo",            revenue: 936,  pct: 26,  color: "#EC4899" },
]

const TX_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  paid:    { label: "Paid",    color: "#10B981", bg: "#10B98118" },
  pending: { label: "Pending", color: "#F59E0B", bg: "#F59E0B18" },
  failed:  { label: "Failed",  color: "#EF4444", bg: "#EF444418" },
}

export default function RevenuePage() {
  const [txFilter, setTxFilter] = useState("all")

  const filteredTx = TRANSACTIONS.filter(
    (tx) => txFilter === "all" || tx.status === txFilter
  )

  return (
    <InstructorPageShell
      title="Revenue"
      user={{ name: "Jane Smith", email: "jane@example.com" }}
      action={
        <button
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90"
          style={{ backgroundColor: "#3B82F6" }}
        >
          <ArrowDownToLine size={15} />
          <span className="hidden sm:inline">Request Payout</span>
        </button>
      }
    >
      <div className="space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Earned",  value: "$9,240", sub: "All time",          icon: DollarSign,  color: "#3B82F6", bg: "#3B82F615" },
            { label: "This Month",    value: "$1,840", sub: "+22% vs last month", icon: TrendingUp,  color: "#10B981", bg: "#10B98115" },
            { label: "Pending",       value: "$450",   sub: "Processing (3 txns)",icon: Clock,       color: "#F59E0B", bg: "#F59E0B15" },
            { label: "Total Paid Out",value: "$8,790", sub: "Across 24 payouts",  icon: CheckCircle2,color: "#8B5CF6", bg: "#8B5CF615" },
          ].map(({ label, value, sub, icon: Icon, color, bg }) => (
            <div
              key={label}
              className="rounded-2xl p-4"
              style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium" style={{ color: "#64748B" }}>{label}</p>
                <div className="flex items-center justify-center w-8 h-8 rounded-xl" style={{ backgroundColor: bg }}>
                  <Icon size={15} style={{ color }} />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs mt-1" style={{ color: "#64748B" }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Monthly revenue bar chart */}
          <div
            className="lg:col-span-3 rounded-2xl p-5"
            style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-semibold text-white">Monthly Revenue</h3>
                <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>Last 6 months</p>
              </div>
              <span className="text-xl font-bold" style={{ color: "#10B981" }}>+22%</span>
            </div>
            <div className="flex items-end gap-3 h-32">
              {MONTHLY.map((m) => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-xs font-semibold" style={{ color: "#94A3B8" }}>
                    ${(m.revenue / 1000).toFixed(1)}k
                  </span>
                  <div
                    className="w-full rounded-t-lg"
                    style={{
                      height: `${(m.revenue / maxMonthly) * 80}%`,
                      minHeight: 6,
                      backgroundColor: m.month === "Jun" ? "#3B82F6" : "#3B82F640",
                    }}
                  />
                  <span className="text-xs" style={{ color: "#64748B" }}>{m.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue by course */}
          <div
            className="lg:col-span-2 rounded-2xl p-5"
            style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
          >
            <h3 className="text-sm font-semibold text-white mb-4">Revenue by Course</h3>
            <div className="space-y-4">
              {BY_COURSE.map(({ name, revenue, pct, color }) => (
                <div key={name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs truncate flex-1 mr-2" style={{ color: "#94A3B8" }}>{name}</p>
                    <p className="text-xs font-bold text-white flex-shrink-0">${revenue.toLocaleString()}</p>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#334155" }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid #334155" }}
          >
            <h3 className="text-sm font-semibold text-white">Transaction History</h3>
            <div className="flex items-center gap-1">
              {["all", "paid", "pending"].map((f) => (
                <button
                  key={f}
                  onClick={() => setTxFilter(f)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors"
                  style={{
                    backgroundColor: txFilter === f ? "#334155" : "transparent",
                    color: txFilter === f ? "#F8FAFC" : "#64748B",
                  }}
                >
                  {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Table header */}
          <div
            className="grid px-5 py-2.5 text-xs font-semibold uppercase tracking-wide"
            style={{
              gridTemplateColumns: "110px 1fr 80px 90px 90px",
              borderBottom: "1px solid #334155",
              color: "#475569",
            }}
          >
            <span>ID</span>
            <span>Course</span>
            <span className="hidden sm:block text-right">Students</span>
            <span className="text-right">Amount</span>
            <span className="text-right">Status</span>
          </div>

          <div className="divide-y" style={{ borderColor: "#334155" }}>
            {filteredTx.map((tx) => {
              const st = TX_STATUS[tx.status]
              return (
                <div
                  key={tx.id}
                  className="grid items-center px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
                  style={{ gridTemplateColumns: "110px 1fr 80px 90px 90px" }}
                >
                  <div>
                    <p className="text-xs font-mono font-semibold" style={{ color: "#60A5FA" }}>{tx.id}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#475569" }}>{tx.date}</p>
                  </div>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0" style={{ backgroundColor: "#3B82F618" }}>
                      <BookOpen size={12} style={{ color: "#3B82F6" }} />
                    </div>
                    <p className="text-sm text-white truncate">{tx.course}</p>
                  </div>
                  <p className="hidden sm:block text-sm text-right" style={{ color: "#94A3B8" }}>{tx.students}</p>
                  <p className="text-sm font-bold text-white text-right">{tx.amount}</p>
                  <div className="flex justify-end">
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ color: st.color, backgroundColor: st.bg }}
                    >
                      {st.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          <div
            className="flex items-center justify-between px-5 py-3 text-xs"
            style={{ borderTop: "1px solid #334155", color: "#475569" }}
          >
            <span>Showing {filteredTx.length} of {TRANSACTIONS.length} transactions</span>
            <button className="flex items-center gap-1 hover:text-white transition-colors">
              Export CSV <ChevronDown size={12} />
            </button>
          </div>
        </div>

        {/* Payout info banner */}
        <div
          className="flex items-start gap-4 rounded-2xl p-5"
          style={{ backgroundColor: "#10B98110", border: "1px solid #10B98130" }}
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0" style={{ backgroundColor: "#10B98120" }}>
            <ArrowDownToLine size={18} style={{ color: "#10B981" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: "#6EE7B7" }}>
              $450.00 pending payout
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#065F46" }}>
              Payouts are processed every Monday. Your next payout will be on June 16, 2025.
              Minimum threshold: $50.
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 flex-shrink-0"
            style={{ backgroundColor: "#10B981" }}
          >
            Request now
          </button>
        </div>
      </div>
    </InstructorPageShell>
  )
}
