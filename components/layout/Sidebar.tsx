"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  LayoutDashboard,
  GraduationCap,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Layers,
} from "lucide-react"
import { useState } from "react"

type Role = "student" | "tutor"

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

const studentNav: NavItem[] = [
  { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
  { label: "My Courses", href: "/student/courses", icon: BookOpen },
  { label: "Explore", href: "/student/explore", icon: Layers },
  { label: "Progress", href: "/student/progress", icon: BarChart3 },
  { label: "Settings", href: "/student/settings", icon: Settings },
]

const tutorNav: NavItem[] = [
  { label: "Dashboard", href: "/tutor/dashboard", icon: LayoutDashboard },
  { label: "My Courses", href: "/tutor/courses", icon: BookOpen },
  { label: "Students", href: "/tutor/students", icon: Users },
  { label: "Analytics", href: "/tutor/analytics", icon: BarChart3 },
  { label: "Settings", href: "/tutor/settings", icon: Settings },
]

interface SidebarProps {
  role: Role
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const nav = role === "student" ? studentNav : tutorNav

  return (
    <aside
      className="relative flex flex-col h-full transition-all duration-300 ease-in-out"
      style={{
        width: collapsed ? "72px" : "240px",
        backgroundColor: "#1E293B",
        borderRight: "1px solid #334155",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 py-5"
        style={{ borderBottom: "1px solid #334155" }}
      >
        <div
          className="flex items-center justify-center rounded-lg flex-shrink-0"
          style={{ width: 36, height: 36, backgroundColor: "#3B82F6" }}
        >
          <GraduationCap size={20} color="#fff" />
        </div>
        {!collapsed && (
          <span className="font-bold text-lg tracking-tight text-white">
            LearnFlow
          </span>
        )}
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className="px-4 pt-4 pb-2">
          <span
            className="text-xs font-semibold uppercase tracking-widest px-2 py-1 rounded"
            style={{ color: "#3B82F6", backgroundColor: "#1D4ED820" }}
          >
            {role === "student" ? "Student" : "Instructor"}
          </span>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 group"
              style={{
                backgroundColor: active ? "#3B82F620" : "transparent",
                color: active ? "#60A5FA" : "#94A3B8",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = "#334155"
                  e.currentTarget.style.color = "#F8FAFC"
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = "transparent"
                  e.currentTarget.style.color = "#94A3B8"
                }
              }}
            >
              <Icon
                size={18}
                style={{ flexShrink: 0, color: active ? "#3B82F6" : "inherit" }}
              />
              {!collapsed && <span>{label}</span>}
              {active && !collapsed && (
                <span
                  className="ml-auto w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: "#3B82F6" }}
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-2 py-3" style={{ borderTop: "1px solid #334155" }}>
        <button
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium w-full transition-colors duration-150"
          style={{ color: "#94A3B8" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#EF444420"
            e.currentTarget.style.color = "#F87171"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent"
            e.currentTarget.style.color = "#94A3B8"
          }}
        >
          <LogOut size={18} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 flex items-center justify-center w-6 h-6 rounded-full border transition-colors duration-150"
        style={{
          backgroundColor: "#1E293B",
          borderColor: "#334155",
          color: "#94A3B8",
          zIndex: 10,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#3B82F6"
          e.currentTarget.style.color = "#fff"
          e.currentTarget.style.borderColor = "#3B82F6"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#1E293B"
          e.currentTarget.style.color = "#94A3B8"
          e.currentTarget.style.borderColor = "#334155"
        }}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  )
}
