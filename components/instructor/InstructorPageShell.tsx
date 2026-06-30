"use client"

import { useState } from "react"
import { Bell, Menu, Search } from "lucide-react"
import { InstructorSidebar } from "./SideBar"
import { ThemeToggle } from "@/components/ThemeToggle"

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
    <div
      className="flex overflow-hidden"
      style={{ backgroundColor: "var(--bg-canvas)", color: "var(--text-primary)", height: "calc(100vh - var(--app-header-height, 150px))" }}
    >
      <InstructorSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="flex items-center gap-4 px-5 py-4 z-30"
          style={{ backgroundColor: "var(--bg-surface)", borderBottom: "1px solid var(--border-default)" }}
        >
          <button
            className="lg:hidden p-1.5 rounded-lg hover:bg-black/5"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={18} style={{ color: "var(--text-secondary)" }} />
          </button>

          <h1 className="text-base font-semibold flex-1" style={{ color: "var(--text-primary)" }}>{title}</h1>

          <div
            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)" }}
          >
            <Search size={14} style={{ color: "var(--text-muted)" }} />
            <input
              placeholder="Search..."
              className="bg-transparent outline-none text-sm w-44"
              style={{ color: "var(--text-primary)" }}
            />
          </div>

          <ThemeToggle />

          <button
            className="relative p-2 rounded-xl transition-colors hover:bg-black/5"
            style={{ color: "var(--text-secondary)" }}
          >
            <Bell size={17} />
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
              style={{ backgroundColor: "var(--accent)" }}
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
