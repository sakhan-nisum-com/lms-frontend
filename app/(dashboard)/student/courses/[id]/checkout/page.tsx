"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { COURSES, STUDENT_PROFILE } from "@/lib/data/courses"
import { usePurchases } from "@/lib/hooks/usePurchases"
import { coursesApi, type ApiCourse } from "@/lib/api/courses"
import { enrollmentsApi } from "@/lib/api/enrollments"
import { CourseThumbnail } from "@/components/CourseThumbnail"
import { ChevronLeft, CheckCircle2, CreditCard, ShieldCheck, Lock } from "lucide-react"

interface FormState {
  name: string
  cardNumber: string
  expiry: string
  cvc: string
}

function formatCardNumber(v: string) {
  return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim()
}

function formatExpiry(v: string) {
  const digits = v.replace(/\D/g, "").slice(0, 4)
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
}

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const mockCourse = COURSES.find((c) => c.id === id) ?? null
  const { isPurchased, purchase } = usePurchases()
  const p = STUDENT_PROFILE

  const [apiCourse, setApiCourse] = useState<ApiCourse | null>(null)
  const [alreadyEnrolled, setAlreadyEnrolled] = useState<boolean | null>(null)
  const [step, setStep] = useState<"loading" | "pay" | "processing" | "success">("loading")
  const [form, setForm] = useState<FormState>({ name: p.name, cardNumber: "", expiry: "", cvc: "" })
  const [errors, setErrors] = useState<Partial<FormState>>({})

  useEffect(() => {
    Promise.all([
      coursesApi.getById(id).catch(() => null),
      enrollmentsApi.getForCourse(id).catch(() => null),
    ]).then(([course, enrollment]) => {
      if (course) setApiCourse(course)
      setAlreadyEnrolled(enrollment !== null)
      setStep("pay")
    })
  }, [id])

  // Derived display values — prefer API data, fall back to mock
  const title = apiCourse?.title ?? mockCourse?.title ?? "Course"
  const price: number | "Free" = apiCourse
    ? (apiCourse.price === 0 ? "Free" : apiCourse.price)
    : (mockCourse?.price ?? 0)

  const sections = apiCourse
    ? apiCourse.sections.sort((a, b) => a.sortOrder - b.sortOrder)
    : (mockCourse?.sections ?? [])
  const firstLessonId = sections[0]?.lessons[0]?.id

  // User already owns this course
  const owned = alreadyEnrolled === true || (mockCourse?.progress !== undefined) || isPurchased(id)

  // Free course — auto-enroll and bounce back to course page
  useEffect(() => {
    if (step !== "pay" || price !== "Free") return
    if (owned) {
      router.replace(`/student/courses/${id}/learn/${firstLessonId ?? ""}`)
    } else {
      enrollmentsApi.enroll(id).catch(() => {})
      purchase(id)
      router.replace(`/student/courses/${id}`)
    }
  }, [step, price, owned, id, router, purchase, firstLessonId])

  if (step === "loading") {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-canvas)" }} className="flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
      </div>
    )
  }

  if (price === "Free") return null

  function validate() {
    const next: Partial<FormState> = {}
    if (!form.name.trim()) next.name = "Name is required"
    if (form.cardNumber.replace(/\s/g, "").length !== 16) next.cardNumber = "Enter a valid 16-digit card number"
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(form.expiry)) next.expiry = "Use MM/YY format"
    if (form.cvc.length < 3) next.cvc = "Enter a valid CVC"
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setStep("processing")
    setTimeout(() => {
      purchase(id)
      setStep("success")
    }, 1200)
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-canvas)" }} className="flex items-center justify-center p-6">
      <div className="grid md:grid-cols-[1fr_320px] gap-6" style={{ maxWidth: 920, width: "100%" }}>

        {/* Left: form / success / already-owned */}
        <div className="rounded-2xl p-6 sm:p-8 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
          <Link
            href={`/student/courses/${id}`}
            className="inline-flex items-center gap-1.5 text-xs mb-6"
            style={{ color: "var(--accent)" }}
          >
            <ChevronLeft size={13} /> Back to course
          </Link>

          {owned && step === "pay" ? (
            <div className="text-center py-10">
              <div className="mx-auto mb-4 flex items-center justify-center w-16 h-16 rounded-full" style={{ backgroundColor: "#10B98120" }}>
                <CheckCircle2 size={32} style={{ color: "var(--success)" }} />
              </div>
              <h1 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>You already own this course</h1>
              <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>No need to pay again — jump back in any time.</p>
              <Link
                href={firstLessonId ? `/student/courses/${id}/learn/${firstLessonId}` : `/student/courses/${id}`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold"
                style={{ backgroundColor: "var(--accent)", color: "#fff" }}
              >
                Continue Learning
              </Link>
            </div>
          ) : step === "success" ? (
            <div className="text-center py-10">
              <div className="mx-auto mb-4 flex items-center justify-center w-16 h-16 rounded-full" style={{ backgroundColor: "#10B98120" }}>
                <CheckCircle2 size={32} style={{ color: "var(--success)" }} />
              </div>
              <h1 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Payment successful!</h1>
              <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
                You now own <strong style={{ color: "var(--text-primary)" }}>{title}</strong>. Start learning right away.
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Link
                  href={firstLessonId ? `/student/courses/${id}/learn/${firstLessonId}` : `/student/courses/${id}`}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold"
                  style={{ backgroundColor: "var(--accent)", color: "#fff" }}
                >
                  Start Watching
                </Link>
                <Link
                  href={`/student/courses/${id}`}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold"
                  style={{ backgroundColor: "var(--border-default)", color: "#CBD5E1" }}
                >
                  Go to course page
                </Link>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>Checkout</h1>
              <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
                This is a demo checkout — no real payment is processed.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>Name on card</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    disabled={step === "processing"}
                    placeholder="Jane Doe"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                    style={{ backgroundColor: "var(--bg-surface-muted)", border: `1px solid ${errors.name ? "var(--danger)" : "var(--border-default)"}`, color: "var(--text-primary)" }}
                  />
                  {errors.name && <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>Card number</label>
                  <div className="relative">
                    <CreditCard size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} />
                    <input
                      value={form.cardNumber}
                      onChange={(e) => setForm({ ...form, cardNumber: formatCardNumber(e.target.value) })}
                      disabled={step === "processing"}
                      placeholder="1234 5678 9012 3456"
                      inputMode="numeric"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm outline-none"
                      style={{ backgroundColor: "var(--bg-surface-muted)", border: `1px solid ${errors.cardNumber ? "var(--danger)" : "var(--border-default)"}`, color: "var(--text-primary)" }}
                    />
                  </div>
                  {errors.cardNumber && <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>{errors.cardNumber}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>Expiry</label>
                    <input
                      value={form.expiry}
                      onChange={(e) => setForm({ ...form, expiry: formatExpiry(e.target.value) })}
                      disabled={step === "processing"}
                      placeholder="MM/YY"
                      inputMode="numeric"
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                      style={{ backgroundColor: "var(--bg-surface-muted)", border: `1px solid ${errors.expiry ? "var(--danger)" : "var(--border-default)"}`, color: "var(--text-primary)" }}
                    />
                    {errors.expiry && <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>{errors.expiry}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>CVC</label>
                    <input
                      value={form.cvc}
                      onChange={(e) => setForm({ ...form, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                      disabled={step === "processing"}
                      placeholder="123"
                      inputMode="numeric"
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                      style={{ backgroundColor: "var(--bg-surface-muted)", border: `1px solid ${errors.cvc ? "var(--danger)" : "var(--border-default)"}`, color: "var(--text-primary)" }}
                    />
                    {errors.cvc && <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>{errors.cvc}</p>}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={step === "processing"}
                  className="w-full py-3 rounded-xl text-sm font-bold transition-opacity"
                  style={{ backgroundColor: "var(--accent)", color: "#fff", opacity: step === "processing" ? 0.7 : 1 }}
                >
                  {step === "processing" ? "Processing payment…" : `Pay $${price} and enroll`}
                </button>

                <p className="flex items-center justify-center gap-1.5 text-xs" style={{ color: "var(--text-tertiary)" }}>
                  <ShieldCheck size={13} /> 30-day money-back guarantee
                </p>
              </form>
            </>
          )}
        </div>

        {/* Right: order summary */}
        <div className="rounded-2xl p-5 h-fit shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
          {mockCourse ? (
            <CourseThumbnail course={mockCourse} heightClass="h-32 mb-4" roundedClass="rounded-lg" />
          ) : (
            <div
              className="h-32 mb-4 rounded-lg flex items-center justify-center text-4xl"
              style={{ backgroundColor: "var(--bg-surface-muted)" }}
            >
              🎓
            </div>
          )}
          <h3 className="text-sm font-bold mb-1 leading-snug" style={{ color: "var(--text-primary)" }}>{title}</h3>
          <p className="text-xs mb-4" style={{ color: "var(--text-tertiary)" }}>{mockCourse?.instructor ?? ""}</p>
          <div className="flex items-center gap-2 text-xs mb-4" style={{ color: "var(--text-tertiary)" }}>
            <Lock size={12} /> Full lifetime access
          </div>
          <div className="flex items-center justify-between text-sm pt-3" style={{ borderTop: "1px solid var(--border-default)" }}>
            <span style={{ color: "var(--text-secondary)" }}>Total</span>
            <span className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>${price}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
