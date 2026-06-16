"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { COURSES, STUDENT_PROFILE } from "@/lib/data/courses"
import { usePurchases } from "@/lib/hooks/usePurchases"
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
  const course = COURSES.find((c) => c.id === id) ?? COURSES[0]
  const { isPurchased, purchase } = usePurchases()
  const p = STUDENT_PROFILE

  const owned = course.progress !== undefined || isPurchased(course.id)
  const firstLessonId = course.sections[0]?.lessons[0]?.id

  const [step, setStep] = useState<"pay" | "processing" | "success">("pay")
  const [form, setForm] = useState<FormState>({ name: p.name, cardNumber: "", expiry: "", cvc: "" })
  const [errors, setErrors] = useState<Partial<FormState>>({})

  // Free courses (or ones already owned) have nothing to pay for — bounce straight to the course.
  useEffect(() => {
    if (course.price === "Free" && step === "pay") {
      purchase(course.id)
      router.replace(`/student/courses/${course.id}`)
    }
  }, [course.id, course.price, purchase, router, step])

  if (course.price === "Free") return null

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
      purchase(course.id)
      setStep("success")
    }, 1200)
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0F172A" }} className="flex items-center justify-center p-6">
      <div className="grid md:grid-cols-[1fr_320px] gap-6" style={{ maxWidth: 920, width: "100%" }}>

        {/* Left: form / success / already-owned */}
        <div className="rounded-2xl p-6 sm:p-8" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
          <Link
            href={`/student/courses/${course.id}`}
            className="inline-flex items-center gap-1.5 text-xs mb-6"
            style={{ color: "#3B82F6" }}
          >
            <ChevronLeft size={13} /> Back to course
          </Link>

          {owned && step === "pay" ? (
            <div className="text-center py-10">
              <div className="mx-auto mb-4 flex items-center justify-center w-16 h-16 rounded-full" style={{ backgroundColor: "#10B98120" }}>
                <CheckCircle2 size={32} style={{ color: "#10B981" }} />
              </div>
              <h1 className="text-xl font-bold text-white mb-2">You already own this course</h1>
              <p className="text-sm mb-6" style={{ color: "#94A3B8" }}>No need to pay again — jump back in any time.</p>
              <Link
                href={firstLessonId ? `/student/courses/${course.id}/learn/${course.nextLessonId || firstLessonId}` : `/student/courses/${course.id}`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold"
                style={{ backgroundColor: "#3B82F6", color: "#fff" }}
              >
                Continue Learning
              </Link>
            </div>
          ) : step === "success" ? (
            <div className="text-center py-10">
              <div className="mx-auto mb-4 flex items-center justify-center w-16 h-16 rounded-full" style={{ backgroundColor: "#10B98120" }}>
                <CheckCircle2 size={32} style={{ color: "#10B981" }} />
              </div>
              <h1 className="text-xl font-bold text-white mb-2">Payment successful!</h1>
              <p className="text-sm mb-6" style={{ color: "#94A3B8" }}>
                You now own <strong className="text-white">{course.title}</strong>. Start learning right away.
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Link
                  href={`/student/courses/${course.id}/learn/${firstLessonId}`}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold"
                  style={{ backgroundColor: "#3B82F6", color: "#fff" }}
                >
                  Start Watching
                </Link>
                <Link
                  href={`/student/courses/${course.id}`}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold"
                  style={{ backgroundColor: "#334155", color: "#CBD5E1" }}
                >
                  Go to course page
                </Link>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-white mb-1">Checkout</h1>
              <p className="text-sm mb-6" style={{ color: "#94A3B8" }}>
                This is a demo checkout — no real payment is processed.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "#94A3B8" }}>Name on card</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    disabled={step === "processing"}
                    placeholder="Jane Doe"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                    style={{ backgroundColor: "#0F172A", border: `1px solid ${errors.name ? "#EF4444" : "#334155"}`, color: "#F8FAFC" }}
                  />
                  {errors.name && <p className="text-xs mt-1" style={{ color: "#EF4444" }}>{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "#94A3B8" }}>Card number</label>
                  <div className="relative">
                    <CreditCard size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#64748B" }} />
                    <input
                      value={form.cardNumber}
                      onChange={(e) => setForm({ ...form, cardNumber: formatCardNumber(e.target.value) })}
                      disabled={step === "processing"}
                      placeholder="1234 5678 9012 3456"
                      inputMode="numeric"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm outline-none"
                      style={{ backgroundColor: "#0F172A", border: `1px solid ${errors.cardNumber ? "#EF4444" : "#334155"}`, color: "#F8FAFC" }}
                    />
                  </div>
                  {errors.cardNumber && <p className="text-xs mt-1" style={{ color: "#EF4444" }}>{errors.cardNumber}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "#94A3B8" }}>Expiry</label>
                    <input
                      value={form.expiry}
                      onChange={(e) => setForm({ ...form, expiry: formatExpiry(e.target.value) })}
                      disabled={step === "processing"}
                      placeholder="MM/YY"
                      inputMode="numeric"
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                      style={{ backgroundColor: "#0F172A", border: `1px solid ${errors.expiry ? "#EF4444" : "#334155"}`, color: "#F8FAFC" }}
                    />
                    {errors.expiry && <p className="text-xs mt-1" style={{ color: "#EF4444" }}>{errors.expiry}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "#94A3B8" }}>CVC</label>
                    <input
                      value={form.cvc}
                      onChange={(e) => setForm({ ...form, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                      disabled={step === "processing"}
                      placeholder="123"
                      inputMode="numeric"
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                      style={{ backgroundColor: "#0F172A", border: `1px solid ${errors.cvc ? "#EF4444" : "#334155"}`, color: "#F8FAFC" }}
                    />
                    {errors.cvc && <p className="text-xs mt-1" style={{ color: "#EF4444" }}>{errors.cvc}</p>}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={step === "processing"}
                  className="w-full py-3 rounded-xl text-sm font-bold transition-opacity"
                  style={{ backgroundColor: "#3B82F6", color: "#fff", opacity: step === "processing" ? 0.7 : 1 }}
                >
                  {step === "processing" ? "Processing payment…" : `Pay $${course.price} and enroll`}
                </button>

                <p className="flex items-center justify-center gap-1.5 text-xs" style={{ color: "#64748B" }}>
                  <ShieldCheck size={13} /> 30-day money-back guarantee
                </p>
              </form>
            </>
          )}
        </div>

        {/* Right: order summary */}
        <div className="rounded-2xl p-5 h-fit" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
          <CourseThumbnail course={course} heightClass="h-32 mb-4" roundedClass="rounded-lg" />
          <h3 className="text-sm font-bold text-white mb-1 leading-snug">{course.title}</h3>
          <p className="text-xs mb-4" style={{ color: "#64748B" }}>{course.instructor}</p>
          <div className="flex items-center gap-2 text-xs mb-4" style={{ color: "#64748B" }}>
            <Lock size={12} /> Full lifetime access
          </div>
          <div className="flex items-center justify-between text-sm pt-3" style={{ borderTop: "1px solid #334155" }}>
            <span style={{ color: "#94A3B8" }}>Total</span>
            <span className="text-lg font-bold text-white">${course.price}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
