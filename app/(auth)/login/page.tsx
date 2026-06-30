"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { GraduationCap, Eye, EyeOff, ArrowRight } from "lucide-react"
import { useState } from "react"

export default function LoginPage() {
  const router = useRouter()
  const [showPw, setShowPw] = useState(false)
  const [role, setRole] = useState<"student" | "tutor" | "admin">("student")
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate auth — redirect based on role
    setTimeout(() => {
      const destination =
        role === "student" ? "/student/dashboard" : role === "tutor" ? "/tutor/dashboard" : "/admin/dashboard"
      router.push(destination)
    }, 800)
  }

  return (
    <div style={{
      minHeight: "calc(100vh - var(--app-header-height, 150px))", backgroundColor: "var(--bg-canvas)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px", position: "relative",
    }}>
      {/* Background glow */}
      <div style={{
        position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)",
        width: 700, height: 400, borderRadius: "50%", pointerEvents: "none",
        background: "radial-gradient(ellipse, rgba(59,130,246,0.14) 0%, transparent 70%)",
      }} />

      <div style={{ width: "100%", maxWidth: 440, position: "relative" }}>

        {/* Logo & heading */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 28 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GraduationCap size={24} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 20, color: "var(--text-primary)" }}>LearnFlow</span>
          </Link>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8, letterSpacing: "-0.02em" }}>Welcome back</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>Sign in to continue your learning journey</p>
        </div>

        {/* Card */}
        <div className="shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: 24, padding: "36px 32px" }}>

          {/* Role toggle */}
          <div style={{ display: "flex", backgroundColor: "var(--bg-surface-muted)", borderRadius: 12, padding: 4, marginBottom: 28, gap: 4 }}>
            {(["student", "tutor", "admin"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                style={{
                  flex: 1, padding: "9px 0", borderRadius: 9, fontSize: 14, fontWeight: 600,
                  border: "none", cursor: "pointer", transition: "all 0.15s",
                  backgroundColor: role === r ? "var(--accent)" : "transparent",
                  color: role === r ? "#fff" : "var(--text-tertiary)",
                }}
              >
                {r === "student" ? "Student" : r === "tutor" ? "Instructor" : "Admin"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Email */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 7 }}>
                Email address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%", padding: "11px 14px", borderRadius: 10,
                  backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)",
                  color: "var(--text-primary)", fontSize: 14, outline: "none", boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
              />
            </div>

            {/* Password */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>Password</label>
                <Link href="/forgot-password" style={{ fontSize: 13, color: "var(--accent)", textDecoration: "none" }}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: "100%", padding: "11px 44px 11px 14px", borderRadius: 10,
                    backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)",
                    color: "var(--text-primary)", fontSize: 14, outline: "none", boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", padding: 0 }}
                >
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "13px", borderRadius: 11, border: "none",
                backgroundColor: loading ? "var(--accent-hover)" : "var(--accent)", color: "#fff",
                fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: "0 4px 20px rgba(59,130,246,0.35)",
                opacity: loading ? 0.85 : 1,
              }}
            >
              {loading ? (
                <>
                  <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                  Signing in…
                </>
              ) : (
                <>Sign in <ArrowRight size={17} /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
            <div style={{ flex: 1, height: 1, backgroundColor: "var(--border-default)" }} />
            <span style={{ color: "var(--text-muted)", fontSize: 13 }}>or continue with</span>
            <div style={{ flex: 1, height: 1, backgroundColor: "var(--border-default)" }} />
          </div>

          {/* OAuth */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {["Google", "Microsoft"].map((p) => (
              <button
                key={p}
                onClick={() => router.push("/student/dashboard")}
                style={{
                  padding: "11px", borderRadius: 10, border: "1px solid var(--border-default)",
                  backgroundColor: "var(--bg-surface-muted)", color: "var(--text-secondary)", fontSize: 14, fontWeight: 600,
                  cursor: "pointer", transition: "border-color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--text-muted)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-default)")}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "var(--text-tertiary)" }}>
          Don&apos;t have an account?{" "}
          <Link href="/register" style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}>
            Sign up free
          </Link>
        </p>

        {/* Quick demo links */}
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>Quick demo access:</p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <Link
              href="/student/dashboard"
              style={{ fontSize: 12, color: "var(--accent)", textDecoration: "none", padding: "5px 12px", borderRadius: 8, border: "1px solid #3b82f630", backgroundColor: "#3b82f610" }}
            >
              → Student Dashboard
            </Link>
            <Link
              href="/tutor/dashboard"
              style={{ fontSize: 12, color: "#8B5CF6", textDecoration: "none", padding: "5px 12px", borderRadius: 8, border: "1px solid #8B5CF630", backgroundColor: "#8B5CF610" }}
            >
              → Tutor Dashboard
            </Link>
            <Link
              href="/admin/dashboard"
              style={{ fontSize: 12, color: "var(--warning)", textDecoration: "none", padding: "5px 12px", borderRadius: 8, border: "1px solid #F59E0B30", backgroundColor: "#F59E0B10" }}
            >
              → Admin Dashboard
            </Link>
          </div>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )
}
