import { api } from "./client"

// ── Types matching backend responses ──────────────────────────────────────────

export interface ApiCourse {
  id: string
  title: string
  titleAr: string | null
  subtitle?: string | null
  description: string | null
  descriptionAr: string | null
  shortDesc: string | null
  instructorId: string
  category: string | null
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
  language?: string | null
  status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "ARCHIVED" | "REJECTED"
  price: number
  originalPrice?: number | null
  thumbnailUrl: string | null
  rating: number
  reviewCount: number
  studentsCount: number
  totalDurationSeconds?: number | null
  certificateOffered: boolean
  certificate?: boolean | null
  isMandatory: boolean
  isFree?: boolean
  enrollmentType?: string | null
  featured?: boolean
  commentsEnabled?: boolean
  tags: string[]
  sections: ApiSection[]
  createdAt: string
  maxStudents?: number | null
  welcomeMessage?: string | null
  completionMessage?: string | null
  learningObjectives?: string[] | null
  targetAudience?: string[] | null
  requirements?: string[] | null
  couponCode?: string | null
  discountPercent?: number | null
  couponExpiry?: string | null
  rejectionReason?: string | null
  updatedAt?: string | null
}

export interface ApiReview {
  id: string
  courseId: string
  studentId: string
  rating: number
  comment: string | null
  createdAt: string
}

export interface ApiSection {
  id: string
  courseId?: string
  title: string
  titleAr: string | null
  sortOrder: number
  lessons: ApiLesson[]
}

export interface ApiLesson {
  id: string
  sectionId?: string
  title: string
  titleAr: string | null
  type: "VIDEO" | "QUIZ" | "READING" | "ASSIGNMENT" | "LIVE" | "PDF" | "DOWNLOAD"
  durationSeconds: number | null
  videoUrl: string | null
  resourceUrl: string | null
  content: string | null
  contentAr: string | null
  sortOrder: number
  freePreview: boolean
  locked: boolean
  passingScore?: number | null
}

export interface PageResponse<T> {
  data: T[]
  totalElements: number
  totalPages: number
  pageNumber: number
  pageSize: number
  first: boolean
  last: boolean
}

// ── Create/Update DTOs ────────────────────────────────────────────────────────

export interface CreateCourseRequest {
  title: string
  titleAr?: string
  subtitle?: string
  description?: string
  descriptionAr?: string
  shortDesc?: string
  category?: string
  level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL_LEVELS"
  language?: string
  price?: number
  originalPrice?: number
  isFree?: boolean
  enrollmentType?: string
  thumbnailUrl?: string
  certificateOffered?: boolean
  certificate?: boolean
  isMandatory?: boolean
  featured?: boolean
  commentsEnabled?: boolean
  tags?: string[]
  maxStudents?: number
  welcomeMessage?: string
  completionMessage?: string
  learningObjectives?: string[]
  targetAudience?: string[]
  requirements?: string[]
  couponCode?: string
  discountPercent?: number
  couponExpiry?: string
}

export interface CreateSectionRequest {
  title: string
  titleAr?: string
  orderIndex?: number
  sortOrder?: number
}

export interface CreateLessonRequest {
  title: string
  titleAr?: string
  type: "VIDEO" | "QUIZ" | "READING" | "ASSIGNMENT" | "LIVE" | "PDF" | "DOWNLOAD" | "TEXT"
  durationSeconds?: number
  videoUrl?: string
  resourceUrl?: string
  content?: string
  contentAr?: string
  sortOrder?: number
  freePreview?: boolean
  locked?: boolean
  passingScore?: number
}

// ── API calls ─────────────────────────────────────────────────────────────────

export const coursesApi = {
  list: (page = 0, size = 20, q?: string, status?: string) => {
    const params = new URLSearchParams({ page: String(page), size: String(size) })
    if (q) params.set("q", q)
    if (status && status !== "ALL") params.set("status", status)
    return api.get<PageResponse<ApiCourse>>(`/api/v1/courses?${params}`)
  },

  getById: (id: string) =>
    api.get<ApiCourse>(`/api/v1/courses/${id}`),

  getByInstructor: (instructorId: string) =>
    api.get<PageResponse<ApiCourse>>(`/api/v1/courses/instructor/${instructorId}?size=100`),

  create: (req: CreateCourseRequest) =>
    api.post<ApiCourse>("/api/v1/courses", req),

  update: (id: string, req: Partial<CreateCourseRequest>) =>
    api.put<ApiCourse>(`/api/v1/courses/${id}`, req),

  submitForReview: (id: string) =>
    api.post<ApiCourse>(`/api/v1/courses/${id}/submit-review`, {}),

  // Sections
  createSection: (courseId: string, req: CreateSectionRequest) =>
    api.post<ApiSection>(`/api/v1/courses/${courseId}/sections`, req),

  updateSection: (courseId: string, sectionId: string, req: Partial<CreateSectionRequest>) =>
    api.put<ApiSection>(`/api/v1/courses/${courseId}/sections/${sectionId}`, req),

  deleteSection: (courseId: string, sectionId: string) =>
    api.delete(`/api/v1/courses/${courseId}/sections/${sectionId}`),

  // Lessons — URL uses /sections/{sectionId}/lessons (no courseId prefix)
  createLesson: (_courseId: string, sectionId: string, req: CreateLessonRequest) =>
    api.post<ApiLesson>(`/api/v1/courses/sections/${sectionId}/lessons`, req),

  updateLesson: (_courseId: string, _sectionId: string, lessonId: string, req: Partial<CreateLessonRequest>) =>
    api.put<ApiLesson>(`/api/v1/courses/lessons/${lessonId}`, req),

  deleteLesson: (_courseId: string, _sectionId: string, lessonId: string) =>
    api.delete(`/api/v1/courses/lessons/${lessonId}`),

  // Moderation (Admin)
  approve: (id: string) =>
    api.post<ApiCourse>(`/api/v1/courses/${id}/approve`, {}),

  reject: (id: string, reason: string) =>
    api.post<ApiCourse>(`/api/v1/courses/${id}/reject`, { reason }),

  // Reviews
  getReviews: (courseId: string) =>
    api.get<ApiReview[]>(`/api/v1/courses/${courseId}/reviews`),

  submitReview: (courseId: string, rating: number, comment: string) =>
    api.post<ApiReview>(`/api/v1/courses/${courseId}/reviews`, { rating, comment }),

  getMyReview: (courseId: string) =>
    api.get<ApiReview>(`/api/v1/courses/${courseId}/reviews/my`),
}
