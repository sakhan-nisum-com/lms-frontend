"use client"

import { useState } from "react"
import { Bell, Menu, Search } from "lucide-react"
import { InstructorSidebar } from "./SideBar"

interface InstructorPageShellProps {
  title: string
  action?: React.ReactNode
  user?: { name: string; email: string }
  children: React.ReactNode
}

export function InstructorPageShell({
  title,
  action,
  user,
  children,
}: InstructorPageShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#0F172A", color: "#F8FAFC" }}>
      <InstructorSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="flex items-center gap-4 px-5 py-4 sticky top-0 z-30"
          style={{ backgroundColor: "#0F172A", borderBottom: "1px solid #1E293B" }}
        >
          <button
            className="lg:hidden p-1.5 rounded-lg hover:bg-white/5"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={18} style={{ color: "#94A3B8" }} />
          </button>

          <h1 className="text-base font-semibold text-white flex-1">{title}</h1>

          <div
            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
          >
            <Search size={14} style={{ color: "#475569" }} />
            <input
              placeholder="Search..."
              className="bg-transparent outline-none text-sm w-44 placeholder-slate-600"
              style={{ color: "#F8FAFC" }}
            />
          </div>

          <button
            className="relative p-2 rounded-xl transition-colors hover:bg-white/5"
            style={{ color: "#94A3B8" }}
          >
            <Bell size={17} />
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
              style={{ backgroundColor: "#3B82F6" }}
            />
          </button>

          {action}
        </header>

        <main className="flex-1 overflow-y-auto p-5">
          {children}
        </main>
      </div>
    </div>
  )
}
