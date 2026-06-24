export type PlatformRole = "student" | "tutor" | "admin"
export type PlatformUserStatus = "active" | "inactive" | "suspended" | "pending"

export interface PlatformUser {
  id: string
  name: string
  email: string
  avatar: string
  role: PlatformRole
  status: PlatformUserStatus
  department: string
  location: string
  joinedDate: string
  lastActive: string
  coursesEnrolled?: number
  coursesTaught?: number
}

// Unified directory across all roles for admin user management.
// Student/tutor ids line up with STUDENT_DIRECTORY / INSTRUCTORS where the
// person already exists elsewhere in the app.
export const PLATFORM_USERS: PlatformUser[] = [
  { id: "stu-001", name: "Alex Johnson", email: "alex.johnson@techcorp.com", avatar: "AJ", role: "student", status: "active", department: "Engineering", location: "New York, US", joinedDate: "2024-07-01", lastActive: "2026-06-19", coursesEnrolled: 6 },
  { id: "stu-002", name: "Sam Rivera", email: "sam.rivera@techcorp.com", avatar: "SR", role: "student", status: "active", department: "Engineering", location: "Austin, US", joinedDate: "2024-08-12", lastActive: "2026-06-18", coursesEnrolled: 4 },
  { id: "stu-003", name: "Jordan Lee", email: "jordan.lee@techcorp.com", avatar: "JL", role: "student", status: "active", department: "Product", location: "Seattle, US", joinedDate: "2024-09-03", lastActive: "2026-06-17", coursesEnrolled: 3 },
  { id: "stu-004", name: "Taylor Reid", email: "taylor.reid@techcorp.com", avatar: "TR", role: "student", status: "suspended", department: "Design", location: "Denver, US", joinedDate: "2024-05-21", lastActive: "2026-05-02", coursesEnrolled: 2 },
  { id: "stu-005", name: "Morgan Kim", email: "morgan.kim@techcorp.com", avatar: "MK", role: "student", status: "active", department: "Data", location: "Chicago, US", joinedDate: "2025-01-15", lastActive: "2026-06-19", coursesEnrolled: 5 },
  { id: "stu-006", name: "Casey Brooks", email: "casey.brooks@techcorp.com", avatar: "CB", role: "student", status: "pending", department: "Engineering", location: "Remote", joinedDate: "2026-06-10", lastActive: "2026-06-10", coursesEnrolled: 0 },
  { id: "stu-007", name: "Priya Nair", email: "priya.nair@techcorp.com", avatar: "PN", role: "student", status: "active", department: "Security", location: "Bengaluru, IN", joinedDate: "2024-11-08", lastActive: "2026-06-16", coursesEnrolled: 7 },
  { id: "stu-008", name: "Diego Fernandez", email: "diego.fernandez@techcorp.com", avatar: "DF", role: "student", status: "active", department: "Engineering", location: "Madrid, ES", joinedDate: "2025-03-22", lastActive: "2026-06-14", coursesEnrolled: 3 },
  { id: "i1", name: "Sarah Chen", email: "sarah.chen@learnflow.io", avatar: "SC", role: "tutor", status: "active", department: "Engineering", location: "San Francisco, US", joinedDate: "2023-02-10", lastActive: "2026-06-19", coursesTaught: 1 },
  { id: "i2", name: "Marcus Webb", email: "marcus.webb@learnflow.io", avatar: "MW", role: "tutor", status: "active", department: "Engineering", location: "Boston, US", joinedDate: "2023-04-18", lastActive: "2026-06-15", coursesTaught: 1 },
  { id: "i3", name: "Priya Nair", email: "priya.nair@learnflow.io", avatar: "PN", role: "tutor", status: "active", department: "Engineering", location: "Bengaluru, IN", joinedDate: "2022-11-02", lastActive: "2026-06-18", coursesTaught: 1 },
  { id: "i4", name: "Dr. Aisha Patel", email: "aisha.patel@learnflow.io", avatar: "AP", role: "tutor", status: "active", department: "Data Science", location: "London, UK", joinedDate: "2023-06-09", lastActive: "2026-06-12", coursesTaught: 1 },
  { id: "i5", name: "James Okafor", email: "james.okafor@learnflow.io", avatar: "JO", role: "tutor", status: "suspended", department: "Security", location: "Toronto, CA", joinedDate: "2022-08-30", lastActive: "2026-04-28", coursesTaught: 1 },
  { id: "i6", name: "Dr. Elena Vasquez", email: "elena.vasquez@learnflow.io", avatar: "EV", role: "tutor", status: "active", department: "Compliance", location: "Madrid, ES", joinedDate: "2023-01-14", lastActive: "2026-06-09", coursesTaught: 1 },
  { id: "i7", name: "Ryan Park", email: "ryan.park@learnflow.io", avatar: "RP", role: "tutor", status: "pending", department: "Product", location: "Ottawa, CA", joinedDate: "2026-05-29", lastActive: "2026-05-29", coursesTaught: 1 },
  { id: "adm-001", name: "Morgan Patel", email: "morgan.patel@learnflow.io", avatar: "MP", role: "admin", status: "active", department: "Platform Ops", location: "New York, US", joinedDate: "2022-01-05", lastActive: "2026-06-19" },
  { id: "adm-002", name: "Lena Kowalski", email: "lena.kowalski@learnflow.io", avatar: "LK", role: "admin", status: "active", department: "Trust & Safety", location: "Berlin, DE", joinedDate: "2023-03-20", lastActive: "2026-06-18" },
  { id: "adm-003", name: "Owen Brooks", email: "owen.brooks@learnflow.io", avatar: "OB", role: "admin", status: "active", department: "Finance", location: "Remote", joinedDate: "2024-02-11", lastActive: "2026-06-17" },
]
