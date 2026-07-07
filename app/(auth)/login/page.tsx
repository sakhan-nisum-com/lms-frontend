"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { GraduationCap, Eye, EyeOff, ArrowRight } from "lucide-react"
import { useState } from "react"
import { authApi } from "@/lib/api/auth"
import { authStore } from "@/lib/auth-store"
import { ApiError } from "@/lib/api/client"

export default function LoginPage() {
  const router = useRouter()
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const tokens = await authApi.login({ email, password })
      authStore.save(tokens)
      router.push(authStore.dashboardPath())
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.status === 401 ? "Invalid email or password." : err.message)
      } else {
        setError("Unable to connect. Please check your connection.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: "calc(100vh - var(--app-header-height, 150px))", backgroundColor: "var(--bg-canvas)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px", position: "relative",
    }}>
      <div style={{
        position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)",
        width: 700, height: 400, borderRadius: "50%", pointerEvents: "none",
        background: "radial-gradient(ellipse, rgba(59,130,246,0.14) 0%, transparent 70%)",
      }} />

      <div style={{ width: "100%", maxWidth: 440, position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 28 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GraduationCap size={24} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 20, color: "var(--text-primary)" }}>نحلم LMS</span>
          </Link>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8, letterSpacing: "-0.02em" }}>Welcome back</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>Sign in to continue your learning journey</p>
        </div>

        <div className="shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: 24, padding: "36px 32px" }}>

          {error && (
            <div style={{
              marginBottom: 20, padding: "12px 16px", borderRadius: 10,
              backgroundColor: "#EF444418", border: "1px solid #EF444440",
              color: "#EF4444", fontSize: 14, fontWeight: 500,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
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
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", padding: 0 }}>
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "13px", borderRadius: 11, border: "none",
                backgroundColor: loading ? "var(--accent-hover)" : "var(--accent)", color: "#fff",
                fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: "0 4px 20px rgba(59,130,246,0.35)", opacity: loading ? 0.85 : 1,
              }}
            >
              {loading ? (
                <><span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />Signing in…</>
              ) : (
                <>Sign in <ArrowRight size={17} /></>
              )}
            </button>
          </form>

          <div style={{ marginTop: 28, padding: "16px", borderRadius: 12, backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)" }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-tertiary)", marginBottom: 10 }}>Demo accounts</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { label: "Admin", email: "admin@nehlum.com", pw: "Admin@123456", color: "#F59E0B" },
                { label: "Instructor", email: "instructor@nehlum.com", pw: "Instructor@123456", color: "#8B5CF6" },
                { label: "Student", email: "student@nehlum.com", pw: "Student@123456", color: "#3B82F6" },
              ].map((d) => (
                <button
                  key={d.label}
                  type="button"
                  onClick={() => { setEmail(d.email); setPassword(d.pw) }}
                  style={{
                    padding: "8px 12px", borderRadius: 8, border: `1px solid ${d.color}30`,
                    backgroundColor: `${d.color}10`, color: d.color, fontSize: 12, fontWeight: 600,
                    cursor: "pointer", textAlign: "left",
                  }}
                >
                  {d.label} — {d.email}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "var(--text-tertiary)" }}>
          Don&apos;t have an account?{" "}
          <Link href="/register" style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}>
            Sign up free
          </Link>
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )
}
