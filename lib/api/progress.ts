import { api } from "./client"

export interface LessonProgressItem {
  lessonId: string
  completed: boolean
  completedAt: string | null
  timeSpentSeconds: number
  videoPositionSeconds: number | null
}

export const progressApi = {
  getCourseProgress: (courseId: string) =>
    api.get<LessonProgressItem[]>(`/api/v1/enrollments/courses/${courseId}/progress`),

  markLesson: (lessonId: string, completed: boolean) =>
    api.post<LessonProgressItem>(`/api/v1/enrollments/lessons/${lessonId}/complete`, { completed }),
}
