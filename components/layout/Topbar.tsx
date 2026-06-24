"use client"

import { Bell, Search, ChevronDown, Radio, ClipboardList, Award, MessageSquare, X } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"

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
    title: "Live session starting soon",
    body: "React Server Components Q&A starts in 30 minutes",
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
    title: "Assignment due in 2 days",
    body: "Build a Blog App with App Router — due Jun 17",
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
    title: "Quiz is now available",
    body: "Module 2: App Router Architecture — 25 min, 2 attempts",
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
    title: "Certificate earned 🎉",
    body: "You completed Cybersecurity Fundamentals with 96%",
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
    title: "Instructor replied to your thread",
    body: "Sarah Chen replied in 'Server Components vs getServerSideProps'",
    time: "1d",
    href: "/student/discussions",
    unread: false,
  },
]

export function Topbar({ userName = "Alex Johnson", role = "student" }: TopbarProps) {
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

  return (
    <header
      className="flex items-center justify-between px-5 py-3 flex-shrink-0 relative z-30"
      style={{ backgroundColor: "#1E293B", borderBottom: "1px solid #334155", height: 60 }}
    >
      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "#64748B" }}
        />
        <input
          type="text"
          placeholder="Search courses, lessons, instructors..."
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg outline-none transition-all duration-200"
          style={{
            backgroundColor: "#0F172A",
            color: "#F8FAFC",
            border: `1px solid ${searchFocused ? "#3B82F6" : "#334155"}`,
          }}
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 ml-4">

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false) }}
            className="relative flex items-center justify-center w-9 h-9 rounded-lg transition-colors duration-150"
            style={{ backgroundColor: notifOpen ? "#3B82F620" : "#334155", color: notifOpen ? "#60A5FA" : "#94A3B8" }}
          >
            <Bell size={15} />
            {unreadCount > 0 && (
              <span
                className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full text-white font-bold"
                style={{ backgroundColor: "#EF4444", fontSize: 9 }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {notifOpen && (
            <div
              className="absolute right-0 top-12 w-80 rounded-2xl shadow-2xl overflow-hidden"
              style={{ backgroundColor: "#1E293B", border: "1px solid #334155", zIndex: 50 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid #334155" }}>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: "#EF444420", color: "#EF4444" }}>
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <button onClick={markAllRead} className="text-xs" style={{ color: "#3B82F6" }}>
                  Mark all read
                </button>
              </div>

              {/* Notification list */}
              <div className="max-h-80 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "#334155 transparent" }}>
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
                        backgroundColor: isUnread ? "#3B82F608" : "transparent",
                        borderBottom: "1px solid #33415530",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#33415540")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isUnread ? "#3B82F608" : "transparent")}
                    >
                      <div
                        className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
                        style={{ backgroundColor: n.iconBg }}
                      >
                        <Icon size={14} style={{ color: n.iconColor }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <p className="text-xs font-semibold text-white leading-snug">{n.title}</p>
                          <span className="text-xs flex-shrink-0 ml-1" style={{ color: "#475569" }}>{n.time}</span>
                        </div>
                        <p className="text-xs mt-0.5 leading-snug line-clamp-2" style={{ color: "#64748B" }}>{n.body}</p>
                      </div>
                      {isUnread && (
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: "#3B82F6" }} />
                      )}
                    </Link>
                  )
                })}
              </div>

              {/* Footer */}
              <div className="px-4 py-2.5" style={{ borderTop: "1px solid #334155" }}>
                <Link
                  href={role === "admin" ? "/admin/audit-log" : "/student/schedule"}
                  onClick={() => setNotifOpen(false)}
                  className="block text-center text-xs font-semibold py-1.5"
                  style={{ color: "#3B82F6" }}
                >
                  View all activity →
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
            style={{ backgroundColor: profileOpen ? "#3B82F620" : "#334155" }}
          >
            <div
              className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white flex-shrink-0"
              style={{ backgroundColor: "#3B82F6" }}
            >
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-white leading-none">{userName}</p>
              <p className="text-xs capitalize mt-0.5" style={{ color: "#64748B" }}>{role}</p>
            </div>
            <ChevronDown size={13} style={{ color: "#64748B" }} />
          </button>

          {/* Profile dropdown */}
          {profileOpen && (
            <div
              className="absolute right-0 top-12 w-52 rounded-2xl shadow-2xl overflow-hidden"
              style={{ backgroundColor: "#1E293B", border: "1px solid #334155", zIndex: 50 }}
            >
              <div className="px-4 py-3" style={{ borderBottom: "1px solid #334155" }}>
                <p className="text-sm font-bold text-white">{userName}</p>
                <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>alex.johnson@techcorp.com</p>
              </div>
              {(role === "admin"
                ? [
                    { label: "Settings", href: "/admin/settings" },
                    { label: "Audit Log", href: "/admin/audit-log" },
                  ]
                : [
                    { label: "My Profile", href: "/student/profile" },
                    { label: "Settings", href: "/student/settings" },
                    { label: "Certificates", href: "/student/certificates" },
                  ]
              ).map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setProfileOpen(false)}
                  className="block px-4 py-2.5 text-sm transition-colors"
                  style={{ color: "#94A3B8" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#334155"
                    e.currentTarget.style.color = "#F8FAFC"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent"
                    e.currentTarget.style.color = "#94A3B8"
                  }}
                >
                  {label}
                </Link>
              ))}
              <div style={{ borderTop: "1px solid #334155" }}>
                <Link
                  href="/login"
                  onClick={() => setProfileOpen(false)}
                  className="block px-4 py-2.5 text-sm"
                  style={{ color: "#F87171" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#EF444415")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  Sign out
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
