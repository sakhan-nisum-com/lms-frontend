import { api } from "./client"

export interface ApiCertificate {
  id: string
  courseId: string
  studentId: string
  courseName: string
  courseNameAr: string | null
  instructorName: string
  credentialId: string
  verificationUrl: string
  issuedAt: string
  grade: number
}

export const certificatesApi = {
  list: () =>
    api.get<ApiCertificate[]>("/api/v1/certificates/my"),

  getForCourse: (courseId: string) =>
    api.get<ApiCertificate>(`/api/v1/certificates/courses/${courseId}`),

  earn: (courseId: string) =>
    api.post<ApiCertificate>(`/api/v1/certificates/courses/${courseId}/earn`, {}),
}
