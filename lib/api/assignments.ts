import { api } from "./client"

export interface ApiAssignment {
  id: string
  courseId: string
  lessonId: string | null
  title: string
  description: string
  dueDate: string | null
  maxScore: number
  submissionType: "TEXT" | "FILE" | "BOTH"
  allowLateSubmission: boolean
}

export interface ApiSubmission {
  id: string
  assignmentId: string
  studentId: string
  studentName: string
  textContent: string | null
  fileUrl: string | null
  submittedAt: string
  grade: number | null
  feedback: string | null
  status: "SUBMITTED" | "GRADED" | "LATE"
  isLate: boolean
}

export interface SubmitAssignmentRequest {
  textContent?: string
  fileUrl?: string
}

export interface GradeSubmissionRequest {
  grade: number
  feedback?: string
}

export const assignmentsApi = {
  getByCourse: (courseId: string) =>
    api.get<ApiAssignment[]>(`/api/v1/assignments/course/${courseId}`),

  getByLesson: (lessonId: string) =>
    api.get<ApiAssignment[]>(`/api/v1/assignments/lesson/${lessonId}`),

  getById: (id: string) =>
    api.get<ApiAssignment>(`/api/v1/assignments/${id}`),

  submit: (assignmentId: string, req: SubmitAssignmentRequest) =>
    api.post<ApiSubmission>(`/api/v1/assignments/${assignmentId}/submit`, req),

  getMySubmission: (assignmentId: string) =>
    api.get<ApiSubmission>(`/api/v1/assignments/${assignmentId}/submission/my`),

  // Instructor endpoints
  listSubmissions: (assignmentId: string) =>
    api.get<ApiSubmission[]>(`/api/v1/assignments/${assignmentId}/submissions`),

  grade: (submissionId: string, req: GradeSubmissionRequest) =>
    api.post<ApiSubmission>(`/api/v1/assignments/submissions/${submissionId}/grade`, req),
}
