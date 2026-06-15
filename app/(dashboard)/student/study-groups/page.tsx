import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { STUDENT_PROFILE } from "@/lib/data/courses"
import { Users } from "lucide-react"

const groups = [
  { id: "g1", name: "React & Next.js Study Circle", members: 12, course: "React & Next.js Masterclass", emoji: "⚛️", color: "#3B82F6", nextMeeting: "Jun 14 · 11:00 AM" },
  { id: "g2", name: "System Design Prep Group", members: 8, course: "System Design for Engineers", emoji: "🏗️", color: "#8B5CF6", nextMeeting: "Jun 14 · 11:00 AM" },
  { id: "g3", name: "TypeScript Deep Dives", members: 6, course: "TypeScript for Professionals", emoji: "🔷", color: "#2563EB", nextMeeting: "Jun 15 · 3:00 PM" },
]

export default function StudyGroupsPage() {
  const p = STUDENT_PROFILE
  return (
    <DashboardLayout role="student" userName={p.name}>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Study Groups</h1>
          <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>
            Collaborate with peers, share notes, and learn together.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((g) => (
            <div key={g.id} className="rounded-2xl p-5" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl text-2xl" style={{ backgroundColor: `${g.color}15` }}>
                  {g.emoji}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{g.name}</p>
                  <p className="text-xs" style={{ color: "#64748B" }}>{g.course}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs" style={{ color: "#64748B" }}>
                <span className="flex items-center gap-1"><Users size={11} /> {g.members} members</span>
                <span>Next: {g.nextMeeting}</span>
              </div>
              <button
                className="w-full mt-3 py-2 rounded-xl text-xs font-semibold"
                style={{ backgroundColor: `${g.color}20`, color: g.color }}
              >
                Join Group
              </button>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
