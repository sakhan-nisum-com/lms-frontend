"use client"

import { useState } from "react"
import { X } from "lucide-react"
import type { Course } from "@/lib/data/courses"
import type { TrainingTrack } from "@/lib/data/trainings"

interface Props {
  courses: Course[]
  trainings: TrainingTrack[]
  initialScope?: string
  onClose: () => void
  onCreate: (scope: string, title: string, body: string, tags: string[]) => void
}

export function NewThreadModal({ courses, trainings, initialScope, onClose, onCreate }: Props) {
  const [scope, setScope] = useState(initialScope && initialScope !== "all" ? initialScope : "")
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [tagsInput, setTagsInput] = useState("")

  const isValid = scope !== "" && title.trim().length > 0 && body.trim().length > 0

  const handleSubmit = () => {
    if (!isValid) return
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
    onCreate(scope, title.trim(), body.trim(), tags)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.78)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-md rounded-2xl"
        style={{ backgroundColor: "#1E293B", border: "1px solid #334155", maxHeight: "92vh", overflowY: "auto" }}
      >
        <div className="flex items-center justify-between p-5 pb-4" style={{ borderBottom: "1px solid #334155" }}>
          <h2 className="text-base font-bold text-white">New Thread</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg"
            style={{ backgroundColor: "#334155", color: "#94A3B8" }}
          >
            <X size={15} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: "#94A3B8" }}>Course or Training</label>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ backgroundColor: "#0F172A", border: "1px solid #334155", color: "#F8FAFC" }}
            >
              <option value="" disabled>Select a course or training…</option>
              {courses.length > 0 && (
                <optgroup label="Courses">
                  {courses.map((c) => (
                    <option key={c.id} value={`course:${c.id}`}>{c.title}</option>
                  ))}
                </optgroup>
              )}
              {trainings.length > 0 && (
                <optgroup label="Trainings">
                  {trainings.map((t) => (
                    <option key={t.id} value={`training:${t.id}`}>{t.title}</option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: "#94A3B8" }}>Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your question or topic?"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ backgroundColor: "#0F172A", border: "1px solid #334155", color: "#F8FAFC" }}
            />
          </div>

          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: "#94A3B8" }}>Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="Add more detail…"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
              style={{ backgroundColor: "#0F172A", border: "1px solid #334155", color: "#F8FAFC" }}
            />
          </div>

          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: "#94A3B8" }}>Tags (optional, comma-separated)</label>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. server-components, ssr"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ backgroundColor: "#0F172A", border: "1px solid #334155", color: "#F8FAFC" }}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className="w-full py-3 rounded-xl text-sm font-bold disabled:opacity-40"
            style={{ backgroundColor: "#3B82F6", color: "#fff" }}
          >
            Post Thread
          </button>
        </div>
      </div>
    </div>
  )
}
