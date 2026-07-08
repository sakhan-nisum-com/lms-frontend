import { api } from "./client"
import type { PageResponse } from "./courses"

export interface ApiPendingCertificate {
  studentId: string
  studentName: string
  studentEmail: string
  courseId: string
  courseTitle: string
  instructorName: string
  completedAt: string
}

export interface ApiCertificate {
  id: string
  courseId: string
  studentId: string
  studentName: string
  courseName: string
  courseNameAr: string | null
  instructorName: string
  credentialId: string
  verificationUrl: string
  issuedAt: string
  grade: number
}

export const certificatesApi = {
  // Student
  list: () =>
    api.get<ApiCertificate[]>("/api/v1/certificates/my"),

  getForCourse: (courseId: string) =>
    api.get<ApiCertificate>(`/api/v1/certificates/courses/${courseId}`),

  earn: (courseId: string) =>
    api.post<ApiCertificate>(`/api/v1/certificates/courses/${courseId}/earn`, {}),

  // Admin
  adminList: (q?: string, page = 0, size = 20) => {
    const p = new URLSearchParams({ page: String(page), size: String(size) })
    if (q) p.set("q", q)
    return api.get<PageResponse<ApiCertificate>>(`/api/v1/admin/certificates?${p}`)
  },

  adminIssue: (studentId: string, courseId: string) =>
    api.post<ApiCertificate>("/api/v1/admin/certificates/issue", { studentId, courseId }),

  adminRevoke: (id: string) =>
    api.delete(`/api/v1/admin/certificates/${id}`),

  adminListPending: (page = 0, size = 20) => {
    const p = new URLSearchParams({ page: String(page), size: String(size) })
    return api.get<PageResponse<ApiPendingCertificate>>(`/api/v1/admin/certificates/pending?${p}`)
  },
}
