"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { settingsApi } from "@/lib/api/admin"
import { coursesApi } from "@/lib/api/courses"
import { authStore } from "@/lib/auth-store"
import { Plus, Trash2, Tag, Loader2, BookOpen } from "lucide-react"

const SETTINGS_KEY = "course_categories"

function parseCategories(raw: string | undefined): string[] {
  if (!raw) return []
  try { return JSON.parse(raw) as string[] } catch { return raw.split(",").map((s) => s.trim()).filter(Boolean) }
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newCat, setNewCat] = useState("")
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null)
  const [courseCountByCategory, setCourseCountByCategory] = useState<Record<string, number>>({})
  const user = authStore.getUser()

  function showToast(text: string, ok: boolean) {
    setToast({ text, ok })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const settings = await settingsApi.getAll()
        const cats = parseCategories(settings[SETTINGS_KEY])
        setCategories(cats.length > 0 ? cats : [
          "Technology", "Business", "Design", "Marketing",
          "Data Science", "Personal Development", "Language", "Health & Fitness",
        ])
      } catch {
        setCategories(["Technology", "Business", "Design", "Marketing"])
      }

      // Count courses per category and surface any category in use that isn't in the list yet
      try {
        const res = await coursesApi.list(0, 500)
        const counts: Record<string, number> = {}
        for (const c of res.data) {
          if (!c.category) continue
          counts[c.category] = (counts[c.category] ?? 0) + 1
        }
        setCourseCountByCategory(counts)

        // Any category actually used by a course must appear in the list
        setCategories((prev) => {
          const missing = Object.keys(counts).filter((cat) => !prev.includes(cat))
          return missing.length > 0 ? [...prev, ...missing] : prev
        })
      } catch {}

      setLoading(false)
    }
    load()
  }, [])

  async function saveCategories(cats: string[]) {
    setSaving(true)
    try {
      await settingsApi.upsert(
        SETTINGS_KEY,
        JSON.stringify(cats),
        "Course categories available platform-wide",
        "content"
      )
      showToast("Categories saved!", true)
    } catch {
      showToast("Failed to save. Please try again.", false)
    } finally { setSaving(false) }
  }

  function addCategory() {
    const trimmed = newCat.trim()
    if (!trimmed || categories.includes(trimmed)) {
      showToast(categories.includes(trimmed) ? "Category already exists." : "Enter a category name.", false)
      return
    }
    const updated = [...categories, trimmed]
    setCategories(updated)
    setNewCat("")
    saveCategories(updated)
  }

  function removeCategory(cat: string) {
    const updated = categories.filter((c) => c !== cat)
    setCategories(updated)
    saveCategories(updated)
  }

  const COLORS = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EC4899", "#14B8A6", "#EF4444", "#6366F1", "#F97316", "#84CC16"]

  return (
    <DashboardLayout role="admin" userName={user?.fullName ?? "Admin"}>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Course Categories</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Manage categories available to instructors when creating courses.
            </p>
          </div>
          {toast && (
            <span className="text-xs font-medium px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: toast.ok ? "#10B98118" : "#EF444418", color: toast.ok ? "#10B981" : "#EF4444" }}>
              {toast.text}
            </span>
          )}
        </div>

        {/* Add new category */}
        <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
          <p className="text-xs font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>ADD CATEGORY</p>
          <div className="flex gap-2">
            <input
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCategory()}
              placeholder="e.g. Artificial Intelligence"
              className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
            />
            <button onClick={addCategory} disabled={saving || !newCat.trim()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: "var(--accent)" }}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Add
            </button>
          </div>
        </div>

        {/* Categories grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin" style={{ color: "var(--text-muted)" }} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((cat, i) => {
              const color = COLORS[i % COLORS.length]
              const count = courseCountByCategory[cat] ?? 0
              return (
                <div key={cat} className="rounded-2xl p-4 flex items-center gap-3 shadow-sm group"
                  style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0"
                    style={{ backgroundColor: color + "20" }}>
                    <Tag size={16} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{cat}</p>
                    <div className="flex items-center gap-1 mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                      <BookOpen size={10} /> {count} course{count !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <button onClick={() => removeCategory(cat)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: "#EF444418", color: "#F87171" }}
                    title="Remove category">
                    <Trash2 size={12} />
                  </button>
                </div>
              )
            })}

            {categories.length === 0 && (
              <div className="col-span-full rounded-2xl p-10 text-center" style={{ border: "1px dashed var(--border-default)" }}>
                <Tag size={32} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>No categories yet. Add one above.</p>
              </div>
            )}
          </div>
        )}

        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          {categories.length} categories · Changes are saved immediately and applied to new course creation forms.
        </p>
      </div>
    </DashboardLayout>
  )
}
