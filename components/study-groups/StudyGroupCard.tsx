"use client"

import { Users } from "lucide-react"
import type { StudyGroup } from "@/lib/data/studyGroups"

interface StudyGroupCardProps {
  group: StudyGroup
  trainingTitle?: string
  isMember: boolean
  onToggleJoin: () => void
}

export function StudyGroupCard({ group, trainingTitle, isMember, onToggleJoin }: StudyGroupCardProps) {
  return (
    <div className="rounded-2xl p-5" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
      <div className="flex items-center gap-3 mb-3">
        <div
          className="flex items-center justify-center w-12 h-12 rounded-xl text-2xl flex-shrink-0"
          style={{ backgroundColor: `${group.color}15` }}
        >
          {group.emoji}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-white truncate">{group.name}</p>
          {trainingTitle && <p className="text-xs truncate" style={{ color: "#64748B" }}>{trainingTitle}</p>}
        </div>
      </div>

      <p className="text-xs mb-3 leading-relaxed" style={{ color: "#94A3B8" }}>{group.description}</p>

      <div className="flex items-center justify-between text-xs mb-3" style={{ color: "#64748B" }}>
        <span className="flex items-center gap-1"><Users size={11} /> {group.memberIds.length} members</span>
        {group.nextMeeting && <span>Next: {group.nextMeeting}</span>}
      </div>

      <button
        onClick={onToggleJoin}
        className="w-full py-2 rounded-xl text-xs font-semibold"
        style={
          isMember
            ? { backgroundColor: "#334155", color: "#CBD5E1" }
            : { backgroundColor: `${group.color}20`, color: group.color }
        }
      >
        {isMember ? "Leave Group" : "Join Group"}
      </button>
    </div>
  )
}
