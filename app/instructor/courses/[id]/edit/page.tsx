"use client"

import { use, useState } from "react"
import { Save, Send, Download } from "lucide-react"
import { InstructorPageShell } from "@/components/instructor/InstructorPageShell"
import { CourseEditor } from "@/components/instructor/CourseEditor"
import type { CourseForm } from "@/components/instructor/CourseEditor"
import { INSTRUCTOR_COURSES } from "@/lib/data/instructor-courses"
import { exportCourseAsSCORM } from "@/lib/scorm-export"

function buildInitialForm(id: number): CourseForm {
  const course = INSTRUCTOR_COURSES.find((c) => c.id === id)
  if (!course) {
    return {
      title: "",
      subtitle: "",
      description: "",
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
      targetAudience: [""],
      requirements: [""],
      testVideoFileName: undefined,
      testVideoUrl: undefined,
      couponCode: "",
      discountPercent: "",
      couponExpiry: "",
      welcomeMessage: "",
      completionMessage: "",
    }
  }

  return {
    title: course.title,
    subtitle: "",
    description: course.description,
    category: course.category,
    level: "All Levels",
    language: "English",
    color: course.color,
    isFree: course.students === 0 && course.revenue === "$0",
    price: course.revenue.replace(/[^0-9.]/g, ""),
    originalPrice: "",
    enrollmentType: "open",
    hasMaxStudents: false,
    maxStudents: "",
    status: course.status,
    featured: course.rating >= 4.8,
    commentsEnabled: true,
    certificate: course.status === "published",
    sections: course.sections,
    learningObjectives: ["", "", "", ""],
    targetAudience: [""],
    requirements: [""],
    testVideoFileName: undefined,
    testVideoUrl: undefined,
    couponCode: "",
    discountPercent: "",
    couponExpiry: "",
    welcomeMessage: "",
    completionMessage: "",
  }
}

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const courseId = parseInt(id, 10)
  const course = INSTRUCTOR_COURSES.find((c) => c.id === courseId)
  const [saved, setSaved] = useState(false)
  const [scormExporting, setScormExporting] = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleSCORMExport(form: CourseForm) {
    if (!form.title.trim()) {
      alert("Please enter a course title before exporting")
      return
    }
    if (form.sections.length === 0) {
      alert("Please add at least one section with lessons before exporting")
      return
    }

    setScormExporting(true)
    try {
      const blob = await exportCourseAsSCORM(form)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${form.title}-scorm.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("SCORM export failed:", error)
      alert("Failed to export course as SCORM. Check console for details.")
    } finally {
      setScormExporting(false)
    }
  }

  const isPublished = course?.status === "published"

  return (
    <InstructorPageShell
      title={course ? `Editing: ${course.title}` : "Edit Course"}
      user={{ name: "Jane Smith", email: "jane@example.com" }}
      action={
        <div className="flex items-center gap-2">
          {saved && (
            <span className="text-xs font-medium px-2.5 py-1.5 rounded-lg" style={{ backgroundColor: "#10B98118", color: "#6EE7B7" }}>
              Saved!
            </span>
          )}
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors hover:border-slate-500"
            style={{ backgroundColor: "#1E293B", border: "1px solid #334155", color: "#CBD5E1" }}
          >
            <Save size={14} />
            <span className="hidden sm:inline">Save Draft</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90"
            style={{ backgroundColor: "#3B82F6" }}
          >
            <Send size={14} />
            <span className="hidden sm:inline">{isPublished ? "Update" : "Publish"}</span>
          </button>
        </div>
      }
    >
      <CourseEditor
        initialForm={buildInitialForm(courseId)}
        mode="edit"
        onExportSCORM={handleSCORMExport}
        scormExporting={scormExporting}
      />
    </InstructorPageShell>
  )
}
