"use client"

import { useMemo, useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { TRAINING_TRACKS } from "@/lib/data/trainings"
import { STUDENT_DIRECTORY } from "@/lib/data/students"
import { useStudyGroups } from "@/lib/hooks/useStudyGroups"
import { Search, Users, Trash2, X, Layers } from "lucide-react"

export default function AdminStudyGroupsPage() {
  const { groups, removeMember, deleteGroup } = useStudyGroups()
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    return groups.filter((g) => {
      if (!search) return true
      const training = TRAINING_TRACKS.find((t) => t.id === g.trainingId)
      return (
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        training?.title.toLowerCase().includes(search.toLowerCase())
      )
    })
  }, [groups, search])

  const totalMembers = groups.reduce((sum, g) => sum + g.memberIds.length, 0)
  const avgSize = groups.length > 0 ? Math.round((totalMembers / groups.length) * 10) / 10 : 0

  const stats = [
    { label: "Total Study Groups", value: groups.length, icon: Layers, color: "#3B82F6" },
    { label: "Total Members", value: totalMembers, icon: Users, color: "#10B981" },
    { label: "Avg. Group Size", value: avgSize, icon: Users, color: "#F59E0B" },
  ]

  return (
    <DashboardLayout role="admin" userName="Morgan Patel">
      <div className="space-y-6 max-w-6xl">
        <div>
          <h1 className="text-2xl font-bold text-white">Study Groups</h1>
          <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>
            Oversight of every study group created across all trainings and instructors.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-2xl p-5" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
              <div className="flex items-center justify-center w-10 h-10 rounded-xl mb-3" style={{ backgroundColor: `${color}20` }}>
                <Icon size={20} style={{ color }} />
              </div>
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-xs mt-0.5" style={{ color: "#64748B" }}>{label}</div>
            </div>
          ))}
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#64748B" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by group or training..."
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg outline-none"
            style={{ backgroundColor: "#1E293B", border: "1px solid #334155", color: "#F8FAFC" }}
          />
        </div>

        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="rounded-2xl p-10 text-center" style={{ backgroundColor: "#1E293B", border: "1px dashed #334155" }}>
              <Users size={36} className="mx-auto mb-3" style={{ color: "#334155" }} />
              <p className="text-sm" style={{ color: "#475569" }}>No study groups match this search.</p>
            </div>
          ) : filtered.map((g) => {
            const training = TRAINING_TRACKS.find((t) => t.id === g.trainingId)
            const members = STUDENT_DIRECTORY.filter((s) => g.memberIds.includes(s.id))
            return (
              <div key={g.id} className="rounded-2xl p-5" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
                <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-11 h-11 rounded-xl text-xl flex-shrink-0" style={{ backgroundColor: `${g.color}15` }}>
                      {g.emoji}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{g.name}</p>
                      <p className="text-xs" style={{ color: "#64748B" }}>
                        {training?.title ?? "Unknown training"} · created by {g.createdBy}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#33415560", color: "#94A3B8" }}>
                      {members.length} members
                    </span>
                    <button
                      onClick={() => deleteGroup(g.id)}
                      title="Disband group"
                      className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg"
                      style={{ backgroundColor: "#EF444420", color: "#F87171" }}
                    >
                      <Trash2 size={12} /> Disband
                    </button>
                  </div>
                </div>

                {g.description && <p className="text-sm mb-3" style={{ color: "#94A3B8" }}>{g.description}</p>}

                <div className="flex flex-wrap gap-2">
                  {members.map((m) => (
                    <span
                      key={m.id}
                      className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full text-xs"
                      style={{ backgroundColor: "#0F172A", border: "1px solid #334155", color: "#CBD5E1" }}
                    >
                      <span className="flex items-center justify-center w-5 h-5 rounded-full font-bold" style={{ backgroundColor: "#334155", color: "#94A3B8", fontSize: 9 }}>
                        {m.avatar}
                      </span>
                      {m.name}
                      <button onClick={() => removeMember(g.id, m.id)} title="Remove member" style={{ color: "#64748B" }}>
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                  {members.length === 0 && <span className="text-xs" style={{ color: "#475569" }}>No members yet</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}
