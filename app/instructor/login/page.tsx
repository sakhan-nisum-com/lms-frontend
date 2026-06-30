"use client"

import Link from "next/link"
import { useState } from "react"
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight, BookOpen } from "lucide-react"

export default function InstructorLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      window.location.href = "/instructor/dashboard"
    }, 1000)
  }

  return (
    <div
      className="flex"
      style={{ backgroundColor: "var(--bg-canvas)", minHeight: "calc(100vh - var(--app-header-height, 150px))" }}
    >
      {/* Left Panel — brand/marketing, stays dark like the sidebar */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 p-10"
        style={{ backgroundColor: "var(--sidebar-bg)", borderRight: "1px solid var(--sidebar-border)" }}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center rounded-lg"
            style={{ width: 36, height: 36, backgroundColor: "var(--sidebar-accent)" }}
          >
            <GraduationCap size={20} color="#fff" />
          </div>
          <span className="font-bold text-lg" style={{ color: "var(--sidebar-text-active)" }}>LearnFlow</span>
        </Link>

        <div>
          <div
            className="flex items-center justify-center w-14 h-14 rounded-2xl mb-6"
            style={{ backgroundColor: "#3B82F620" }}
          >
            <BookOpen size={28} style={{ color: "var(--sidebar-accent)" }} />
          </div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: "var(--sidebar-text-active)" }}>
            Empower learners worldwide
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--sidebar-text)" }}>
            Create and manage courses, track student progress, and grow your
            teaching impact — all from your instructor dashboard.
          </p>

          <ul className="mt-8 space-y-4">
            {[
              "Publish unlimited courses",
              "Real-time student analytics",
              "Integrated quiz & assignment builder",
              "Earn revenue from your content",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm" style={{ color: "var(--sidebar-text-hover)" }}>
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: "var(--sidebar-accent)" }}
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs" style={{ color: "var(--sidebar-text)" }}>
          © 2025 LearnFlow. Instructor Portal.
        </p>
      </div>

      {/* Right Panel — form, light */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div
              className="flex items-center justify-center rounded-lg"
              style={{ width: 36, height: 36, backgroundColor: "var(--accent)" }}
            >
              <GraduationCap size={20} color="#fff" />
            </div>
            <span className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>LearnFlow</span>
          </Link>

          <div className="mb-8">
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-4"
              style={{ backgroundColor: "var(--accent-subtle)", color: "var(--accent)", border: "1px solid #3B82F630" }}
            >
              <BookOpen size={11} />
              Instructor Portal
            </div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Welcome back</h1>
            <p className="mt-1.5 text-sm" style={{ color: "var(--text-tertiary)" }}>
              Sign in to manage your courses and students.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Email address
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-colors"
                  style={{
                    backgroundColor: "var(--bg-surface-muted)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-default)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#3B82F6")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                  Password
                </label>
                <Link
                  href="/instructor/forgot-password"
                  className="text-xs transition-colors hover:text-blue-400"
                  style={{ color: "var(--accent)" }}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl text-sm outline-none transition-colors"
                  style={{
                    backgroundColor: "var(--bg-surface-muted)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-default)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#3B82F6")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors hover:text-slate-300"
                  style={{ color: "var(--text-muted)" }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded accent-blue-500"
              />
              <label htmlFor="remember" className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Keep me signed in
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-150 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              style={{ backgroundColor: "var(--accent)" }}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-sm text-center" style={{ color: "var(--text-tertiary)" }}>
            New instructor?{" "}
            <Link
              href="/instructor/register"
              className="font-medium transition-colors hover:text-blue-400"
              style={{ color: "var(--accent)" }}
            >
              Create an account
            </Link>
          </p>

          <div className="mt-8 pt-6" style={{ borderTop: "1px solid var(--border-default)" }}>
            <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
              Are you a student?{" "}
              <Link href="/login" className="hover:text-slate-400 underline underline-offset-2 transition-colors" style={{ color: "var(--text-tertiary)" }}>
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
