"use client"

import { Bell, Search, ChevronDown, Radio, ClipboardList, Award, MessageSquare, X } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { ThemeToggle } from "@/components/ThemeToggle"
import { LanguageToggle } from "@/components/LanguageToggle"

interface TopbarProps {
  userName?: string
  role?: "student" | "tutor" | "admin"
}

const notifications = [
  {
    id: "n1",
    type: "live",
    icon: Radio,
    iconColor: "#EF4444",
    iconBg: "#EF444418",
    titleKey: "liveTitle",
    bodyKey: "liveBody",
    time: "30m",
    href: "/student/live",
    unread: true,
  },
  {
    id: "n2",
    type: "assignment",
    icon: ClipboardList,
    iconColor: "#F59E0B",
    iconBg: "#F59E0B18",
    titleKey: "assignmentTitle",
    bodyKey: "assignmentBody",
    time: "2h",
    href: "/student/courses/c1?tab=assignments",
    unread: true,
  },
  {
    id: "n3",
    type: "quiz",
    icon: MessageSquare,
    iconColor: "#8B5CF6",
    iconBg: "#8B5CF618",
    titleKey: "quizTitle",
    bodyKey: "quizBody",
    time: "5h",
    href: "/student/courses/c1?tab=quizzes",
    unread: true,
  },
  {
    id: "n4",
    type: "cert",
    icon: Award,
    iconColor: "#F59E0B",
    iconBg: "#F59E0B18",
    titleKey: "certTitle",
    bodyKey: "certBody",
    time: "3d",
    href: "/student/certificates",
    unread: false,
  },
  {
    id: "n5",
    type: "reply",
    icon: MessageSquare,
    iconColor: "#10B981",
    iconBg: "#10B98118",
    titleKey: "replyTitle",
    bodyKey: "replyBody",
    time: "1d",
    href: "/student/discussions",
    unread: false,
  },
]

export function Topbar({ userName = "Alex Johnson", role = "student" }: TopbarProps) {
  const t = useTranslations("topbar")
  const tNotif = useTranslations("notifications")
  const tSidebar = useTranslations("sidebar")
  const tCommon = useTranslations("common")
  const [searchFocused, setSearchFocused] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => n.unread && !readIds.has(n.id)).length

  // Close dropdowns on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const markAllRead = () => setReadIds(new Set(notifications.map((n) => n.id)))

  const roleLabel = role === "student" ? tCommon("student") : role === "tutor" ? tCommon("instructor") : tCommon("admin")

  return (
    <header
      className="flex items-center justify-between px-5 py-3 flex-shrink-0 relative z-30"
      style={{ backgroundColor: "var(--bg-surface)", borderBottom: "1px solid var(--border-default)", height: 60 }}
    >
      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search
          size={14}
          className="absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "var(--text-muted)" }}
        />
        <input
          type="text"
          placeholder={t("searchPlaceholder")}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className="w-full ps-9 pe-4 py-2 text-sm rounded-lg outline-none transition-all duration-200"
          style={{
            backgroundColor: "var(--bg-surface-muted)",
            color: "var(--text-primary)",
            border: `1px solid ${searchFocused ? "var(--accent)" : "var(--border-default)"}`,
          }}
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 ms-4">

        <LanguageToggle />
        <ThemeToggle />

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false) }}
            className="relative flex items-center justify-center w-9 h-9 rounded-lg transition-colors duration-150"
            style={{
              backgroundColor: notifOpen ? "var(--accent-subtle)" : "var(--bg-surface-muted)",
              color: notifOpen ? "var(--accent)" : "var(--text-muted)",
            }}
          >
            <Bell size={15} />
            {unreadCount > 0 && (
              <span
                className="absolute -top-1 flex items-center justify-center w-4 h-4 rounded-full text-white font-bold"
                style={{ backgroundColor: "var(--danger)", fontSize: 9, insetInlineEnd: -4 }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {notifOpen && (
            <div
              className="absolute end-0 top-12 w-80 rounded-2xl shadow-xl overflow-hidden"
              style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)", zIndex: 50 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--border-default)" }}>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{t("notifications")}</span>
                  {unreadCount > 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: "var(--danger-bg)", color: "var(--danger)" }}>
                      {t("newCount", { count: unreadCount })}
                    </span>
                  )}
                </div>
                <button onClick={markAllRead} className="text-xs" style={{ color: "var(--accent)" }}>
                  {t("markAllRead")}
                </button>
              </div>

              {/* Notification list */}
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((n) => {
                  const Icon = n.icon
                  const isUnread = n.unread && !readIds.has(n.id)
                  return (
                    <Link
                      key={n.id}
                      href={n.href}
                      onClick={() => { setReadIds((p) => new Set([...p, n.id])); setNotifOpen(false) }}
                      className="flex items-start gap-3 px-4 py-3 transition-colors"
                      style={{
                        backgroundColor: isUnread ? "var(--accent-subtle)" : "transparent",
                        borderBottom: "1px solid var(--border-subtle)",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-surface-muted)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isUnread ? "var(--accent-subtle)" : "transparent")}
                    >
                      <div
                        className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
                        style={{ backgroundColor: n.iconBg }}
                      >
                        <Icon size={14} style={{ color: n.iconColor }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <p className="text-xs font-semibold leading-snug" style={{ color: "var(--text-primary)" }}>{tNotif(n.titleKey)}</p>
                          <span className="text-xs flex-shrink-0 ms-1" style={{ color: "var(--text-muted)" }}>{n.time}</span>
                        </div>
                        <p className="text-xs mt-0.5 leading-snug line-clamp-2" style={{ color: "var(--text-tertiary)" }}>{tNotif(n.bodyKey)}</p>
                      </div>
                      {isUnread && (
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: "var(--accent)" }} />
                      )}
                    </Link>
                  )
                })}
              </div>

              {/* Footer */}
              <div className="px-4 py-2.5" style={{ borderTop: "1px solid var(--border-default)" }}>
                <Link
                  href={role === "admin" ? "/admin/audit-log" : "/student/schedule"}
                  onClick={() => setNotifOpen(false)}
                  className="block text-center text-xs font-semibold py-1.5"
                  style={{ color: "var(--accent)" }}
                >
                  {t("viewAllActivity")}
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false) }}
            className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition-colors duration-150"
            style={{ backgroundColor: profileOpen ? "var(--accent-subtle)" : "var(--bg-surface-muted)" }}
          >
            <div
              className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white flex-shrink-0"
              style={{ backgroundColor: "var(--accent)" }}
            >
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="text-start hidden sm:block">
              <p className="text-xs font-semibold leading-none" style={{ color: "var(--text-primary)" }}>{userName}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{roleLabel}</p>
            </div>
            <ChevronDown size={13} style={{ color: "var(--text-tertiary)" }} />
          </button>

          {/* Profile dropdown */}
          {profileOpen && (
            <div
              className="absolute end-0 top-12 w-52 rounded-2xl shadow-xl overflow-hidden"
              style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)", zIndex: 50 }}
            >
              <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border-default)" }}>
                <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{userName}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>alex.johnson@techcorp.com</p>
              </div>
              {(role === "admin"
                ? [
                    { label: tSidebar("nav.settings"), href: "/admin/settings" },
                    { label: tSidebar("nav.auditLog"), href: "/admin/audit-log" },
                  ]
                : [
                    { label: t("myProfile"), href: "/student/profile" },
                    { label: tSidebar("nav.settings"), href: "/student/settings" },
                    { label: tSidebar("nav.certificates"), href: "/student/certificates" },
                  ]
              ).map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setProfileOpen(false)}
                  className="block px-4 py-2.5 text-sm transition-colors"
                  style={{ color: "var(--text-secondary)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--bg-surface-muted)"
                    e.currentTarget.style.color = "var(--text-primary)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent"
                    e.currentTarget.style.color = "var(--text-secondary)"
                  }}
                >
                  {label}
                </Link>
              ))}
              <div style={{ borderTop: "1px solid var(--border-default)" }}>
                <Link
                  href="/login"
                  onClick={() => setProfileOpen(false)}
                  className="block px-4 py-2.5 text-sm"
                  style={{ color: "var(--danger)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--danger-bg)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  {t("signOut")}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
