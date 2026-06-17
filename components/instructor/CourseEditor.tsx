"use client"

import { useEffect, useRef, useState } from "react"
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Pencil,
  Video,
  FileText,
  HelpCircle,
  Eye,
  EyeOff,
  Film,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading2,
} from "lucide-react"
import type { Section, Lesson, QuizQuestion } from "@/lib/data/instructor-courses"

export interface CourseForm {
  title: string
  subtitle: string
  description: string
  category: string
  level: string
  language: string
  color: string
  isFree: boolean
  price: string
  originalPrice: string
  enrollmentType: "open" | "invite"
  hasMaxStudents: boolean
  maxStudents: string
  status: "draft" | "published" | "review"
  featured: boolean
  commentsEnabled: boolean
  certificate: boolean
  sections: Section[]
}

interface CourseEditorProps {
  initialForm: CourseForm
  mode: "new" | "edit"
}

const TABS = ["Details", "Curriculum", "Pricing", "Settings"]

const CATEGORIES = [
  "Software Engineering",
  "Design & UX",
  "Cloud & DevOps",
  "Data Science",
  "Business",
  "Marketing",
  "Photography",
  "Music",
]

const LEVELS = ["Beginner", "Intermediate", "Advanced", "All Levels"]

const LESSON_TYPE_META: Record<Lesson["type"], { icon: typeof Video; color: string }> = {
  video: { icon: Video, color: "#3B82F6" },
  text: { icon: FileText, color: "#10B981" },
  quiz: { icon: HelpCircle, color: "#8B5CF6" },
}

const LESSON_TYPE_ACTIONS: { type: Lesson["type"]; icon: typeof Video; label: string; color: string }[] = [
  { type: "video", icon: Video, label: "Upload Video", color: "#3B82F6" },
  { type: "text", icon: FileText, label: "Write Text", color: "#10B981" },
  { type: "quiz", icon: HelpCircle, label: "Create Quiz", color: "#8B5CF6" },
]

const RICH_TEXT_TOOLS: { command: string; arg?: string; icon: typeof Bold; title: string }[] = [
  { command: "bold", icon: Bold, title: "Bold" },
  { command: "italic", icon: Italic, title: "Italic" },
  { command: "underline", icon: Underline, title: "Underline" },
  { command: "formatBlock", arg: "H2", icon: Heading2, title: "Heading" },
  { command: "insertUnorderedList", icon: List, title: "Bullet list" },
  { command: "insertOrderedList", icon: ListOrdered, title: "Numbered list" },
]

const STATUS_OPTIONS = [
  { value: "draft" as const,     label: "Draft",       desc: "Only visible to you — not yet listed for students.",       color: "#64748B" },
  { value: "review" as const,    label: "In Review",   desc: "Submitted for platform review before publishing.",          color: "#F59E0B" },
  { value: "published" as const, label: "Published",   desc: "Live and discoverable by students.",                        color: "#10B981" },
]

// ── Shared helpers ────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="relative inline-flex items-center w-11 h-6 rounded-full transition-colors flex-shrink-0"
      style={{ backgroundColor: checked ? "#3B82F6" : "#334155" }}
    >
      <span
        className="inline-block w-4 h-4 bg-white rounded-full transition-transform"
        style={{ transform: checked ? "translateX(24px)" : "translateX(4px)" }}
      />
    </button>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold mb-1.5" style={{ color: "#94A3B8" }}>
      {children}
    </label>
  )
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none placeholder-slate-600"
      style={{ backgroundColor: "#0F172A", border: "1px solid #334155", color: "#F8FAFC" }}
      onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
      onBlur={(e) => (e.currentTarget.style.borderColor = "#334155")}
    />
  )
}

function RichTextEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (editorRef.current && !initialized.current) {
      editorRef.current.innerHTML = value
      initialized.current = true
    }
  }, [value])

  function exec(command: string, arg?: string) {
    editorRef.current?.focus()
    document.execCommand(command, false, arg)
    onChange(editorRef.current?.innerHTML ?? "")
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #334155" }}>
      <div
        className="flex items-center gap-1 px-2 py-1.5 flex-wrap"
        style={{ backgroundColor: "#1E293B", borderBottom: "1px solid #334155" }}
      >
        {RICH_TEXT_TOOLS.map(({ command, arg, icon: Icon, title }) => (
          <button
            key={command + (arg ?? "")}
            type="button"
            title={title}
            onMouseDown={(e) => {
              e.preventDefault()
              exec(command, arg)
            }}
            className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
            style={{ color: "#94A3B8" }}
          >
            <Icon size={13} />
          </button>
        ))}
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(editorRef.current?.innerHTML ?? "")}
        className="px-3 py-3 text-sm outline-none min-h-[140px] max-h-[320px] overflow-y-auto"
        style={{ color: "#F8FAFC", backgroundColor: "#0F172A" }}
      />
    </div>
  )
}

function QuizNumberInput({
  label,
  value,
  onChange,
  placeholder,
  caption,
  max,
}: {
  label: string
  value: number | undefined
  onChange: (v: number | undefined) => void
  placeholder?: string
  caption?: string
  max?: number
}) {
  return (
    <div className="max-w-[260px]">
      <FieldLabel>{label}</FieldLabel>
      <input
        type="number"
        min={1}
        max={max}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg text-sm outline-none"
        style={{ backgroundColor: "#0F172A", border: "1px solid #334155", color: "#F8FAFC" }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "#8B5CF6")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "#334155")}
      />
      {caption && (
        <p className="text-xs mt-1" style={{ color: "#475569" }}>
          {caption}
        </p>
      )}
    </div>
  )
}

// ── Details Tab ───────────────────────────────────────────────────────────────

function DetailsTab({ form, onChange }: { form: CourseForm; onChange: (f: CourseForm) => void }) {
  const set = (key: keyof CourseForm) => (val: string) => onChange({ ...form, [key]: val })

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <FieldLabel>
          Course Title <span style={{ color: "#EF4444" }}>*</span>
        </FieldLabel>
        <TextInput value={form.title} onChange={set("title")} placeholder="e.g. React & TypeScript Masterclass" />
      </div>

      <div>
        <FieldLabel>Subtitle</FieldLabel>
        <TextInput value={form.subtitle} onChange={set("subtitle")} placeholder="A brief tagline for your course" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <FieldLabel>Description</FieldLabel>
          <span className="text-xs" style={{ color: "#475569" }}>
            {form.description.length}/2000
          </span>
        </div>
        <textarea
          value={form.description}
          onChange={(e) => onChange({ ...form, description: e.target.value.slice(0, 2000) })}
          rows={5}
          placeholder="Describe what students will learn, who it's for, and what they'll need..."
          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none placeholder-slate-600"
          style={{ backgroundColor: "#0F172A", border: "1px solid #334155", color: "#F8FAFC" }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#334155")}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <FieldLabel>Category</FieldLabel>
          <select
            value={form.category}
            onChange={(e) => onChange({ ...form, category: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none appearance-none"
            style={{ backgroundColor: "#0F172A", border: "1px solid #334155", color: form.category ? "#F8FAFC" : "#475569" }}
          >
            <option value="">Select category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <FieldLabel>Language</FieldLabel>
          <TextInput value={form.language} onChange={set("language")} placeholder="English" />
        </div>
      </div>

      <div>
        <FieldLabel>Level</FieldLabel>
        <div className="flex items-center gap-2 flex-wrap">
          {LEVELS.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => onChange({ ...form, level: l })}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors"
              style={{
                backgroundColor: form.level === l ? "#3B82F620" : "#1E293B",
                color: form.level === l ? "#60A5FA" : "#64748B",
                border: `1px solid ${form.level === l ? "#3B82F640" : "#334155"}`,
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}

// ── Curriculum Tab ────────────────────────────────────────────────────────────

function CurriculumTab({ form, onChange }: { form: CourseForm; onChange: (f: CourseForm) => void }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [quizEditorId, setQuizEditorId] = useState<string | null>(null)
  const [textEditorId, setTextEditorId] = useState<string | null>(null)
  const [uploadTarget, setUploadTarget] = useState<{ sectionId: string; lessonId: string } | null>(null)
  const [uploadProgress, setUploadProgress] = useState<{ lessonId: string; percent: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function startEdit(id: string, title: string) {
    setEditingId(id)
    setEditValue(title)
  }

  function commitEdit() {
    if (!editingId) return
    const val = editValue.trim()
    if (!val) { setEditingId(null); return }
    onChange({
      ...form,
      sections: form.sections.map((s) => {
        if (s.id === editingId) return { ...s, title: val }
        return { ...s, lessons: s.lessons.map((l) => (l.id === editingId ? { ...l, title: val } : l)) }
      }),
    })
    setEditingId(null)
  }

  function updateSections(sections: Section[]) {
    onChange({ ...form, sections })
  }

  function toggleSection(id: string) {
    updateSections(form.sections.map((s) => (s.id === id ? { ...s, expanded: !s.expanded } : s)))
  }

  function moveSectionUp(id: string) {
    const idx = form.sections.findIndex((s) => s.id === id)
    if (idx <= 0) return
    const copy = [...form.sections]
    ;[copy[idx - 1], copy[idx]] = [copy[idx], copy[idx - 1]]
    updateSections(copy)
  }

  function moveSectionDown(id: string) {
    const idx = form.sections.findIndex((s) => s.id === id)
    if (idx < 0 || idx >= form.sections.length - 1) return
    const copy = [...form.sections]
    ;[copy[idx], copy[idx + 1]] = [copy[idx + 1], copy[idx]]
    updateSections(copy)
  }

  function removeSection(id: string) {
    updateSections(form.sections.filter((s) => s.id !== id))
  }

  function addSection() {
    const id = `s-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    const title = `Section ${form.sections.length + 1}`
    updateSections([...form.sections, { id, title, expanded: true, lessons: [] }])
    setTimeout(() => startEdit(id, title), 50)
  }

  function addLesson(sectionId: string) {
    const id = `l-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    onChange({
      ...form,
      sections: form.sections.map((s) =>
        s.id === sectionId
          ? { ...s, lessons: [...s.lessons, { id, title: "New Lesson", type: "video", duration: "", isPreview: false }] }
          : s
      ),
    })
    setTimeout(() => startEdit(id, "New Lesson"), 50)
  }

  function removeLesson(sectionId: string, lessonId: string) {
    onChange({
      ...form,
      sections: form.sections.map((s) =>
        s.id === sectionId ? { ...s, lessons: s.lessons.filter((l) => l.id !== lessonId) } : s
      ),
    })
  }

  function moveLessonUp(sectionId: string, lessonId: string) {
    onChange({
      ...form,
      sections: form.sections.map((s) => {
        if (s.id !== sectionId) return s
        const idx = s.lessons.findIndex((l) => l.id === lessonId)
        if (idx <= 0) return s
        const copy = [...s.lessons]
        ;[copy[idx - 1], copy[idx]] = [copy[idx], copy[idx - 1]]
        return { ...s, lessons: copy }
      }),
    })
  }

  function moveLessonDown(sectionId: string, lessonId: string) {
    onChange({
      ...form,
      sections: form.sections.map((s) => {
        if (s.id !== sectionId) return s
        const idx = s.lessons.findIndex((l) => l.id === lessonId)
        if (idx < 0 || idx >= s.lessons.length - 1) return s
        const copy = [...s.lessons]
        ;[copy[idx], copy[idx + 1]] = [copy[idx + 1], copy[idx]]
        return { ...s, lessons: copy }
      }),
    })
  }

  function updateLesson(sectionId: string, lessonId: string, updates: Partial<Lesson>) {
    onChange({
      ...form,
      sections: form.sections.map((s) =>
        s.id === sectionId
          ? { ...s, lessons: s.lessons.map((l) => (l.id === lessonId ? { ...l, ...updates } : l)) }
          : s
      ),
    })
  }

  function selectLessonType(sectionId: string, lessonId: string, type: Lesson["type"]) {
    if (uploadProgress?.lessonId === lessonId) return
    updateLesson(sectionId, lessonId, { type })
    if (type === "video") {
      setUploadTarget({ sectionId, lessonId })
      fileInputRef.current?.click()
    } else if (type === "text") {
      setTextEditorId((prev) => (prev === lessonId ? null : lessonId))
    } else {
      setQuizEditorId((prev) => (prev === lessonId ? null : lessonId))
    }
  }

  function handleVideoFileSelected(file: File | undefined) {
    const target = uploadTarget
    setUploadTarget(null)
    if (!file || !target) return

    const { sectionId, lessonId } = target
    setUploadProgress({ lessonId, percent: 0 })

    let percent = 0
    const interval = setInterval(() => {
      percent = Math.min(100, percent + Math.random() * 18 + 7)
      if (percent >= 100) {
        clearInterval(interval)
        const url = URL.createObjectURL(file)
        updateLesson(sectionId, lessonId, { videoFileName: file.name, videoUrl: url })
        setUploadProgress({ lessonId, percent: 100 })
        setTimeout(() => setUploadProgress(null), 400)
      } else {
        setUploadProgress({ lessonId, percent: Math.round(percent) })
      }
    }, 180)
  }

  function updateQuestions(sectionId: string, lessonId: string, questions: QuizQuestion[]) {
    updateLesson(sectionId, lessonId, { questions })
  }

  function addQuestion(sectionId: string, lessonId: string, current: QuizQuestion[]) {
    const id = `q-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`
    updateQuestions(sectionId, lessonId, [
      ...current,
      { id, question: "New question", options: ["Option A", "Option B", "Option C", "Option D"], correctIndex: 0 },
    ])
  }

  function removeQuestion(sectionId: string, lessonId: string, current: QuizQuestion[], qId: string) {
    updateQuestions(sectionId, lessonId, current.filter((q) => q.id !== qId))
  }

  function patchQuestion(sectionId: string, lessonId: string, current: QuizQuestion[], qId: string, patch: Partial<QuizQuestion>) {
    updateQuestions(sectionId, lessonId, current.map((q) => (q.id === qId ? { ...q, ...patch } : q)))
  }

  const totalLessons = form.sections.reduce((sum, s) => sum + s.lessons.length, 0)

  return (
    <div className="space-y-3 max-w-3xl">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          handleVideoFileSelected(e.target.files?.[0])
          e.target.value = ""
        }}
      />

      <p className="text-xs pb-1" style={{ color: "#64748B" }}>
        {form.sections.length} section{form.sections.length !== 1 ? "s" : ""} · {totalLessons} lesson{totalLessons !== 1 ? "s" : ""}
      </p>

      {form.sections.map((section, si) => (
        <div
          key={section.id}
          className="rounded-2xl overflow-hidden"
          style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
        >
          {/* Section header */}
          <div
            className="flex items-center gap-3 px-4 py-3"
            style={{ borderBottom: section.expanded && section.lessons.length > 0 ? "1px solid #334155" : "none" }}
          >
            <button
              type="button"
              onClick={() => toggleSection(section.id)}
              className="flex-shrink-0 p-1 rounded-lg hover:bg-white/5 transition-colors"
              style={{ color: "#64748B" }}
            >
              <ChevronDown
                size={15}
                style={{
                  transform: section.expanded ? "rotate(0deg)" : "rotate(-90deg)",
                  transition: "transform 0.2s",
                }}
              />
            </button>

            {/* Title inline edit */}
            <div className="flex-1 min-w-0 group flex items-center gap-2">
              {editingId === section.id ? (
                <input
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={commitEdit}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitEdit()
                    if (e.key === "Escape") setEditingId(null)
                  }}
                  className="flex-1 bg-transparent outline-none text-sm font-semibold text-white border-b"
                  style={{ borderColor: "#3B82F6" }}
                />
              ) : (
                <>
                  <span
                    className="text-sm font-semibold text-white cursor-text truncate"
                    onClick={() => startEdit(section.id, section.title)}
                  >
                    {section.title}
                  </span>
                  <Pencil
                    size={11}
                    className="opacity-0 group-hover:opacity-100 flex-shrink-0 cursor-pointer transition-opacity"
                    style={{ color: "#475569" }}
                    onClick={() => startEdit(section.id, section.title)}
                  />
                </>
              )}
            </div>

            <span className="text-xs flex-shrink-0" style={{ color: "#475569" }}>
              {section.lessons.length} lesson{section.lessons.length !== 1 ? "s" : ""}
            </span>

            <div className="flex items-center gap-0.5 flex-shrink-0">
              <button
                type="button"
                onClick={() => moveSectionUp(section.id)}
                disabled={si === 0}
                className="p-1 rounded hover:bg-white/5 transition-colors disabled:opacity-20"
                style={{ color: "#64748B" }}
              >
                <ChevronUp size={13} />
              </button>
              <button
                type="button"
                onClick={() => moveSectionDown(section.id)}
                disabled={si === form.sections.length - 1}
                className="p-1 rounded hover:bg-white/5 transition-colors disabled:opacity-20"
                style={{ color: "#64748B" }}
              >
                <ChevronDown size={13} />
              </button>
              <button
                type="button"
                onClick={() => removeSection(section.id)}
                className="p-1 rounded transition-colors"
                style={{ color: "#64748B" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#64748B")}
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          {/* Lessons */}
          {section.expanded && (
            <div>
              {section.lessons.map((lesson, li) => {
                const questions = lesson.questions ?? []
                const quizOpen = quizEditorId === lesson.id
                const textOpen = textEditorId === lesson.id
                const isUploadingThis = uploadProgress?.lessonId === lesson.id
                const TypeIcon = LESSON_TYPE_META[lesson.type].icon
                return (
                  <div key={lesson.id} style={{ borderBottom: li < section.lessons.length - 1 ? "1px solid #0F172A" : "none" }}>
                    {/* Lesson row */}
                    <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.02] transition-colors">
                      {/* Type icon (decorative) */}
                      <TypeIcon size={14} style={{ color: LESSON_TYPE_META[lesson.type].color, flexShrink: 0 }} />

                      {/* Lesson title inline edit */}
                      <div className="flex-1 min-w-0 group flex items-center gap-2">
                        {editingId === lesson.id ? (
                          <input
                            autoFocus
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={commitEdit}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") commitEdit()
                              if (e.key === "Escape") setEditingId(null)
                            }}
                            className="flex-1 bg-transparent outline-none text-sm text-white border-b"
                            style={{ borderColor: "#3B82F6" }}
                          />
                        ) : (
                          <>
                            <span
                              className="text-sm text-white truncate cursor-text"
                              onClick={() => startEdit(lesson.id, lesson.title)}
                            >
                              {lesson.title}
                            </span>
                            <Pencil
                              size={10}
                              className="opacity-0 group-hover:opacity-100 flex-shrink-0 cursor-pointer transition-opacity"
                              style={{ color: "#475569" }}
                              onClick={() => startEdit(lesson.id, lesson.title)}
                            />
                          </>
                        )}
                      </div>

                      {/* Duration (video only) */}
                      {lesson.type === "video" && (
                        <input
                          value={lesson.duration}
                          onChange={(e) => updateLesson(section.id, lesson.id, { duration: e.target.value })}
                          placeholder="00:00"
                          className="w-16 px-2 py-1 rounded-lg text-xs text-center bg-transparent outline-none flex-shrink-0"
                          style={{ border: "1px solid #334155", color: "#94A3B8" }}
                          onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
                          onBlur={(e) => (e.currentTarget.style.borderColor = "#334155")}
                        />
                      )}

                      {/* Preview toggle */}
                      <button
                        type="button"
                        title={lesson.isPreview ? "Preview on" : "Preview off"}
                        onClick={() => updateLesson(section.id, lesson.id, { isPreview: !lesson.isPreview })}
                        className="p-1.5 rounded-lg transition-colors flex-shrink-0"
                        style={{ color: lesson.isPreview ? "#3B82F6" : "#334155" }}
                      >
                        {lesson.isPreview ? <Eye size={13} /> : <EyeOff size={13} />}
                      </button>

                      {/* Reorder + delete */}
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => moveLessonUp(section.id, lesson.id)}
                          disabled={li === 0}
                          className="p-1 rounded hover:bg-white/5 transition-colors disabled:opacity-20"
                          style={{ color: "#64748B" }}
                        >
                          <ChevronUp size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveLessonDown(section.id, lesson.id)}
                          disabled={li === section.lessons.length - 1}
                          className="p-1 rounded hover:bg-white/5 transition-colors disabled:opacity-20"
                          style={{ color: "#64748B" }}
                        >
                          <ChevronDown size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeLesson(section.id, lesson.id)}
                          className="p-1 rounded transition-colors"
                          style={{ color: "#64748B" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#64748B")}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Type action buttons + meta */}
                    <div className="flex items-center gap-2 px-4 pb-2.5 flex-wrap">
                      {LESSON_TYPE_ACTIONS.map(({ type, icon: Icon, label, color }) => {
                        const active = lesson.type === type
                        return (
                          <button
                            key={type}
                            type="button"
                            disabled={isUploadingThis}
                            onClick={() => selectLessonType(section.id, lesson.id, type)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{
                              backgroundColor: active ? `${color}20` : "#0F172A",
                              color: active ? color : "#64748B",
                              border: `1px solid ${active ? `${color}40` : "#334155"}`,
                            }}
                          >
                            <Icon size={12} />
                            {type === "video" && isUploadingThis ? "Uploading…" : label}
                          </button>
                        )
                      })}

                      {lesson.type === "video" && !isUploadingThis && lesson.videoFileName && (
                        <span
                          className="flex items-center gap-1 text-xs truncate max-w-[180px]"
                          style={{ color: "#475569" }}
                          title={lesson.videoFileName}
                        >
                          <Film size={11} className="flex-shrink-0" />
                          {lesson.videoFileName}
                        </span>
                      )}
                      {lesson.type === "quiz" && (
                        <span className="text-xs" style={{ color: "#8B5CF6" }}>
                          {questions.length} question{questions.length !== 1 ? "s" : ""}
                        </span>
                      )}
                      {lesson.type === "text" && (
                        <span className="text-xs" style={{ color: "#475569" }}>
                          {lesson.textContent && lesson.textContent.replace(/<[^>]*>/g, "").trim().length > 0
                            ? "Content saved"
                            : "No content yet"}
                        </span>
                      )}
                    </div>

                    {/* Video upload progress */}
                    {isUploadingThis && (
                      <div className="px-4 pb-3">
                        <div className="flex justify-between mb-1 text-xs" style={{ color: "#64748B" }}>
                          <span>Uploading video…</span>
                          <span>{uploadProgress!.percent}%</span>
                        </div>
                        <div className="h-1.5 rounded-full" style={{ backgroundColor: "#334155" }}>
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${uploadProgress!.percent}%`, backgroundColor: "#3B82F6" }}
                          />
                        </div>
                      </div>
                    )}

                    {/* ── Inline Rich Text Editor ── */}
                    {lesson.type === "text" && textOpen && (
                      <div className="px-4 pb-4" style={{ backgroundColor: "#0F172A", borderTop: "1px solid #334155" }}>
                        <p className="text-xs font-semibold mb-2 pt-3" style={{ color: "#10B981" }}>
                          Lesson Content
                        </p>
                        <RichTextEditor
                          value={lesson.textContent ?? ""}
                          onChange={(html) => updateLesson(section.id, lesson.id, { textContent: html })}
                        />
                      </div>
                    )}

                    {/* ── Inline Quiz Builder ── */}
                    {lesson.type === "quiz" && quizOpen && (
                      <div className="px-4 pt-3 pb-4 space-y-3" style={{ backgroundColor: "#0F172A", borderTop: "1px solid #334155" }}>
                        {/* Quiz Settings */}
                        <div className="rounded-xl p-4 space-y-4" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
                          <p className="text-xs font-semibold" style={{ color: "#8B5CF6" }}>
                            Quiz Settings
                          </p>

                          {/* Question mode: fixed vs bank */}
                          <div>
                            <FieldLabel>Question Mode</FieldLabel>
                            <div className="flex items-center gap-1 p-1 rounded-xl w-fit" style={{ backgroundColor: "#0F172A" }}>
                              {(
                                [
                                  { key: "fixed" as const, label: "Fixed Questions" },
                                  { key: "bank" as const, label: "Question Bank" },
                                ]
                              ).map(({ key, label }) => {
                                const active = (lesson.quizMode ?? "fixed") === key
                                return (
                                  <button
                                    key={key}
                                    type="button"
                                    onClick={() => updateLesson(section.id, lesson.id, { quizMode: key })}
                                    className="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                    style={{
                                      backgroundColor: active ? "#8B5CF6" : "transparent",
                                      color: active ? "#FFFFFF" : "#64748B",
                                    }}
                                  >
                                    {label}
                                  </button>
                                )
                              })}
                            </div>
                            <p className="text-xs mt-1.5" style={{ color: "#475569" }}>
                              {(lesson.quizMode ?? "fixed") === "bank"
                                ? "Randomly pick a set number of questions from the pool below each time a student takes this quiz."
                                : "Show every question below, in order, each time a student takes this quiz."}
                            </p>
                          </div>

                          {(lesson.quizMode ?? "fixed") === "bank" && (
                            <QuizNumberInput
                              label="Random questions to show"
                              value={lesson.randomQuestionCount}
                              onChange={(v) => updateLesson(section.id, lesson.id, { randomQuestionCount: v })}
                              placeholder={questions.length ? `e.g. ${Math.min(5, questions.length)}` : "e.g. 5"}
                              max={questions.length || undefined}
                              caption={`Pool has ${questions.length} question${questions.length !== 1 ? "s" : ""} total.`}
                            />
                          )}

                          {/* Mandatory toggle */}
                          <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid #334155" }}>
                            <div>
                              <p className="text-sm font-medium text-white">Mandatory Quiz</p>
                              <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>
                                Require a minimum score before the student can move to the next lesson.
                              </p>
                            </div>
                            <Toggle
                              checked={lesson.isMandatory ?? false}
                              onChange={() => updateLesson(section.id, lesson.id, { isMandatory: !(lesson.isMandatory ?? false) })}
                            />
                          </div>

                          {lesson.isMandatory && (
                            <QuizNumberInput
                              label="Minimum correct answers to pass"
                              value={lesson.minCorrectToPass}
                              onChange={(v) => updateLesson(section.id, lesson.id, { minCorrectToPass: v })}
                              placeholder="e.g. 3"
                              max={(lesson.quizMode === "bank" ? lesson.randomQuestionCount : questions.length) || undefined}
                              caption={`Out of ${lesson.quizMode === "bank" ? lesson.randomQuestionCount ?? "?" : questions.length} question${questions.length !== 1 ? "s" : ""} shown.`}
                            />
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold" style={{ color: "#8B5CF6" }}>
                            Quiz Questions
                          </p>
                          <button
                            type="button"
                            onClick={() => addQuestion(section.id, lesson.id, questions)}
                            className="flex items-center gap-1 text-xs font-medium transition-colors hover:opacity-80"
                            style={{ color: "#8B5CF6" }}
                          >
                            <Plus size={12} /> Add Question
                          </button>
                        </div>

                        {questions.length === 0 && (
                          <p className="text-xs py-4 text-center" style={{ color: "#475569" }}>
                            No questions yet. Click &ldquo;Add Question&rdquo; to start.
                          </p>
                        )}

                        {questions.map((q, qi) => (
                          <div
                            key={q.id}
                            className="rounded-xl p-4 space-y-3"
                            style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
                          >
                            {/* Question header */}
                            <div className="flex items-start gap-2">
                              <span
                                className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold mt-0.5"
                                style={{ backgroundColor: "#8B5CF620", color: "#A78BFA" }}
                              >
                                {qi + 1}
                              </span>
                              <textarea
                                value={q.question}
                                onChange={(e) => patchQuestion(section.id, lesson.id, questions, q.id, { question: e.target.value })}
                                rows={2}
                                placeholder="Enter question text..."
                                className="flex-1 bg-transparent outline-none text-sm text-white resize-none placeholder-slate-600"
                                style={{ borderBottom: "1px solid #334155" }}
                                onFocus={(e) => (e.currentTarget.style.borderColor = "#8B5CF6")}
                                onBlur={(e) => (e.currentTarget.style.borderColor = "#334155")}
                              />
                              <button
                                type="button"
                                onClick={() => removeQuestion(section.id, lesson.id, questions, q.id)}
                                className="p-1 rounded transition-colors flex-shrink-0"
                                style={{ color: "#475569" }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
                                onMouseLeave={(e) => (e.currentTarget.style.color = "#475569")}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>

                            {/* Options */}
                            <div className="space-y-2 pl-7">
                              {q.options.map((opt, oi) => (
                                <div key={oi} className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => patchQuestion(section.id, lesson.id, questions, q.id, { correctIndex: oi })}
                                    className="flex-shrink-0 w-4 h-4 rounded-full border-2 transition-all"
                                    style={{
                                      borderColor: q.correctIndex === oi ? "#10B981" : "#334155",
                                      backgroundColor: q.correctIndex === oi ? "#10B981" : "transparent",
                                    }}
                                    title="Mark as correct answer"
                                  />
                                  <span className="text-xs font-medium w-5 flex-shrink-0" style={{ color: "#475569" }}>
                                    {String.fromCharCode(65 + oi)}
                                  </span>
                                  <input
                                    value={opt}
                                    onChange={(e) => {
                                      const opts = [...q.options]
                                      opts[oi] = e.target.value
                                      patchQuestion(section.id, lesson.id, questions, q.id, { options: opts })
                                    }}
                                    placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                                    className="flex-1 bg-transparent outline-none text-xs placeholder-slate-600"
                                    style={{
                                      color: q.correctIndex === oi ? "#6EE7B7" : "#94A3B8",
                                      borderBottom: "1px solid transparent",
                                    }}
                                    onFocus={(e) => (e.currentTarget.style.borderColor = "#334155")}
                                    onBlur={(e) => (e.currentTarget.style.borderColor = "transparent")}
                                  />
                                  {q.correctIndex === oi && (
                                    <span className="text-xs flex-shrink-0" style={{ color: "#10B981" }}>✓</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Add lesson button */}
              <div className="px-4 py-2.5" style={{ borderTop: section.lessons.length > 0 ? "1px solid #334155" : "none" }}>
                <button
                  type="button"
                  onClick={() => addLesson(section.id)}
                  className="flex items-center gap-1.5 text-xs font-medium transition-colors hover:opacity-80"
                  style={{ color: "#3B82F6" }}
                >
                  <Plus size={13} /> Add Lesson
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Add section */}
      <button
        type="button"
        onClick={addSection}
        className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-2xl text-sm font-medium transition-all"
        style={{ backgroundColor: "transparent", border: "1px dashed #334155", color: "#64748B" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#3B82F6"
          e.currentTarget.style.color = "#3B82F6"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#334155"
          e.currentTarget.style.color = "#64748B"
        }}
      >
        <Plus size={14} /> Add Section
      </button>
    </div>
  )
}

// ── Pricing Tab ───────────────────────────────────────────────────────────────

function PricingTab({ form, onChange }: { form: CourseForm; onChange: (f: CourseForm) => void }) {
  return (
    <div className="space-y-6 max-w-2xl">
      {/* Free / Paid toggle */}
      <div>
        <FieldLabel>Course Price</FieldLabel>
        <div className="flex items-center gap-1 p-1 rounded-xl w-fit" style={{ backgroundColor: "#1E293B" }}>
          {["Free", "Paid"].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange({ ...form, isFree: opt === "Free" })}
              className="px-5 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: (opt === "Free") === form.isFree ? "#334155" : "transparent",
                color: (opt === "Free") === form.isFree ? "#F8FAFC" : "#64748B",
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {!form.isFree && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel>Price (USD)</FieldLabel>
            <TextInput value={form.price} onChange={(v) => onChange({ ...form, price: v })} placeholder="29.99" type="number" />
          </div>
          <div>
            <FieldLabel>Original Price (optional)</FieldLabel>
            <TextInput
              value={form.originalPrice}
              onChange={(v) => onChange({ ...form, originalPrice: v })}
              placeholder="59.99"
              type="number"
            />
            <p className="text-xs mt-1.5" style={{ color: "#475569" }}>
              Shown as strikethrough if higher than price.
            </p>
          </div>
        </div>
      )}

      {/* Enrollment type */}
      <div>
        <FieldLabel>Enrollment</FieldLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { key: "open" as const,   label: "Open",         desc: "Anyone can enroll immediately" },
            { key: "invite" as const, label: "Invite Only",  desc: "Students need an invite link" },
          ].map(({ key, label, desc }) => (
            <button
              key={key}
              type="button"
              onClick={() => onChange({ ...form, enrollmentType: key })}
              className="flex items-start gap-3 p-4 rounded-xl text-left transition-all"
              style={{
                backgroundColor: "#1E293B",
                border: `1px solid ${form.enrollmentType === key ? "#3B82F6" : "#334155"}`,
              }}
            >
              <div
                className="w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5"
                style={{
                  borderColor: form.enrollmentType === key ? "#3B82F6" : "#475569",
                  backgroundColor: form.enrollmentType === key ? "#3B82F6" : "transparent",
                }}
              />
              <div>
                <p className="text-sm font-medium text-white">{label}</p>
                <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Max students */}
      <div
        className="flex items-center justify-between p-4 rounded-xl"
        style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
      >
        <div>
          <p className="text-sm font-medium text-white">Limit enrollment</p>
          <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>
            Cap the maximum number of students who can enroll.
          </p>
        </div>
        <Toggle checked={form.hasMaxStudents} onChange={() => onChange({ ...form, hasMaxStudents: !form.hasMaxStudents })} />
      </div>

      {form.hasMaxStudents && (
        <div>
          <FieldLabel>Max Students</FieldLabel>
          <TextInput
            value={form.maxStudents}
            onChange={(v) => onChange({ ...form, maxStudents: v })}
            placeholder="100"
            type="number"
          />
        </div>
      )}
    </div>
  )
}

// ── Settings Tab ──────────────────────────────────────────────────────────────

function SettingsTab({ form, onChange }: { form: CourseForm; onChange: (f: CourseForm) => void }) {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <FieldLabel>Course Status</FieldLabel>
        <div className="space-y-2">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ ...form, status: opt.value })}
              className="flex items-center gap-4 w-full p-4 rounded-xl text-left transition-all"
              style={{
                backgroundColor: "#1E293B",
                border: `1px solid ${form.status === opt.value ? opt.color + "60" : "#334155"}`,
                borderLeft: `3px solid ${form.status === opt.value ? opt.color : "#334155"}`,
              }}
            >
              <div
                className="w-4 h-4 rounded-full border-2 flex-shrink-0"
                style={{
                  borderColor: form.status === opt.value ? opt.color : "#475569",
                  backgroundColor: form.status === opt.value ? opt.color : "transparent",
                }}
              />
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: form.status === opt.value ? opt.color : "#F8FAFC" }}>
                  {opt.label}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {[
        { key: "featured" as const,        label: "Featured Course",       desc: "Highlight this course on the platform homepage." },
        { key: "commentsEnabled" as const, label: "Enable Comments",       desc: "Allow students to leave questions and discussions." },
        { key: "certificate" as const,     label: "Completion Certificate", desc: "Award a certificate when a student finishes the course." },
      ].map(({ key, label, desc }) => (
        <div
          key={key}
          className="flex items-center justify-between p-4 rounded-xl"
          style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
        >
          <div>
            <p className="text-sm font-medium text-white">{label}</p>
            <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>{desc}</p>
          </div>
          <Toggle checked={form[key] as boolean} onChange={() => onChange({ ...form, [key]: !form[key] })} />
        </div>
      ))}
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export function CourseEditor({ initialForm, mode }: CourseEditorProps) {
  const [form, setForm] = useState<CourseForm>(initialForm)
  const [tab, setTab] = useState(TABS[0])

  const tabProps = { form, onChange: setForm }

  return (
    <div className="space-y-5">
      {/* Tab bar */}
      <div
        className="flex items-center gap-1 p-1 rounded-xl w-fit sticky top-0 z-10"
        style={{ backgroundColor: "#1E293B" }}
      >
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: tab === t ? "#334155" : "transparent",
              color: tab === t ? "#F8FAFC" : "#64748B",
            }}
          >
            {t}
          </button>
        ))}
        {mode === "edit" && (
          <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: "#3B82F615", color: "#60A5FA" }}>
            Editing
          </span>
        )}
      </div>

      {tab === "Details"    && <DetailsTab    {...tabProps} />}
      {tab === "Curriculum" && <CurriculumTab {...tabProps} />}
      {tab === "Pricing"    && <PricingTab    {...tabProps} />}
      {tab === "Settings"   && <SettingsTab   {...tabProps} />}
    </div>
  )
}
