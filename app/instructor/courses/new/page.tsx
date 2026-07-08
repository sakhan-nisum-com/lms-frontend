"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Save, Send, Loader2 } from "lucide-react"
import { InstructorPageShell } from "@/components/instructor/InstructorPageShell"
import { CourseEditor } from "@/components/instructor/CourseEditor"
import type { CourseForm } from "@/components/instructor/CourseEditor"
import { coursesApi, type CreateCourseRequest, type CreateSectionRequest, type CreateLessonRequest } from "@/lib/api/courses"
import { quizzesApi, type CreateQuizRequest } from "@/lib/api/quizzes"
import { authStore } from "@/lib/auth-store"

const DEFAULT_FORM: CourseForm = {
  title: "",
  titleAr: "",
  subtitle: "",
  subtitleAr: "",
  description: "",
  descriptionAr: "",
  category: "",
  level: "All Levels",
  language: "English",
  color: "#3B82F6",
  isFree: true,
  price: "",
  originalPrice: "",
  enrollmentType: "open",
  hasMaxStudents: false,
  maxStudents: "",
  status: "draft",
  featured: false,
  commentsEnabled: true,
  certificate: true,
  sections: [],
  learningObjectives: ["", "", "", ""],
  learningObjectivesAr: [""],
  targetAudience: [""],
  targetAudienceAr: [""],
  requirements: [""],
  requirementsAr: [""],
  testVideoFileName: undefined,
  testVideoUrl: undefined,
  couponCode: "",
  discountPercent: "",
  couponExpiry: "",
  welcomeMessage: "",
  welcomeMessageAr: "",
  completionMessage: "",
  completionMessageAr: "",
}

export default function NewCoursePage() {
  const router = useRouter()
  const formRef = useRef<CourseForm>(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null)
  const user = authStore.getUser()

  function showToast(text: string, ok: boolean) {
    setToast({ text, ok })
    setTimeout(() => setToast(null), 3000)
  }

  async function saveCourse(publish: boolean) {
    const form = formRef.current
    if (!form.title.trim()) {
      showToast("Please add a course title before saving.", false)
      return
    }

    publish ? setPublishing(true) : setSaving(true)
    try {
      const levelMap: Record<string, CreateCourseRequest["level"]> = {
        beginner: "BEGINNER", intermediate: "INTERMEDIATE", advanced: "ADVANCED", "all levels": "ALL_LEVELS",
      }
      const body: CreateCourseRequest = {
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

      const course = await coursesApi.create(body)

      // Create sections + lessons (+ quizzes inside quiz lessons)
      for (const section of form.sections) {
        const sectionBody: CreateSectionRequest = {
          title: section.title || "Section",
          titleAr: section.titleAr || undefined,
          sortOrder: form.sections.indexOf(section),
        }
        const createdSection = await coursesApi.createSection(course.id, sectionBody)

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
          const createdLesson = await coursesApi.createLesson(course.id, createdSection.id, lessonBody)

          // If this lesson is a quiz, create the quiz with its questions
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
        }
      }

      if (publish) {
        await coursesApi.submitForReview(course.id)
        showToast("Course submitted for review!", true)
      } else {
        showToast("Draft saved!", true)
      }

      setTimeout(() => router.push("/instructor/courses"), 1000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save course"
      showToast(msg, false)
    } finally {
      setSaving(false)
      setPublishing(false)
    }
  }

  return (
    <InstructorPageShell
      title="New Course"
      user={{ name: user?.fullName ?? "Instructor", email: user?.email ?? "" }}
      action={
        <div className="flex items-center gap-2">
          {toast && (
            <span className="text-xs font-medium px-2.5 py-1.5 rounded-lg"
              style={{ backgroundColor: toast.ok ? "#10B98118" : "#EF444418", color: toast.ok ? "#10B981" : "#EF4444" }}>
              {toast.text}
            </span>
          )}
          <button
            onClick={() => saveCourse(false)}
            disabled={saving || publishing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span className="hidden sm:inline">Save Draft</span>
          </button>
          <button
            onClick={() => saveCourse(true)}
            disabled={saving || publishing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: "var(--accent)" }}
          >
            {publishing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            <span className="hidden sm:inline">{publishing ? "Publishing…" : "Publish"}</span>
          </button>
        </div>
      }
    >
      <CourseEditor
        initialForm={DEFAULT_FORM}
        mode="new"
        onFormChange={(f) => { formRef.current = f }}
      />
    </InstructorPageShell>
  )
}
