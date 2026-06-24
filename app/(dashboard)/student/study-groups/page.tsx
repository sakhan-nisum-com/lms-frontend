"use client"

import Link from "next/link"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { StudyGroupCard } from "@/components/study-groups/StudyGroupCard"
import { STUDENT_PROFILE } from "@/lib/data/courses"
import { TRAINING_TRACKS } from "@/lib/data/trainings"
import { useStudyGroups } from "@/lib/hooks/useStudyGroups"

export default function StudyGroupsPage() {
  const p = STUDENT_PROFILE
  const { groups, addMembers, removeMember } = useStudyGroups()

  const toggleJoin = (groupId: string, isMember: boolean) => {
    if (isMember) removeMember(groupId, p.id)
    else addMembers(groupId, [p.id])
  }

  return (
    <DashboardLayout role="student" userName={p.name}>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Study Groups</h1>
          <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>
            Collaborate with peers on your trainings, share notes, and learn together.
          </p>
        </div>

        {groups.length === 0 ? (
          <div className="rounded-2xl p-10 text-center" style={{ backgroundColor: "#1E293B", border: "1px dashed #334155" }}>
            <p className="text-sm" style={{ color: "#475569" }}>No study groups yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups.map((g) => {
              const training = TRAINING_TRACKS.find((t) => t.id === g.trainingId)
              const isMember = g.memberIds.includes(p.id)
              return (
                <div key={g.id} className="space-y-2">
                  <StudyGroupCard
                    group={g}
                    trainingTitle={training?.title}
                    isMember={isMember}
                    onToggleJoin={() => toggleJoin(g.id, isMember)}
                  />
                  {training && (
                    <Link href={`/student/trainings/${training.id}`} className="block text-xs font-medium px-1" style={{ color: "#3B82F6" }}>
                      View training →
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
