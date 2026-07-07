import { api } from "./client"
import type { PageResponse } from "./courses"

export interface ApiDiscussionThread {
  id: string
  courseId: string | null
  lessonId: string | null
  trainingId: string | null
  title: string
  titleAr?: string
  body: string
  authorId: string
  authorName: string
  pinned: boolean
  /** @deprecated use pinned */
  isPinned?: boolean
  replyCount: number
  createdAt: string
  // Fields not yet returned by backend — kept for type-compatibility with existing UI
  authorRole?: "STUDENT" | "INSTRUCTOR" | "ADMIN"
  tags?: string[]
  isSolved?: boolean
  viewCount?: number
  lastReplyAt?: string | null
  lastReplyByName?: string | null
}

export interface ApiDiscussionReply {
  id: string
  threadId: string
  authorId: string
  authorName: string
  body: string
  acceptedAnswer: boolean
  createdAt: string
  // Fields not yet returned by backend — kept for type-compatibility with existing UI
  authorRole?: "STUDENT" | "INSTRUCTOR" | "ADMIN"
  isInstructorAnswer?: boolean
  likedByMe?: boolean
  likeCount?: number
}

export interface CreateThreadRequest {
  courseId?: string
  lessonId?: string
  trainingId?: string
  title: string
  body: string
  tags?: string[]
}

export const discussionsApi = {
  list: (courseId?: string, page = 0, size = 20) => {
    const params = new URLSearchParams({ page: String(page), size: String(size) })
    if (courseId) return api.get<PageResponse<ApiDiscussionThread>>(`/api/v1/discussions/course/${courseId}?${params}`)
    return api.get<PageResponse<ApiDiscussionThread>>(`/api/v1/discussions?${params}`)
  },

  listByCourse: (courseId: string, page = 0, size = 20) =>
    api.get<PageResponse<ApiDiscussionThread>>(
      `/api/v1/discussions/course/${courseId}?page=${page}&size=${size}`
    ),

  listByLesson: (lessonId: string, page = 0, size = 50) =>
    api.get<PageResponse<ApiDiscussionThread>>(
      `/api/v1/discussions/lesson/${lessonId}?page=${page}&size=${size}`
    ),

  getById: (id: string) =>
    api.get<ApiDiscussionThread>(`/api/v1/discussions/${id}`),

  create: (req: CreateThreadRequest) =>
    api.post<ApiDiscussionThread>("/api/v1/discussions", req),

  delete: (id: string) =>
    api.delete<void>(`/api/v1/discussions/${id}`),

  pin: (id: string) =>
    api.post<ApiDiscussionThread>(`/api/v1/discussions/${id}/pin`, {}),

  markSolved: (id: string, replyId: string) =>
    api.post<ApiDiscussionThread>(`/api/v1/discussions/${id}/mark-solved`, { replyId }),

  listReplies: (threadId: string) =>
    api.get<ApiDiscussionReply[]>(`/api/v1/discussions/${threadId}/replies`),

  createReply: (threadId: string, body: string) =>
    api.post<ApiDiscussionReply>(`/api/v1/discussions/${threadId}/replies`, { body }),

  likeReply: (replyId: string) =>
    api.post<void>(`/api/v1/discussions/replies/${replyId}/like`, {}),

  deleteReply: (replyId: string) =>
    api.delete<void>(`/api/v1/discussions/replies/${replyId}`),
}
