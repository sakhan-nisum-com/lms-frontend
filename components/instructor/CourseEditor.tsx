"use client"

import { useEffect, useRef, useState } from "react"
import {
  Archive,
  BrainCircuit,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText,
  Film,
  HelpCircle,
  ImageIcon,
  Link2,
  Paperclip,
  Pencil,
  Plus,
  Trash2,
  Video,
  Eye,
  EyeOff,
  Check,
  X,
} from "lucide-react"
import type { Section, Lesson, LessonResource, QuizQuestion, LessonKnowledgeCheck, SessionKnowledgeCheck, SessionKCPart } from "@/lib/data/instructor-courses"

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
  // Step 3 — Setup & Test Video
  testVideoFileName?: string
  testVideoUrl?: string
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
  onExportSCORM?: (form: CourseForm) => Promise<void>
  scormExporting?: boolean
}

type StepId = 1 | 2 | 3 | 4 | 5 | 6

// ── Constants ─────────────────────────────────────────────────────────────────

const STEPS: { id: StepId; label: string; group: string; optional?: boolean }[] = [
  { id: 1, label: "Intended Learners",   group: "Getting Started" },
  { id: 2, label: "Curriculum",          group: "Course Content" },
  { id: 3, label: "Course Landing Page", group: "Publish" },
  { id: 4, label: "Pricing",             group: "Publish" },
  { id: 5, label: "Promotions",          group: "Publish" },
  { id: 6, label: "Course Messages",     group: "Publish" },
]

const STEP_GROUPS: { label: string; ids: StepId[] }[] = [
  { label: "Getting Started", ids: [1] },
  { label: "Course Content",  ids: [2] },
  { label: "Publish",         ids: [3, 4, 5, 6] },
]

const CATEGORIES = [
  "Software Engineering", "Design & UX", "Cloud & DevOps", "Data Science",
  "Business", "Marketing", "Photography", "Music",
]

const LEVELS = ["Beginner", "Intermediate", "Advanced", "All Levels"]

const FEATURED_PLACEMENT_FEE = "$49 / month"


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


// ── Completion detection ──────────────────────────────────────────────────────

function isStepComplete(id: StepId, form: CourseForm): boolean {
  switch (id) {
    case 1:
      return (
        form.learningObjectives.filter((s) => s.trim().length > 0).length >= 4 &&
        form.targetAudience.some((s) => s.trim().length > 0) &&
        form.requirements.some((s) => s.trim().length > 0)
      )
    case 2: return form.sections.length > 0 && form.sections.some((s) => s.lessons.length > 0)
    case 3: return form.title.trim().length > 0 && form.category.length > 0 && form.description.trim().length > 0
    case 4: return form.isFree || form.price.trim().length > 0
    case 5: return true
    case 6: return form.welcomeMessage.trim().length > 0 && form.completionMessage.trim().length > 0
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
  const containerRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const quillRef = useRef<any>(null)
  const suppressRef = useRef(false)

  useEffect(() => {
    if (!containerRef.current || quillRef.current) return
    let cancelled = false
    import('quill').then(({ default: Quill }) => {
      if (cancelled || !containerRef.current) return
      const quill = new Quill(containerRef.current, {
        theme: 'snow',
        placeholder: 'Write your lesson content here…',
        modules: {
          toolbar: [
            [{ header: [2, 3, false] }],
            ['bold', 'italic', 'underline'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link', 'clean'],
          ],
        },
      })
      if (value) quill.clipboard.dangerouslyPasteHTML(value)
      quill.on('text-change', () => {
        suppressRef.current = true
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const html = (quill as any).getSemanticHTML?.() ?? quill.root.innerHTML
        onChange(html === '<p></p>' ? '' : html)
      })
      quillRef.current = quill
    })
    return () => {
      cancelled = true
      // Remove the toolbar Quill inserts as the previous sibling of our container
      const toolbar = containerRef.current?.previousElementSibling
      if (toolbar?.classList.contains('ql-toolbar')) toolbar.remove()
      // Reset the container so Quill can re-mount cleanly
      if (containerRef.current) {
        containerRef.current.className = ''
        containerRef.current.innerHTML = ''
      }
      quillRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (suppressRef.current) { suppressRef.current = false; return }
    if (!quillRef.current) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const current = (quillRef.current as any).getSemanticHTML?.() ?? quillRef.current.root.innerHTML
    if (current !== value) quillRef.current.clipboard.dangerouslyPasteHTML(value || '')
  }, [value])

  return (
    <div className="quill-dark rounded-xl overflow-hidden" style={{ border: "1px solid #334155" }}>
      <div ref={containerRef} />
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

// ── Shared KC question form ───────────────────────────────────────────────────

type KCDraft = { question: string; options: string[]; correctIndex: number }

function KCQuestionForm({ draft, onChange, onAdd, onCancel, editMode }: {
  draft: KCDraft
  onChange: (d: KCDraft) => void
  onAdd: () => void
  onCancel?: () => void
  editMode?: boolean
}) {
  const canAdd = draft.question.trim().length > 0 && draft.options.every(o => o.trim().length > 0)
  return (
    <div className="rounded-xl p-3 space-y-2.5" style={{ backgroundColor: "#1E293B", border: "1px dashed #8B5CF630" }}>
      <p className="text-xs font-semibold" style={{ color: "#8B5CF6" }}>{editMode ? "Edit Question" : "Add Question"}</p>
      <input
        value={draft.question}
        onChange={e => onChange({ ...draft, question: e.target.value })}
        placeholder="Question text…"
        className="w-full px-3 py-2 rounded-xl text-xs outline-none placeholder-slate-600"
        style={{ backgroundColor: "#0F172A", border: "1px solid #334155", color: "#F8FAFC" }}
        onFocus={e => (e.currentTarget.style.borderColor = "#8B5CF6")}
        onBlur={e => (e.currentTarget.style.borderColor = "#334155")}
      />
      <div className="grid grid-cols-2 gap-2">
        {draft.options.map((opt, oi) => (
          <div key={oi} className="flex items-center gap-2">
            <button
              type="button"
              title={`Mark option ${String.fromCharCode(65 + oi)} as correct`}
              onClick={() => onChange({ ...draft, correctIndex: oi })}
              className="flex-shrink-0 w-4 h-4 rounded-full border-2 transition-all"
              style={{
                borderColor: draft.correctIndex === oi ? "#8B5CF6" : "#475569",
                backgroundColor: draft.correctIndex === oi ? "#8B5CF6" : "transparent",
              }}
            />
            <input
              value={opt}
              onChange={e => { const opts = [...draft.options]; opts[oi] = e.target.value; onChange({ ...draft, options: opts }) }}
              placeholder={`Option ${String.fromCharCode(65 + oi)}`}
              className="flex-1 px-2 py-1.5 rounded-lg text-xs outline-none placeholder-slate-600"
              style={{ backgroundColor: "#0F172A", border: "1px solid #334155", color: "#F8FAFC" }}
              onFocus={e => (e.currentTarget.style.borderColor = "#8B5CF6")}
              onBlur={e => (e.currentTarget.style.borderColor = "#334155")}
            />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{ backgroundColor: "#334155", color: "#94A3B8" }}
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={onAdd}
          disabled={!canAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-30 transition-all"
          style={{ backgroundColor: "#8B5CF620", color: "#A78BFA", border: "1px solid #8B5CF630" }}
        >
          {editMode ? <Check size={12} /> : <Plus size={12} />}
          {editMode ? "Save" : "Add Question"}
        </button>
      </div>
    </div>
  )
}

// ── Step 3: Curriculum ────────────────────────────────────────────────────────

function CurriculumTab({ form, onChange }: { form: CourseForm; onChange: (f: CourseForm) => void }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [quizEditorId, setQuizEditorId] = useState<string | null>(null)
  const [textEditorId, setTextEditorId] = useState<string | null>(null)
  const [uploadTarget, setUploadTarget] = useState<{ sectionId: string; lessonId: string } | null>(null)
  const [uploadProgress, setUploadProgress] = useState<{ lessonId: string; percent: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Resources
  const [resourceOpenId, setResourceOpenId] = useState<string | null>(null)
  const [linkUrl, setLinkUrl] = useState("")
  const [linkName, setLinkName] = useState("")
  const resourceFileRef = useRef<HTMLInputElement>(null)
  const [resourceTarget, setResourceTarget] = useState<{ sectionId: string; lessonId: string } | null>(null)

  // Knowledge Checks
  const [lessonKCOpenId, setLessonKCOpenId] = useState<string | null>(null)
  const [sectionKCOpenId, setSectionKCOpenId] = useState<string | null>(null)
  const [sessionKCPartFormId, setSessionKCPartFormId] = useState<string | null>(null)
  const EMPTY_KC_DRAFT: KCDraft = { question: "", options: ["", "", "", ""], correctIndex: 0 }
  const [lessonKCQ, setLessonKCQ] = useState<KCDraft>(EMPTY_KC_DRAFT)
  const [sessionKCQ, setSessionKCQ] = useState<KCDraft>(EMPTY_KC_DRAFT)
  const [editingKCQ, setEditingKCQ] = useState<{
    type: "lesson" | "session"
    sectionId: string
    lessonId: string
    questionId: string
    draft: KCDraft
  } | null>(null)

  // ── KC helpers ──────────────────────────────────────────────────────────────

  function getLessonKC(sId: string, lId: string): LessonKnowledgeCheck | undefined {
    return form.sections.find(s => s.id === sId)?.lessons.find(l => l.id === lId)?.lessonKC
  }

  function patchLessonKC(sId: string, lId: string, patch: Partial<LessonKnowledgeCheck>) {
    onChange({
      ...form,
      sections: form.sections.map(s => s.id !== sId ? s : {
        ...s,
        lessons: s.lessons.map(l => l.id !== lId ? l : {
          ...l,
          lessonKC: { questions: [], passingScore: 80, isMandatory: false, ...l.lessonKC, ...patch },
        }),
      }),
    })
  }

  function addLessonKCQuestion(sId: string, lId: string) {
    const { question, options, correctIndex } = lessonKCQ
    if (!question.trim() || options.some(o => !o.trim())) return
    const q: QuizQuestion = { id: `lkc-${Date.now()}`, question: question.trim(), options: options.map(o => o.trim()), correctIndex }
    patchLessonKC(sId, lId, { questions: [...(getLessonKC(sId, lId)?.questions ?? []), q] })
    setLessonKCQ(EMPTY_KC_DRAFT)
  }

  function removeLessonKCQuestion(sId: string, lId: string, qId: string) {
    const kc = getLessonKC(sId, lId)
    if (!kc) return
    patchLessonKC(sId, lId, { questions: kc.questions.filter(q => q.id !== qId) })
  }

  function removeLessonKC(sId: string, lId: string) {
    onChange({
      ...form,
      sections: form.sections.map(s => s.id !== sId ? s : {
        ...s,
        lessons: s.lessons.map(l => l.id !== lId ? l : { ...l, lessonKC: undefined }),
      }),
    })
  }

  function getSessionKC(sId: string): SessionKnowledgeCheck | undefined {
    return form.sections.find(s => s.id === sId)?.sessionKC
  }

  function patchSessionKC(sId: string, patch: Partial<SessionKnowledgeCheck>) {
    const kc = getSessionKC(sId)
    if (!kc) return
    onChange({ ...form, sections: form.sections.map(s => s.id !== sId ? s : { ...s, sessionKC: { ...kc, ...patch } }) })
  }

  function initSessionKC(sId: string) {
    const section = form.sections.find(s => s.id === sId)
    if (!section || section.sessionKC) return
    const parts: SessionKCPart[] = section.lessons.map(l => ({ lessonId: l.id, questions: [], passingScore: 80 }))
    onChange({ ...form, sections: form.sections.map(s => s.id !== sId ? s : { ...s, sessionKC: { isMandatory: false, parts } }) })
  }

  function patchSessionKCPart(sId: string, lId: string, patch: Partial<SessionKCPart>) {
    const kc = getSessionKC(sId)
    if (!kc) return
    patchSessionKC(sId, { parts: kc.parts.map(p => p.lessonId !== lId ? p : { ...p, ...patch }) })
  }

  function addSessionKCQuestion(sId: string, lId: string) {
    const { question, options, correctIndex } = sessionKCQ
    if (!question.trim() || options.some(o => !o.trim())) return
    const q: QuizQuestion = { id: `skc-${Date.now()}`, question: question.trim(), options: options.map(o => o.trim()), correctIndex }
    const kc = getSessionKC(sId)
    if (!kc) return
    const part = kc.parts.find(p => p.lessonId === lId)
    patchSessionKCPart(sId, lId, { questions: [...(part?.questions ?? []), q] })
    setSessionKCQ(EMPTY_KC_DRAFT)
  }

  function removeSessionKCQuestion(sId: string, lId: string, qId: string) {
    const kc = getSessionKC(sId)
    if (!kc) return
    const part = kc.parts.find(p => p.lessonId === lId)
    if (!part) return
    patchSessionKCPart(sId, lId, { questions: part.questions.filter(q => q.id !== qId) })
  }

  function removeSessionKC(sId: string) {
    onChange({ ...form, sections: form.sections.map(s => s.id !== sId ? s : { ...s, sessionKC: undefined }) })
  }

  function saveEditKCQuestion() {
    if (!editingKCQ) return
    const { type, sectionId, lessonId, questionId, draft } = editingKCQ
    const { question, options, correctIndex } = draft
    if (!question.trim() || options.some(o => !o.trim())) return
    const updated: QuizQuestion = { id: questionId, question: question.trim(), options: options.map(o => o.trim()), correctIndex }
    if (type === "lesson") {
      const kc = getLessonKC(sectionId, lessonId)
      if (!kc) return
      patchLessonKC(sectionId, lessonId, { questions: kc.questions.map(q => q.id === questionId ? updated : q) })
    } else {
      const kc = getSessionKC(sectionId)
      if (!kc) return
      const part = kc.parts.find(p => p.lessonId === lessonId)
      if (!part) return
      patchSessionKCPart(sectionId, lessonId, { questions: part.questions.map(q => q.id === questionId ? updated : q) })
    }
    setEditingKCQ(null)
  }

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

  function getLessonResources(sectionId: string, lessonId: string): LessonResource[] {
    return form.sections.find(s => s.id === sectionId)?.lessons.find(l => l.id === lessonId)?.resources ?? []
  }

  function addFileResource(sectionId: string, lessonId: string, file: File) {
    const id = `res-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`
    const fileType: LessonResource["fileType"] =
      file.name.toLowerCase().endsWith(".zip") || file.name.toLowerCase().endsWith(".tar") || file.name.toLowerCase().endsWith(".gz") ? "zip"
      : file.type === "application/pdf" ? "pdf"
      : file.type.startsWith("image/") ? "image"
      : file.type.startsWith("text/") || /\.(md|doc|docx|txt)$/i.test(file.name) ? "text"
      : "other"
    const resource: LessonResource = {
      id, type: "file", name: file.name, url: URL.createObjectURL(file), fileType,
      size: file.size > 1024 * 1024 ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`,
    }
    updateLesson(sectionId, lessonId, { resources: [...getLessonResources(sectionId, lessonId), resource] })
  }

  function addLinkResource(sectionId: string, lessonId: string) {
    if (!linkUrl.trim()) return
    const id = `res-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`
    const resource: LessonResource = { id, type: "link", name: linkName.trim() || linkUrl.trim(), url: linkUrl.trim() }
    updateLesson(sectionId, lessonId, { resources: [...getLessonResources(sectionId, lessonId), resource] })
    setLinkUrl(""); setLinkName("")
  }

  function removeResource(sectionId: string, lessonId: string, resourceId: string) {
    updateLesson(sectionId, lessonId, { resources: getLessonResources(sectionId, lessonId).filter(r => r.id !== resourceId) })
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
      <input
        ref={resourceFileRef}
        type="file"
        multiple
        accept=".zip,.tar,.gz,.pdf,image/*,.txt,.md,.doc,.docx"
        className="hidden"
        onChange={(e) => {
          const target = resourceTarget
          if (!target) return
          Array.from(e.target.files ?? []).forEach(f => addFileResource(target.sectionId, target.lessonId, f))
          e.target.value = ""
          setResourceTarget(null)
        }}
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
              {/* Session KC toggle */}
              <button
                type="button"
                title="Session Knowledge Check"
                onClick={() => {
                  if (!section.sessionKC) initSessionKC(section.id)
                  setSectionKCOpenId(prev => prev === section.id ? null : section.id)
                }}
                className="p-1 rounded hover:bg-white/5 transition-colors flex-shrink-0 relative"
                style={{ color: section.sessionKC ? "#8B5CF6" : "#64748B" }}
              >
                <BrainCircuit size={14} />
                {(section.sessionKC?.parts.reduce((a, p) => a + p.questions.length, 0) ?? 0) > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold text-white" style={{ backgroundColor: "#8B5CF6" }}>
                    {section.sessionKC!.parts.reduce((a, p) => a + p.questions.length, 0)}
                  </span>
                )}
              </button>
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

          {/* Session KC panel */}
          {sectionKCOpenId === section.id && section.sessionKC && (
            <div className="px-4 py-4 space-y-3" style={{ backgroundColor: "#080D1A", borderBottom: "1px solid #334155" }}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold" style={{ color: "#8B5CF6" }}>Session Knowledge Check</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs select-none" style={{ color: "#94A3B8" }}>
                    <Toggle
                      checked={section.sessionKC.isMandatory}
                      onChange={() => patchSessionKC(section.id, { isMandatory: !section.sessionKC!.isMandatory })}
                    />
                    Mandatory
                  </div>
                  <button
                    type="button"
                    onClick={() => { removeSessionKC(section.id); setSectionKCOpenId(null) }}
                    className="p-1 rounded-lg transition-colors"
                    style={{ color: "#475569" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#EF4444")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#475569")}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <p className="text-xs" style={{ color: "#475569" }}>
                Shown before the section starts. Students who pass a part&apos;s check can skip that lesson; failed parts must be completed.
                {section.sessionKC.isMandatory ? " (Mandatory — students cannot skip this check.)" : ""}
              </p>

              <div className="space-y-2">
                {section.lessons.map((lesson, li) => {
                  const part = section.sessionKC!.parts.find(p => p.lessonId === lesson.id)
                  const partQs = part?.questions ?? []
                  const partOpen = sessionKCPartFormId === lesson.id
                  return (
                    <div key={lesson.id} className="rounded-xl overflow-hidden" style={{ border: "1px solid #334155" }}>
                      <div className="flex items-center gap-3 px-3 py-2.5" style={{ backgroundColor: "#1E293B" }}>
                        <span className="text-xs font-bold flex-shrink-0" style={{ color: "#8B5CF6" }}>Part {li + 1}</span>
                        <span className="text-xs text-white flex-1 min-w-0 truncate">{lesson.title}</span>
                        <span className="text-xs flex-shrink-0" style={{ color: "#475569" }}>
                          {partQs.length} Q{partQs.length !== 1 ? "s" : ""}
                        </span>
                        <span className="text-xs flex-shrink-0" style={{ color: "#64748B" }}>
                          Pass {part?.passingScore ?? 80}%
                        </span>
                        <button
                          type="button"
                          onClick={() => setSessionKCPartFormId(prev => prev === lesson.id ? null : lesson.id)}
                          className="text-xs px-2 py-0.5 rounded-lg flex-shrink-0 transition-colors"
                          style={{ backgroundColor: partOpen ? "#8B5CF620" : "#334155", color: partOpen ? "#A78BFA" : "#64748B" }}
                        >
                          {partOpen ? "Close" : "Edit"}
                        </button>
                      </div>
                      {partOpen && (
                        <div className="px-3 py-3 space-y-3" style={{ backgroundColor: "#0A0F1E" }}>
                          <div className="flex items-center gap-2">
                            <span className="text-xs" style={{ color: "#64748B" }}>Passing score</span>
                            <input
                              type="number" min={0} max={100}
                              value={part?.passingScore ?? 80}
                              onChange={e => patchSessionKCPart(section.id, lesson.id, { passingScore: Number(e.target.value) })}
                              className="w-16 px-2 py-1 rounded-lg text-xs text-center outline-none"
                              style={{ backgroundColor: "#1E293B", border: "1px solid #334155", color: "#F8FAFC" }}
                            />
                            <span className="text-xs" style={{ color: "#64748B" }}>%</span>
                          </div>
                          {partQs.map((q, qi) => {
                            const isEditingThis = editingKCQ?.type === "session" && editingKCQ.sectionId === section.id && editingKCQ.lessonId === lesson.id && editingKCQ.questionId === q.id
                            return isEditingThis ? (
                              <KCQuestionForm
                                key={q.id}
                                draft={editingKCQ.draft}
                                onChange={d => setEditingKCQ(prev => prev ? { ...prev, draft: d } : null)}
                                onAdd={saveEditKCQuestion}
                                onCancel={() => setEditingKCQ(null)}
                                editMode
                              />
                            ) : (
                              <div key={q.id} className="flex items-start gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
                                <span className="text-xs font-bold flex-shrink-0 mt-0.5" style={{ color: "#8B5CF6" }}>{qi + 1}.</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-white">{q.question}</p>
                                  <p className="text-[10px] mt-0.5" style={{ color: "#10B981" }}>✓ {q.options[q.correctIndex]}</p>
                                </div>
                                <button type="button"
                                  onClick={() => setEditingKCQ({ type: "session", sectionId: section.id, lessonId: lesson.id, questionId: q.id, draft: { question: q.question, options: [...q.options], correctIndex: q.correctIndex } })}
                                  className="p-1 rounded flex-shrink-0 transition-colors" style={{ color: "#475569" }}
                                  onMouseEnter={e => (e.currentTarget.style.color = "#8B5CF6")}
                                  onMouseLeave={e => (e.currentTarget.style.color = "#475569")}>
                                  <Pencil size={11} />
                                </button>
                                <button type="button" onClick={() => removeSessionKCQuestion(section.id, lesson.id, q.id)}
                                  className="p-1 rounded flex-shrink-0 transition-colors" style={{ color: "#475569" }}
                                  onMouseEnter={e => (e.currentTarget.style.color = "#EF4444")}
                                  onMouseLeave={e => (e.currentTarget.style.color = "#475569")}>
                                  <X size={11} />
                                </button>
                              </div>
                            )
                          })}
                          <KCQuestionForm
                            draft={sessionKCQ}
                            onChange={setSessionKCQ}
                            onAdd={() => addSessionKCQuestion(section.id, lesson.id)}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

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

                      <button
                        type="button"
                        title="Resources"
                        onClick={() => setResourceOpenId(prev => prev === lesson.id ? null : lesson.id)}
                        className="p-1.5 rounded-lg transition-colors flex-shrink-0 relative"
                        style={{ color: resourceOpenId === lesson.id ? "#F59E0B" : (lesson.resources?.length ? "#F59E0B" : "#334155") }}
                      >
                        <Paperclip size={13} />
                        {(lesson.resources?.length ?? 0) > 0 && (
                          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                            style={{ backgroundColor: "#F59E0B" }}>
                            {lesson.resources!.length}
                          </span>
                        )}
                      </button>

                      {/* Lesson KC button */}
                      <button
                        type="button"
                        title="Lesson Knowledge Check"
                        onClick={() => setLessonKCOpenId(prev => prev === lesson.id ? null : lesson.id)}
                        className="p-1.5 rounded-lg transition-colors flex-shrink-0 relative"
                        style={{ color: lesson.lessonKC ? "#8B5CF6" : (lessonKCOpenId === lesson.id ? "#8B5CF6" : "#334155") }}
                      >
                        <BrainCircuit size={13} />
                        {(lesson.lessonKC?.questions.length ?? 0) > 0 && (
                          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                            style={{ backgroundColor: "#8B5CF6" }}>
                            {lesson.lessonKC!.questions.length}
                          </span>
                        )}
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

                    {/* Video URL input (for testing) */}
                    {lesson.type === "video" && (
                      <div className="px-4 py-3" style={{ backgroundColor: "#0A0F1E", borderTop: "1px solid #334155" }}>
                        <label className="block text-xs font-semibold mb-2" style={{ color: "#64748B" }}>Video URL (for testing)</label>
                        <input
                          value={lesson.videoUrl || ""}
                          onChange={(e) => updateLesson(section.id, lesson.id, { videoUrl: e.target.value })}
                          placeholder="https://example.com/video.mp4"
                          className="w-full px-3 py-2 rounded-lg text-xs outline-none placeholder-slate-600"
                          style={{ backgroundColor: "#1E293B", border: "1px solid #334155", color: "#F8FAFC" }}
                          onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
                          onBlur={(e) => (e.currentTarget.style.borderColor = "#334155")}
                        />
                        <p className="text-[10px] mt-1.5" style={{ color: "#475569" }}>Paste a public video URL (MP4). For testing: https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4</p>
                      </div>
                    )}

                    {/* Resources panel */}
                    {resourceOpenId === lesson.id && (
                      <div className="px-4 pb-4 pt-3 space-y-3" style={{ backgroundColor: "#0A0F1E", borderTop: "1px solid #334155" }}>
                        <p className="text-xs font-semibold" style={{ color: "#F59E0B" }}>Lesson Resources</p>

                        {/* Existing resources */}
                        {(lesson.resources ?? []).length > 0 && (
                          <div className="space-y-1.5">
                            {(lesson.resources ?? []).map(r => {
                              const isGithub = r.type === "link" && r.url.includes("github.com")
                              return (
                                <div key={r.id} className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
                                  style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
                                  {r.type === "link"
                                    ? <Link2 size={13} style={{ color: isGithub ? "#94A3B8" : "#3B82F6", flexShrink: 0 }} />
                                    : r.fileType === "zip"
                                    ? <Archive size={13} style={{ color: "#F59E0B", flexShrink: 0 }} />
                                    : r.fileType === "pdf"
                                    ? <FileText size={13} style={{ color: "#EF4444", flexShrink: 0 }} />
                                    : r.fileType === "image"
                                    ? <ImageIcon size={13} style={{ color: "#10B981", flexShrink: 0 }} />
                                    : <FileText size={13} style={{ color: "#64748B", flexShrink: 0 }} />}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-white truncate">{r.name}</p>
                                    {r.type === "link" && (
                                      <p className="text-[10px] truncate" style={{ color: "#475569" }}>{r.url}</p>
                                    )}
                                    {r.size && (
                                      <p className="text-[10px]" style={{ color: "#475569" }}>{r.size}</p>
                                    )}
                                  </div>
                                  {r.type === "link" && (
                                    <a href={r.url} target="_blank" rel="noopener noreferrer"
                                      className="p-1 rounded-lg flex-shrink-0 transition-colors"
                                      style={{ color: "#475569" }}
                                      onMouseEnter={e => (e.currentTarget.style.color = "#3B82F6")}
                                      onMouseLeave={e => (e.currentTarget.style.color = "#475569")}>
                                      <ExternalLink size={11} />
                                    </a>
                                  )}
                                  <button type="button"
                                    onClick={() => removeResource(section.id, lesson.id, r.id)}
                                    className="p-1 rounded-lg flex-shrink-0 transition-colors"
                                    style={{ color: "#475569" }}
                                    onMouseEnter={e => (e.currentTarget.style.color = "#EF4444")}
                                    onMouseLeave={e => (e.currentTarget.style.color = "#475569")}>
                                    <X size={11} />
                                  </button>
                                </div>
                              )
                            })}
                          </div>
                        )}

                        {/* Add file */}
                        <button
                          type="button"
                          onClick={() => { setResourceTarget({ sectionId: section.id, lessonId: lesson.id }); resourceFileRef.current?.click() }}
                          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-medium transition-colors"
                          style={{ border: "1px dashed #334155", color: "#64748B" }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = "#F59E0B"; e.currentTarget.style.color = "#F59E0B" }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = "#334155"; e.currentTarget.style.color = "#64748B" }}
                        >
                          <Archive size={12} /> Upload file (ZIP, PDF, image, doc…)
                        </button>

                        {/* Add link */}
                        <div className="space-y-1.5">
                          <input
                            value={linkName}
                            onChange={e => setLinkName(e.target.value)}
                            placeholder="Label (optional)"
                            className="w-full px-3 py-2 rounded-xl text-xs outline-none placeholder-slate-600"
                            style={{ backgroundColor: "#1E293B", border: "1px solid #334155", color: "#F8FAFC" }}
                            onFocus={e => (e.currentTarget.style.borderColor = "#F59E0B")}
                            onBlur={e => (e.currentTarget.style.borderColor = "#334155")}
                          />
                          <div className="flex items-center gap-2">
                            <input
                              value={linkUrl}
                              onChange={e => setLinkUrl(e.target.value)}
                              onKeyDown={e => { if (e.key === "Enter") addLinkResource(section.id, lesson.id) }}
                              placeholder="https://github.com/… or any URL"
                              className="flex-1 px-3 py-2 rounded-xl text-xs outline-none placeholder-slate-600"
                              style={{ backgroundColor: "#1E293B", border: "1px solid #334155", color: "#F8FAFC" }}
                              onFocus={e => (e.currentTarget.style.borderColor = "#F59E0B")}
                              onBlur={e => (e.currentTarget.style.borderColor = "#334155")}
                            />
                            <button
                              type="button"
                              onClick={() => addLinkResource(section.id, lesson.id)}
                              disabled={!linkUrl.trim()}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold flex-shrink-0 disabled:opacity-30"
                              style={{ backgroundColor: "#F59E0B20", color: "#F59E0B", border: "1px solid #F59E0B30" }}
                            >
                              <Plus size={11} /> Add Link
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Lesson KC panel */}
                    {lessonKCOpenId === lesson.id && (
                      <div className="px-4 pb-4 pt-3 space-y-3" style={{ backgroundColor: "#0A0F1E", borderTop: "1px solid #334155" }}>
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <p className="text-xs font-semibold" style={{ color: "#8B5CF6" }}>Lesson Knowledge Check</p>
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs" style={{ color: "#64748B" }}>Passing score</span>
                              <input
                                type="number" min={0} max={100}
                                value={lesson.lessonKC?.passingScore ?? 80}
                                onChange={e => patchLessonKC(section.id, lesson.id, { passingScore: Number(e.target.value) })}
                                className="w-14 px-2 py-1 rounded-lg text-xs text-center outline-none"
                                style={{ backgroundColor: "#1E293B", border: "1px solid #334155", color: "#F8FAFC" }}
                              />
                              <span className="text-xs" style={{ color: "#64748B" }}>%</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs select-none" style={{ color: "#94A3B8" }}>
                              <Toggle
                                checked={lesson.lessonKC?.isMandatory ?? false}
                                onChange={() => patchLessonKC(section.id, lesson.id, { isMandatory: !(lesson.lessonKC?.isMandatory ?? false) })}
                              />
                              Mandatory
                            </div>
                            {lesson.lessonKC && (
                              <button
                                type="button"
                                onClick={() => removeLessonKC(section.id, lesson.id)}
                                className="text-xs px-2 py-1 rounded-lg transition-colors"
                                style={{ backgroundColor: "#EF444420", color: "#EF4444", border: "1px solid #EF444430" }}
                              >
                                Remove KC
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-xs" style={{ color: "#475569" }}>
                          Students who pass can skip this lesson. Fail or skipped KC means the lesson must be completed.
                          {lesson.lessonKC?.isMandatory ? " (Mandatory — students cannot bypass this check.)" : ""}
                        </p>
                        {(lesson.lessonKC?.questions ?? []).map((q, qi) => {
                          const isEditingThis = editingKCQ?.type === "lesson" && editingKCQ.sectionId === section.id && editingKCQ.lessonId === lesson.id && editingKCQ.questionId === q.id
                          return isEditingThis ? (
                            <KCQuestionForm
                              key={q.id}
                              draft={editingKCQ.draft}
                              onChange={d => setEditingKCQ(prev => prev ? { ...prev, draft: d } : null)}
                              onAdd={saveEditKCQuestion}
                              onCancel={() => setEditingKCQ(null)}
                              editMode
                            />
                          ) : (
                            <div key={q.id} className="flex items-start gap-2 px-3 py-2.5 rounded-xl" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
                              <span className="text-xs font-bold flex-shrink-0 mt-0.5" style={{ color: "#8B5CF6" }}>{qi + 1}.</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-white">{q.question}</p>
                                <p className="text-[10px] mt-0.5" style={{ color: "#10B981" }}>✓ {q.options[q.correctIndex]}</p>
                              </div>
                              <button type="button"
                                onClick={() => setEditingKCQ({ type: "lesson", sectionId: section.id, lessonId: lesson.id, questionId: q.id, draft: { question: q.question, options: [...q.options], correctIndex: q.correctIndex } })}
                                className="p-1 rounded flex-shrink-0 transition-colors" style={{ color: "#475569" }}
                                onMouseEnter={e => (e.currentTarget.style.color = "#8B5CF6")}
                                onMouseLeave={e => (e.currentTarget.style.color = "#475569")}>
                                <Pencil size={11} />
                              </button>
                              <button type="button" onClick={() => removeLessonKCQuestion(section.id, lesson.id, q.id)}
                                className="p-1 rounded flex-shrink-0 transition-colors" style={{ color: "#475569" }}
                                onMouseEnter={e => (e.currentTarget.style.color = "#EF4444")}
                                onMouseLeave={e => (e.currentTarget.style.color = "#475569")}>
                                <X size={11} />
                              </button>
                            </div>
                          )
                        })}
                        <KCQuestionForm
                          draft={lessonKCQ}
                          onChange={setLessonKCQ}
                          onAdd={() => addLessonKCQuestion(section.id, lesson.id)}
                        />
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
                              max={questions.length || undefined}
                              caption={`Out of ${questions.length} question${questions.length !== 1 ? "s" : ""} shown.`}
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

      <div style={{ borderTop: "1px solid #334155", paddingTop: 24 }}>
        <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "#475569" }}>Featured Placement</p>

        <div className="p-4 rounded-xl" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Featured Course</p>
              <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>Highlight this course on the platform homepage.</p>
            </div>
            <Toggle checked={form.featured} onChange={() => onChange({ ...form, featured: !form.featured })} />
          </div>

          {form.featured && (
            <div className="flex items-center justify-between gap-4 mt-4 pt-4" style={{ borderTop: "1px solid #334155" }}>
              <p className="text-xs leading-relaxed" style={{ color: "#94A3B8" }}>
                Featured courses are billed a homepage placement fee for the duration they remain featured.
              </p>
              <p className="text-sm font-semibold whitespace-nowrap" style={{ color: "#34D399" }}>{FEATURED_PLACEMENT_FEE}</p>
            </div>
          )}
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

export function CourseEditor({ initialForm, mode, onExportSCORM, scormExporting }: CourseEditorProps) {
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
          <div className="px-3 pb-3 pt-2 space-y-2" style={{ borderTop: "1px solid #334155" }}>
            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded-full block"
              style={{ backgroundColor: mode === "edit" ? "#3B82F615" : "#10B98115", color: mode === "edit" ? "#60A5FA" : "#34D399" }}
            >
              {mode === "edit" ? "Editing" : "New Course"}
            </span>
            {mode === "edit" && onExportSCORM && (
              <button
                onClick={() => onExportSCORM(form)}
                disabled={scormExporting}
                className="w-full flex items-center justify-center gap-2 px-2 py-2 rounded-lg text-xs font-medium transition-colors"
                style={{
                  backgroundColor: scormExporting ? "#475569" : "#10B98115",
                  color: scormExporting ? "#94A3B8" : "#34D399",
                  border: "1px solid #10B98130",
                  cursor: scormExporting ? "not-allowed" : "pointer",
                }}
              >
                {scormExporting ? "Exporting..." : "↓ SCORM"}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Right: step content */}
      <div className="flex-1 min-w-0">
        {currentStep === 1 && <IntendedLearnersStep  {...stepProps} />}
        {currentStep === 2 && <CurriculumTab         {...stepProps} />}
        {currentStep === 3 && <CourseLandingPageStep {...stepProps} />}
        {currentStep === 4 && <PricingTab            {...stepProps} />}
        {currentStep === 5 && <PromotionsStep        {...stepProps} />}
        {currentStep === 6 && <CourseMessagesStep    {...stepProps} />}
      </div>
    </div>
  )
}
