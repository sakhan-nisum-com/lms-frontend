import type { Course, CourseCategory } from "@/lib/data/courses"

const CATEGORY_KEYWORDS: Record<CourseCategory, string> = {
  Engineering: "programming",
  "Data Science": "data",
  Design: "design",
  Business: "business",
  Security: "cybersecurity",
  Compliance: "compliance",
  Leadership: "leadership",
  Product: "product",
}

// Deterministic per-course photo: same course always gets the same image,
// topically matched to its category via loremflickr's tag search.
export function getCourseImageUrl(course: Pick<Course, "id" | "category">, width = 600, height = 400) {
  const keyword = CATEGORY_KEYWORDS[course.category]
  const lock = parseInt(course.id.replace(/\D/g, ""), 10) || 1
  return `https://loremflickr.com/${width}/${height}/${keyword}?lock=${lock}`
}
