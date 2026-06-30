"use client"

import { useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { LEARNING_PATHS, COURSES, STUDENT_PROFILE } from "@/lib/data/courses"
import {
  Map, ChevronRight, Clock, BookOpen, Award, AlertCircle,
  CheckCircle2, TrendingUp, Play, Users, Star,
} from "lucide-react"

export default function LearningPathsPage() {
  const p = STUDENT_PROFILE
  const [expandedPath, setExpandedPath] = useState<string | null>("lp1")

  const mandatory = LEARNING_PATHS.filter((lp) => lp.isMandatory)
  const optional = LEARNING_PATHS.filter((lp) => !lp.isMandatory)

  return (
    <DashboardLayout role="student" userName={p.name}>
      <div className="space-y-6 max-w-6xl">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Learning Paths</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Structured curricula to guide you from beginner to expert — or meet your compliance requirements.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Paths Enrolled", value: String(LEARNING_PATHS.filter((lp) => lp.progress > 0).length), icon: Map, color: "#3B82F6" },
            { label: "Paths Completed", value: "0", icon: CheckCircle2, color: "#10B981" },
            { label: "Mandatory Remaining", value: "1", icon: AlertCircle, color: "#EF4444" },
            { label: "Skills Tracked", value: "14", icon: Star, color: "#F59E0B" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-xl p-4 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
              <div className="flex items-center justify-center w-9 h-9 rounded-xl mb-2" style={{ backgroundColor: `${color}20` }}>
                <Icon size={17} style={{ color }} />
              </div>
              <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{value}</p>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Mandatory Paths */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={16} style={{ color: "var(--danger)" }} />
            <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Required Paths</h2>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#EF444420", color: "var(--danger)" }}>
              Deadline: Jun 30, 2025
            </span>
          </div>

          {mandatory.map((path) => {
            const pathCourses = COURSES.filter((c) => path.courseIds.includes(c.id))
            const isExpanded = expandedPath === path.id
            const daysLeft = 18 // mock

            return (
              <div
                key={path.id}
                className="rounded-2xl overflow-hidden mb-3 shadow-sm"
                style={{ backgroundColor: "var(--bg-surface)", border: "1px solid #EF444430" }}
              >
                <button
                  className="w-full flex items-center gap-4 p-5 text-left"
                  onClick={() => setExpandedPath(isExpanded ? null : path.id)}
                >
                  <div
                    className="flex items-center justify-center w-12 h-12 rounded-xl text-2xl flex-shrink-0"
                    style={{ backgroundColor: `${path.color}15` }}
                  >
                    {path.thumbnail}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{path.title}</span>
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: "#EF444420", color: "var(--danger)" }}>REQUIRED</span>
                    </div>
                    <p className="text-xs mb-2 line-clamp-1" style={{ color: "var(--text-tertiary)" }}>{path.description}</p>
                    <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-tertiary)" }}>
                      <span className="flex items-center gap-1"><Clock size={11} />{path.estimatedHours}h total</span>
                      <span className="flex items-center gap-1"><BookOpen size={11} />{path.courseIds.length} courses</span>
                      <span className="flex items-center gap-1 font-semibold" style={{ color: "var(--danger)" }}>
                        <AlertCircle size={11} />{daysLeft} days left
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1" style={{ color: "var(--text-tertiary)" }}>
                        <span>{path.progress}% complete</span>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ backgroundColor: "var(--border-default)" }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${path.progress}%`, backgroundColor: path.progress >= 100 ? "var(--success)" : "var(--danger)" }}
                        />
                      </div>
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
                    style={{
                      color: "var(--text-tertiary)",
                      transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                      transition: "transform 0.2s",
                      flexShrink: 0,
                    }}
                  />
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 space-y-3" style={{ borderTop: "1px solid var(--border-default)" }}>
                    {/* Skills */}
                    <div className="pt-4">
                      <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Skills You&apos;ll Earn</p>
                      <div className="flex flex-wrap gap-2">
                        {path.skills.map((skill) => (
                          <span key={skill} className="text-xs px-2 py-1 rounded-lg" style={{ backgroundColor: "var(--border-default)", color: "#CBD5E1" }}>{skill}</span>
                        ))}
                      </div>
                    </div>

                    {/* Courses in path */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Course Sequence</p>
                      <div className="space-y-2">
                        {pathCourses.map((course, idx) => {
                          const isCompleted = course.progress === 100
                          const isActive = course.progress !== undefined && course.progress! > 0 && course.progress! < 100
                          return (
                            <div
                              key={course.id}
                              className="flex items-center gap-3 rounded-xl p-3"
                              style={{
                                backgroundColor: "var(--bg-surface-muted)",
                                border: `1px solid ${isCompleted ? "#10B98130" : isActive ? "#3B82F630" : "var(--border-default)"}`,
                              }}
                            >
                              <div
                                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                style={{
                                  backgroundColor: isCompleted ? "var(--success)" : isActive ? "var(--accent)" : "var(--border-default)",
                                  color: "#fff",
                                }}
                              >
                                {isCompleted ? <CheckCircle2 size={14} /> : idx + 1}
                              </div>
                              <div
                                className="flex items-center justify-center w-8 h-8 rounded-lg text-lg flex-shrink-0"
                                style={{ backgroundColor: `${course.thumbnailColor}15` }}
                              >
                                {course.thumbnail}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>{course.title}</p>
                                <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{course.totalDuration} · {course.level}</p>
                              </div>
                              {course.progress !== undefined ? (
                                <div className="text-right flex-shrink-0">
                                  <p className="text-xs font-semibold" style={{ color: isCompleted ? "var(--success)" : "#60A5FA" }}>{course.progress}%</p>
                                  {!isCompleted && (
                                    <Link
                                      href={`/student/courses/${course.id}/learn/${course.nextLessonId}`}
                                      className="text-xs flex items-center gap-0.5 mt-0.5"
                                      style={{ color: "var(--accent)" }}
                                    >
                                      <Play size={10} fill="#3B82F6" /> Resume
                                    </Link>
                                  )}
                                </div>
                              ) : (
                                <Link
                                  href={`/student/courses/${course.id}`}
                                  className="text-xs px-2 py-1 rounded-lg flex-shrink-0"
                                  style={{ backgroundColor: "var(--border-default)", color: "var(--text-secondary)" }}
                                >
                                  Start
                                </Link>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Optional Paths */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} style={{ color: "var(--accent)" }} />
            <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Recommended Paths</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {optional.map((path) => {
              const pathCourses = COURSES.filter((c) => path.courseIds.includes(c.id))
              return (
                <div
                  key={path.id}
                  className="rounded-2xl overflow-hidden flex flex-col shadow-sm"
                  style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
                >
                  {/* Banner */}
                  <div
                    className="flex items-center justify-between p-4"
                    style={{ backgroundColor: `${path.color}10`, borderBottom: "1px solid var(--border-default)" }}
                  >
                    <div className="text-4xl">{path.thumbnail}</div>
                    <div className="text-right">
                      <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{path.level}</p>
                      <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>{path.estimatedHours}h</p>
                    </div>
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-sm font-bold mb-1" style={{ color: "var(--text-primary)" }}>{path.title}</h3>
                    <p className="text-xs mb-3 line-clamp-2 flex-1" style={{ color: "var(--text-tertiary)" }}>{path.description}</p>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {path.skills.slice(0, 4).map((skill) => (
                        <span key={skill} className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: "var(--border-default)", color: "var(--text-secondary)" }}>{skill}</span>
                      ))}
                      {path.skills.length > 4 && (
                        <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: "var(--border-default)", color: "var(--text-tertiary)" }}>+{path.skills.length - 4}</span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-3 text-xs mb-3" style={{ color: "var(--text-tertiary)" }}>
                      <span className="flex items-center gap-1"><BookOpen size={11} />{path.courseIds.length} courses</span>
                      <span className="flex items-center gap-1"><Users size={11} />{(path.enrolledCount / 1000).toFixed(0)}k enrolled</span>
                    </div>

                    {/* Progress */}
                    {path.progress > 0 && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1" style={{ color: "var(--text-tertiary)" }}>
                          <span>Progress</span><span>{path.progress}%</span>
                        </div>
                        <div className="h-1.5 rounded-full" style={{ backgroundColor: "var(--border-default)" }}>
                          <div className="h-full rounded-full" style={{ width: `${path.progress}%`, backgroundColor: path.color }} />
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {path.progress > 0 ? (
                        <button
                          className="flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1"
                          style={{ backgroundColor: path.color, color: "#fff" }}
                        >
                          <Play size={12} fill="#fff" /> Continue
                        </button>
                      ) : (
                        <button
                          className="flex-1 py-2 rounded-xl text-xs font-semibold"
                          style={{ backgroundColor: `${path.color}20`, color: path.color }}
                        >
                          Start Path
                        </button>
                      )}
                      <button
                        className="px-3 py-2 rounded-xl text-xs font-semibold"
                        style={{ backgroundColor: "var(--border-default)", color: "var(--text-secondary)" }}
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </DashboardLayout>
  )
}
