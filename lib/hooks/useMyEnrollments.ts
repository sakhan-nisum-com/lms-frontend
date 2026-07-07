"use client"

import { useState, useEffect } from "react"
import { enrollmentsApi, type EnrollmentResponse } from "@/lib/api/enrollments"
import { coursesApi, type ApiCourse } from "@/lib/api/courses"

export interface EnrolledCourse {
  enrollment: EnrollmentResponse
  course: ApiCourse
}

const EMPTY_ENROLLMENT = (courseId: string): EnrollmentResponse => ({
  id: courseId,
  studentId: "",
  courseId,
  enrolledAt: new Date().toISOString(),
  completedAt: null,
  progressPct: 0,
  lastAccessedLessonId: null,
  lastAccessedAt: null,
  totalTimeSpentSeconds: 0,
})

/**
 * Fetches all courses the student has access to:
 * 1. Backend enrollment records (requires login)
 * 2. extraCourseIds — IDs from localStorage purchases that aren't in the mock COURSES array
 *
 * Falls back gracefully when the enrollment API is unavailable (unauthenticated).
 */
export function useMyEnrollments(extraCourseIds: string[] = []) {
  const [items, setItems] = useState<EnrolledCourse[]>([])
  const [loading, setLoading] = useState(true)

  const extraKey = extraCourseIds.join(",")

  useEffect(() => {
    const extra = extraKey.split(",").filter(Boolean)

    enrollmentsApi.myEnrollments()
      .then((page) => page.data)
      .catch(() => [] as EnrollmentResponse[])
      .then(async (enrollments) => {
        const enrollmentMap = new Map(enrollments.map((e) => [e.courseId, e]))

        // Union of enrolled course IDs + purchased-only IDs
        const allIds = [...new Set([...enrollmentMap.keys(), ...extra])]
        if (allIds.length === 0) return

        const courses = await Promise.all(
          allIds.map((id) => coursesApi.getById(id).catch(() => null))
        )

        const pairs: EnrolledCourse[] = []
        for (let i = 0; i < allIds.length; i++) {
          if (!courses[i]) continue
          const courseId = allIds[i]
          pairs.push({
            enrollment: enrollmentMap.get(courseId) ?? EMPTY_ENROLLMENT(courseId),
            course: courses[i]!,
          })
        }
        setItems(pairs)
      })
      .finally(() => setLoading(false))
  // extraKey is a stable string derived from the array
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extraKey])

  return { items, loading }
}
