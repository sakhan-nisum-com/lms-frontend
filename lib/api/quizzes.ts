import { api } from "./client"

export type QuestionType = "MCQ" | "MULTI_SELECT" | "TRUE_FALSE" | "SHORT_ANSWER" | "ESSAY"

export interface QuizOption {
  text: string
  textAr?: string
}

export interface ApiQuizQuestion {
  id?: string
  type: QuestionType
  questionText: string
  questionTextAr?: string
  explanation?: string
  sortOrder?: number
  points?: number
  options?: QuizOption[]
  correctIndex?: number
  correctIndices?: number[]
  acceptedAnswers?: string[]
}

export interface ApiQuiz {
  id: string
  courseId: string | null
  lessonId: string | null
  passingScore: number
  timeLimitMinutes: number | null
  randomizeQuestions: boolean
  maxAttempts: number | null
  isMandatory: boolean
  questions: ApiQuizQuestion[]
}

export interface CreateQuizRequest {
  courseId?: string
  lessonId?: string
  trainingId?: string
  title?: string
  passingScore?: number
  timeLimitMinutes?: number
  randomizeQuestions?: boolean
  maxAttempts?: number
  isMandatory?: boolean
  questions?: ApiQuizQuestion[]
}

export interface AnswerSubmission {
  questionId: string
  selectedIndex?: number
  selectedIndices?: number[]
  textAnswer?: string
}

export interface QuizAttemptResponse {
  id: string
  quizId: string
  score: number
  maxScore: number
  passed: boolean
  submittedAt: string
  timeSpentSeconds: number
}

export const quizzesApi = {
  getById: (quizId: string) =>
    api.get<ApiQuiz>(`/api/v1/quizzes/${quizId}`),

  getByLesson: (lessonId: string) =>
    api.get<ApiQuiz[]>(`/api/v1/quizzes/lesson/${lessonId}`),

  getByCourse: (courseId: string) =>
    api.get<ApiQuiz[]>(`/api/v1/quizzes/course/${courseId}`),

  create: (req: CreateQuizRequest) =>
    api.post<ApiQuiz>("/api/v1/quizzes", req),

  update: (quizId: string, req: Partial<CreateQuizRequest>) =>
    api.put<ApiQuiz>(`/api/v1/quizzes/${quizId}`, req),

  submit: (quizId: string, answers: AnswerSubmission[]) =>
    api.post<QuizAttemptResponse>(`/api/v1/quizzes/submit`, { quizId, answers }),

  getAttempts: (quizId: string) =>
    api.get<QuizAttemptResponse[]>(`/api/v1/quizzes/${quizId}/attempts`),
}
