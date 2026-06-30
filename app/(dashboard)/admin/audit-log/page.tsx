"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { AUDIT_LOG_SEED } from "@/lib/data/auditLog"
import type { AuditSeverity } from "@/lib/data/auditLog"
import { Search, ShieldAlert, Info, AlertTriangle, Ban } from "lucide-react"

export default function AdminAuditLogPage() {
  const t = useTranslations("adminAuditLog")
  const [search, setSearch] = useState("")
  const [severityFilter, setSeverityFilter] = useState<"all" | AuditSeverity>("all")

  const severityMeta: Record<AuditSeverity, { color: string; icon: React.ElementType; label: string }> = {
    info: { color: "#3B82F6", icon: Info, label: t("severityInfo") },
    warning: { color: "#F59E0B", icon: AlertTriangle, label: t("severityWarning") },
    critical: { color: "#EF4444", icon: Ban, label: t("severityCritical") },
  }

  const filterLabels: Record<"all" | AuditSeverity, string> = {
    all: t("filterAll"),
    info: t("filterInfo"),
    warning: t("filterWarning"),
    critical: t("filterCritical"),
  }

  const filtered = useMemo(() => {
    return AUDIT_LOG_SEED.filter((l) => {
      if (severityFilter !== "all" && l.severity !== severityFilter) return false
      if (search && !l.actor.toLowerCase().includes(search.toLowerCase()) && !l.target.toLowerCase().includes(search.toLowerCase()) && !l.action.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [search, severityFilter])

  const stats = [
    { label: t("totalEvents"), value: AUDIT_LOG_SEED.length, color: "#3B82F6" },
    { label: t("critical"), value: AUDIT_LOG_SEED.filter((l) => l.severity === "critical").length, color: "#EF4444" },
    { label: t("warnings"), value: AUDIT_LOG_SEED.filter((l) => l.severity === "warning").length, color: "#F59E0B" },
  ]

  return (
    <DashboardLayout role="admin" userName="Morgan Patel">
      <div className="space-y-6 max-w-5xl">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{t("title")}</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {t("subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {stats.map(({ label, value, color }) => (
            <div key={label} className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
              <div className="text-2xl font-bold" style={{ color }}>{value}</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{label}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full ps-9 pe-4 py-2.5 text-sm rounded-lg outline-none"
              style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
            />
          </div>
          <div className="flex gap-1.5">
            {(["all", "info", "warning", "critical"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSeverityFilter(s)}
                className="px-3 py-2 rounded-lg text-xs font-semibold capitalize"
                style={{
                  backgroundColor: severityFilter === s ? "var(--accent)" : "var(--bg-surface)",
                  color: severityFilter === s ? "#fff" : "var(--text-secondary)",
                  border: "1px solid var(--border-default)",
                }}
              >
                {filterLabels[s]}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
          {filtered.length === 0 ? (
            <div className="p-10 text-center">
              <ShieldAlert size={28} className="mx-auto mb-2" style={{ color: "var(--border-default)" }} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>{t("emptyTitle")}</p>
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
                    style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border-default)" : "none" }}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0" style={{ backgroundColor: `${meta.color}20` }}>
                      <Icon size={14} style={{ color: meta.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                        <span className="font-semibold">{l.actor}</span> {l.action.toLowerCase()}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{l.target}</p>
                    </div>
                    <div className="text-end flex-shrink-0">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${meta.color}20`, color: meta.color }}>
                        {meta.label}
                      </span>
                      <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>{l.timestamp}</p>
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
