"use client"

import { useMemo, useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { useCertificateRegistry } from "@/lib/hooks/useCertificateRegistry"
import type { CertificateState } from "@/lib/data/certificateRegistry"
import { Search, Award, ShieldCheck, Clock, Ban, ExternalLink } from "lucide-react"

const stateColors: Record<CertificateState, React.CSSProperties> = {
  valid: { backgroundColor: "#10B98120", color: "#34D399" },
  "expiring-soon": { backgroundColor: "#F59E0B20", color: "#FCD34D" },
  expired: { backgroundColor: "#64748B20", color: "#94A3B8" },
  revoked: { backgroundColor: "#EF444420", color: "#F87171" },
}

const stateLabels: Record<CertificateState, string> = {
  valid: "Valid",
  "expiring-soon": "Expiring Soon",
  expired: "Expired",
  revoked: "Revoked",
}

export default function AdminCertificatesPage() {
  const { certificates, revoke } = useCertificateRegistry()
  const [search, setSearch] = useState("")
  const [stateFilter, setStateFilter] = useState<"all" | CertificateState>("all")

  const filtered = useMemo(() => {
    return certificates.filter((c) => {
      if (stateFilter !== "all" && c.state !== stateFilter) return false
      if (search && !c.studentName.toLowerCase().includes(search.toLowerCase()) && !c.courseName.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [certificates, stateFilter, search])

  const stats = [
    { label: "Total Issued", value: certificates.length, icon: Award, color: "#3B82F6" },
    { label: "Valid", value: certificates.filter((c) => c.state === "valid").length, icon: ShieldCheck, color: "#10B981" },
    { label: "Expiring Soon", value: certificates.filter((c) => c.state === "expiring-soon").length, icon: Clock, color: "#F59E0B" },
    { label: "Revoked", value: certificates.filter((c) => c.state === "revoked").length, icon: Ban, color: "#EF4444" },
  ]

  return (
    <DashboardLayout role="admin" userName="Morgan Patel">
      <div className="space-y-6 max-w-6xl">
        <div>
          <h1 className="text-2xl font-bold text-white">Certificates</h1>
          <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>
            Registry of every certificate issued across the platform.
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

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#64748B" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student or course..."
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg outline-none"
              style={{ backgroundColor: "#1E293B", border: "1px solid #334155", color: "#F8FAFC" }}
            />
          </div>
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value as "all" | CertificateState)}
            className="px-3 py-2.5 rounded-lg text-sm outline-none"
            style={{ backgroundColor: "#1E293B", border: "1px solid #334155", color: "#F8FAFC" }}
          >
            <option value="all">All states</option>
            <option value="valid">Valid</option>
            <option value="expiring-soon">Expiring Soon</option>
            <option value="expired">Expired</option>
            <option value="revoked">Revoked</option>
          </select>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid #334155" }}>
                {["Credential", "Student", "Course", "Issued", "Expires", "Grade", "State", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#64748B" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr
                  key={c.id}
                  className="transition-colors"
                  style={{ borderBottom: i < filtered.length - 1 ? "1px solid #334155" : "none" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#334155")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1.5 font-mono text-xs" style={{ color: "#94A3B8" }}>
                      {c.credentialId} <ExternalLink size={11} style={{ color: "#475569" }} />
                    </span>
                  </td>
                  <td className="px-5 py-4 font-medium text-white">{c.studentName}</td>
                  <td className="px-5 py-4" style={{ color: "#94A3B8" }}>{c.courseName}</td>
                  <td className="px-5 py-4" style={{ color: "#94A3B8" }}>{c.issuedDate}</td>
                  <td className="px-5 py-4" style={{ color: "#94A3B8" }}>{c.expiryDate ?? "No expiry"}</td>
                  <td className="px-5 py-4" style={{ color: "#94A3B8" }}>{c.grade}%</td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={stateColors[c.state]}>
                      {stateLabels[c.state]}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {c.state !== "revoked" && (
                      <button
                        onClick={() => revoke(c.id)}
                        className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg"
                        style={{ backgroundColor: "#EF444420", color: "#F87171" }}
                      >
                        <Ban size={12} /> Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm" style={{ color: "#475569" }}>
                    No certificates match these filters.
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
