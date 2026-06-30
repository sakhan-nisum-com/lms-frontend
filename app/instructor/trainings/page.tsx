"use client"

import Link from "next/link"
import {
  Target,
  Plus,
  Users,
  Video,
  Link2,
  ChevronRight,
  Calendar,
  Zap,
} from "lucide-react"
import { InstructorPageShell } from "@/components/instructor/InstructorPageShell"

const FEATURE_CARDS = [
  {
    icon: Users,
    color: "#3B82F6",
    title: "Cohort-Based Programs",
    desc: "Run high-ticket, time-bound cohorts with structured start and end dates, keeping learners accountable and engaged.",
  },
  {
    icon: Video,
    color: "#8B5CF6",
    title: "Live Workshop Integration",
    desc: "Blend pre-recorded content with scheduled live sessions, Q&As, and instructor-led workshops in a single program.",
  },
  {
    icon: Link2,
    color: "#10B981",
    title: "Subscription Links",
    desc: "Generate shareable public enrollment links with custom expiration dates, seat caps, and early-bird pricing.",
  },
]

export default function TrainingsPage() {
  return (
    <InstructorPageShell
      title="Trainings"
      user={{ name: "Jane Smith", email: "jane@example.com" }}
      action={
        <Link
          href="/instructor/trainings/new"
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "var(--accent)" }}
        >
          <Plus size={15} />
          <span className="hidden sm:inline">Create Training</span>
        </Link>
      }
    >
      <div className="max-w-4xl mx-auto space-y-8 pt-4">

        {/* Hero empty state */}
        <div
          className="flex flex-col items-center text-center py-16 px-8 rounded-2xl shadow-sm"
          style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
        >
          {/* Icon */}
          <div
            className="flex items-center justify-center w-20 h-20 rounded-2xl mb-6"
            style={{
              background: "linear-gradient(135deg, #3B82F620 0%, #8B5CF620 100%)",
              border: "1px solid #3B82F630",
            }}
          >
            <Target size={38} style={{ color: "var(--accent)" }} />
          </div>

          <h2 className="text-xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
            No Training Programs Yet
          </h2>

          <p className="text-sm leading-relaxed max-w-md mb-8" style={{ color: "var(--text-tertiary)" }}>
            Manage your premium training programs here. Create high-ticket, time-bound cohorts,
            integrate live workshops, and distribute public subscription links with custom
            expiration dates.
          </p>

          <Link
            href="/instructor/trainings/new"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "var(--accent)" }}
          >
            <Plus size={15} />
            Create Training
          </Link>

          {/* Quick stats row */}
          <div className="flex items-center gap-6 mt-10 pt-8 w-full justify-center" style={{ borderTop: "1px solid var(--border-default)" }}>
            {[
              { icon: Calendar, label: "Cohorts", value: "0" },
              { icon: Users,    label: "Enrolled",  value: "0" },
              { icon: Zap,      label: "Active",     value: "0" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5">
                  <Icon size={13} style={{ color: "var(--text-muted)" }} />
                  <span className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{value}</span>
                </div>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Feature highlight cards */}
        <div>
          <p className="text-xs font-semibold mb-4 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            What you can build
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {FEATURE_CARDS.map(({ icon: Icon, color, title, desc }) => (
              <div
                key={title}
                className="group rounded-2xl p-5 flex flex-col gap-3 cursor-pointer transition-all shadow-sm"
                style={{
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--border-default)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = color + "60")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-default)")}
              >
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-xl"
                  style={{ backgroundColor: color + "18" }}
                >
                  <Icon size={18} style={{ color }} />
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>{title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-tertiary)" }}>{desc}</p>
                </div>
                <div className="flex items-center gap-1 mt-auto" style={{ color }}>
                  <span className="text-xs font-medium">Coming soon</span>
                  <ChevronRight size={12} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </InstructorPageShell>
  )
}
