"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, BookOpen, Compass, Map,
  BarChart3, Award, MessageSquare, Users, Calendar, UserCircle,
  Settings, LogOut, ChevronLeft, ChevronRight, GraduationCap,
  Radio, Video, Wrench, GraduationCap as Training, CalendarCheck, PackageOpen,
  UserCog, Megaphone, ShieldAlert, DollarSign,
} from "lucide-react"
import { useState } from "react"

type Role = "student" | "tutor" | "admin"

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: string
  badgeColor?: string
  liveIndicator?: boolean
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
      { label: "My Learning", href: "/student/my-learning", icon: LayoutDashboard },
      { label: "My Courses", href: "/student/courses", icon: BookOpen },
      { label: "My Trainings", href: "/student/my-trainings", icon: Training },
      { label: "Learning Paths", href: "/student/learning-paths", icon: Map },
      { label: "Explore Catalog", href: "/student/explore", icon: Compass },
      { label: "SCORM Courses", href: "/student/scorm", icon: PackageOpen },
    ],
  },
  {
    label: "LIVE & CONTENT",
    items: [
      { label: "Live Classes", href: "/student/live", icon: Radio, badge: "LIVE", badgeColor: "#EF4444", liveIndicator: true },
      { label: "Trainings", href: "/student/trainings", icon: Training },
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
      { label: "Study Groups", href: "/tutor/study-groups", icon: Users },
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

const adminGroups: NavGroup[] = [
  {
    label: "OVERVIEW",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "PEOPLE",
    items: [
      { label: "Users", href: "/admin/users", icon: UserCog },
    ],
  },
  {
    label: "CONTENT",
    items: [
      { label: "Courses", href: "/admin/courses", icon: BookOpen },
      { label: "Trainings", href: "/admin/trainings", icon: Training },
    ],
  },
  {
    label: "COMMUNITY",
    items: [
      { label: "Discussions", href: "/admin/discussions", icon: MessageSquare },
      { label: "Study Groups", href: "/admin/study-groups", icon: Users },
    ],
  },
  {
    label: "FINANCE",
    items: [
      { label: "Payments", href: "/admin/transactions", icon: DollarSign },
      { label: "Certificates", href: "/admin/certificates", icon: Award },
    ],
  },
  {
    label: "COMMUNICATION",
    items: [
      { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
    ],
  },
  {
    label: "INSIGHTS",
    items: [
      { label: "Reports", href: "/admin/reports", icon: BarChart3 },
      { label: "Audit Log", href: "/admin/audit-log", icon: ShieldAlert },
    ],
  },
  {
    label: "ACCOUNT",
    items: [
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
]

interface SidebarProps {
  role: Role
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const groups = role === "student" ? studentGroups : role === "tutor" ? tutorGroups : adminGroups

  return (
    <aside
      className="relative flex flex-col h-full transition-all duration-300 ease-in-out"
      style={{
        width: collapsed ? "64px" : "240px",
        backgroundColor: "#1E293B",
        borderRight: "1px solid #334155",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-3 px-4 py-5 flex-shrink-0"
        style={{ borderBottom: "1px solid #334155" }}
      >
        <div
          className="flex items-center justify-center rounded-lg flex-shrink-0"
          style={{ width: 34, height: 34, backgroundColor: "#3B82F6" }}
        >
          <GraduationCap size={18} color="#fff" />
        </div>
        {!collapsed && (
          <span className="font-bold text-base tracking-tight text-white">LearnFlow</span>
        )}
      </Link>

      {/* Role badge */}
      {!collapsed && (
        <div className="px-4 pt-3 pb-1 flex-shrink-0">
          <span
            className="text-xs font-semibold uppercase tracking-widest px-2 py-0.5 rounded"
            style={{ color: "#3B82F6", backgroundColor: "#1D4ED815" }}
          >
            {role === "student" ? "Student" : role === "tutor" ? "Instructor" : "Admin"}
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-1" style={{ scrollbarWidth: "none" }}>
        {groups.map((group) => (
          <div key={group.label} className="mb-0.5">
            {!collapsed && (
              <div
                className="px-3 pt-3.5 pb-1 text-xs font-bold tracking-widest"
                style={{ color: "#3F5068", letterSpacing: "0.09em" }}
              >
                {group.label}
              </div>
            )}
            {collapsed && <div className="pt-2.5" />}

            {group.items.map(({ label, href, icon: Icon, badge, badgeColor, liveIndicator }) => {
              const active = pathname === href || pathname.startsWith(href + "/")
              return (
                <Link
                  key={href}
                  href={href}
                  title={collapsed ? label : undefined}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-150 relative"
                  style={{
                    backgroundColor: active ? "#3B82F618" : "transparent",
                    color: active ? "#60A5FA" : "#94A3B8",
                    marginBottom: 1,
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
                  {/* Active left bar */}
                  {active && (
                    <span
                      className="absolute left-0 top-1 bottom-1 w-0.5 rounded-r"
                      style={{ backgroundColor: "#3B82F6" }}
                    />
                  )}

                  <div className="relative flex-shrink-0">
                    <Icon size={16} style={{ color: active ? "#3B82F6" : "inherit" }} />
                    {liveIndicator && !collapsed && (
                      <span
                        className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: "#EF4444", boxShadow: "0 0 0 2px #1E293B" }}
                      />
                    )}
                  </div>

                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate">{label}</span>
                      {badge && (
                        <span
                          className="text-xs font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: liveIndicator ? "#EF444422" : `${badgeColor}22`,
                            color: badgeColor,
                            fontSize: liveIndicator ? 9 : 10,
                            letterSpacing: liveIndicator ? "0.04em" : 0,
                          }}
                        >
                          {badge}
                        </span>
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
        <Link
          href="/login"
          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium w-full transition-colors duration-150"
          style={{ color: "#94A3B8" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#EF444418"
            e.currentTarget.style.color = "#F87171"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent"
            e.currentTarget.style.color = "#94A3B8"
          }}
        >
          <LogOut size={16} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Log out</span>}
        </Link>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[72px] flex items-center justify-center w-6 h-6 rounded-full border transition-all duration-150 z-10"
        style={{ backgroundColor: "#1E293B", borderColor: "#334155", color: "#64748B" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#3B82F6"
          e.currentTarget.style.color = "#fff"
          e.currentTarget.style.borderColor = "#3B82F6"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#1E293B"
          e.currentTarget.style.color = "#64748B"
          e.currentTarget.style.borderColor = "#334155"
        }}
      >
        {collapsed ? <ChevronRight size={11} /> : <ChevronLeft size={11} />}
      </button>
    </aside>
  )
}
