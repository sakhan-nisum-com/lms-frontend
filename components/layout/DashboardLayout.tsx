import { Sidebar } from "./Sidebar"
import { Topbar } from "./Topbar"

type Role = "student" | "tutor" | "admin"

interface DashboardLayoutProps {
  children: React.ReactNode
  role: Role
  userName?: string
}

export function DashboardLayout({
  children,
  role,
  userName,
}: DashboardLayoutProps) {
  return (
    <div
      className="flex overflow-hidden"
      style={{ backgroundColor: "var(--bg-canvas)", height: "100vh" }}
    >
      <Sidebar role={role} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar role={role} userName={userName} />
        <main
          className="flex-1 overflow-y-auto p-6"
          style={{ backgroundColor: "var(--bg-canvas)" }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
