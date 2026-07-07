import { api } from "./client"

export interface ApiNote {
  id: string
  lessonId: string
  content: string
  updatedAt: string
}

export const notesApi = {
  getByLesson: (lessonId: string) =>
    api.get<ApiNote | null>(`/api/v1/notes/lesson/${lessonId}`),

  upsert: (lessonId: string, content: string) =>
    api.put<ApiNote>(`/api/v1/notes/lesson/${lessonId}`, { content }),

  delete: (lessonId: string) =>
    api.delete<void>(`/api/v1/notes/lesson/${lessonId}`),
}
