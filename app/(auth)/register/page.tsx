"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { GraduationCap, Eye, EyeOff, BookOpen, Users, ArrowRight } from "lucide-react"
import { useState } from "react"

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<"student" | "tutor">("student")
  const [loading, setLoading] = useState(false)

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ backgroundColor: "#0F172A" }}
    >
      <div
        className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-5 blur-3xl pointer-events-none"
        style={{ backgroundColor: "#3B82F6" }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2.5 mb-6">
            <div
              className="flex items-center justify-center rounded-xl"
              style={{ width: 44, height: 44, backgroundColor: "#3B82F6" }}
            >
              <GraduationCap size={24} color="#fff" />
            </div>
            <span className="font-bold text-xl text-white">LearnFlow</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>
            Join 50,000+ learners today — it&apos;s free
          </p>
        </div>

        {/* Role picker */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { value: "student" as const, label: "I'm a Student", icon: BookOpen, desc: "Take courses & learn" },
            { value: "tutor" as const, label: "I'm an Instructor", icon: Users, desc: "Create & teach courses" },
          ].map(({ value, label, icon: Icon, desc }) => (
            <button
              key={value}
              onClick={() => setRole(value)}
              className="flex flex-col items-center gap-2 py-4 px-3 rounded-xl transition-all duration-150"
              style={{
                backgroundColor: role === value ? "#1D3A6B" : "#1E293B",
                border: `1.5px solid ${role === value ? "#3B82F6" : "#334155"}`,
              }}
            >
              <div
                className="flex items-center justify-center w-9 h-9 rounded-lg"
                style={{ backgroundColor: role === value ? "#3B82F620" : "#334155" }}
              >
                <Icon size={18} style={{ color: role === value ? "#3B82F6" : "#64748B" }} />
              </div>
              <span
                className="text-sm font-semibold"
                style={{ color: role === value ? "#60A5FA" : "#94A3B8" }}
              >
                {label}
              </span>
              <span className="text-xs" style={{ color: "#64748B" }}>{desc}</span>
            </button>
          ))}
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
        >
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault()
              setLoading(true)
              setTimeout(() => {
                router.push(role === "student" ? "/student/dashboard" : "/tutor/dashboard")
              }, 800)
            }}
          >
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              {["First name", "Last name"].map((label) => (
                <div key={label}>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#CBD5E1" }}>
                    {label}
                  </label>
                  <input
                    type="text"
                    placeholder={label === "First name" ? "John" : "Doe"}
                    className="w-full px-4 py-2.5 text-sm rounded-lg outline-none transition-all duration-200"
                    style={{ backgroundColor: "#334155", color: "#F8FAFC", border: "1px solid #475569" }}
                    onFocus={(e) => (e.target.style.borderColor = "#3B82F6")}
                    onBlur={(e) => (e.target.style.borderColor = "#475569")}
                  />
                </div>
              ))}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#CBD5E1" }}>
                Email address
              </label>
              <input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 text-sm rounded-lg outline-none transition-all duration-200"
                style={{ backgroundColor: "#334155", color: "#F8FAFC", border: "1px solid #475569" }}
                onFocus={(e) => (e.target.style.borderColor = "#3B82F6")}
                onBlur={(e) => (e.target.style.borderColor = "#475569")}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#CBD5E1" }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  className="w-full px-4 py-2.5 pr-10 text-sm rounded-lg outline-none transition-all duration-200"
                  style={{ backgroundColor: "#334155", color: "#F8FAFC", border: "1px solid #475569" }}
                  onFocus={(e) => (e.target.style.borderColor = "#3B82F6")}
                  onBlur={(e) => (e.target.style.borderColor = "#475569")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#64748B" }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                className="mt-0.5 rounded accent-blue-500"
              />
              <span className="text-xs leading-relaxed" style={{ color: "#94A3B8" }}>
                I agree to the{" "}
                <Link href="/terms" style={{ color: "#3B82F6" }} className="hover:underline">Terms of Service</Link>
                {" "}and{" "}
                <Link href="/privacy" style={{ color: "#3B82F6" }} className="hover:underline">Privacy Policy</Link>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
              style={{ backgroundColor: "#3B82F6", opacity: loading ? 0.85 : 1, cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? (
                <>
                  <span style={{ width: 15, height: 15, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                  Creating account…
                </>
              ) : (
                <>Create account <ArrowRight size={15} /></>
              )}
            </button>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ backgroundColor: "#334155" }} />
            <span className="text-xs" style={{ color: "#64748B" }}>or</span>
            <div className="flex-1 h-px" style={{ backgroundColor: "#334155" }} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {["Google", "GitHub"].map((provider) => (
              <button
                key={provider}
                className="py-2.5 rounded-lg text-sm font-medium transition-colors duration-150"
                style={{ backgroundColor: "#334155", color: "#CBD5E1", border: "1px solid #475569" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#475569")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#334155")}
              >
                {provider}
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-sm mt-6" style={{ color: "#64748B" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#3B82F6" }} className="font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
