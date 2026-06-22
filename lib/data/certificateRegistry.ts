export type CertificateState = "valid" | "expiring-soon" | "expired" | "revoked"

export interface RegistryCertificate {
  id: string
  studentId: string
  studentName: string
  courseName: string
  category: string
  credentialId: string
  issuedDate: string
  expiryDate: string | null
  grade: number
  state: CertificateState
}

export const CERTIFICATE_REGISTRY: RegistryCertificate[] = [
  { id: "cert1", studentId: "stu-001", studentName: "Alex Johnson", courseName: "Cybersecurity Fundamentals", category: "Security", credentialId: "LF-SEC-2025-A4X9B1", issuedDate: "2025-03-01", expiryDate: "2027-03-01", grade: 96, state: "valid" },
  { id: "cert2", studentId: "stu-001", studentName: "Alex Johnson", courseName: "Diversity, Equity & Inclusion", category: "Compliance", credentialId: "LF-DEI-2024-H7M2C8", issuedDate: "2024-09-15", expiryDate: null, grade: 100, state: "valid" },
  { id: "cert3", studentId: "stu-001", studentName: "Alex Johnson", courseName: "React Foundations (Module 1)", category: "Engineering", credentialId: "LF-REACT-2025-R3N8K5", issuedDate: "2025-01-10", expiryDate: null, grade: 87, state: "valid" },
  { id: "cert4", studentId: "stu-002", studentName: "Sam Rivera", courseName: "Information Security Awareness", category: "Compliance", credentialId: "LF-ISA-2025-K2P7Q1", issuedDate: "2025-06-20", expiryDate: "2026-06-20", grade: 91, state: "expiring-soon" },
  { id: "cert5", studentId: "stu-003", studentName: "Jordan Lee", courseName: "Data Privacy & GDPR", category: "Compliance", credentialId: "LF-GDPR-2024-T9Y3V5", issuedDate: "2024-07-15", expiryDate: "2025-07-15", grade: 84, state: "expired" },
  { id: "cert6", studentId: "stu-005", studentName: "Morgan Kim", courseName: "AWS Cloud Architecture", category: "Engineering", credentialId: "LF-AWS-2025-N4D8F2", issuedDate: "2025-04-02", expiryDate: null, grade: 93, state: "valid" },
  { id: "cert7", studentId: "stu-007", studentName: "Priya Nair", courseName: "Anti-Harassment & Workplace Ethics", category: "Compliance", credentialId: "LF-AHE-2025-W6E1R7", issuedDate: "2025-08-10", expiryDate: "2026-08-10", grade: 100, state: "expiring-soon" },
  { id: "cert8", studentId: "stu-008", studentName: "Diego Fernandez", courseName: "Machine Learning Foundations", category: "Data Science", credentialId: "LF-ML-2025-C5B9X3", issuedDate: "2025-02-18", expiryDate: null, grade: 89, state: "revoked" },
]
