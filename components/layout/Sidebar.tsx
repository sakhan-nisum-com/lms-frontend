"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, BookOpen, Compass, Map,
  BarChart3, Award, MessageSquare, Users, Calendar, UserCircle,
  Settings, LogOut, ChevronLeft, ChevronRight, GraduationCap,
  Radio, GraduationCap as Training, UserCog, Megaphone,
  ShieldAlert, DollarSign, Tag,
} from "lucide-react"
import { useState } from "react"
import { useLocale, useTranslations } from "next-intl"

type Role = "student" | "tutor" | "admin"

interface NavItem {
  labelKey: string
  href: string
  icon: React.ElementType
  badgeKey?: string
  badgeColor?: string
  liveIndicator?: boolean
}

interface NavGroup {
  groupKey: string
  items: NavItem[]
}

const studentGroups: NavGroup[] = [
  {
    groupKey: "overview",
    items: [
      { labelKey: "dashboard", href: "/student/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    groupKey: "myLearning",
    items: [
      { labelKey: "myLearningItem", href: "/student/my-learning", icon: LayoutDashboard },
      { labelKey: "myCourses", href: "/student/courses", icon: BookOpen },
      { labelKey: "myTrainings", href: "/student/my-trainings", icon: Training },
      { labelKey: "learningPaths", href: "/student/learning-paths", icon: Map },
      { labelKey: "exploreCatalog", href: "/student/explore", icon: Compass },
    ],
  },
  {
    groupKey: "liveContent",
    items: [
      { labelKey: "liveClasses", href: "/student/live", icon: Radio, badgeKey: "live", badgeColor: "#EF4444", liveIndicator: true },
      { labelKey: "trainings", href: "/student/trainings", icon: Training },
    ],
  },
  {
    groupKey: "growth",
    items: [
      { labelKey: "progressAnalytics", href: "/student/progress", icon: BarChart3 },
      { labelKey: "certificates", href: "/student/certificates", icon: Award },
    ],
  },
  {
    groupKey: "community",
    items: [
      { labelKey: "discussions", href: "/student/discussions", icon: MessageSquare },
      { labelKey: "studyGroups", href: "/student/study-groups", icon: Users },
    ],
  },
  {
    groupKey: "planning",
    items: [
      { labelKey: "schedule", href: "/student/schedule", icon: Calendar },
    ],
  },
  {
    groupKey: "account",
    items: [
      { labelKey: "profile", href: "/student/profile", icon: UserCircle },
      { labelKey: "settings", href: "/student/settings", icon: Settings },
    ],
  },
]

const tutorGroups: NavGroup[] = [
  {
    groupKey: "overview",
    items: [
      { labelKey: "dashboard", href: "/tutor/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    groupKey: "teaching",
    items: [
      { labelKey: "myCourses", href: "/tutor/courses", icon: BookOpen },
      { labelKey: "students", href: "/tutor/students", icon: Users },
      { labelKey: "studyGroups", href: "/tutor/study-groups", icon: Users },
    ],
  },
  {
    groupKey: "insights",
    items: [
      { labelKey: "analytics", href: "/tutor/analytics", icon: BarChart3 },
    ],
  },
  {
    groupKey: "account",
    items: [
      { labelKey: "settings", href: "/tutor/settings", icon: Settings },
    ],
  },
]

const adminGroups: NavGroup[] = [
  {
    groupKey: "overview",
    items: [
      { labelKey: "dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    groupKey: "people",
    items: [
      { labelKey: "users", href: "/admin/users", icon: UserCog },
    ],
  },
  {
    groupKey: "content",
    items: [
      { labelKey: "courses", href: "/admin/courses", icon: BookOpen },
      { labelKey: "categories", href: "/admin/categories", icon: Tag },
      { labelKey: "trainings", href: "/admin/trainings", icon: Training },
    ],
  },
  {
    groupKey: "community",
    items: [
      { labelKey: "discussions", href: "/admin/discussions", icon: MessageSquare },
      { labelKey: "studyGroups", href: "/admin/study-groups", icon: Users },
    ],
  },
  {
    groupKey: "finance",
    items: [
      { labelKey: "payments", href: "/admin/transactions", icon: DollarSign },
      { labelKey: "certificates", href: "/admin/certificates", icon: Award },
    ],
  },
  {
    groupKey: "communication",
    items: [
      { labelKey: "announcements", href: "/admin/announcements", icon: Megaphone },
    ],
  },
  {
    groupKey: "insights",
    items: [
      { labelKey: "reports", href: "/admin/reports", icon: BarChart3 },
      { labelKey: "auditLog", href: "/admin/audit-log", icon: ShieldAlert },
    ],
  },
  {
    groupKey: "account",
    items: [
      { labelKey: "settings", href: "/admin/settings", icon: Settings },
    ],
  },
]

interface SidebarProps {
  role: Role
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const locale = useLocale()
  const isRtl = locale === "ar"
  const t = useTranslations("sidebar")
  const tCommon = useTranslations("common")
  const [collapsed, setCollapsed] = useState(false)
  const groups = role === "student" ? studentGroups : role === "tutor" ? tutorGroups : adminGroups

  const ExpandIcon = isRtl ? ChevronLeft : ChevronRight
  const CollapseIcon = isRtl ? ChevronRight : ChevronLeft

  return (
    <aside
      className="relative flex flex-col h-full transition-all duration-300 ease-in-out"
      style={{
        width: collapsed ? "64px" : "240px",
        backgroundColor: "var(--sidebar-bg)",
        borderInlineEnd: "1px solid var(--sidebar-border)",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-3 px-4 py-5 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--sidebar-border)" }}
      >
        <div
          className="flex items-center justify-center rounded-lg flex-shrink-0"
          style={{ width: 34, height: 34, backgroundColor: "var(--sidebar-accent)" }}
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
            style={{ color: "var(--sidebar-accent)", backgroundColor: "#1D4ED815" }}
          >
            {role === "student" ? tCommon("student") : role === "tutor" ? tCommon("instructor") : tCommon("admin")}
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-1" style={{ scrollbarWidth: "none" }}>
        {groups.map((group) => (
          <div key={group.groupKey} className="mb-0.5">
            {!collapsed && (
              <div
                className="px-3 pt-3.5 pb-1 text-xs font-bold tracking-widest"
                style={{ color: "#3F5068", letterSpacing: "0.09em" }}
              >
                {t(`groups.${group.groupKey}`)}
              </div>
            )}
            {collapsed && <div className="pt-2.5" />}

            {group.items.map(({ labelKey, href, icon: Icon, badgeKey, badgeColor, liveIndicator }) => {
              const active = pathname === href || pathname.startsWith(href + "/")
              const label = t(`nav.${labelKey}`)
              return (
                <Link
                  key={href}
                  href={href}
                  title={collapsed ? label : undefined}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-150 relative"
                  style={{
                    backgroundColor: active ? "#3B82F618" : "transparent",
                    color: active ? "#60A5FA" : "var(--sidebar-text)",
                    marginBottom: 1,
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
                  {/* Active bar on the leading edge */}
                  {active && (
                    <span
                      className="absolute top-1 bottom-1 w-0.5 rounded-e"
                      style={{ backgroundColor: "var(--sidebar-accent)", insetInlineStart: 0 }}
                    />
                  )}

                  <div className="relative flex-shrink-0">
                    <Icon size={16} style={{ color: active ? "var(--sidebar-accent)" : "inherit" }} />
                    {liveIndicator && !collapsed && (
                      <span
                        className="absolute -top-0.5 w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: "#EF4444", boxShadow: "0 0 0 2px var(--sidebar-bg)", insetInlineEnd: -2 }}
                      />
                    )}
                  </div>

                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate">{label}</span>
                      {badgeKey && (
                        <span
                          className="text-xs font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: liveIndicator ? "#EF444422" : `${badgeColor}22`,
                            color: badgeColor,
                            fontSize: liveIndicator ? 9 : 10,
                            letterSpacing: liveIndicator ? "0.04em" : 0,
                          }}
                        >
                          {t(`${badgeKey}`)}
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
      <div className="px-2 py-3 flex-shrink-0" style={{ borderTop: "1px solid var(--sidebar-border)" }}>
        <Link
          href="/login"
          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium w-full transition-colors duration-150"
          style={{ color: "var(--sidebar-text)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#EF444418"
            e.currentTarget.style.color = "#F87171"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent"
            e.currentTarget.style.color = "var(--sidebar-text)"
          }}
        >
          <LogOut size={16} style={{ flexShrink: 0 }} />
          {!collapsed && <span>{t("logOut")}</span>}
        </Link>
      </div>

      {/* Collapse toggle — sits on the edge facing the content, which flips with direction */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-[72px] flex items-center justify-center w-6 h-6 rounded-full border transition-all duration-150 z-10"
        style={{ backgroundColor: "var(--sidebar-bg)", borderColor: "var(--sidebar-border)", color: "var(--sidebar-text)", insetInlineEnd: -12 }}
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
        {collapsed ? <ExpandIcon size={11} /> : <CollapseIcon size={11} />}
      </button>
    </aside>
  )
}
