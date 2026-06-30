"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { TRAINING_TRACKS } from "@/lib/data/trainings"
import { STUDENT_DIRECTORY } from "@/lib/data/students"
import { useStudyGroups } from "@/lib/hooks/useStudyGroups"
import { Users, Plus, X, UserPlus } from "lucide-react"

const EMOJI_OPTIONS = ["👥", "📘", "💡", "🚀", "🔐", "🧠", "☁️", "🎯"]
const COLOR_OPTIONS = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EC4899", "#06B6D4"]

export default function TutorStudyGroupsPage() {
  const { groups, createGroup, addMembers, removeMember } = useStudyGroups()
  const [showForm, setShowForm] = useState(false)
  const [trainingId, setTrainingId] = useState(TRAINING_TRACKS[0]?.id ?? "")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [emoji, setEmoji] = useState(EMOJI_OPTIONS[0])
  const [color, setColor] = useState(COLOR_OPTIONS[0])
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([])
  const [addingToGroupId, setAddingToGroupId] = useState<string | null>(null)
  const [memberToAdd, setMemberToAdd] = useState("")

  const toggleSelectedMember = (id: string) => {
    setSelectedMemberIds((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]))
  }

  const resetForm = () => {
    setName("")
    setDescription("")
    setEmoji(EMOJI_OPTIONS[0])
    setColor(COLOR_OPTIONS[0])
    setSelectedMemberIds([])
    setTrainingId(TRAINING_TRACKS[0]?.id ?? "")
  }

  const handleCreate = () => {
    if (!name.trim() || !trainingId) return
    createGroup({
      trainingId,
      name: name.trim(),
      description: description.trim(),
      emoji,
      color,
      createdBy: "Sarah Chen",
      memberIds: selectedMemberIds,
    })
    resetForm()
    setShowForm(false)
  }

  const handleAddMember = (groupId: string) => {
    if (!memberToAdd) return
    addMembers(groupId, [memberToAdd])
    setMemberToAdd("")
    setAddingToGroupId(null)
  }

  return (
    <DashboardLayout role="tutor" userName="Sarah Chen">
      <div className="space-y-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Study Groups</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Create study groups for your trainings and manage who&apos;s in them.
            </p>
          </div>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--accent)" }}
          >
            <Plus size={16} /> {showForm ? "Cancel" : "Create Study Group"}
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <div className="rounded-2xl p-5 space-y-4 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text-secondary)" }}>Training</label>
                <select
                  value={trainingId}
                  onChange={(e) => setTrainingId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                >
                  {TRAINING_TRACKS.map((t) => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text-secondary)" }}>Group Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Capstone Prep Group"
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text-secondary)" }}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="What will this group focus on?"
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
                style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text-secondary)" }}>Icon</label>
                <div className="flex gap-1.5 flex-wrap">
                  {EMOJI_OPTIONS.map((e) => (
                    <button
                      key={e}
                      onClick={() => setEmoji(e)}
                      className="w-9 h-9 rounded-lg text-base flex items-center justify-center"
                      style={{ backgroundColor: emoji === e ? "#3B82F640" : "var(--bg-surface-muted)", border: `1px solid ${emoji === e ? "#3B82F6" : "var(--border-default)"}` }}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text-secondary)" }}>Color</label>
                <div className="flex gap-1.5 flex-wrap">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className="w-9 h-9 rounded-lg"
                      style={{ backgroundColor: c, border: `2px solid ${color === c ? "var(--text-primary)" : "transparent"}` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text-secondary)" }}>Add Members</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {STUDENT_DIRECTORY.map((s) => {
                  const selected = selectedMemberIds.includes(s.id)
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggleSelectedMember(s.id)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-left"
                      style={{ backgroundColor: selected ? "#3B82F620" : "var(--bg-surface-muted)", border: `1px solid ${selected ? "#3B82F6" : "var(--border-default)"}` }}
                    >
                      <span
                        className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: "var(--border-default)", color: "var(--text-secondary)" }}
                      >
                        {s.avatar}
                      </span>
                      <span className="text-xs truncate" style={{ color: selected ? "#3B82F6" : "var(--text-secondary)" }}>{s.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => { resetForm(); setShowForm(false) }}
                className="px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: "var(--border-default)", color: "var(--text-secondary)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!name.trim()}
                className="px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40"
                style={{ backgroundColor: "var(--accent)", color: "#fff" }}
              >
                Create Group
              </button>
            </div>
          </div>
        )}

        {/* Existing groups */}
        <div className="space-y-4">
          {groups.length === 0 ? (
            <div className="rounded-2xl p-10 text-center" style={{ backgroundColor: "var(--bg-surface)", border: "1px dashed var(--border-default)" }}>
              <Users size={36} className="mx-auto mb-3" style={{ color: "var(--border-default)" }} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No study groups yet. Create one above.</p>
            </div>
          ) : groups.map((g) => {
            const training = TRAINING_TRACKS.find((t) => t.id === g.trainingId)
            const members = STUDENT_DIRECTORY.filter((s) => g.memberIds.includes(s.id))
            const addableStudents = STUDENT_DIRECTORY.filter((s) => !g.memberIds.includes(s.id))
            const isAdding = addingToGroupId === g.id
            return (
              <div key={g.id} className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex items-center justify-center w-11 h-11 rounded-xl text-xl flex-shrink-0"
                      style={{ backgroundColor: `${g.color}15` }}
                    >
                      {g.emoji}
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{g.name}</p>
                      <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{training?.title ?? "Unknown training"}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: "var(--bg-surface-muted)", color: "var(--text-secondary)" }}>
                    {members.length} members
                  </span>
                </div>

                {g.description && <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>{g.description}</p>}

                <div className="flex flex-wrap gap-2 mb-3">
                  {members.map((m) => (
                    <span
                      key={m.id}
                      className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full text-xs"
                      style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}
                    >
                      <span
                        className="flex items-center justify-center w-5 h-5 rounded-full font-bold"
                        style={{ backgroundColor: "var(--border-default)", color: "var(--text-secondary)", fontSize: 9 }}
                      >
                        {m.avatar}
                      </span>
                      {m.name}
                      <button onClick={() => removeMember(g.id, m.id)} style={{ color: "var(--text-tertiary)" }}>
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                  {members.length === 0 && <span className="text-xs" style={{ color: "var(--text-muted)" }}>No members yet</span>}
                </div>

                {isAdding ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={memberToAdd}
                      onChange={(e) => setMemberToAdd(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg text-xs outline-none"
                      style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                    >
                      <option value="">Select a student…</option>
                      {addableStudents.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleAddMember(g.id)}
                      disabled={!memberToAdd}
                      className="px-3 py-2 rounded-lg text-xs font-semibold disabled:opacity-40"
                      style={{ backgroundColor: "var(--accent)", color: "#fff" }}
                    >
                      Add
                    </button>
                    <button
                      onClick={() => { setAddingToGroupId(null); setMemberToAdd("") }}
                      className="px-3 py-2 rounded-lg text-xs font-semibold"
                      style={{ backgroundColor: "var(--border-default)", color: "var(--text-secondary)" }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingToGroupId(g.id)}
                    disabled={addableStudents.length === 0}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-40"
                    style={{ backgroundColor: "var(--bg-surface-muted)", color: "var(--text-secondary)" }}
                  >
                    <UserPlus size={12} /> Add People
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}
