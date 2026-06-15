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
} from "lucide-react"

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

const instructorNav: NavItem[] = [
  { label: "Dashboard",   href: "/instructor/dashboard",  icon: LayoutDashboard },
  { label: "My Courses",  href: "/instructor/courses",    icon: BookOpen },
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
          style={{ backgroundColor: "#0F172Acc" }}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={[
          "fixed top-0 left-0 h-full z-50 flex flex-col transition-all duration-300 ease-in-out",
          "lg:static lg:z-auto lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        style={{
          width: collapsed ? 72 : 240,
          backgroundColor: "#1E293B",
          borderRight: "1px solid #334155",
          flexShrink: 0,
        }}
      >
        {/* Logo row */}
        <div
          className="flex items-center gap-3 px-4 py-5"
          style={{ borderBottom: "1px solid #334155" }}
        >
          <Link
            href="/"
            className="flex items-center gap-3 min-w-0"
            title="LearnFlow"
          >
            <div
              className="flex items-center justify-center rounded-lg flex-shrink-0"
              style={{ width: 36, height: 36, backgroundColor: "#3B82F6" }}
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
              <X size={15} style={{ color: "#94A3B8" }} />
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
                  color: active ? "#60A5FA" : "#94A3B8",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = "#ffffff08"
                    e.currentTarget.style.color = "#CBD5E1"
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

        {/* User + logout */}
        <div className="px-2 py-3 space-y-1" style={{ borderTop: "1px solid #334155" }}>
          {/* User pill */}
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
            style={{ backgroundColor: "#0F172A" }}
          >
            <div
              className="flex items-center justify-center rounded-full text-xs font-bold text-white flex-shrink-0"
              style={{ width: 30, height: 30, backgroundColor: "#3B82F6" }}
            >
              {initials}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate leading-none">
                  {user.name}
                </p>
                <p className="text-xs truncate mt-0.5" style={{ color: "#64748B" }}>
                  {user.email}
                </p>
              </div>
            )}
          </div>

          {/* Logout */}
          <button
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium w-full transition-colors duration-150"
            style={{ color: "#94A3B8" }}
            title={collapsed ? "Sign out" : undefined}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#EF444418"
              e.currentTarget.style.color = "#F87171"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent"
              e.currentTarget.style.color = "#94A3B8"
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
            backgroundColor: "#1E293B",
            borderColor: "#334155",
            color: "#94A3B8",
            zIndex: 10,
          }}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
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
    </>
  )
}