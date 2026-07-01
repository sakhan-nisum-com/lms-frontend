export interface DirectoryStudent {
  id: string
  name: string
  email: string
  avatar: string
}

// Mock directory of learners an instructor can add to a study group.
// stu-001 matches STUDENT_PROFILE in courses.ts (the signed-in student).
export const STUDENT_DIRECTORY: DirectoryStudent[] = [
  { id: "stu-001", name: "Alex Johnson", email: "alex.johnson@techcorp.com", avatar: "AJ" },
  { id: "stu-002", name: "Sam Rivera", email: "sam.rivera@techcorp.com", avatar: "SR" },
  { id: "stu-003", name: "Jordan Lee", email: "jordan.lee@techcorp.com", avatar: "JL" },
  { id: "stu-004", name: "Taylor Reid", email: "taylor.reid@techcorp.com", avatar: "TR" },
  { id: "stu-005", name: "Morgan Kim", email: "morgan.kim@techcorp.com", avatar: "MK" },
  { id: "stu-006", name: "Casey Brooks", email: "casey.brooks@techcorp.com", avatar: "CB" },
  { id: "stu-007", name: "Priya Nair", email: "priya.nair@techcorp.com", avatar: "PN" },
  { id: "stu-008", name: "Diego Fernandez", email: "diego.fernandez@techcorp.com", avatar: "DF" },
]
