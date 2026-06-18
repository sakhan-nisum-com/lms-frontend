import { Sidebar } from "./Sidebar"
import { Topbar } from "./Topbar"

type Role = "student" | "tutor"

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
      style={{ backgroundColor: "#0F172A", height: "calc(100vh - var(--app-header-height, 150px))" }}
    >
      <Sidebar role={role} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar role={role} userName={userName} />
        <main
          className="flex-1 overflow-y-auto p-6"
          style={{ backgroundColor: "#0F172A" }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
