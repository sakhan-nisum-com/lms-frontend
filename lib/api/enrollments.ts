import { api } from "./client"
import type { ApiCourse } from "./courses"

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
