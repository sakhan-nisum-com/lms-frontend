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
  Check,
  Camera,
  Scissors,
  Mic,
  Monitor,
} from "lucide-react"
import type { Section, Lesson, QuizQuestion } from "@/lib/data/instructor-courses"

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CourseForm {
  // Core
  title: string
  subtitle: string
  description: string
  category: string
  level: string
  language: string
  color: string
  // Pricing
  isFree: boolean
  price: string
  originalPrice: string
  enrollmentType: "open" | "invite"
  hasMaxStudents: boolean
  maxStudents: string
  // Settings
  status: "draft" | "published" | "review"
  featured: boolean
  commentsEnabled: boolean
  certificate: boolean
  sections: Section[]
  // Step 1 — Intended Learners
  learningObjectives: string[]
  targetAudience: string[]
  requirements: string[]
  // Step 2 — Course Structure
  weeklyTime: "casually" | "seriously" | "intensely" | "full-time"
  courseType: "practical" | "theory" | "mixed"
  // Step 3 — Setup & Test Video
  testVideoFileName?: string
  testVideoUrl?: string
  // Step 6 — Captions
  captionsSrtUrl?: string
  // Step 7 — Accessibility
  hasTranscripts: boolean
  isKeyboardNavigable: boolean
  // Step 10 — Promotions
  couponCode: string
  discountPercent: string
  couponExpiry: string
  // Step 11 — Messages
  welcomeMessage: string
  completionMessage: string
}

interface CourseEditorProps {
  initialForm: CourseForm
  mode: "new" | "edit"
}

type StepId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11

// ── Constants ─────────────────────────────────────────────────────────────────

const STEPS: { id: StepId; label: string; group: string; optional?: boolean }[] = [
  { id: 1,  label: "Intended Learners",   group: "Getting Started" },
  { id: 2,  label: "Course Structure",    group: "Getting Started" },
  { id: 3,  label: "Setup & Test Video",  group: "Getting Started" },
  { id: 4,  label: "Film & Edit",         group: "Getting Started" },
  { id: 5,  label: "Curriculum",          group: "Course Content" },
  { id: 6,  label: "Captions",            group: "Course Content", optional: true },
  { id: 7,  label: "Accessibility",       group: "Course Content", optional: true },
  { id: 8,  label: "Course Landing Page", group: "Publish" },
  { id: 9,  label: "Pricing",             group: "Publish" },
  { id: 10, label: "Promotions",          group: "Publish" },
  { id: 11, label: "Course Messages",     group: "Publish" },
]

const STEP_GROUPS: { label: string; ids: StepId[] }[] = [
  { label: "Getting Started", ids: [1, 2, 3, 4] },
  { label: "Course Content",  ids: [5, 6, 7] },
  { label: "Publish",         ids: [8, 9, 10, 11] },
]

const CATEGORIES = [
  "Software Engineering", "Design & UX", "Cloud & DevOps", "Data Science",
  "Business", "Marketing", "Photography", "Music",
]

const LEVELS = ["Beginner", "Intermediate", "Advanced", "All Levels"]

const COLOR_SWATCHES = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444", "#EC4899"]

const LESSON_TYPE_META: Record<Lesson["type"], { icon: typeof Video; color: string }> = {
  video: { icon: Video,      color: "#3B82F6" },
  text:  { icon: FileText,   color: "#10B981" },
  quiz:  { icon: HelpCircle, color: "#8B5CF6" },
}

const LESSON_TYPE_ACTIONS: { type: Lesson["type"]; icon: typeof Video; label: string; color: string }[] = [
  { type: "video", icon: Video,      label: "Upload Video", color: "#3B82F6" },
  { type: "text",  icon: FileText,   label: "Write Text",   color: "#10B981" },
  { type: "quiz",  icon: HelpCircle, label: "Create Quiz",  color: "#8B5CF6" },
]

const RICH_TEXT_TOOLS: { command: string; arg?: string; icon: typeof Bold; title: string }[] = [
  { command: "bold",                icon: Bold,         title: "Bold" },
  { command: "italic",              icon: Italic,       title: "Italic" },
  { command: "underline",           icon: Underline,    title: "Underline" },
  { command: "formatBlock", arg:"H2",icon: Heading2,     title: "Heading" },
  { command: "insertUnorderedList", icon: List,         title: "Bullet list" },
  { command: "insertOrderedList",   icon: ListOrdered,  title: "Numbered list" },
]

const STATUS_OPTIONS = [
  { value: "draft"     as const, label: "Draft",      desc: "Only visible to you — not yet listed for students.",      color: "#64748B" },
  { value: "review"    as const, label: "In Review",  desc: "Submitted for platform review before publishing.",         color: "#F59E0B" },
  { value: "published" as const, label: "Published",  desc: "Live and discoverable by students.",                       color: "#10B981" },
]

// ── Completion detection ──────────────────────────────────────────────────────

function isStepComplete(id: StepId, form: CourseForm): boolean {
  switch (id) {
    case 1:
      return (
        form.learningObjectives.filter((s) => s.trim().length > 0).length >= 4 &&
        form.targetAudience.some((s) => s.trim().length > 0) &&
        form.requirements.some((s) => s.trim().length > 0)
      )
    case 2: return true
    case 3: return !!form.testVideoFileName
    case 4: return true
    case 5: return form.sections.length > 0 && form.sections.some((s) => s.lessons.length > 0)
    case 6: return !!form.captionsSrtUrl?.trim()
    case 7: return form.hasTranscripts || form.isKeyboardNavigable
    case 8: return form.title.trim().length > 0 && form.category.length > 0 && form.description.trim().length > 0
    case 9: return form.isFree || form.price.trim().length > 0
    case 10: return true
    case 11: return form.welcomeMessage.trim().length > 0 && form.completionMessage.trim().length > 0
  }
}

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

function TextInput({ value, onChange, placeholder, type = "text" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string
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
      <div className="flex items-center gap-1 px-2 py-1.5 flex-wrap" style={{ backgroundColor: "#1E293B", borderBottom: "1px solid #334155" }}>
        {RICH_TEXT_TOOLS.map(({ command, arg, icon: Icon, title }) => (
          <button
            key={command + (arg ?? "")}
            type="button"
            title={title}
            onMouseDown={(e) => { e.preventDefault(); exec(command, arg) }}
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

function QuizNumberInput({ label, value, onChange, placeholder, caption, max }: {
  label: string; value: number | undefined; onChange: (v: number | undefined) => void
  placeholder?: string; caption?: string; max?: number
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
      {caption && <p className="text-xs mt-1" style={{ color: "#475569" }}>{caption}</p>}
    </div>
  )
}

function BulletListEditor({ label, hint, values, onChange, minItems = 0, addLabel }: {
  label: string; hint?: string; values: string[]; onChange: (v: string[]) => void
  minItems?: number; addLabel: string
}) {
  const filled = values.filter((v) => v.trim().length > 0).length
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <FieldLabel>{label}</FieldLabel>
        {minItems > 0 && (
          <span className="text-xs" style={{ color: filled >= minItems ? "#10B981" : "#475569" }}>
            {filled}/{minItems} required
          </span>
        )}
      </div>
      {hint && <p className="text-xs mb-3" style={{ color: "#475569" }}>{hint}</p>}
      <div className="space-y-2">
        {values.map((v, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#334155" }} />
            <div className="flex-1">
              <TextInput
                value={v}
                onChange={(newVal) => {
                  const copy = [...values]; copy[i] = newVal; onChange(copy)
                }}
                placeholder={`Add item ${i + 1}…`}
              />
            </div>
            <button
              type="button"
              onClick={() => onChange(values.filter((_, j) => j !== i))}
              disabled={values.length <= 1}
              className="p-1.5 rounded-lg transition-colors flex-shrink-0 disabled:opacity-20"
              style={{ color: "#475569" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#475569")}
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...values, ""])}
        className="flex items-center gap-1.5 mt-3 text-xs font-medium hover:opacity-80 transition-opacity"
        style={{ color: "#3B82F6" }}
      >
        <Plus size={12} /> {addLabel}
      </button>
    </div>
  )
}

// ── Step 1: Intended Learners ─────────────────────────────────────────────────

function IntendedLearnersStep({ form, onChange }: { form: CourseForm; onChange: (f: CourseForm) => void }) {
  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h3 className="text-base font-semibold text-white mb-1">Intended Learners</h3>
        <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>
          These descriptions are shown publicly on your course landing page and directly affect enrollment.
          Help students decide whether your course is right for them.
        </p>
      </div>

      <BulletListEditor
        label="What will students learn in your course?"
        hint="Enter at least 4 learning objectives or outcomes."
        values={form.learningObjectives}
        onChange={(v) => onChange({ ...form, learningObjectives: v })}
        minItems={4}
        addLabel="Add objective"
      />

      <BulletListEditor
        label="Who is this course for?"
        hint="Describe the intended learners — their skill level, background, and interests."
        values={form.targetAudience}
        onChange={(v) => onChange({ ...form, targetAudience: v })}
        addLabel="Add target audience"
      />

      <BulletListEditor
        label="Requirements / Prerequisites"
        hint="List skills, tools, or experience students need. If none, write 'No prerequisites needed.'"
        values={form.requirements}
        onChange={(v) => onChange({ ...form, requirements: v })}
        addLabel="Add requirement"
      />
    </div>
  )
}

// ── Step 2: Course Structure ──────────────────────────────────────────────────

function CourseStructureStep({ form, onChange }: { form: CourseForm; onChange: (f: CourseForm) => void }) {
  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h3 className="text-base font-semibold text-white mb-1">Course Structure</h3>
        <p className="text-sm" style={{ color: "#64748B" }}>
          Tell us about your availability and course approach so we can tailor guidance for you.
        </p>
      </div>

      <div>
        <FieldLabel>How much time can you spend creating your course per week?</FieldLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          {([
            { key: "casually"  as const, label: "Casually",            time: "~1 hr/week",     desc: "I'll chip away at it slowly" },
            { key: "seriously" as const, label: "Seriously",           time: "~2–4 hrs/week",  desc: "I can dedicate a few evenings" },
            { key: "intensely" as const, label: "Intensely",           time: "~5–10 hrs/week", desc: "I'm committed to finishing fast" },
            { key: "full-time" as const, label: "I'll make it my job", time: "17+ hrs/week",   desc: "Building this is my priority" },
          ] as const).map(({ key, label, time, desc }) => (
            <button
              key={key}
              type="button"
              onClick={() => onChange({ ...form, weeklyTime: key })}
              className="flex items-start gap-3 p-4 rounded-xl text-left transition-all"
              style={{
                backgroundColor: "#1E293B",
                border: `1px solid ${form.weeklyTime === key ? "#3B82F6" : "#334155"}`,
              }}
            >
              <div
                className="w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 transition-all"
                style={{
                  borderColor: form.weeklyTime === key ? "#3B82F6" : "#475569",
                  backgroundColor: form.weeklyTime === key ? "#3B82F6" : "transparent",
                }}
              />
              <div>
                <p className="text-sm font-semibold" style={{ color: form.weeklyTime === key ? "#60A5FA" : "#F8FAFC" }}>
                  {label}
                </p>
                <p className="text-xs font-medium mt-0.5" style={{ color: "#10B981" }}>{time}</p>
                <p className="text-xs mt-1" style={{ color: "#64748B" }}>{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <FieldLabel>What kind of course are you building?</FieldLabel>
        <div className="flex items-center gap-2 flex-wrap mt-2">
          {([
            { key: "practical" as const, label: "Hands-on / Project-based" },
            { key: "theory"    as const, label: "Concepts & Theory" },
            { key: "mixed"     as const, label: "Both" },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => onChange({ ...form, courseType: key })}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                backgroundColor: form.courseType === key ? "#3B82F620" : "#1E293B",
                color: form.courseType === key ? "#60A5FA" : "#64748B",
                border: `1px solid ${form.courseType === key ? "#3B82F640" : "#334155"}`,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Step 3: Setup & Test Video ────────────────────────────────────────────────

function SetupTestVideoStep({ form, onChange }: { form: CourseForm; onChange: (f: CourseForm) => void }) {
  const [testProgress, setTestProgress] = useState<number | null>(null)
  const testFileRef = useRef<HTMLInputElement>(null)

  function handleTestFile(file: File | undefined) {
    if (!file) return
    setTestProgress(0)
    let pct = 0
    const iv = setInterval(() => {
      pct = Math.min(100, pct + Math.random() * 18 + 7)
      if (pct >= 100) {
        clearInterval(iv)
        const url = URL.createObjectURL(file)
        onChange({ ...form, testVideoFileName: file.name, testVideoUrl: url })
        setTestProgress(100)
        setTimeout(() => setTestProgress(null), 400)
      } else {
        setTestProgress(Math.round(pct))
      }
    }, 180)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-base font-semibold text-white mb-1">Setup & Test Video</h3>
        <p className="text-sm" style={{ color: "#64748B" }}>
          Confirm your recording setup with a short test clip before filming your full course.
        </p>
      </div>

      {/* Equipment tips */}
      <div className="rounded-2xl p-5 space-y-4" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
        <p className="text-sm font-semibold text-white flex items-center gap-2">
          <Camera size={14} style={{ color: "#3B82F6" }} />
          Equipment Checklist
        </p>
        {[
          { Icon: Monitor, color: "#3B82F6", text: "Video: Use a webcam or phone at 1080p minimum. Keep your background tidy and well-lit." },
          { Icon: Mic,     color: "#10B981", text: "Audio: Record in a quiet room. A USB microphone dramatically improves perceived quality." },
          { Icon: Camera,  color: "#F59E0B", text: "Lighting: Natural side-light or a ring light removes shadows. Avoid backlit windows." },
        ].map(({ Icon, color, text }) => (
          <div key={color} className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center mt-0.5" style={{ backgroundColor: `${color}15` }}>
              <Icon size={12} style={{ color }} />
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "#94A3B8" }}>{text}</p>
          </div>
        ))}
      </div>

      {/* Test video upload */}
      <div>
        <FieldLabel>Upload Test Video</FieldLabel>
        <p className="text-xs mb-3" style={{ color: "#475569" }}>
          Upload a 2–5 minute sample to verify your audio, video, and lighting before recording the full course.
        </p>
        <input
          ref={testFileRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => { handleTestFile(e.target.files?.[0]); e.target.value = "" }}
        />
        {form.testVideoFileName && testProgress === null ? (
          <div className="flex items-center gap-3 p-3.5 rounded-xl" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
            <Film size={14} style={{ color: "#3B82F6", flexShrink: 0 }} />
            <span className="text-sm text-white truncate flex-1">{form.testVideoFileName}</span>
            <button
              type="button"
              onClick={() => testFileRef.current?.click()}
              className="text-xs font-medium flex-shrink-0 hover:opacity-80"
              style={{ color: "#3B82F6" }}
            >
              Replace
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={testProgress !== null}
            onClick={() => testFileRef.current?.click()}
            className="flex flex-col items-center justify-center w-full py-10 rounded-2xl transition-all disabled:opacity-60"
            style={{ border: "1px dashed #334155" }}
            onMouseEnter={(e) => { if (testProgress === null) e.currentTarget.style.borderColor = "#3B82F6" }}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#334155")}
          >
            <Film size={28} style={{ color: "#334155", marginBottom: 10 }} />
            <span className="text-sm font-medium" style={{ color: "#64748B" }}>
              {testProgress !== null ? "Uploading…" : "Click to upload test video"}
            </span>
            <span className="text-xs mt-1" style={{ color: "#475569" }}>MP4, MOV, AVI — up to 500 MB</span>
          </button>
        )}
        {testProgress !== null && (
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1" style={{ color: "#64748B" }}>
              <span>Uploading…</span><span>{testProgress}%</span>
            </div>
            <div className="h-1.5 rounded-full" style={{ backgroundColor: "#334155" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${testProgress}%`, backgroundColor: "#3B82F6" }} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Step 4: Film & Edit ───────────────────────────────────────────────────────

function FilmEditStep({ form: _, onChange: __ }: { form: CourseForm; onChange: (f: CourseForm) => void }) {
  const CHECKLIST = {
    before: [
      "Write a full script or detailed outline — don't improvise",
      "Record a test clip and review before your full session",
      "Clean your background or set up a virtual backdrop",
      "Close all notifications on your computer",
      "Fully charge all equipment — mic, camera, laptop",
    ],
    during: [
      "Speak to one person, not a crowd — keep energy personal",
      "Pause and re-record stumbles — don't power through mistakes",
      "Keep each lesson under 10 minutes for better completion rates",
      "Use screen capture tools (OBS, Loom, QuickTime) for screen demos",
      "Review each recording immediately while your setup is still active",
    ],
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-base font-semibold text-white mb-1">Film & Edit</h3>
        <p className="text-sm" style={{ color: "#64748B" }}>
          Use these best practices to produce polished, professional video content.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(["before", "during"] as const).map((phase) => (
          <div key={phase} className="rounded-2xl p-5" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
            <div className="flex items-center gap-2 mb-4">
              {phase === "before"
                ? <Scissors size={14} style={{ color: "#F59E0B" }} />
                : <Camera  size={14} style={{ color: "#10B981" }} />}
              <p className="text-sm font-semibold text-white">
                {phase === "before" ? "Before Filming" : "While Filming"}
              </p>
            </div>
            <ul className="space-y-3">
              {CHECKLIST[phase].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center mt-0.5" style={{ backgroundColor: "#334155" }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#64748B" }} />
                  </span>
                  <p className="text-xs leading-relaxed" style={{ color: "#94A3B8" }}>{item}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: "#3B82F610", border: "1px solid #3B82F630" }}>
        <Check size={14} style={{ color: "#3B82F6", flexShrink: 0 }} />
        <p className="text-xs" style={{ color: "#94A3B8" }}>
          Once you&apos;re comfortable with your setup, head to <strong className="text-white">Curriculum</strong> to upload your full course content.
        </p>
      </div>
    </div>
  )
}

// ── Step 5: Curriculum ────────────────────────────────────────────────────────

function CurriculumTab({ form, onChange }: { form: CourseForm; onChange: (f: CourseForm) => void }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [quizEditorId, setQuizEditorId] = useState<string | null>(null)
  const [textEditorId, setTextEditorId] = useState<string | null>(null)
  const [uploadTarget, setUploadTarget] = useState<{ sectionId: string; lessonId: string } | null>(null)
  const [uploadProgress, setUploadProgress] = useState<{ lessonId: string; percent: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function startEdit(id: string, title: string) { setEditingId(id); setEditValue(title) }

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

  function updateSections(sections: Section[]) { onChange({ ...form, sections }) }

  function toggleSection(id: string) {
    updateSections(form.sections.map((s) => (s.id === id ? { ...s, expanded: !s.expanded } : s)))
  }

  function moveSectionUp(id: string) {
    const idx = form.sections.findIndex((s) => s.id === id)
    if (idx <= 0) return
    const copy = [...form.sections];
    [copy[idx - 1], copy[idx]] = [copy[idx], copy[idx - 1]]
    updateSections(copy)
  }

  function moveSectionDown(id: string) {
    const idx = form.sections.findIndex((s) => s.id === id)
    if (idx < 0 || idx >= form.sections.length - 1) return
    const copy = [...form.sections];
    [copy[idx], copy[idx + 1]] = [copy[idx + 1], copy[idx]]
    updateSections(copy)
  }

  function removeSection(id: string) { updateSections(form.sections.filter((s) => s.id !== id)) }

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
        const copy = [...s.lessons];
        [copy[idx - 1], copy[idx]] = [copy[idx], copy[idx - 1]]
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
        const copy = [...s.lessons];
        [copy[idx], copy[idx + 1]] = [copy[idx + 1], copy[idx]]
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
        onChange={(e) => { handleVideoFileSelected(e.target.files?.[0]); e.target.value = "" }}
      />

      <p className="text-xs pb-1" style={{ color: "#64748B" }}>
        {form.sections.length} section{form.sections.length !== 1 ? "s" : ""} · {totalLessons} lesson{totalLessons !== 1 ? "s" : ""}
      </p>

      {form.sections.map((section, si) => (
        <div key={section.id} className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
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
              <ChevronDown size={15} style={{ transform: section.expanded ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.2s" }} />
            </button>

            <div className="flex-1 min-w-0 group flex items-center gap-2">
              {editingId === section.id ? (
                <input
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={commitEdit}
                  onKeyDown={(e) => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") setEditingId(null) }}
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
              <button type="button" onClick={() => moveSectionUp(section.id)} disabled={si === 0}
                className="p-1 rounded hover:bg-white/5 transition-colors disabled:opacity-20" style={{ color: "#64748B" }}>
                <ChevronUp size={13} />
              </button>
              <button type="button" onClick={() => moveSectionDown(section.id)} disabled={si === form.sections.length - 1}
                className="p-1 rounded hover:bg-white/5 transition-colors disabled:opacity-20" style={{ color: "#64748B" }}>
                <ChevronDown size={13} />
              </button>
              <button type="button" onClick={() => removeSection(section.id)}
                className="p-1 rounded transition-colors" style={{ color: "#64748B" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#64748B")}>
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
                    <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.02] transition-colors">
                      <TypeIcon size={14} style={{ color: LESSON_TYPE_META[lesson.type].color, flexShrink: 0 }} />

                      <div className="flex-1 min-w-0 group flex items-center gap-2">
                        {editingId === lesson.id ? (
                          <input
                            autoFocus
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={commitEdit}
                            onKeyDown={(e) => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") setEditingId(null) }}
                            className="flex-1 bg-transparent outline-none text-sm text-white border-b"
                            style={{ borderColor: "#3B82F6" }}
                          />
                        ) : (
                          <>
                            <span className="text-sm text-white truncate cursor-text" onClick={() => startEdit(lesson.id, lesson.title)}>
                              {lesson.title}
                            </span>
                            <Pencil size={10} className="opacity-0 group-hover:opacity-100 flex-shrink-0 cursor-pointer transition-opacity" style={{ color: "#475569" }} onClick={() => startEdit(lesson.id, lesson.title)} />
                          </>
                        )}
                      </div>

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

                      <button
                        type="button"
                        title={lesson.isPreview ? "Preview on" : "Preview off"}
                        onClick={() => updateLesson(section.id, lesson.id, { isPreview: !lesson.isPreview })}
                        className="p-1.5 rounded-lg transition-colors flex-shrink-0"
                        style={{ color: lesson.isPreview ? "#3B82F6" : "#334155" }}
                      >
                        {lesson.isPreview ? <Eye size={13} /> : <EyeOff size={13} />}
                      </button>

                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <button type="button" onClick={() => moveLessonUp(section.id, lesson.id)} disabled={li === 0}
                          className="p-1 rounded hover:bg-white/5 transition-colors disabled:opacity-20" style={{ color: "#64748B" }}>
                          <ChevronUp size={12} />
                        </button>
                        <button type="button" onClick={() => moveLessonDown(section.id, lesson.id)} disabled={li === section.lessons.length - 1}
                          className="p-1 rounded hover:bg-white/5 transition-colors disabled:opacity-20" style={{ color: "#64748B" }}>
                          <ChevronDown size={12} />
                        </button>
                        <button type="button" onClick={() => removeLesson(section.id, lesson.id)}
                          className="p-1 rounded transition-colors" style={{ color: "#64748B" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#64748B")}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Type action buttons */}
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
                        <span className="flex items-center gap-1 text-xs truncate max-w-[180px]" style={{ color: "#475569" }} title={lesson.videoFileName}>
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
                          {lesson.textContent && lesson.textContent.replace(/<[^>]*>/g, "").trim().length > 0 ? "Content saved" : "No content yet"}
                        </span>
                      )}
                    </div>

                    {/* Video upload progress */}
                    {isUploadingThis && (
                      <div className="px-4 pb-3">
                        <div className="flex justify-between mb-1 text-xs" style={{ color: "#64748B" }}>
                          <span>Uploading video…</span><span>{uploadProgress!.percent}%</span>
                        </div>
                        <div className="h-1.5 rounded-full" style={{ backgroundColor: "#334155" }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${uploadProgress!.percent}%`, backgroundColor: "#3B82F6" }} />
                        </div>
                      </div>
                    )}

                    {/* Rich Text Editor */}
                    {lesson.type === "text" && textOpen && (
                      <div className="px-4 pb-4" style={{ backgroundColor: "#0F172A", borderTop: "1px solid #334155" }}>
                        <p className="text-xs font-semibold mb-2 pt-3" style={{ color: "#10B981" }}>Lesson Content</p>
                        <RichTextEditor
                          value={lesson.textContent ?? ""}
                          onChange={(html) => updateLesson(section.id, lesson.id, { textContent: html })}
                        />
                      </div>
                    )}

                    {/* Quiz Builder */}
                    {lesson.type === "quiz" && quizOpen && (
                      <div className="px-4 pt-3 pb-4 space-y-3" style={{ backgroundColor: "#0F172A", borderTop: "1px solid #334155" }}>
                        <div className="rounded-xl p-4 space-y-4" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
                          <p className="text-xs font-semibold" style={{ color: "#8B5CF6" }}>Quiz Settings</p>

                          <div>
                            <FieldLabel>Question Mode</FieldLabel>
                            <div className="flex items-center gap-1 p-1 rounded-xl w-fit" style={{ backgroundColor: "#0F172A" }}>
                              {([{ key: "fixed" as const, label: "Fixed Questions" }, { key: "bank" as const, label: "Question Bank" }]).map(({ key, label }) => {
                                const active = (lesson.quizMode ?? "fixed") === key
                                return (
                                  <button key={key} type="button" onClick={() => updateLesson(section.id, lesson.id, { quizMode: key })}
                                    className="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                    style={{ backgroundColor: active ? "#8B5CF6" : "transparent", color: active ? "#FFFFFF" : "#64748B" }}>
                                    {label}
                                  </button>
                                )
                              })}
                            </div>
                            <p className="text-xs mt-1.5" style={{ color: "#475569" }}>
                              {(lesson.quizMode ?? "fixed") === "bank"
                                ? "Randomly pick questions from the pool each time a student takes this quiz."
                                : "Show every question in order, every time."}
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

                          <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid #334155" }}>
                            <div>
                              <p className="text-sm font-medium text-white">Mandatory Quiz</p>
                              <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>Require a minimum score before the student can move on.</p>
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
                          <p className="text-xs font-semibold" style={{ color: "#8B5CF6" }}>Quiz Questions</p>
                          <button type="button" onClick={() => addQuestion(section.id, lesson.id, questions)}
                            className="flex items-center gap-1 text-xs font-medium hover:opacity-80" style={{ color: "#8B5CF6" }}>
                            <Plus size={12} /> Add Question
                          </button>
                        </div>

                        {questions.length === 0 && (
                          <p className="text-xs py-4 text-center" style={{ color: "#475569" }}>
                            No questions yet. Click &ldquo;Add Question&rdquo; to start.
                          </p>
                        )}

                        {questions.map((q, qi) => (
                          <div key={q.id} className="rounded-xl p-4 space-y-3" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
                            <div className="flex items-start gap-2">
                              <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold mt-0.5" style={{ backgroundColor: "#8B5CF620", color: "#A78BFA" }}>
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
                              <button type="button" onClick={() => removeQuestion(section.id, lesson.id, questions, q.id)}
                                className="p-1 rounded transition-colors flex-shrink-0" style={{ color: "#475569" }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
                                onMouseLeave={(e) => (e.currentTarget.style.color = "#475569")}>
                                <Trash2 size={12} />
                              </button>
                            </div>
                            <div className="space-y-2 pl-7">
                              {q.options.map((opt, oi) => (
                                <div key={oi} className="flex items-center gap-2">
                                  <button type="button" onClick={() => patchQuestion(section.id, lesson.id, questions, q.id, { correctIndex: oi })}
                                    className="flex-shrink-0 w-4 h-4 rounded-full border-2 transition-all"
                                    style={{ borderColor: q.correctIndex === oi ? "#10B981" : "#334155", backgroundColor: q.correctIndex === oi ? "#10B981" : "transparent" }}
                                    title="Mark as correct answer" />
                                  <span className="text-xs font-medium w-5 flex-shrink-0" style={{ color: "#475569" }}>{String.fromCharCode(65 + oi)}</span>
                                  <input
                                    value={opt}
                                    onChange={(e) => { const opts = [...q.options]; opts[oi] = e.target.value; patchQuestion(section.id, lesson.id, questions, q.id, { options: opts }) }}
                                    placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                                    className="flex-1 bg-transparent outline-none text-xs placeholder-slate-600"
                                    style={{ color: q.correctIndex === oi ? "#6EE7B7" : "#94A3B8", borderBottom: "1px solid transparent" }}
                                    onFocus={(e) => (e.currentTarget.style.borderColor = "#334155")}
                                    onBlur={(e) => (e.currentTarget.style.borderColor = "transparent")}
                                  />
                                  {q.correctIndex === oi && <span className="text-xs flex-shrink-0" style={{ color: "#10B981" }}>✓</span>}
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

              <div className="px-4 py-2.5" style={{ borderTop: section.lessons.length > 0 ? "1px solid #334155" : "none" }}>
                <button type="button" onClick={() => addLesson(section.id)}
                  className="flex items-center gap-1.5 text-xs font-medium hover:opacity-80" style={{ color: "#3B82F6" }}>
                  <Plus size={13} /> Add Lesson
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      <button type="button" onClick={addSection}
        className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-2xl text-sm font-medium transition-all"
        style={{ backgroundColor: "transparent", border: "1px dashed #334155", color: "#64748B" }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3B82F6"; e.currentTarget.style.color = "#3B82F6" }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#334155"; e.currentTarget.style.color = "#64748B" }}>
        <Plus size={14} /> Add Section
      </button>
    </div>
  )
}

// ── Step 6: Captions ──────────────────────────────────────────────────────────

function CaptionsStep({ form, onChange }: { form: CourseForm; onChange: (f: CourseForm) => void }) {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-base font-semibold text-white mb-1">Captions <span className="text-xs font-normal ml-1" style={{ color: "#475569" }}>(Optional)</span></h3>
        <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>
          Captions improve accessibility for deaf and hard-of-hearing learners, non-native speakers, and anyone in a noisy environment. Highly recommended but not required.
        </p>
      </div>

      <div className="rounded-2xl p-5 space-y-4" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
        <FieldLabel>
          SRT / VTT Caption File URL{" "}
          <span style={{ color: "#475569", fontWeight: 400 }}>(optional)</span>
        </FieldLabel>
        <TextInput
          value={form.captionsSrtUrl ?? ""}
          onChange={(v) => onChange({ ...form, captionsSrtUrl: v })}
          placeholder="https://your-host.com/captions.srt"
        />
        <p className="text-xs" style={{ color: "#475569" }}>
          Upload your .srt or .vtt file to a host (e.g. Amazon S3, Dropbox) and paste the URL here.
        </p>
      </div>

      <div className="rounded-xl p-4" style={{ backgroundColor: "#0F172A", border: "1px solid #334155" }}>
        <p className="text-xs" style={{ color: "#64748B" }}>
          Per-lesson caption tracks can also be added in the{" "}
          <strong className="text-white">Curriculum</strong> step by expanding each individual video lesson.
        </p>
      </div>
    </div>
  )
}

// ── Step 7: Accessibility ─────────────────────────────────────────────────────

function AccessibilityStep({ form, onChange }: { form: CourseForm; onChange: (f: CourseForm) => void }) {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-base font-semibold text-white mb-1">Accessibility <span className="text-xs font-normal ml-1" style={{ color: "#475569" }}>(Optional)</span></h3>
        <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>
          Help all students, including those with disabilities, access your content comfortably.
        </p>
      </div>

      {[
        { key: "hasTranscripts" as const, label: "Provide Transcripts", desc: "Text transcripts make your course accessible to deaf and hard-of-hearing learners." },
        { key: "isKeyboardNavigable" as const, label: "Keyboard Navigable", desc: "Confirm the course player and quizzes can be fully navigated without a mouse." },
      ].map(({ key, label, desc }) => (
        <div key={key} className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
          <div>
            <p className="text-sm font-medium text-white">{label}</p>
            <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>{desc}</p>
          </div>
          <Toggle checked={form[key]} onChange={() => onChange({ ...form, [key]: !form[key] })} />
        </div>
      ))}
    </div>
  )
}

// ── Step 8: Course Landing Page ───────────────────────────────────────────────

function CourseLandingPageStep({ form, onChange }: { form: CourseForm; onChange: (f: CourseForm) => void }) {
  const set = (key: keyof CourseForm) => (val: string) => onChange({ ...form, [key]: val })

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-base font-semibold text-white mb-1">Course Landing Page</h3>
        <p className="text-sm" style={{ color: "#64748B" }}>
          This information is publicly visible and helps students decide whether to enroll.
        </p>
      </div>

      <div>
        <FieldLabel>Course Title <span style={{ color: "#EF4444" }}>*</span></FieldLabel>
        <TextInput value={form.title} onChange={set("title")} placeholder="e.g. React & TypeScript Masterclass" />
      </div>

      <div>
        <FieldLabel>Subtitle</FieldLabel>
        <TextInput value={form.subtitle} onChange={set("subtitle")} placeholder="A brief tagline for your course" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <FieldLabel>Description</FieldLabel>
          <span className="text-xs" style={{ color: "#475569" }}>{form.description.length}/2000</span>
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
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
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
            <button key={l} type="button" onClick={() => onChange({ ...form, level: l })}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors"
              style={{
                backgroundColor: form.level === l ? "#3B82F620" : "#1E293B",
                color: form.level === l ? "#60A5FA" : "#64748B",
                border: `1px solid ${form.level === l ? "#3B82F640" : "#334155"}`,
              }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div>
        <FieldLabel>Course Color</FieldLabel>
        <div className="flex items-center gap-3">
          {COLOR_SWATCHES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChange({ ...form, color: c })}
              className="w-8 h-8 rounded-full transition-all"
              style={{ backgroundColor: c, boxShadow: form.color === c ? `0 0 0 2px #0F172A, 0 0 0 4px ${c}` : "none" }}
            />
          ))}
        </div>
      </div>

      <div style={{ borderTop: "1px solid #334155", paddingTop: 24 }}>
        <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "#475569" }}>Publishing</p>

        <div className="space-y-2 mb-5">
          {STATUS_OPTIONS.map((opt) => (
            <button key={opt.value} type="button" onClick={() => onChange({ ...form, status: opt.value })}
              className="flex items-center gap-4 w-full p-4 rounded-xl text-left transition-all"
              style={{
                backgroundColor: "#1E293B",
                border: `1px solid ${form.status === opt.value ? opt.color + "60" : "#334155"}`,
                borderLeft: `3px solid ${form.status === opt.value ? opt.color : "#334155"}`,
              }}>
              <div className="w-4 h-4 rounded-full border-2 flex-shrink-0"
                style={{ borderColor: form.status === opt.value ? opt.color : "#475569", backgroundColor: form.status === opt.value ? opt.color : "transparent" }} />
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: form.status === opt.value ? opt.color : "#F8FAFC" }}>{opt.label}</p>
                <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
          <div>
            <p className="text-sm font-medium text-white">Featured Course</p>
            <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>Highlight this course on the platform homepage.</p>
          </div>
          <Toggle checked={form.featured} onChange={() => onChange({ ...form, featured: !form.featured })} />
        </div>
      </div>
    </div>
  )
}

// ── Step 9: Pricing ───────────────────────────────────────────────────────────

function PricingTab({ form, onChange }: { form: CourseForm; onChange: (f: CourseForm) => void }) {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-base font-semibold text-white mb-1">Pricing</h3>
        <p className="text-sm" style={{ color: "#64748B" }}>Set a price for your course and configure enrollment options.</p>
      </div>

      <div>
        <FieldLabel>Course Price</FieldLabel>
        <div className="flex items-center gap-1 p-1 rounded-xl w-fit" style={{ backgroundColor: "#1E293B" }}>
          {["Free", "Paid"].map((opt) => (
            <button key={opt} type="button" onClick={() => onChange({ ...form, isFree: opt === "Free" })}
              className="px-5 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ backgroundColor: (opt === "Free") === form.isFree ? "#334155" : "transparent", color: (opt === "Free") === form.isFree ? "#F8FAFC" : "#64748B" }}>
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
            <TextInput value={form.originalPrice} onChange={(v) => onChange({ ...form, originalPrice: v })} placeholder="59.99" type="number" />
            <p className="text-xs mt-1.5" style={{ color: "#475569" }}>Shown as strikethrough if higher than price.</p>
          </div>
        </div>
      )}

      <div>
        <FieldLabel>Enrollment</FieldLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { key: "open" as const,   label: "Open",        desc: "Anyone can enroll immediately" },
            { key: "invite" as const, label: "Invite Only", desc: "Students need an invite link" },
          ].map(({ key, label, desc }) => (
            <button key={key} type="button" onClick={() => onChange({ ...form, enrollmentType: key })}
              className="flex items-start gap-3 p-4 rounded-xl text-left transition-all"
              style={{ backgroundColor: "#1E293B", border: `1px solid ${form.enrollmentType === key ? "#3B82F6" : "#334155"}` }}>
              <div className="w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5"
                style={{ borderColor: form.enrollmentType === key ? "#3B82F6" : "#475569", backgroundColor: form.enrollmentType === key ? "#3B82F6" : "transparent" }} />
              <div>
                <p className="text-sm font-medium text-white">{label}</p>
                <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
        <div>
          <p className="text-sm font-medium text-white">Limit enrollment</p>
          <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>Cap the maximum number of students who can enroll.</p>
        </div>
        <Toggle checked={form.hasMaxStudents} onChange={() => onChange({ ...form, hasMaxStudents: !form.hasMaxStudents })} />
      </div>

      {form.hasMaxStudents && (
        <div>
          <FieldLabel>Max Students</FieldLabel>
          <TextInput value={form.maxStudents} onChange={(v) => onChange({ ...form, maxStudents: v })} placeholder="100" type="number" />
        </div>
      )}
    </div>
  )
}

// ── Step 10: Promotions ───────────────────────────────────────────────────────

function PromotionsStep({ form, onChange }: { form: CourseForm; onChange: (f: CourseForm) => void }) {
  return (
    <div className="space-y-6 max-w-sm">
      <div>
        <h3 className="text-base font-semibold text-white mb-1">Promotions</h3>
        <p className="text-sm" style={{ color: "#64748B" }}>
          Create a coupon code to offer a discount at checkout. Leave blank to disable promotions.
        </p>
      </div>

      <div>
        <FieldLabel>Coupon Code</FieldLabel>
        <TextInput
          value={form.couponCode}
          onChange={(v) => onChange({ ...form, couponCode: v.toUpperCase() })}
          placeholder="LAUNCH50"
        />
      </div>

      <div>
        <FieldLabel>Discount %</FieldLabel>
        <TextInput value={form.discountPercent} onChange={(v) => onChange({ ...form, discountPercent: v })} placeholder="50" type="number" />
      </div>

      <div>
        <FieldLabel>Expiry Date <span style={{ color: "#475569", fontWeight: 400 }}>(optional)</span></FieldLabel>
        <TextInput value={form.couponExpiry} onChange={(v) => onChange({ ...form, couponExpiry: v })} placeholder="" type="date" />
      </div>
    </div>
  )
}

// ── Step 11: Course Messages ──────────────────────────────────────────────────

function CourseMessagesStep({ form, onChange }: { form: CourseForm; onChange: (f: CourseForm) => void }) {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-base font-semibold text-white mb-1">Course Messages</h3>
        <p className="text-sm" style={{ color: "#64748B" }}>
          Communicate with students at key moments in their learning journey.
        </p>
      </div>

      <div>
        <FieldLabel>Welcome Message</FieldLabel>
        <p className="text-xs mb-2" style={{ color: "#475569" }}>Shown to students when they first enroll.</p>
        <RichTextEditor value={form.welcomeMessage} onChange={(html) => onChange({ ...form, welcomeMessage: html })} />
      </div>

      <div>
        <FieldLabel>Congratulations Message</FieldLabel>
        <p className="text-xs mb-2" style={{ color: "#475569" }}>Shown when a student completes every lesson.</p>
        <RichTextEditor value={form.completionMessage} onChange={(html) => onChange({ ...form, completionMessage: html })} />
      </div>

      <div style={{ borderTop: "1px solid #334155", paddingTop: 20 }}>
        {[
          { key: "commentsEnabled" as const, label: "Enable Comments",       desc: "Allow students to leave questions and discussions on lessons." },
          { key: "certificate"     as const, label: "Completion Certificate", desc: "Award a certificate when a student finishes the course." },
        ].map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between p-4 rounded-xl mb-3" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
            <div>
              <p className="text-sm font-medium text-white">{label}</p>
              <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>{desc}</p>
            </div>
            <Toggle checked={form[key]} onChange={() => onChange({ ...form, [key]: !form[key] })} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export function CourseEditor({ initialForm, mode }: CourseEditorProps) {
  const [form, setForm] = useState<CourseForm>(initialForm)
  const [currentStep, setCurrentStep] = useState<StepId>(1)

  const stepProps = { form, onChange: setForm }

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* Left: vertical step navigator */}
      <nav className="w-full lg:w-56 flex-shrink-0 lg:sticky lg:top-4 lg:self-start">
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
          {STEP_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="px-4 pt-4 pb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: "#475569" }}>
                {group.label}
              </p>
              {group.ids.map((id) => {
                const step = STEPS.find((s) => s.id === id)!
                const done = isStepComplete(id, form)
                const optional = !!step.optional
                const active = currentStep === id
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setCurrentStep(id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-all"
                    style={{
                      backgroundColor: active ? "#0F172A" : "transparent",
                      borderLeft: `3px solid ${active ? "#3B82F6" : "transparent"}`,
                    }}
                  >
                    <span
                      className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center font-bold"
                      style={{
                        fontSize: 10,
                        backgroundColor: done ? (optional ? "#47556918" : "#10B98118") : active ? "#3B82F618" : "#0F172A",
                        border: `1px solid ${done ? (optional ? "#475569" : "#10B981") : active ? "#3B82F6" : "#334155"}`,
                        color: done ? (optional ? "#64748B" : "#10B981") : active ? "#60A5FA" : "#475569",
                      }}
                    >
                      {done ? <Check size={9} /> : id}
                    </span>
                    <span className="flex-1 truncate text-xs font-medium" style={{ color: active ? "#F8FAFC" : "#64748B" }}>
                      {step.label}
                    </span>
                    {optional && !active && (
                      <span className="flex-shrink-0 text-[9px] px-1.5 py-0.5 rounded" style={{ backgroundColor: "#0F172A", color: "#475569", border: "1px solid #334155" }}>
                        Opt
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
          <div className="px-3 pb-3 pt-2" style={{ borderTop: "1px solid #334155" }}>
            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{ backgroundColor: mode === "edit" ? "#3B82F615" : "#10B98115", color: mode === "edit" ? "#60A5FA" : "#34D399" }}
            >
              {mode === "edit" ? "Editing" : "New Course"}
            </span>
          </div>
        </div>
      </nav>

      {/* Right: step content */}
      <div className="flex-1 min-w-0">
        {currentStep === 1  && <IntendedLearnersStep  {...stepProps} />}
        {currentStep === 2  && <CourseStructureStep   {...stepProps} />}
        {currentStep === 3  && <SetupTestVideoStep    {...stepProps} />}
        {currentStep === 4  && <FilmEditStep          {...stepProps} />}
        {currentStep === 5  && <CurriculumTab         {...stepProps} />}
        {currentStep === 6  && <CaptionsStep          {...stepProps} />}
        {currentStep === 7  && <AccessibilityStep     {...stepProps} />}
        {currentStep === 8  && <CourseLandingPageStep {...stepProps} />}
        {currentStep === 9  && <PricingTab            {...stepProps} />}
        {currentStep === 10 && <PromotionsStep        {...stepProps} />}
        {currentStep === 11 && <CourseMessagesStep    {...stepProps} />}
      </div>
    </div>
  )
}
