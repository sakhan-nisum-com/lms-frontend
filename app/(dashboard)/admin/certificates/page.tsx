"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { useCertificateRegistry } from "@/lib/hooks/useCertificateRegistry"
import type { CertificateState } from "@/lib/data/certificateRegistry"
import { Search, Award, ShieldCheck, Clock, Ban, ExternalLink } from "lucide-react"

const stateColors: Record<CertificateState, React.CSSProperties> = {
  valid: { backgroundColor: "#10B98120", color: "#34D399" },
  "expiring-soon": { backgroundColor: "#F59E0B20", color: "#FCD34D" },
  expired: { backgroundColor: "#64748B20", color: "var(--text-secondary)" },
  revoked: { backgroundColor: "#EF444420", color: "#F87171" },
}

export default function AdminCertificatesPage() {
  const t = useTranslations("adminCertificates")
  const { certificates, revoke } = useCertificateRegistry()
  const [search, setSearch] = useState("")
  const [stateFilter, setStateFilter] = useState<"all" | CertificateState>("all")

  const stateLabels: Record<CertificateState, string> = {
    valid: t("valid"),
    "expiring-soon": t("expiringSoon"),
    expired: t("expired"),
    revoked: t("revoked"),
  }

  const filtered = useMemo(() => {
    return certificates.filter((c) => {
      if (stateFilter !== "all" && c.state !== stateFilter) return false
      if (search && !c.studentName.toLowerCase().includes(search.toLowerCase()) && !c.courseName.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [certificates, stateFilter, search])

  const stats = [
    { label: t("totalIssued"), value: certificates.length, icon: Award, color: "#3B82F6" },
    { label: t("valid"), value: certificates.filter((c) => c.state === "valid").length, icon: ShieldCheck, color: "#10B981" },
    { label: t("expiringSoon"), value: certificates.filter((c) => c.state === "expiring-soon").length, icon: Clock, color: "#F59E0B" },
    { label: t("revoked"), value: certificates.filter((c) => c.state === "revoked").length, icon: Ban, color: "#EF4444" },
  ]

  return (
    <DashboardLayout role="admin" userName="Morgan Patel">
      <div className="space-y-6 max-w-6xl">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{t("title")}</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {t("subtitle")}
          </p>
        </div>

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
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value as "all" | CertificateState)}
            className="px-3 py-2.5 rounded-lg text-sm outline-none"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
          >
            <option value="all">{t("allStates")}</option>
            <option value="valid">{t("valid")}</option>
            <option value="expiring-soon">{t("expiringSoon")}</option>
            <option value="expired">{t("expired")}</option>
            <option value="revoked">{t("revoked")}</option>
          </select>
        </div>

        <div className="rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-default)" }}>
                {[t("colCredential"), t("colStudent"), t("colCourse"), t("colIssued"), t("colExpires"), t("colGrade"), t("colState"), t("colActions")].map((h) => (
                  <th key={h} className="text-start px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
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
                  style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border-default)" : "none" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--border-default)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1.5 font-mono text-xs" style={{ color: "var(--text-secondary)" }}>
                      {c.credentialId} <ExternalLink size={11} style={{ color: "var(--text-muted)" }} />
                    </span>
                  </td>
                  <td className="px-5 py-4 font-medium" style={{ color: "var(--text-primary)" }}>{c.studentName}</td>
                  <td className="px-5 py-4" style={{ color: "var(--text-secondary)" }}>{c.courseName}</td>
                  <td className="px-5 py-4" style={{ color: "var(--text-secondary)" }}>{c.issuedDate}</td>
                  <td className="px-5 py-4" style={{ color: "var(--text-secondary)" }}>{c.expiryDate ?? t("noExpiry")}</td>
                  <td className="px-5 py-4" style={{ color: "var(--text-secondary)" }}>{c.grade}%</td>
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
                        <Ban size={12} /> {t("revoke")}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                    {t("emptyTitle")}
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
