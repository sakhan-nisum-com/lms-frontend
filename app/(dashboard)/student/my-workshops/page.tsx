"use client"

import Link from "next/link"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { WorkshopCard } from "@/components/WorkshopCard"
import { WORKSHOPS } from "@/lib/data/workshops"
import { useWorkshopRegistrations } from "@/lib/hooks/useWorkshopRegistrations"
import { Wrench, Calendar, Clock, CalendarCheck } from "lucide-react"

export default function MyWorkshopsPage() {
  const { registeredIds, isRegistered, toggleRegistration } = useWorkshopRegistrations()

  const registered = WORKSHOPS
    .filter((w) => registeredIds.has(w.id))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const totalHours = registered.reduce((s, w) => s + parseInt(w.duration, 10), 0)
  const nextWorkshop = registered[0]

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>My Workshops</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              {registered.length} registered · {totalHours}h of live sessions
            </p>
          </div>
          <Link
            href="/student/workshops"
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg"
            style={{ backgroundColor: "var(--accent)", color: "#fff" }}
          >
            <Wrench size={15} /> Browse Workshops
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: "Registered", value: registered.length, icon: CalendarCheck, color: "#3B82F6" },
            { label: "Live Hours", value: `${totalHours}h`, icon: Clock, color: "#10B981" },
            { label: "Next Up", value: nextWorkshop ? new Date(nextWorkshop.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—", icon: Calendar, color: "#F59E0B" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-xl p-4 flex items-center gap-3 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}20` }}>
                <Icon size={16} style={{ color }} />
              </div>
              <div>
                <p className="text-lg font-black" style={{ color: "var(--text-primary)" }}>{value}</p>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Workshop cards */}
        {registered.length === 0 ? (
          <div className="rounded-2xl p-12 text-center shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px dashed var(--border-default)" }}>
            <Wrench size={36} className="mx-auto mb-3" style={{ color: "var(--border-default)" }} />
            <p className="text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>No workshops registered yet</p>
            <p className="text-xs mb-4" style={{ color: "var(--text-tertiary)" }}>Browse upcoming hands-on sessions and save your seat.</p>
            <Link
              href="/student/workshops"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ backgroundColor: "var(--accent)", color: "#fff" }}
            >
              <Wrench size={14} /> Browse Workshops
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-5">
            {registered.map((ws) => (
              <WorkshopCard
                key={ws.id}
                workshop={ws}
                isRegistered={isRegistered(ws.id)}
                onToggleRegister={() => toggleRegistration(ws.id)}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
