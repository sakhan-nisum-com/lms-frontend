"use client"

import { useEffect, useState, useCallback } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { auditLogApi, type AuditLogEntry } from "@/lib/api/admin"
import { authStore } from "@/lib/auth-store"
import { Search, ShieldAlert, FileText, Loader2, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"

const ACTION_COLORS: Record<string, string> = {
  CREATE: "#10B981", UPDATE: "#3B82F6", DELETE: "#EF4444",
  LOGIN: "#8B5CF6", LOGOUT: "#64748B", APPROVE: "#10B981", REJECT: "#EF4444",
}

function getActionColor(action: string): string {
  const upper = action.toUpperCase()
  for (const [key, color] of Object.entries(ACTION_COLORS)) {
    if (upper.includes(key)) return color
  }
  return "#64748B"
}

export default function AdminAuditLogPage() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const user = authStore.getUser()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await auditLogApi.list(page, 50)
      setEntries(res.data)
      setTotalPages(res.totalPages || 1)
      setTotalElements(res.totalElements)
    } catch { setEntries([]) }
    finally { setLoading(false) }
  }, [page])

  useEffect(() => { load() }, [load])

  const filtered = search
    ? entries.filter((e) =>
        e.action.toLowerCase().includes(search.toLowerCase()) ||
        (e.entityType ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (e.details ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : entries

  const statCounts = {
    total: totalElements,
    creates: entries.filter((e) => e.action.toUpperCase().includes("CREATE")).length,
    deletes: entries.filter((e) => e.action.toUpperCase().includes("DELETE")).length,
  }

  return (
    <DashboardLayout role="admin" userName={user?.fullName ?? "Admin"}>
      <div className="space-y-6 max-w-6xl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Audit Log</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Full record of all admin and system actions on the platform.
            </p>
          </div>
          <button onClick={load}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Events", value: statCounts.total, color: "#3B82F6" },
            { label: "Creates", value: statCounts.creates, color: "#10B981" },
            { label: "Deletes", value: statCounts.deletes, color: "#EF4444" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
              <div className="text-2xl font-bold" style={{ color }}>{value}</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{label}</div>
            </div>
          ))}
        </div>

        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by action, entity, or details…"
            className="w-full pl-8 pr-3 py-2 rounded-xl text-xs outline-none"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }} />
        </div>

        <div className="rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={28} className="animate-spin" style={{ color: "var(--text-muted)" }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <ShieldAlert size={32} className="mb-3" style={{ color: "var(--text-muted)" }} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No audit events found</p>
            </div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-default)" }}>
                    {["Time", "Action", "Entity", "User", "IP", "Details"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                        style={{ color: "var(--text-tertiary)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((e, i) => {
                    const color = getActionColor(e.action)
                    return (
                      <tr key={e.id}
                        style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border-default)" : "none" }}
                        className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: "var(--text-tertiary)" }}>
                          {new Date(e.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                            style={{ color, backgroundColor: color + "20" }}>
                            {e.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                          {e.entityType ?? "—"}
                          {e.entityId && <span className="ml-1 font-mono" style={{ color: "var(--text-muted)" }}>{e.entityId.slice(0, 6)}…</span>}
                        </td>
                        <td className="px-4 py-3 text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                          {e.userId ? e.userId.slice(0, 8) + "…" : "System"}
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
                          {e.ipAddress ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-xs max-w-[180px] truncate" style={{ color: "var(--text-secondary)" }}
                          title={e.details ?? ""}>
                          {e.details ?? "—"}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: "1px solid var(--border-default)" }}>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{totalElements.toLocaleString()} total events · Page {page + 1} of {totalPages}</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
                      className="p-1.5 rounded-lg disabled:opacity-30" style={{ color: "var(--text-secondary)" }}>
                      <ChevronLeft size={15} />
                    </button>
                    <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                      className="p-1.5 rounded-lg disabled:opacity-30" style={{ color: "var(--text-secondary)" }}>
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
