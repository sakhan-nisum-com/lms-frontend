"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  DollarSign,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Target,
} from "lucide-react"

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

const instructorNav: NavItem[] = [
  { label: "Dashboard",   href: "/instructor/dashboard",  icon: LayoutDashboard },
  { label: "My Courses",  href: "/instructor/courses",    icon: BookOpen },
  { label: "Trainings",   href: "/instructor/trainings",  icon: Target },
  { label: "Students",    href: "/instructor/students",   icon: Users },
  { label: "Analytics",   href: "/instructor/analytics",  icon: BarChart3 },
  { label: "Revenue",     href: "/instructor/revenue",    icon: DollarSign },
  { label: "Settings",    href: "/instructor/settings",   icon: Settings },
]

export interface InstructorSidebarProps {
  /** Mobile drawer open state */
  isOpen: boolean
  /** Called when the mobile close button or backdrop is pressed */
  onClose: () => void
  user?: {
    name: string
    email: string
  }
}

export function InstructorSidebar({
  isOpen,
  onClose,
  user = { name: "Jane Smith", email: "jane@example.com" },
}: InstructorSidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ backgroundColor: "#0F172Acc", top: "var(--app-header-height, 150px)" }}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={[
          "fixed left-0 z-50 flex flex-col transition-all duration-300 ease-in-out",
          "lg:static lg:z-auto lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        style={{
          width: collapsed ? 72 : 240,
          backgroundColor: "var(--sidebar-bg)",
          borderRight: "1px solid var(--sidebar-border)",
          flexShrink: 0,
          top: "var(--app-header-height, 150px)",
          height: "calc(100vh - var(--app-header-height, 150px))",
        }}
      >
        {/* Logo row */}
        <div
          className="flex items-center gap-3 px-4 py-5"
          style={{ borderBottom: "1px solid var(--sidebar-border)" }}
        >
          <Link
            href="/"
            className="flex items-center gap-3 min-w-0"
            title="LearnFlow"
          >
            <div
              className="flex items-center justify-center rounded-lg flex-shrink-0"
              style={{ width: 36, height: 36, backgroundColor: "var(--sidebar-accent)" }}
            >
              <GraduationCap size={20} color="#fff" />
            </div>
            {!collapsed && (
              <span className="font-bold text-base tracking-tight text-white truncate">
                LearnFlow
              </span>
            )}
          </Link>

          {/* Mobile close button — only visible when drawer is open */}
          {!collapsed && (
            <button
              onClick={onClose}
              className="ml-auto lg:hidden p-1 rounded-lg transition-colors hover:bg-white/10"
              aria-label="Close sidebar"
            >
              <X size={15} style={{ color: "var(--sidebar-text)" }} />
            </button>
          )}
        </div>

        {/* Role badge */}
        {!collapsed && (
          <div className="px-4 pt-3 pb-2">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: "#3B82F615",
                color: "#60A5FA",
                border: "1px solid #3B82F630",
              }}
            >
              <BookOpen size={10} />
              Instructor
            </span>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {instructorNav.map(({ label, href, icon: Icon }) => {
            const active =
              pathname === href || pathname.startsWith(href + "/")
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150"
                style={{
                  backgroundColor: active ? "#3B82F620" : "transparent",
                  color: active ? "#60A5FA" : "var(--sidebar-text)",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = "var(--sidebar-bg-hover)"
                    e.currentTarget.style.color = "var(--sidebar-text-hover)"
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = "transparent"
                    e.currentTarget.style.color = "var(--sidebar-text)"
                  }
                }}
              >
                <Icon
                  size={17}
                  style={{ flexShrink: 0, color: active ? "var(--sidebar-accent)" : "inherit" }}
                />
                {!collapsed && <span>{label}</span>}
                {active && !collapsed && (
                  <span
                    className="ml-auto w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: "var(--sidebar-accent)" }}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* User + logout */}
        <div className="px-2 py-3 space-y-1" style={{ borderTop: "1px solid var(--sidebar-border)" }}>
          {/* User pill */}
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
            style={{ backgroundColor: "var(--sidebar-bg-active)" }}
          >
            <div
              className="flex items-center justify-center rounded-full text-xs font-bold text-white flex-shrink-0"
              style={{ width: 30, height: 30, backgroundColor: "var(--sidebar-accent)" }}
            >
              {initials}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate leading-none">
                  {user.name}
                </p>
                <p className="text-xs truncate mt-0.5" style={{ color: "var(--sidebar-text)" }}>
                  {user.email}
                </p>
              </div>
            )}
          </div>

          {/* Logout */}
          <button
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium w-full transition-colors duration-150"
            style={{ color: "var(--sidebar-text)" }}
            title={collapsed ? "Sign out" : undefined}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#EF444418"
              e.currentTarget.style.color = "#F87171"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent"
              e.currentTarget.style.color = "var(--sidebar-text)"
            }}
          >
            <LogOut size={17} style={{ flexShrink: 0 }} />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex absolute -right-3 top-20 items-center justify-center w-6 h-6 rounded-full border transition-colors duration-150"
          style={{
            backgroundColor: "var(--sidebar-bg)",
            borderColor: "var(--sidebar-border)",
            color: "var(--sidebar-text)",
            zIndex: 10,
          }}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--sidebar-accent)"
            e.currentTarget.style.color = "#fff"
            e.currentTarget.style.borderColor = "var(--sidebar-accent)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--sidebar-bg)"
            e.currentTarget.style.color = "var(--sidebar-text)"
            e.currentTarget.style.borderColor = "var(--sidebar-border)"
          }}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>
    </>
  )
}
