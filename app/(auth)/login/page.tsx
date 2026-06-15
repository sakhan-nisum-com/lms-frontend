"use client"

import Link from "next/link"
import { GraduationCap, Eye, EyeOff, ArrowRight } from "lucide-react"
import { useState } from "react"

export default function LoginPage() {
  const [showPw, setShowPw] = useState(false)
  const [role, setRole] = useState<"student" | "tutor">("student")

  return (
    <div style={{
      minHeight: "100vh", backgroundColor: "#0f172a",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px", position: "relative",
    }}>
      {/* Background glow */}
      <div style={{
        position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)",
        width: 700, height: 400, borderRadius: "50%", pointerEvents: "none",
        background: "radial-gradient(ellipse, rgba(59,130,246,0.12) 0%, transparent 70%)",
      }} />

      <div style={{ width: "100%", maxWidth: 440, position: "relative" }}>

        {/* Logo & heading */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 28 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GraduationCap size={24} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 20, color: "#f8fafc" }}>LearnFlow</span>
          </Link>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#f8fafc", marginBottom: 8, letterSpacing: "-0.02em" }}>Welcome back</h1>
          <p style={{ color: "#94a3b8", fontSize: 15 }}>Sign in to continue your learning journey</p>
        </div>

        {/* Card */}
        <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 24, padding: "36px 32px" }}>

          {/* Role toggle */}
          <div style={{ display: "flex", backgroundColor: "#0f172a", borderRadius: 12, padding: 4, marginBottom: 28, gap: 4 }}>
            {(["student", "tutor"] as const).map(r => (
              <button
                key={r}
                onClick={() => setRole(r)}
                style={{
                  flex: 1, padding: "9px 0", borderRadius: 9, fontSize: 14, fontWeight: 600,
                  border: "none", cursor: "pointer", transition: "all 0.15s",
                  backgroundColor: role === r ? "#3b82f6" : "transparent",
                  color: role === r ? "#fff" : "#64748b",
                }}
              >
                {r === "student" ? "Student" : "Instructor"}
              </button>
            ))}
          </div>

          <form onSubmit={e => e.preventDefault()} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Email */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#cbd5e1", marginBottom: 7 }}>
                Email address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                style={{
                  width: "100%", padding: "11px 14px", borderRadius: 10,
                  backgroundColor: "#0f172a", border: "1px solid #334155",
                  color: "#f8fafc", fontSize: 14, outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={e => (e.target.style.borderColor = "#3b82f6")}
                onBlur={e => (e.target.style.borderColor = "#334155")}
              />
            </div>

            {/* Password */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#cbd5e1" }}>Password</label>
                <Link href="/forgot-password" style={{ fontSize: 13, color: "#3b82f6", textDecoration: "none" }}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  style={{
                    width: "100%", padding: "11px 44px 11px 14px", borderRadius: 10,
                    backgroundColor: "#0f172a", border: "1px solid #334155",
                    color: "#f8fafc", fontSize: 14, outline: "none",
                    boxSizing: "border-box",
                  }}
                  onFocus={e => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={e => (e.target.style.borderColor = "#334155")}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: "#64748b", padding: 0,
                  }}
                >
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              style={{
                width: "100%", padding: "13px", borderRadius: 11, border: "none",
                backgroundColor: "#3b82f6", color: "#fff", fontSize: 15, fontWeight: 700,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: "0 4px 20px rgba(59,130,246,0.35)",
              }}
            >
              Sign in <ArrowRight size={17} />
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
            <div style={{ flex: 1, height: 1, backgroundColor: "#334155" }} />
            <span style={{ color: "#475569", fontSize: 13 }}>or continue with</span>
            <div style={{ flex: 1, height: 1, backgroundColor: "#334155" }} />
          </div>

          {/* OAuth */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {["Google", "GitHub"].map(p => (
              <button
                key={p}
                style={{
                  padding: "11px", borderRadius: 10, border: "1px solid #334155",
                  backgroundColor: "#0f172a", color: "#cbd5e1", fontSize: 14, fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "#64748b" }}>
          Don&apos;t have an account?{" "}
          <Link href="/register" style={{ color: "#3b82f6", fontWeight: 600, textDecoration: "none" }}>
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  )
}
