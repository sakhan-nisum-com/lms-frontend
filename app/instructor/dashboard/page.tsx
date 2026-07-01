"use client"

import Link from "next/link"
import { useState } from "react"
import {
  Users,
  BarChart3,
  Bell,
  Plus,
  Star,
  TrendingUp,
  DollarSign,
  MoreHorizontal,
  ChevronRight,
  Play,
  Clock,
  AlertCircle,
  Search,
  Menu,
  BookOpen,
} from "lucide-react"
import { InstructorSidebar } from "@/components/instructor/SideBar"

const stats = [
  {
    label: "Total Students",
    value: "3,842",
    change: "+12%",
    up: true,
    icon: Users,
    color: "#3B82F6",
    bg: "#3B82F615",
  },
  {
    label: "Published Courses",
    value: "14",
    change: "+2 this month",
    up: true,
    icon: BookOpen,
    color: "#10B981",
    bg: "#10B98115",
  },
  {
    label: "Total Revenue",
    value: "$9,240",
    change: "+18%",
    up: true,
    icon: DollarSign,
    color: "#F59E0B",
    bg: "#F59E0B15",
  },
  {
    label: "Avg. Rating",
    value: "4.8",
    change: "↑ from 4.6",
    up: true,
    icon: Star,
    color: "#8B5CF6",
    bg: "#8B5CF615",
  },
]

const courses = [
  {
    id: 1,
    title: "React & TypeScript Masterclass",
    students: 1204,
    rating: 4.9,
    revenue: "$3,612",
    status: "published",
    lessons: 48,
    thumbnail: "#3B82F6",
  },
  {
    id: 2,
    title: "Node.js REST API Development",
    students: 876,
    rating: 4.7,
    revenue: "$2,628",
    status: "published",
    lessons: 35,
    thumbnail: "#10B981",
  },
  {
    id: 3,
    title: "Advanced CSS & Animation",
    students: 543,
    rating: 4.8,
    revenue: "$1,629",
    status: "published",
    lessons: 27,
    thumbnail: "#F59E0B",
  },
  {
    id: 4,
    title: "System Design Fundamentals",
    students: 0,
    rating: 0,
    revenue: "$0",
    status: "draft",
    lessons: 12,
    thumbnail: "#8B5CF6",
  },
  {
    id: 5,
    title: "Docker & Kubernetes for Developers",
    students: 0,
    rating: 0,
    revenue: "$0",
    status: "review",
    lessons: 31,
    thumbnail: "#EF4444",
  },
]

const recentActivity = [
  { text: "Sarah M. enrolled in React & TypeScript Masterclass", time: "5 min ago", icon: Users, color: "#3B82F6" },
  { text: "New review: ★★★★★ on Node.js REST API Development", time: "1 hr ago", icon: Star, color: "#F59E0B" },
  { text: "Payout of $420 processed to your account", time: "3 hrs ago", icon: DollarSign, color: "#10B981" },
  { text: "System Design Fundamentals is ready for review", time: "Yesterday", icon: AlertCircle, color: "#8B5CF6" },
]

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    published: { label: "Published", color: "#10B981", bg: "#10B98118" },
    draft:     { label: "Draft",     color: "#64748B", bg: "#33415518" },
    review:    { label: "In Review", color: "#F59E0B", bg: "#F59E0B18" },
  }
  const s = map[status] ?? map.draft
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ color: s.color, backgroundColor: s.bg }}
    >
      {s.label}
    </span>
  )
}

export default function InstructorDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div
      className="flex overflow-hidden"
      style={{ backgroundColor: "#0F172A", color: "#F8FAFC", height: "calc(100vh - var(--app-header-height, 150px))" }}
    >
      <InstructorSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={{ name: "Jane Smith", email: "jane@example.com" }}
      />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header
          className="flex items-center gap-4 px-5 py-4 z-30"
          style={{ backgroundColor: "#0F172A", borderBottom: "1px solid #1E293B" }}
        >
          <button
            className="lg:hidden p-1.5 rounded-lg hover:bg-white/5"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={18} style={{ color: "#94A3B8" }} />
          </button>

          <div className="flex-1">
            <h1 className="text-base font-semibold text-white">Dashboard</h1>
          </div>

          <div
            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
            style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
          >
            <Search size={14} style={{ color: "#475569" }} />
            <input
              placeholder="Search courses, students..."
              className="bg-transparent outline-none text-sm w-48 placeholder-slate-600"
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

          <Link
            href="/instructor/courses/new"
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: "#3B82F6" }}
          >
            <Plus size={15} />
            New Course
          </Link>
        </header>

        {/* Body */}
        <main className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Greeting */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Good morning, Jane 👋</h2>
              <p className="text-sm mt-0.5" style={{ color: "#64748B" }}>
                Here&apos;s what&apos;s happening with your courses today.
              </p>
            </div>
            <Link
              href="/instructor/courses/new"
              className="sm:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white hover:opacity-90"
              style={{ backgroundColor: "#3B82F6" }}
            >
              <Plus size={13} />
              New Course
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map(({ label, value, change, up, icon: Icon, color, bg }) => (
              <div
                key={label}
                className="rounded-2xl p-4"
                style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium" style={{ color: "#64748B" }}>{label}</p>
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-xl"
                    style={{ backgroundColor: bg }}
                  >
                    <Icon size={15} style={{ color }} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs mt-1 flex items-center gap-1" style={{ color: up ? "#10B981" : "#EF4444" }}>
                  <TrendingUp size={11} />
                  {change}
                </p>
              </div>
            ))}
          </div>

          {/* Content row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Courses table */}
            <div
              className="xl:col-span-2 rounded-2xl overflow-hidden"
              style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
            >
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: "1px solid #334155" }}
              >
                <h3 className="text-sm font-semibold text-white">My Courses</h3>
                <Link
                  href="/instructor/courses"
                  className="flex items-center gap-1 text-xs font-medium transition-colors hover:text-blue-400"
                  style={{ color: "#3B82F6" }}
                >
                  View all
                  <ChevronRight size={13} />
                </Link>
              </div>

              <div className="divide-y" style={{ borderColor: "#334155" }}>
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
                  >
                    <div
                      className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
                      style={{ backgroundColor: course.thumbnail + "20" }}
                    >
                      <Play size={14} style={{ color: course.thumbnail }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{course.title}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs flex items-center gap-1" style={{ color: "#64748B" }}>
                          <Users size={11} />
                          {course.students.toLocaleString()}
                        </span>
                        <span className="text-xs flex items-center gap-1" style={{ color: "#64748B" }}>
                          <Clock size={11} />
                          {course.lessons} lessons
                        </span>
                        {course.rating > 0 && (
                          <span className="text-xs flex items-center gap-1" style={{ color: "#F59E0B" }}>
                            <Star size={11} />
                            {course.rating}
                          </span>
                        )}
                      </div>
                    </div>

                    <StatusBadge status={course.status} />

                    <span className="hidden sm:block text-sm font-semibold text-white w-16 text-right">
                      {course.revenue}
                    </span>

                    <button
                      className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                      style={{ color: "#64748B" }}
                    >
                      <MoreHorizontal size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div
              className="rounded-2xl"
              style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
            >
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: "1px solid #334155" }}
              >
                <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
              </div>
              <ul className="divide-y" style={{ borderColor: "#334155" }}>
                {recentActivity.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 px-5 py-3.5">
                    <div
                      className="flex items-center justify-center w-7 h-7 rounded-xl shrink-0 mt-0.5"
                      style={{ backgroundColor: item.color + "18" }}
                    >
                      <item.icon size={13} style={{ color: item.color }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs leading-relaxed" style={{ color: "#CBD5E1" }}>{item.text}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#475569" }}>{item.time}</p>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Quick actions */}
              <div className="px-5 py-4" style={{ borderTop: "1px solid #334155" }}>
                <p className="text-xs font-semibold mb-3" style={{ color: "#64748B" }}>QUICK ACTIONS</p>
                <div className="space-y-2">
                  {[
                    { icon: Plus,     label: "Create new course",  href: "/instructor/courses/new", color: "#3B82F6" },
                    { icon: Users,    label: "View all students",  href: "/instructor/students",    color: "#10B981" },
                    { icon: BarChart3, label: "View analytics",    href: "/instructor/analytics",   color: "#8B5CF6" },
                  ].map(({ icon: Icon, label, href, color }) => (
                    <Link
                      key={label}
                      href={href}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors hover:border-slate-600"
                      style={{
                        backgroundColor: "#0F172A",
                        border: "1px solid #334155",
                        color: "#94A3B8",
                      }}
                    >
                      <Icon size={13} style={{ color }} />
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Progress cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Completion rate",  value: 74, desc: "Students completing your courses", color: "#3B82F6" },
              { label: "Avg. engagement",  value: 62, desc: "Avg. watch time per lesson",       color: "#10B981" },
              { label: "Quiz pass rate",   value: 88, desc: "Students passing quizzes",         color: "#8B5CF6" },
            ].map(({ label, value, desc, color }) => (
              <div
                key={label}
                className="rounded-2xl p-5"
                style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-white">{label}</p>
                  <span className="text-lg font-bold text-white">{value}%</span>
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ backgroundColor: "#334155" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${value}%`, backgroundColor: color }}
                  />
                </div>
                <p className="text-xs mt-2" style={{ color: "#64748B" }}>{desc}</p>
              </div>
            ))}
          </div>

          {/* Draft notice */}
          <div
            className="flex items-start gap-3 rounded-2xl p-4"
            style={{ backgroundColor: "#F59E0B10", border: "1px solid #F59E0B30" }}
          >
            <AlertCircle size={17} style={{ color: "#F59E0B", flexShrink: 0, marginTop: 1 }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: "#FCD34D" }}>
                2 courses need attention
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#92400E" }}>
                &ldquo;System Design Fundamentals&rdquo; is in draft and &ldquo;Docker &amp; Kubernetes&rdquo; is awaiting review.
                Publish them to reach more students.
              </p>
              <Link
                href="/instructor/courses"
                className="inline-flex items-center gap-1 mt-2 text-xs font-semibold transition-colors hover:text-yellow-300"
                style={{ color: "#F59E0B" }}
              >
                Review courses <ChevronRight size={12} />
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
