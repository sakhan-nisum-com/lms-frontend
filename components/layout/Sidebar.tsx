"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  BookOpen,
  Compass,
  Map,
  ClipboardList,
  Brain,
  BarChart3,
  Award,
  MessageSquare,
  Users,
  Calendar,
  UserCircle,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from "lucide-react"
import { useState } from "react"

type Role = "student" | "tutor"

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: string
  badgeColor?: string
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const studentGroups: NavGroup[] = [
  {
    label: "OVERVIEW",
    items: [
      { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "MY LEARNING",
    items: [
      { label: "My Courses", href: "/student/courses", icon: BookOpen },
      { label: "Learning Paths", href: "/student/learning-paths", icon: Map },
      { label: "Explore Catalog", href: "/student/explore", icon: Compass },
    ],
  },
  {
    label: "ASSESSMENTS",
    items: [
      { label: "Assignments", href: "/student/assignments", icon: ClipboardList, badge: "3", badgeColor: "#F59E0B" },
      { label: "Quizzes & Exams", href: "/student/quizzes", icon: Brain, badge: "1", badgeColor: "#8B5CF6" },
    ],
  },
  {
    label: "GROWTH",
    items: [
      { label: "Progress & Analytics", href: "/student/progress", icon: BarChart3 },
      { label: "Certificates", href: "/student/certificates", icon: Award },
    ],
  },
  {
    label: "COMMUNITY",
    items: [
      { label: "Discussions", href: "/student/discussions", icon: MessageSquare },
      { label: "Study Groups", href: "/student/study-groups", icon: Users },
    ],
  },
  {
    label: "PLANNING",
    items: [
      { label: "Schedule", href: "/student/schedule", icon: Calendar },
    ],
  },
  {
    label: "ACCOUNT",
    items: [
      { label: "Profile", href: "/student/profile", icon: UserCircle },
      { label: "Settings", href: "/student/settings", icon: Settings },
    ],
  },
]

const tutorGroups: NavGroup[] = [
  {
    label: "OVERVIEW",
    items: [
      { label: "Dashboard", href: "/tutor/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "TEACHING",
    items: [
      { label: "My Courses", href: "/tutor/courses", icon: BookOpen },
      { label: "Students", href: "/tutor/students", icon: Users },
    ],
  },
  {
    label: "INSIGHTS",
    items: [
      { label: "Analytics", href: "/tutor/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "ACCOUNT",
    items: [
      { label: "Settings", href: "/tutor/settings", icon: Settings },
    ],
  },
]

interface SidebarProps {
  role: Role
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const groups = role === "student" ? studentGroups : tutorGroups

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
        className="flex items-center gap-3 px-4 py-5 flex-shrink-0"
        style={{ borderBottom: "1px solid #334155" }}
      >
        <div
          className="flex items-center justify-center rounded-lg flex-shrink-0"
          style={{ width: 36, height: 36, backgroundColor: "#3B82F6" }}
        >
          <GraduationCap size={20} color="#fff" />
        </div>
        {!collapsed && (
          <span className="font-bold text-lg tracking-tight text-white">LearnFlow</span>
        )}
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className="px-4 pt-4 pb-2 flex-shrink-0">
          <span
            className="text-xs font-semibold uppercase tracking-widest px-2 py-1 rounded"
            style={{ color: "#3B82F6", backgroundColor: "#1D4ED820" }}
          >
            {role === "student" ? "Student" : "Instructor"}
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-1" style={{ scrollbarWidth: "none" }}>
        {groups.map((group) => (
          <div key={group.label} className="mb-1">
            {/* Group label */}
            {!collapsed && (
              <div
                className="px-3 pt-4 pb-1.5 text-xs font-semibold tracking-widest"
                style={{ color: "#475569" }}
              >
                {group.label}
              </div>
            )}
            {collapsed && <div className="pt-3" />}

            {group.items.map(({ label, href, icon: Icon, badge, badgeColor }) => {
              const active = pathname === href || pathname.startsWith(href + "/")
              return (
                <Link
                  key={href}
                  href={href}
                  title={collapsed ? label : undefined}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150"
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
                    size={17}
                    style={{ flexShrink: 0, color: active ? "#3B82F6" : "inherit" }}
                  />
                  {!collapsed && (
                    <>
                      <span className="flex-1">{label}</span>
                      {badge && (
                        <span
                          className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                          style={{ backgroundColor: `${badgeColor}22`, color: badgeColor, fontSize: 11 }}
                        >
                          {badge}
                        </span>
                      )}
                      {active && !badge && (
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: "#3B82F6" }}
                        />
                      )}
                    </>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-2 py-3 flex-shrink-0" style={{ borderTop: "1px solid #334155" }}>
        <button
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium w-full transition-colors duration-150"
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
          <LogOut size={17} style={{ flexShrink: 0 }} />
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
