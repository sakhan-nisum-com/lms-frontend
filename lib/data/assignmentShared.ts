export type SubmissionFormat = "text" | "file" | "mcq"

export interface AssignmentMCQQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
}
