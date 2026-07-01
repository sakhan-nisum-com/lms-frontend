"use client"

import { useMemo, useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { AUDIT_LOG_SEED } from "@/lib/data/auditLog"
import type { AuditSeverity } from "@/lib/data/auditLog"
import { Search, ShieldAlert, Info, AlertTriangle, Ban } from "lucide-react"

const severityMeta: Record<AuditSeverity, { color: string; icon: React.ElementType; label: string }> = {
  info: { color: "#3B82F6", icon: Info, label: "Info" },
  warning: { color: "#F59E0B", icon: AlertTriangle, label: "Warning" },
  critical: { color: "#EF4444", icon: Ban, label: "Critical" },
}

export default function AdminAuditLogPage() {
  const [search, setSearch] = useState("")
  const [severityFilter, setSeverityFilter] = useState<"all" | AuditSeverity>("all")

  const filtered = useMemo(() => {
    return AUDIT_LOG_SEED.filter((l) => {
      if (severityFilter !== "all" && l.severity !== severityFilter) return false
      if (search && !l.actor.toLowerCase().includes(search.toLowerCase()) && !l.target.toLowerCase().includes(search.toLowerCase()) && !l.action.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [search, severityFilter])

  const stats = [
    { label: "Total Events", value: AUDIT_LOG_SEED.length, color: "#3B82F6" },
    { label: "Critical", value: AUDIT_LOG_SEED.filter((l) => l.severity === "critical").length, color: "#EF4444" },
    { label: "Warnings", value: AUDIT_LOG_SEED.filter((l) => l.severity === "warning").length, color: "#F59E0B" },
  ]

  return (
    <DashboardLayout role="admin" userName="Morgan Patel">
      <div className="space-y-6 max-w-5xl">
        <div>
          <h1 className="text-2xl font-bold text-white">Audit Log</h1>
          <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>
            Full history of administrative actions across the platform.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {stats.map(({ label, value, color }) => (
            <div key={label} className="rounded-2xl p-5" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
              <div className="text-2xl font-bold" style={{ color }}>{value}</div>
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
              placeholder="Search by actor, action, or target..."
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg outline-none"
              style={{ backgroundColor: "#1E293B", border: "1px solid #334155", color: "#F8FAFC" }}
            />
          </div>
          <div className="flex gap-1.5">
            {(["all", "info", "warning", "critical"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSeverityFilter(s)}
                className="px-3 py-2 rounded-lg text-xs font-semibold capitalize"
                style={{
                  backgroundColor: severityFilter === s ? "#3B82F6" : "#1E293B",
                  color: severityFilter === s ? "#fff" : "#94A3B8",
                  border: "1px solid #334155",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
          {filtered.length === 0 ? (
            <div className="p-10 text-center">
              <ShieldAlert size={28} className="mx-auto mb-2" style={{ color: "#334155" }} />
              <p className="text-sm" style={{ color: "#475569" }}>No events match these filters.</p>
            </div>
          ) : (
            <div>
              {filtered.map((l, i) => {
                const meta = severityMeta[l.severity]
                const Icon = meta.icon
                return (
                  <div
                    key={l.id}
                    className="flex items-start gap-3 px-5 py-4"
                    style={{ borderBottom: i < filtered.length - 1 ? "1px solid #334155" : "none" }}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0" style={{ backgroundColor: `${meta.color}20` }}>
                      <Icon size={14} style={{ color: meta.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">
                        <span className="font-semibold">{l.actor}</span> {l.action.toLowerCase()}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>{l.target}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${meta.color}20`, color: meta.color }}>
                        {meta.label}
                      </span>
                      <p className="text-xs mt-1" style={{ color: "#64748B" }}>{l.timestamp}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
