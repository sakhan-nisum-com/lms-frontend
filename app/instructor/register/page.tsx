"use client"

import Link from "next/link"
import { useState } from "react"
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  BookOpen,
  User,
  Briefcase,
  CheckCircle2,
} from "lucide-react"

const SPECIALTIES = [
  "Software Engineering",
  "Data Science & AI",
  "Design & UX",
  "Business & Management",
  "Marketing",
  "Cybersecurity",
  "Cloud & DevOps",
  "Other",
]

export default function InstructorRegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    specialty: "",
    bio: "",
    password: "",
    confirm: "",
    agreed: false,
  })

  function update(field: keyof typeof form, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleStep1(e: React.FormEvent) {
    e.preventDefault()
    setStep(2)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirm) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      window.location.href = "/instructor/dashboard"
    }, 1200)
  }

  return (
    <div className="flex" style={{ backgroundColor: "#0F172A", minHeight: "calc(100vh - var(--app-header-height, 150px))" }}>
      {/* Left Panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 p-10"
        style={{ backgroundColor: "#1E293B", borderRight: "1px solid #334155" }}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center rounded-lg"
            style={{ width: 36, height: 36, backgroundColor: "#3B82F6" }}
          >
            <GraduationCap size={20} color="#fff" />
          </div>
          <span className="font-bold text-lg text-white">LearnFlow</span>
        </Link>

        <div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Share your expertise
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "#94A3B8" }}>
            Join thousands of instructors already earning and teaching on
            LearnFlow. Building a course has never been easier.
          </p>

          <ul className="mt-8 space-y-4">
            {[
              "Free to join — no upfront cost",
              "Reach a global audience of 50K+ learners",
              "Powerful course builder with video & quizzes",
              "Detailed analytics on every student",
              "Dedicated instructor support team",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm" style={{ color: "#CBD5E1" }}>
                <CheckCircle2 size={15} style={{ color: "#3B82F6", flexShrink: 0 }} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs" style={{ color: "#475569" }}>
          © 2025 LearnFlow. Instructor Portal.
        </p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div
              className="flex items-center justify-center rounded-lg"
              style={{ width: 36, height: 36, backgroundColor: "#3B82F6" }}
            >
              <GraduationCap size={20} color="#fff" />
            </div>
            <span className="font-bold text-lg text-white">LearnFlow</span>
          </Link>

          {/* Header */}
          <div className="mb-6">
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-4"
              style={{ backgroundColor: "#3B82F615", color: "#60A5FA", border: "1px solid #3B82F630" }}
            >
              <BookOpen size={11} />
              Instructor Portal
            </div>
            <h1 className="text-2xl font-bold text-white">Create your account</h1>
            <p className="mt-1.5 text-sm" style={{ color: "#64748B" }}>
              Start building and publishing courses today.
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-colors"
                  style={{
                    backgroundColor: step >= s ? "#3B82F6" : "#1E293B",
                    border: `1px solid ${step >= s ? "#3B82F6" : "#334155"}`,
                    color: step >= s ? "#fff" : "#64748B",
                  }}
                >
                  {s}
                </div>
                <span
                  className="text-xs font-medium"
                  style={{ color: step >= s ? "#CBD5E1" : "#475569" }}
                >
                  {s === 1 ? "Profile" : "Security"}
                </span>
                {s < 2 && (
                  <div
                    className="w-10 h-px"
                    style={{ backgroundColor: step > s ? "#3B82F6" : "#334155" }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>
                    First name
                  </label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#475569" }} />
                    <input
                      type="text"
                      required
                      value={form.firstName}
                      onChange={(e) => update("firstName", e.target.value)}
                      placeholder="Jane"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-colors"
                      style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
                      onFocus={(e) => (e.target.style.borderColor = "#3B82F6")}
                      onBlur={(e) => (e.target.style.borderColor = "#334155")}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>
                    Last name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.lastName}
                    onChange={(e) => update("lastName", e.target.value)}
                    placeholder="Smith"
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-colors"
                    style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
                    onFocus={(e) => (e.target.style.borderColor = "#3B82F6")}
                    onBlur={(e) => (e.target.style.borderColor = "#334155")}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>
                  Email address
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#475569" }} />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-colors"
                    style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
                    onFocus={(e) => (e.target.style.borderColor = "#3B82F6")}
                    onBlur={(e) => (e.target.style.borderColor = "#334155")}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>
                  Teaching specialty
                </label>
                <div className="relative">
                  <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" style={{ color: "#475569" }} />
                  <select
                    required
                    value={form.specialty}
                    onChange={(e) => update("specialty", e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-colors appearance-none"
                    style={{
                      backgroundColor: "#1E293B",
                      border: "1px solid #334155",
                      color: form.specialty ? "#F8FAFC" : "#64748B",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#3B82F6")}
                    onBlur={(e) => (e.target.style.borderColor = "#334155")}
                  >
                    <option value="" disabled style={{ backgroundColor: "#1E293B" }}>
                      Select a specialty
                    </option>
                    {SPECIALTIES.map((s) => (
                      <option key={s} value={s} style={{ backgroundColor: "#1E293B", color: "#F8FAFC" }}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>
                  Short bio <span style={{ color: "#475569" }}>(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={form.bio}
                  onChange={(e) => update("bio", e.target.value)}
                  placeholder="Tell students a little about yourself..."
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-colors resize-none"
                  style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
                  onFocus={(e) => (e.target.style.borderColor = "#3B82F6")}
                  onBlur={(e) => (e.target.style.borderColor = "#334155")}
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-150 hover:opacity-90 mt-2"
                style={{ backgroundColor: "#3B82F6" }}
              >
                Continue
                <ArrowRight size={15} />
              </button>
            </form>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>
                  Password
                </label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#475569" }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full pl-9 pr-11 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-colors"
                    style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
                    onFocus={(e) => (e.target.style.borderColor = "#3B82F6")}
                    onBlur={(e) => (e.target.style.borderColor = "#334155")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors hover:text-slate-300"
                    style={{ color: "#475569" }}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Password strength */}
              {form.password && (
                <div className="space-y-1.5">
                  <div className="flex gap-1">
                    {[
                      form.password.length >= 8,
                      /[A-Z]/.test(form.password),
                      /[0-9]/.test(form.password),
                      /[^A-Za-z0-9]/.test(form.password),
                    ].map((met, i) => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-colors"
                        style={{ backgroundColor: met ? "#3B82F6" : "#334155" }}
                      />
                    ))}
                  </div>
                  <p className="text-xs" style={{ color: "#64748B" }}>
                    Use 8+ characters, uppercase, numbers &amp; symbols
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>
                  Confirm password
                </label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#475569" }} />
                  <input
                    type={showConfirm ? "text" : "password"}
                    required
                    value={form.confirm}
                    onChange={(e) => update("confirm", e.target.value)}
                    placeholder="Repeat your password"
                    className="w-full pl-9 pr-11 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-colors"
                    style={{
                      backgroundColor: "#1E293B",
                      border: `1px solid ${form.confirm && form.confirm !== form.password ? "#EF4444" : "#334155"}`,
                    }}
                    onFocus={(e) => (e.target.style.borderColor = form.confirm !== form.password ? "#EF4444" : "#3B82F6")}
                    onBlur={(e) => (e.target.style.borderColor = form.confirm !== form.password ? "#EF4444" : "#334155")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors hover:text-slate-300"
                    style={{ color: "#475569" }}
                  >
                    {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {form.confirm && form.confirm !== form.password && (
                  <p className="mt-1 text-xs" style={{ color: "#EF4444" }}>
                    Passwords do not match
                  </p>
                )}
              </div>

              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  checked={form.agreed}
                  onChange={(e) => update("agreed", e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded accent-blue-500 shrink-0"
                />
                <label htmlFor="terms" className="text-sm leading-relaxed" style={{ color: "#94A3B8" }}>
                  I agree to the{" "}
                  <Link href="/terms" className="hover:text-blue-400 transition-colors" style={{ color: "#3B82F6" }}>
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="hover:text-blue-400 transition-colors" style={{ color: "#3B82F6" }}>
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:border-slate-500"
                  style={{
                    backgroundColor: "#1E293B",
                    border: "1px solid #334155",
                    color: "#94A3B8",
                  }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || form.password !== form.confirm}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-150 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: "#3B82F6" }}
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Create account
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          <p className="mt-6 text-sm text-center" style={{ color: "#64748B" }}>
            Already have an account?{" "}
            <Link
              href="/instructor/login"
              className="font-medium transition-colors hover:text-blue-400"
              style={{ color: "#3B82F6" }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}