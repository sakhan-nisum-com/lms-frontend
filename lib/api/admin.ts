import { api } from "./client"
import type { PageResponse } from "./courses"

// ── User management ───────────────────────────────────────────────────────────

export type AdminUserRole = "STUDENT" | "INSTRUCTOR" | "ADMIN"
export type AdminUserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING"

export interface AdminUser {
  id: string
  fullName: string
  fullNameAr: string | null
  email: string
  role: AdminUserRole
  status: AdminUserStatus
  avatarUrl: string | null
  preferredLanguage: string | null
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

export const usersApi = {
  list: (params: { q?: string; role?: AdminUserRole; status?: AdminUserStatus; page?: number; size?: number } = {}) => {
    const p = new URLSearchParams()
    if (params.q) p.set("q", params.q)
    if (params.role) p.set("role", params.role)
    if (params.status) p.set("status", params.status)
    p.set("page", String(params.page ?? 0))
    p.set("size", String(params.size ?? 20))
    return api.get<PageResponse<AdminUser>>(`/api/v1/users?${p}`)
  },

  getById: (id: string) =>
    api.get<AdminUser>(`/api/v1/users/${id}`),

  getMe: () =>
    api.get<AdminUser>("/api/v1/users/me"),

  updateStatus: (id: string, status: AdminUserStatus) =>
    api.patch<AdminUser>(`/api/v1/users/${id}/status?status=${status}`, {}),

  delete: (id: string) =>
    api.delete(`/api/v1/users/${id}`),
}

// ── Announcements ─────────────────────────────────────────────────────────────

export interface ApiAnnouncement {
  id: string
  authorId: string
  authorName: string | null
  title: string
  titleAr: string | null
  body: string
  bodyAr: string | null
  audience: "ALL" | "STUDENTS" | "INSTRUCTORS"
  priority: "NORMAL" | "HIGH" | "CRITICAL"
  pinned: boolean
  expiresAt: string | null
  createdAt: string
}

export interface CreateAnnouncementRequest {
  title: string
  titleAr?: string
  body: string
  bodyAr?: string
  audience: "ALL" | "STUDENTS" | "INSTRUCTORS"
  priority: "NORMAL" | "HIGH" | "CRITICAL"
  pinned?: boolean
  expiresAt?: string
}

export const announcementsApi = {
  list: (page = 0) =>
    api.get<PageResponse<ApiAnnouncement>>(`/api/v1/announcements?page=${page}`),

  create: (req: CreateAnnouncementRequest) =>
    api.post<ApiAnnouncement>("/api/v1/announcements", req),

  delete: (id: string) =>
    api.delete(`/api/v1/announcements/${id}`),
}

// ── Site settings ─────────────────────────────────────────────────────────────

export const settingsApi = {
  getAll: () =>
    api.get<Record<string, string>>("/api/v1/settings"),

  upsert: (key: string, value: string, description?: string, category?: string) => {
    const p = new URLSearchParams({ value })
    if (description) p.set("description", description)
    if (category) p.set("category", category)
    return api.put<void>(`/api/v1/settings/${key}?${p}`, {})
  },
}

// ── Audit log ─────────────────────────────────────────────────────────────────

export interface AuditLogEntry {
  id: string
  userId: string | null
  action: string
  entityType: string | null
  entityId: string | null
  details: string | null
  ipAddress: string | null
  createdAt: string
}

export const auditLogApi = {
  list: (page = 0, size = 50) =>
    api.get<PageResponse<AuditLogEntry>>(`/api/v1/audit-log?page=${page}&size=${size}`),
}
