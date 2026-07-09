import { api } from "./client"
import type { ApiCourse, PageResponse } from "./courses"

export interface InstructorStudent {
  enrollmentId: string
  studentId: string
  fullName: string
  fullNameAr: string | null
  email: string
  avatarUrl: string | null
  courseId: string
  courseTitle: string
  progressPct: number
  enrolledAt: string
  completedAt: string | null
  lastAccessedAt: string | null
  totalTimeSpentSeconds: number
}

export interface InstructorStudentStats {
  totalEnrolled: number
  activeThisWeek: number
  avgCompletion: number
  newThisMonth: number
  courseBreakdown: { courseId: string; courseTitle: string; count: number }[]
}

export const instructorStudentsApi = {
  list: (params: { q?: string; page?: number; size?: number } = {}) => {
    const p = new URLSearchParams()
    if (params.q) p.set("q", params.q)
    p.set("page", String(params.page ?? 0))
    p.set("size", String(params.size ?? 20))
    return api.get<PageResponse<InstructorStudent>>(`/api/v1/instructor/students?${p}`)
  },

  stats: () =>
    api.get<InstructorStudentStats>("/api/v1/instructor/students/stats"),
}

export interface EnrollmentResponse {
  id: string
  studentId: string
  courseId: string
  enrolledAt: string
  completedAt: string | null
  progressPct: number
  lastAccessedLessonId: string | null
  lastAccessedAt: string | null
  totalTimeSpentSeconds: number
  course?: ApiCourse
}

export interface LessonProgressResponse {
  id: string
  studentId: string
  lessonId: string
  courseId: string
  completed: boolean
  completedAt: string | null
  timeSpentSeconds: number
  videoPositionSeconds: number | null
}

export const enrollmentsApi = {
  enroll: (courseId: string) =>
    api.post<EnrollmentResponse>(`/api/v1/enrollments/courses/${courseId}`, {}),

  myEnrollments: (page = 0, size = 100) =>
    api.get<import("./courses").PageResponse<EnrollmentResponse>>(`/api/v1/enrollments/my?page=${page}&size=${size}`),

  getForCourse: (courseId: string) =>
    api.get<EnrollmentResponse>(`/api/v1/enrollments/courses/${courseId}`),

  markLessonComplete: (lessonId: string, timeSpentSeconds?: number) =>
    api.post<LessonProgressResponse>(`/api/v1/enrollments/lessons/${lessonId}/complete`, {
      timeSpentSeconds: timeSpentSeconds ?? 0,
    }),

  getCourseProgress: (courseId: string) =>
    api.get<LessonProgressResponse[]>(`/api/v1/enrollments/courses/${courseId}/progress`),
}
