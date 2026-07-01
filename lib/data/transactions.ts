export type TransactionStatus = "completed" | "refunded" | "pending" | "failed"
export type PaymentMethod = "card" | "paypal" | "invoice" | "wire"

export interface Transaction {
  id: string
  userId: string
  userName: string
  courseId: string
  courseName: string
  amount: number
  status: TransactionStatus
  method: PaymentMethod
  date: string
}

export const TRANSACTIONS: Transaction[] = [
  { id: "txn-1001", userId: "stu-001", userName: "Alex Johnson", courseId: "c1", courseName: "React & Next.js Masterclass", amount: 89, status: "completed", method: "card", date: "2026-06-18" },
  { id: "txn-1002", userId: "stu-002", userName: "Sam Rivera", courseId: "c2", courseName: "TypeScript Fundamentals", amount: 59, status: "completed", method: "card", date: "2026-06-17" },
  { id: "txn-1003", userId: "stu-005", userName: "Morgan Kim", courseId: "c4", courseName: "Machine Learning Foundations", amount: 129, status: "completed", method: "paypal", date: "2026-06-17" },
  { id: "txn-1004", userId: "stu-007", userName: "Priya Nair", courseId: "c5", courseName: "Cybersecurity Fundamentals", amount: 99, status: "refunded", method: "card", date: "2026-06-16" },
  { id: "txn-1005", userId: "stu-008", userName: "Diego Fernandez", courseId: "c3", courseName: "System Design Deep Dive", amount: 149, status: "completed", method: "card", date: "2026-06-15" },
  { id: "txn-1006", userId: "stu-003", userName: "Jordan Lee", courseId: "c7", courseName: "Product Strategy & Roadmapping", amount: 79, status: "pending", method: "invoice", date: "2026-06-15" },
  { id: "txn-1007", userId: "stu-004", userName: "Taylor Reid", courseId: "c9", courseName: "UX Research Fundamentals", amount: 69, status: "failed", method: "card", date: "2026-06-14" },
  { id: "txn-1008", userId: "stu-001", userName: "Alex Johnson", courseId: "c10", courseName: "AWS Cloud Architecture", amount: 119, status: "completed", method: "card", date: "2026-06-13" },
  { id: "txn-1009", userId: "stu-006", userName: "Casey Brooks", courseId: "c11", courseName: "Data Analysis with Python & SQL", amount: 0, status: "completed", method: "card", date: "2026-06-12" },
  { id: "txn-1010", userId: "stu-002", userName: "Sam Rivera", courseId: "c8", courseName: "Leadership Communication Skills", amount: 49, status: "completed", method: "paypal", date: "2026-06-11" },
  { id: "txn-1011", userId: "stu-005", userName: "Morgan Kim", courseId: "c6", courseName: "Data Privacy & GDPR", amount: 0, status: "completed", method: "card", date: "2026-06-10" },
  { id: "txn-1012", userId: "stu-007", userName: "Priya Nair", courseId: "c12", courseName: "Diversity, Equity & Inclusion", amount: 0, status: "completed", method: "card", date: "2026-06-09" },
  { id: "txn-1013", userId: "stu-008", userName: "Diego Fernandez", courseId: "c1", courseName: "React & Next.js Masterclass", amount: 89, status: "completed", method: "wire", date: "2026-06-08" },
  { id: "txn-1014", userId: "stu-003", userName: "Jordan Lee", courseId: "c2", courseName: "TypeScript Fundamentals", amount: 59, status: "refunded", method: "card", date: "2026-06-06" },
  { id: "txn-1015", userId: "stu-004", userName: "Taylor Reid", courseId: "c4", courseName: "Machine Learning Foundations", amount: 129, status: "completed", method: "card", date: "2026-06-04" },
]
