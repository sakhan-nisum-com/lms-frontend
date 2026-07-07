import { api } from "./client"

export interface AdminDashboardStats {
  totalUsers: number
  totalStudents: number
  totalInstructors: number
  totalAdmins: number
  totalCourses: number
  publishedCourses: number
  pendingCourses: number
  totalEnrollments: number
  totalCertificates: number
  totalRevenue: number
  totalTransactions: number
}

export interface InstructorStats {
  totalCourses: number
  publishedCourses: number
  draftCourses: number
  totalStudents: number
  totalRevenue: number
  averageRating: number
  totalCompletions: number
}

export interface StudentStats {
  enrolledCourses: number
  completedCourses: number
  inProgressCourses: number
  totalLessonsCompleted: number
  totalTimeSpentSeconds: number
  certificatesEarned: number
  averageScore: number
}

export const analyticsApi = {
  adminDashboard: () =>
    api.get<AdminDashboardStats>("/api/v1/analytics/admin/dashboard"),

  instructorDashboard: () =>
    api.get<InstructorStats>("/api/v1/analytics/instructor/dashboard"),

  studentDashboard: () =>
    api.get<StudentStats>("/api/v1/analytics/student/dashboard"),
}
