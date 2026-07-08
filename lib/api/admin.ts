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
  bio: string | null
  bioAr: string | null
  department: string | null
  location: string | null
  phoneNumber: string | null
  preferredLanguage: string | null
  emailVerified: boolean
  lastLoginAt: string | null
  createdAt: string
  headline: string | null
  yearsOfExperience: number | null
  specialization: string | null
  websiteUrl: string | null
  linkedinUrl: string | null
  twitterUrl: string | null
}

export interface UpdateProfileRequest {
  fullName?: string
  fullNameAr?: string
  bio?: string
  bioAr?: string
  department?: string
  location?: string
  phoneNumber?: string
  preferredLanguage?: string
  avatarUrl?: string
  headline?: string
  yearsOfExperience?: number | null
  specialization?: string
  websiteUrl?: string
  linkedinUrl?: string
  twitterUrl?: string
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

  updateMe: (req: UpdateProfileRequest) =>
    api.put<AdminUser>("/api/v1/users/me", req),

  changePassword: (req: { currentPassword: string; newPassword: string }) =>
    api.patch<void>("/api/v1/users/me/password", req),

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

// ── Admin — Instructors ───────────────────────────────────────────────────────

export interface InstructorSummary {
  id: string
  fullName: string
  fullNameAr: string | null
  email: string
  status: AdminUserStatus
  avatarUrl: string | null
  bio: string | null
  department: string | null
  courseCount: number
  totalStudents: number
  lastLoginAt: string | null
  createdAt: string
}

export interface InstructorCourse {
  id: string
  title: string
  titleAr: string | null
  category: string | null
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL_LEVELS"
  status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "ARCHIVED" | "REJECTED"
  price: number
  isFree: boolean
  rating: number
  studentsCount: number
  enrolledCount: number
  createdAt: string
}

export interface EnrolledStudent {
  enrollmentId: string
  studentId: string
  fullName: string
  fullNameAr: string | null
  email: string
  avatarUrl: string | null
  progressPct: number
  enrolledAt: string
  completedAt: string | null
  totalTimeSpentSeconds: number
}

export const instructorsAdminApi = {
  list: (params: { q?: string; page?: number; size?: number } = {}) => {
    const p = new URLSearchParams()
    if (params.q) p.set("q", params.q)
    p.set("page", String(params.page ?? 0))
    p.set("size", String(params.size ?? 15))
    return api.get<PageResponse<InstructorSummary>>(`/api/v1/admin/instructors?${p}`)
  },

  getById: (id: string) =>
    api.get<InstructorSummary>(`/api/v1/admin/instructors/${id}`),

  updateStatus: (id: string, status: AdminUserStatus) =>
    api.patch<{ status: AdminUserStatus }>(`/api/v1/admin/instructors/${id}/status?status=${status}`, {}),

  getCourses: (instructorId: string) =>
    api.get<InstructorCourse[]>(`/api/v1/admin/instructors/${instructorId}/courses`),

  getCourseStudents: (courseId: string, page = 0, size = 20) =>
    api.get<PageResponse<EnrolledStudent>>(
      `/api/v1/admin/instructors/courses/${courseId}/students?page=${page}&size=${size}`
    ),
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
