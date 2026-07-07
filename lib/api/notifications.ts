import { api } from "./client"
import type { PageResponse } from "./courses"

export interface ApiNotification {
  id: string
  recipientId: string
  title: string
  titleAr: string | null
  body: string
  bodyAr: string | null
  type: string
  referenceId: string | null
  readAt: string | null
  actionUrl: string | null
  createdAt: string
}

export const notificationsApi = {
  list: (page = 0) =>
    api.get<PageResponse<ApiNotification>>(`/api/v1/notifications?page=${page}`),

  unreadCount: () =>
    api.get<number>("/api/v1/notifications/unread-count"),

  markAllRead: () =>
    api.post<void>("/api/v1/notifications/mark-all-read", {}),
}
