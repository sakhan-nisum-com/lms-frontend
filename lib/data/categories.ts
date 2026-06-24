import type { CourseCategory } from "./courses"

export interface CategoryMeta {
  label: string
  value: CourseCategory
  slug: string
  subcategories: string[]
}

export const CATEGORIES: CategoryMeta[] = [
  { label: "Engineering", value: "Engineering", slug: "engineering", subcategories: ["Web Development", "Cloud & DevOps", "Mobile Development", "Programming Languages", "Software Architecture"] },
  { label: "Data Science", value: "Data Science", slug: "data-science", subcategories: ["Machine Learning", "Data Analysis", "Python for Data Science", "SQL & Databases", "Data Visualization"] },
  { label: "Design", value: "Design", slug: "design", subcategories: ["UX/UI Design", "Graphic Design", "Design Systems", "Figma & Prototyping", "Product Design"] },
  { label: "Business", value: "Business", slug: "business", subcategories: ["Entrepreneurship", "Project Management", "Sales", "Business Strategy", "Finance & Accounting"] },
  { label: "Security", value: "Security", slug: "security", subcategories: ["Cybersecurity Fundamentals", "Ethical Hacking", "Network Security", "Cloud Security", "Risk & Compliance"] },
  { label: "Compliance", value: "Compliance", slug: "compliance", subcategories: ["Workplace Safety", "Data Privacy & GDPR", "Regulatory Training", "Code of Conduct", "Anti-Harassment"] },
  { label: "Leadership", value: "Leadership", slug: "leadership", subcategories: ["People Management", "Communication Skills", "Coaching & Mentoring", "Decision Making", "Team Building"] },
  { label: "Product", value: "Product", slug: "product", subcategories: ["Product Management", "Agile & Scrum", "Product Strategy", "User Research", "Roadmapping"] },
]

export function getCategoryBySlug(slug: string): CategoryMeta | undefined {
  return CATEGORIES.find((c) => c.slug === slug)
}
