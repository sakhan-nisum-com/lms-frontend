import type { Course } from "@/lib/data/courses"

type ProgressStore = Record<string, string[]>

// Merges a course's statically-seeded lesson completion with whatever the
// learner has marked complete in the lesson player (tracked in localStorage),
// so "is this course done" is accurate everywhere — not just on the one page
// that happens to call useProgress(courseId) directly.
export function getCourseProgress(course: Course, store: ProgressStore) {
  const completedFromStore = new Set(store[course.id] ?? [])
  const totalLessons = course.sections.reduce((s, sec) => s + sec.lessons.length, 0)
  const completedLessons = course.sections.reduce(
    (s, sec) => s + sec.lessons.filter((l) => l.completed || completedFromStore.has(l.id)).length,
    0
  )
  const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : (course.progress ?? 0)
  const isComplete = totalLessons > 0 ? progressPct === 100 : course.progress === 100

  return { totalLessons, completedLessons, progressPct, isComplete }
}
