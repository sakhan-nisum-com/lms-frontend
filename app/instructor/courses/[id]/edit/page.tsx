"use client"

import { use, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Save, Send, Loader2 } from "lucide-react"
import { InstructorPageShell } from "@/components/instructor/InstructorPageShell"
import { CourseEditor } from "@/components/instructor/CourseEditor"
import type { CourseForm } from "@/components/instructor/CourseEditor"
import { coursesApi, type ApiCourse, type CreateCourseRequest, type CreateSectionRequest, type CreateLessonRequest } from "@/lib/api/courses"
import { quizzesApi, type CreateQuizRequest } from "@/lib/api/quizzes"
import { authStore } from "@/lib/auth-store"

function apiCourseToForm(c: ApiCourse): CourseForm {
  const levelDisplay: Record<string, string> = {
    BEGINNER: "Beginner", INTERMEDIATE: "Intermediate", ADVANCED: "Advanced", ALL_LEVELS: "All Levels",
  }
  return {
    title: c.title,
    titleAr: c.titleAr ?? "",
    subtitle: c.subtitle ?? "",
    subtitleAr: "",
    description: c.description ?? "",
    descriptionAr: "",
    category: c.category ?? "",
    level: levelDisplay[c.level] ?? "All Levels",
    language: c.language ?? "English",
    color: "#3B82F6",
    isFree: c.isFree ?? c.price === 0,
    price: c.price > 0 ? String(c.price) : "",
    originalPrice: c.originalPrice != null ? String(c.originalPrice) : "",
    enrollmentType: ((c.enrollmentType ?? "OPEN").toLowerCase() === "invite" ? "invite" : "open") as "open" | "invite",
    hasMaxStudents: c.maxStudents != null && c.maxStudents > 0,
    maxStudents: c.maxStudents != null ? String(c.maxStudents) : "",
    status: c.status?.toLowerCase() as CourseForm["status"] ?? "draft",
    featured: c.featured ?? false,
    commentsEnabled: c.commentsEnabled ?? true,
    certificate: c.certificateOffered ?? true,
    sections: c.sections.map((s) => ({
      id: s.id,
      title: s.title,
      expanded: true,
      lessons: s.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        type: (l.type === "QUIZ" ? "quiz" : l.type === "READING" ? "text" : l.type === "PDF" ? "pdf" : "video") as "video" | "text" | "quiz" | "pdf",
        duration: l.durationSeconds ? `${Math.ceil(l.durationSeconds / 60)} min` : "",
        isPreview: l.freePreview,
        videoUrl: l.videoUrl ?? undefined,
        videoFileName: l.videoUrl ? l.videoUrl.split("/").pop() : undefined,
        resourceUrl: l.resourceUrl ?? undefined,
        resourceFileName: l.resourceUrl ? l.resourceUrl.split("/").pop() : undefined,
        textContent: l.content ?? undefined,
        questions: [],
      })),
    })),
    learningObjectives: (c.learningObjectives ?? []).length > 0 ? (c.learningObjectives as string[]) : ["", "", "", ""],
    learningObjectivesAr: [""],
    targetAudience: (c.targetAudience ?? []).length > 0 ? (c.targetAudience as string[]) : [""],
    targetAudienceAr: [""],
    requirements: (c.requirements ?? []).length > 0 ? (c.requirements as string[]) : [""],
    requirementsAr: [""],
    testVideoFileName: undefined,
    testVideoUrl: undefined,
    couponCode: c.couponCode ?? "",
    discountPercent: c.discountPercent != null ? String(c.discountPercent) : "",
    couponExpiry: c.couponExpiry ? c.couponExpiry.substring(0, 10) : "",
    welcomeMessage: c.welcomeMessage ?? "",
    welcomeMessageAr: "",
    completionMessage: c.completionMessage ?? "",
    completionMessageAr: "",
  }
}

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const formRef = useRef<CourseForm | null>(null)
  const [initialForm, setInitialForm] = useState<CourseForm | null>(null)
  const [courseTitle, setCourseTitle] = useState("Edit Course")
  const [isPublished, setIsPublished] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null)
  const user = authStore.getUser()

  function showToast(text: string, ok: boolean) {
    setToast({ text, ok })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    async function load() {
      try {
        const course = await coursesApi.getById(id)
        const form = apiCourseToForm(course)

        // Load quiz questions for each quiz lesson
        for (const section of form.sections) {
          for (const lesson of section.lessons) {
            if (lesson.type === "quiz") {
              try {
                const quizzes = await quizzesApi.getByLesson(lesson.id)
                if (quizzes.length > 0) {
                  const quiz = quizzes[0]
                  lesson.quizId = quiz.id
                  lesson.questions = (quiz.questions ?? []).map((q) => ({
                    id: q.id ?? `q-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
                    question: q.questionText ?? "",
                    options: (q.options ?? []).map((o) => o.text),
                    correctIndex: q.correctIndex ?? 0,
                  }))
                  lesson.quizMode = quiz.randomizeQuestions ? "bank" : "fixed"
                  if (quiz.randomizeQuestions && quiz.maxAttempts) {
                    lesson.randomQuestionCount = quiz.maxAttempts
                  }
                }
              } catch {
                // no quiz for this lesson yet
              }
            }
          }
        }

        setInitialForm(form)
        setCourseTitle(course.title)
        setIsPublished(course.status === "PUBLISHED")
      } catch {
        showToast("Failed to load course", false)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  async function saveCourse(publish: boolean) {
    const form = formRef.current
    if (!form) return
    if (!form.title.trim()) {
      showToast("Please add a course title.", false)
      return
    }

    publish ? setPublishing(true) : setSaving(true)
    try {
      const levelMap: Record<string, CreateCourseRequest["level"]> = {
        beginner: "BEGINNER", intermediate: "INTERMEDIATE", advanced: "ADVANCED", "all levels": "ALL_LEVELS",
      }
      const body: Partial<CreateCourseRequest> = {
        title: form.title.trim(),
        titleAr: form.titleAr?.trim() || undefined,
        subtitle: form.subtitle?.trim() || undefined,
        description: form.description?.trim() || undefined,
        descriptionAr: form.descriptionAr?.trim() || undefined,
        category: form.category?.trim() || undefined,
        level: levelMap[form.level.toLowerCase()] ?? "BEGINNER",
        language: form.language || "English",
        price: form.isFree ? 0 : parseFloat(form.price || "0"),
        originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : undefined,
        isFree: form.isFree,
        enrollmentType: form.enrollmentType?.toUpperCase() || "OPEN",
        certificateOffered: form.certificate,
        featured: form.featured,
        commentsEnabled: form.commentsEnabled,
        maxStudents: form.hasMaxStudents ? parseInt(form.maxStudents || "0") : undefined,
        welcomeMessage: form.welcomeMessage?.trim() || undefined,
        completionMessage: form.completionMessage?.trim() || undefined,
        learningObjectives: form.learningObjectives.filter(Boolean),
        targetAudience: form.targetAudience.filter(Boolean),
        requirements: form.requirements.filter(Boolean),
        couponCode: form.couponCode?.trim() || undefined,
        discountPercent: form.discountPercent ? parseFloat(form.discountPercent) : undefined,
        couponExpiry: form.couponExpiry ? `${form.couponExpiry}T00:00:00Z` : undefined,
      }

      await coursesApi.update(id, body)

      const isUUID = (v: string | undefined) =>
        !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)

      // Sync sections/lessons
      for (const section of form.sections) {
        let sectionId = section.id
        if (!isUUID(sectionId)) {
          const sectionBody: CreateSectionRequest = {
            title: section.title || "Section",
            titleAr: section.titleAr || undefined,
            sortOrder: form.sections.indexOf(section),
          }
          const created = await coursesApi.createSection(id, sectionBody)
          sectionId = created.id
        }
        for (const lesson of section.lessons) {
          const lessonBody: CreateLessonRequest = {
            title: lesson.title || "Lesson",
            titleAr: lesson.titleAr || undefined,
            type: lesson.type?.toUpperCase() === "QUIZ" ? "QUIZ"
              : lesson.type?.toUpperCase() === "TEXT" ? "READING"
              : lesson.type?.toUpperCase() === "PDF" ? "PDF"
              : "VIDEO",
            sortOrder: section.lessons.indexOf(lesson),
            freePreview: lesson.isPreview ?? false,
            videoUrl: lesson.videoUrl || undefined,
            resourceUrl: lesson.resourceUrl || undefined,
            content: lesson.textContent || undefined,
          }
          if (!isUUID(lesson.id)) {
            const createdLesson = await coursesApi.createLesson(id, sectionId, lessonBody)
            if (lesson.type === "quiz" && lesson.questions && lesson.questions.length > 0) {
              const quizBody: CreateQuizRequest = {
                lessonId: createdLesson.id,
                title: lesson.title || "Quiz",
                passingScore: 70,
                timeLimitMinutes: 30,
                randomizeQuestions: lesson.quizMode === "bank",
                maxAttempts: lesson.quizMode === "bank" && lesson.randomQuestionCount
                  ? lesson.randomQuestionCount : undefined,
                questions: lesson.questions.map((q, qi) => ({
                  type: "MCQ" as const,
                  questionText: q.question,
                  points: 1,
                  sortOrder: qi,
                  options: q.options.map((opt) => ({ text: opt })),
                  correctIndex: q.correctIndex,
                })),
              }
              await quizzesApi.create(quizBody)
            }
          } else {
            await coursesApi.updateLesson(id, sectionId, lesson.id!, lessonBody)
            if (lesson.type === "quiz" && lesson.questions && lesson.questions.length > 0) {
              const quizBody: CreateQuizRequest = {
                title: lesson.title || "Quiz",
                passingScore: 70,
                timeLimitMinutes: 30,
                randomizeQuestions: lesson.quizMode === "bank",
                maxAttempts: lesson.quizMode === "bank" && lesson.randomQuestionCount
                  ? lesson.randomQuestionCount : undefined,
                questions: lesson.questions.map((q, qi) => ({
                  type: "MCQ" as const,
                  questionText: q.question,
                  points: 1,
                  sortOrder: qi,
                  options: q.options.map((opt) => ({ text: opt })),
                  correctIndex: q.correctIndex,
                })),
              }
              if (lesson.quizId) {
                await quizzesApi.update(lesson.quizId, quizBody)
              } else {
                await quizzesApi.create({ ...quizBody, lessonId: lesson.id! })
              }
            }
          }
        }
      }

      if (publish && !isPublished) {
        await coursesApi.submitForReview(id)
        showToast("Submitted for review!", true)
      } else {
        showToast("Changes saved!", true)
      }

      setTimeout(() => router.push("/instructor/courses"), 1000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save"
      showToast(msg, false)
    } finally {
      setSaving(false)
      setPublishing(false)
    }
  }

  if (loading) {
    return (
      <InstructorPageShell title="Edit Course" user={{ name: user?.fullName ?? "Instructor", email: user?.email ?? "" }}>
        <div className="flex items-center justify-center py-32">
          <Loader2 size={28} className="animate-spin" style={{ color: "var(--text-muted)" }} />
        </div>
      </InstructorPageShell>
    )
  }

  if (!initialForm) {
    return (
      <InstructorPageShell title="Edit Course" user={{ name: user?.fullName ?? "Instructor", email: user?.email ?? "" }}>
        <div className="flex flex-col items-center justify-center py-32">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Course not found.</p>
        </div>
      </InstructorPageShell>
    )
  }

  return (
    <InstructorPageShell
      title={`Editing: ${courseTitle}`}
      user={{ name: user?.fullName ?? "Instructor", email: user?.email ?? "" }}
      action={
        <div className="flex items-center gap-2">
          {toast && (
            <span className="text-xs font-medium px-2.5 py-1.5 rounded-lg"
              style={{ backgroundColor: toast.ok ? "#10B98118" : "#EF444418", color: toast.ok ? "#10B981" : "#EF4444" }}>
              {toast.text}
            </span>
          )}
          <button onClick={() => saveCourse(false)} disabled={saving || publishing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span className="hidden sm:inline">Save Draft</span>
          </button>
          <button onClick={() => saveCourse(true)} disabled={saving || publishing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: "var(--accent)" }}>
            {publishing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            <span className="hidden sm:inline">{isPublished ? "Update" : "Submit for Review"}</span>
          </button>
        </div>
      }
    >
      <CourseEditor
        initialForm={initialForm}
        mode="edit"
        onFormChange={(f) => { formRef.current = f }}
      />
    </InstructorPageShell>
  )
}
