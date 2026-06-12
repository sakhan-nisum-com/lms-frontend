"use client"

import Link from "next/link"
import { GraduationCap, Eye, EyeOff } from "lucide-react"
import { useState } from "react"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#0F172A" }}
    >
      {/* Background glow */}
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
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>
            Sign in to continue your learning journey
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
        >
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "#CBD5E1" }}
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 text-sm rounded-lg outline-none transition-all duration-200"
                style={{
                  backgroundColor: "#334155",
                  color: "#F8FAFC",
                  border: "1px solid #475569",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#3B82F6")}
                onBlur={(e) => (e.target.style.borderColor = "#475569")}
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium"
                  style={{ color: "#CBD5E1" }}
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs transition-colors"
                  style={{ color: "#3B82F6" }}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-10 text-sm rounded-lg outline-none transition-all duration-200"
                  style={{
                    backgroundColor: "#334155",
                    color: "#F8FAFC",
                    border: "1px solid #475569",
                  }}
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

            {/* Role selector */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#CBD5E1" }}>
                Sign in as
              </label>
              <div className="grid grid-cols-2 gap-3">
                {["Student", "Instructor"].map((role) => (
                  <label
                    key={role}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-lg cursor-pointer text-sm font-medium transition-all duration-150"
                    style={{
                      backgroundColor: role === "Student" ? "#3B82F620" : "#334155",
                      border: `1px solid ${role === "Student" ? "#3B82F6" : "#475569"}`,
                      color: role === "Student" ? "#60A5FA" : "#94A3B8",
                    }}
                  >
                    <input type="radio" name="role" value={role} className="sr-only" defaultChecked={role === "Student"} />
                    {role}
                  </label>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity duration-150 hover:opacity-90 mt-2"
              style={{ backgroundColor: "#3B82F6" }}
            >
              Sign in
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ backgroundColor: "#334155" }} />
            <span className="text-xs" style={{ color: "#64748B" }}>or continue with</span>
            <div className="flex-1 h-px" style={{ backgroundColor: "#334155" }} />
          </div>

          {/* OAuth */}
          <div className="grid grid-cols-2 gap-3">
            {["Google", "GitHub"].map((provider) => (
              <button
                key={provider}
                className="py-2.5 rounded-lg text-sm font-medium transition-colors duration-150"
                style={{
                  backgroundColor: "#334155",
                  color: "#CBD5E1",
                  border: "1px solid #475569",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#475569")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#334155")}
              >
                {provider}
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-sm mt-6" style={{ color: "#64748B" }}>
          Don&apos;t have an account?{" "}
          <Link href="/register" style={{ color: "#3B82F6" }} className="font-medium hover:underline">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  )
}
