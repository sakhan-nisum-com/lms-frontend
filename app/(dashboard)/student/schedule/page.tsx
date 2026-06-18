"use client"

import { useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { SCHEDULE_EVENTS, STUDENT_PROFILE } from "@/lib/data/courses"
import {
  Calendar, ChevronLeft, ChevronRight, Clock, ExternalLink,
  Video, ClipboardList, Brain, AlertCircle, Wrench,
} from "lucide-react"
import { isZoomLink } from "@/lib/data/live-session"

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

const eventTypeIcon = (type: string) => {
  switch (type) {
    case "live-session": return <Video size={12} />
    case "assignment-due": return <ClipboardList size={12} />
    case "quiz": return <Brain size={12} />
    case "exam": return <AlertCircle size={12} />
    case "workshop": return <Wrench size={12} />
    default: return <Calendar size={12} />
  }
}

const eventTypeLabel: Record<string, string> = {
  "live-session": "Live Session",
  "assignment-due": "Assignment Due",
  "quiz": "Quiz",
  "exam": "Exam",
  "workshop": "Workshop",
  "office-hours": "Office Hours",
}

function getHour(time: string): string {
  const [h, m] = time.split(":").map(Number)
  const period = h >= 12 ? "PM" : "AM"
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${display}:${String(m).padStart(2, "0")} ${period}`
}

// Generate calendar days for June 2025
function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)
  return days
}

export default function SchedulePage() {
  const p = STUDENT_PROFILE
  const [currentMonth] = useState({ year: 2025, month: 5 }) // June 2025 (0-indexed)
  const today = 12 // June 12

  const calDays = getCalendarDays(currentMonth.year, currentMonth.month)

  const getEventsForDay = (day: number | null) => {
    if (!day) return []
    const dateStr = `2025-06-${String(day).padStart(2, "0")}`
    return SCHEDULE_EVENTS.filter((e) => e.date === dateStr)
  }

  const upcomingEvents = SCHEDULE_EVENTS
    .filter((e) => {
      const d = parseInt(e.date.split("-")[2])
      return d >= today
    })
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))

  const todayEvents = SCHEDULE_EVENTS.filter((e) => e.status === "today")

  return (
    <DashboardLayout role="student" userName={p.name}>
      <div className="space-y-6 max-w-7xl">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Schedule</h1>
            <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>
              {upcomingEvents.length} upcoming events · June 2025
            </p>
          </div>
        </div>

        {/* Today's events */}
        {todayEvents.length > 0 && (
          <div
            className="rounded-2xl p-4"
            style={{ backgroundColor: "#1E293B", border: "1px solid #3B82F640" }}
          >
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#60A5FA" }}>TODAY — JUNE 12</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {todayEvents.map((event) => (
                <div
                  key={event.id}
                  className="rounded-xl p-3 flex items-start gap-3"
                  style={{ backgroundColor: "#0F172A", border: `1px solid ${event.color}40` }}
                >
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: `${event.color}20`, color: event.color }}
                  >
                    {eventTypeIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{event.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>
                      {getHour(event.startTime)} – {getHour(event.endTime)}
                    </p>
                    {event.meetLink && (
                      isZoomLink(event.meetLink) ? (
                        <Link
                          href={`/student/live-session/${event.id}`}
                          className="flex items-center gap-1 text-xs mt-1 font-medium"
                          style={{ color: "#10B981" }}
                        >
                          <Video size={10} /> Join in LMS
                        </Link>
                      ) : (
                        <a
                          href={event.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs mt-1"
                          style={{ color: "#3B82F6" }}
                        >
                          <ExternalLink size={10} /> Join meeting
                        </a>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl p-5" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
              {/* Month nav */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-white">
                  {MONTHS[currentMonth.month]} {currentMonth.year}
                </h2>
                <div className="flex gap-1">
                  <button
                    className="p-1.5 rounded-lg"
                    style={{ backgroundColor: "#334155", color: "#94A3B8" }}
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <button
                    className="p-1.5 rounded-lg"
                    style={{ backgroundColor: "#334155", color: "#94A3B8" }}
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 mb-2">
                {DAYS.map((d) => (
                  <div key={d} className="text-center text-xs font-semibold py-1" style={{ color: "#475569" }}>
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {calDays.map((day, idx) => {
                  const dayEvents = getEventsForDay(day)
                  const isToday = day === today
                  return (
                    <div
                      key={idx}
                      className="rounded-lg p-1.5 min-h-16 cursor-pointer transition-colors"
                      style={{
                        backgroundColor: isToday ? "#3B82F620" : day ? "transparent" : "transparent",
                        border: `1px solid ${isToday ? "#3B82F6" : "transparent"}`,
                      }}
                    >
                      {day && (
                        <>
                          <span
                            className="text-xs font-semibold"
                            style={{ color: isToday ? "#60A5FA" : day < today ? "#475569" : "#94A3B8" }}
                          >
                            {day}
                          </span>
                          <div className="mt-1 space-y-0.5">
                            {dayEvents.slice(0, 2).map((ev) => (
                              <div
                                key={ev.id}
                                className="rounded px-1 py-0.5 text-xs truncate"
                                style={{
                                  backgroundColor: `${ev.color}20`,
                                  color: ev.color,
                                  fontSize: 9,
                                }}
                                title={ev.title}
                              >
                                {ev.title.split(":")[0].substring(0, 12)}
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <div className="text-xs" style={{ color: "#475569", fontSize: 9 }}>
                                +{dayEvents.length - 2} more
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-3 mt-4 pt-4" style={{ borderTop: "1px solid #334155" }}>
                {[
                  { type: "live-session", color: "#3B82F6", label: "Live Session" },
                  { type: "assignment-due", color: "#F59E0B", label: "Assignment Due" },
                  { type: "quiz", color: "#8B5CF6", label: "Quiz" },
                  { type: "exam", color: "#EF4444", label: "Exam" },
                  { type: "workshop", color: "#10B981", label: "Workshop" },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-1.5 text-xs" style={{ color: "#94A3B8" }}>
                    <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: color }} />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Upcoming events list */}
          <div>
            <h2 className="text-sm font-bold text-white mb-3">Upcoming Events</h2>
            <div className="space-y-2">
              {upcomingEvents.map((event) => {
                const day = parseInt(event.date.split("-")[2])
                const isToday = day === today
                return (
                  <div
                    key={event.id}
                    className="rounded-xl p-3"
                    style={{
                      backgroundColor: "#1E293B",
                      border: `1px solid ${isToday ? event.color + "40" : "#334155"}`,
                    }}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
                        style={{ backgroundColor: `${event.color}20`, color: event.color }}
                      >
                        {eventTypeIcon(event.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white leading-snug">{event.title}</p>
                        <p className="text-xs mt-0.5 truncate" style={{ color: "#64748B" }}>{event.courseName}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span
                            className="text-xs px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: `${event.color}20`, color: event.color, fontSize: 10 }}
                          >
                            {eventTypeLabel[event.type] ?? event.type}
                          </span>
                          <span className="text-xs flex items-center gap-0.5" style={{ color: "#475569" }}>
                            <Clock size={10} />
                            {isToday ? "Today" : `Jun ${day}`} · {getHour(event.startTime)}
                          </span>
                        </div>
                        {event.meetLink && (
                          isZoomLink(event.meetLink) ? (
                            <Link
                              href={`/student/live-session/${event.id}`}
                              className="flex items-center gap-1 text-xs mt-1.5 font-medium"
                              style={{ color: "#10B981" }}
                            >
                              <Video size={10} /> Join in LMS
                            </Link>
                          ) : (
                            <a
                              href={event.meetLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs mt-1.5"
                              style={{ color: "#3B82F6" }}
                            >
                              <ExternalLink size={10} /> Join meeting
                            </a>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  )
}
