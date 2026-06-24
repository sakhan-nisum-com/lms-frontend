export type AuditSeverity = "info" | "warning" | "critical"

export interface AuditLogEntry {
  id: string
  actor: string
  action: string
  target: string
  targetType: "user" | "course" | "training" | "discussion" | "study-group" | "transaction" | "settings"
  timestamp: string
  severity: AuditSeverity
}

export const AUDIT_LOG_SEED: AuditLogEntry[] = [
  { id: "log-1", actor: "Morgan Patel", action: "Suspended account", target: "Taylor Reid", targetType: "user", timestamp: "2026-06-18 09:14", severity: "warning" },
  { id: "log-2", actor: "Lena Kowalski", action: "Locked discussion thread", target: "Off-topic spam in 'React Server Components Q&A'", targetType: "discussion", timestamp: "2026-06-18 08:02", severity: "warning" },
  { id: "log-3", actor: "Owen Brooks", action: "Issued refund", target: "txn-1004 · Priya Nair", targetType: "transaction", timestamp: "2026-06-17 16:45", severity: "info" },
  { id: "log-4", actor: "Morgan Patel", action: "Published course", target: "Docker & Kubernetes 101", targetType: "course", timestamp: "2026-06-17 11:20", severity: "info" },
  { id: "log-5", actor: "System", action: "Failed payment retry", target: "txn-1007 · Taylor Reid", targetType: "transaction", timestamp: "2026-06-16 22:10", severity: "critical" },
  { id: "log-6", actor: "Lena Kowalski", action: "Removed discussion thread", target: "Reported post in Study Group 'Capstone Prep'", targetType: "discussion", timestamp: "2026-06-16 14:33", severity: "critical" },
  { id: "log-7", actor: "Morgan Patel", action: "Updated mandatory deadline", target: "Information Security Awareness", targetType: "training", timestamp: "2026-06-15 10:05", severity: "info" },
  { id: "log-8", actor: "Owen Brooks", action: "Approved instructor application", target: "Ryan Park", targetType: "user", timestamp: "2026-06-14 13:50", severity: "info" },
  { id: "log-9", actor: "Morgan Patel", action: "Disbanded study group", target: "Inactive group 'Old Cohort 2024'", targetType: "study-group", timestamp: "2026-06-12 09:40", severity: "warning" },
  { id: "log-10", actor: "Lena Kowalski", action: "Updated platform settings", target: "Maintenance mode enabled", targetType: "settings", timestamp: "2026-06-10 07:15", severity: "warning" },
  { id: "log-11", actor: "Owen Brooks", action: "Reactivated account", target: "James Okafor", targetType: "user", timestamp: "2026-06-09 15:22", severity: "info" },
  { id: "log-12", actor: "System", action: "Bulk certificate export", target: "142 certificates · Q2 compliance report", targetType: "course", timestamp: "2026-06-05 06:00", severity: "info" },
]
