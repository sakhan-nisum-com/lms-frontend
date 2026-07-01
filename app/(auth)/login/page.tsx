"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { GraduationCap, Eye, EyeOff, ArrowRight, ChevronLeft } from "lucide-react"
import { useState } from "react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"

interface UserRole {
  role: "INSTRUCTOR" | "LEARNER" | "ADMIN"
  label: string
  description: string
  icon: string
}

const ROLE_OPTIONS: UserRole[] = [
  { role: "LEARNER", label: "Student", description: "Take courses and learn", icon: "📚" },
  { role: "INSTRUCTOR", label: "Instructor", description: "Create and teach courses", icon: "👨‍🏫" },
]

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<"email" | "role-select" | "password">("email")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [selectedRole, setSelectedRole] = useState<"INSTRUCTOR" | "LEARNER" | null>(null)
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>([])

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!email.trim()) {
      setError("Please enter your email")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Call backend to check available roles for this email
      const response = await fetch(`${API_BASE_URL}/auth/check-email`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        throw new Error("Email not found")
      }

      const data = await response.json()
      const roles = data.data.availableRoles || ["LEARNER"]

      // Filter to only show roles this user has
      const filtered = ROLE_OPTIONS.filter((r) =>
        roles.includes(r.role)
      )

      setAvailableRoles(filtered)
      setStep(filtered.length === 1 ? "password" : "role-select")
      if (filtered.length === 1) {
        setSelectedRole(filtered[0].role as "INSTRUCTOR" | "LEARNER")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Email not found")
    } finally {
      setLoading(false)
    }
  }

  const handleRoleSelect = (role: "INSTRUCTOR" | "LEARNER") => {
    setSelectedRole(role)
    setStep("password")
  }

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!password.trim()) {
      setError("Please enter your password")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Login failed")
      }

      const data = await response.json()
      const user = data.data

      // Verify the login role matches the selected role
      if (user.role !== selectedRole) {
        throw new Error(
          `You don't have ${selectedRole === "INSTRUCTOR" ? "instructor" : "student"} access`
        )
      }

      // Redirect based on role
      let dashboardPath = "/student/dashboard"
      if (user.role === "INSTRUCTOR") {
        dashboardPath = "/instructor/dashboard"
      } else if (user.role === "ADMIN") {
        dashboardPath = "/admin/dashboard"
      }

      router.push(dashboardPath)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0f172a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        position: "relative",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "fixed",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 700,
          height: 400,
          borderRadius: "50%",
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse, rgba(59,130,246,0.14) 0%, transparent 70%)",
        }}
      />

      <div style={{ width: "100%", maxWidth: 440, position: "relative" }}>
        {/* Logo & heading */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
              marginBottom: 28,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: "#3b82f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <GraduationCap size={24} color="#fff" />
            </div>
            <span
              style={{
                fontWeight: 800,
                fontSize: 20,
                color: "#f8fafc",
              }}
            >
              LearnFlow
            </span>
          </Link>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: "#f8fafc",
              marginBottom: 8,
              letterSpacing: "-0.02em",
            }}
          >
            Welcome back
          </h1>
          <p style={{ color: "#94a3b8", fontSize: 15 }}>
            {step === "email" && "Sign in to continue your learning journey"}
            {step === "role-select" && "Select your role"}
            {step === "password" && selectedRole && (
              <>Sign in as {ROLE_OPTIONS.find((r) => r.role === selectedRole)?.label}</>
            )}
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            backgroundColor: "#1e293b",
            border: "1px solid #334155",
            borderRadius: 24,
            padding: "36px 32px",
          }}
        >
          {/* Error message */}
          {error && (
            <div
              style={{
                padding: "12px 14px",
                borderRadius: 10,
                backgroundColor: "#7f1d1d",
                border: "1px solid #dc2626",
                marginBottom: 20,
              }}
            >
              <p style={{ fontSize: 14, color: "#fca5a5", margin: 0 }}>{error}</p>
            </div>
          )}

          {/* STEP 1: Email */}
          {step === "email" && (
            <form onSubmit={handleEmailSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#cbd5e1",
                    marginBottom: 7,
                  }}
                >
                  Email address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 10,
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    color: "#f8fafc",
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#334155")}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: 11,
                  border: "none",
                  backgroundColor: loading ? "#2563eb" : "#3b82f6",
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: "0 4px 20px rgba(59,130,246,0.35)",
                  opacity: loading ? 0.85 : 1,
                }}
              >
                {loading ? (
                  <>
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        border: "2px solid rgba(255,255,255,0.4)",
                        borderTopColor: "#fff",
                        borderRadius: "50%",
                        display: "inline-block",
                        animation: "spin 0.7s linear infinite",
                      }}
                    />
                    Checking email…
                  </>
                ) : (
                  <>
                    Continue <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: Role Selection */}
          {step === "role-select" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {availableRoles.map((role) => (
                <button
                  key={role.role}
                  onClick={() => handleRoleSelect(role.role)}
                  style={{
                    padding: "16px",
                    borderRadius: 12,
                    border: "2px solid #334155",
                    backgroundColor: "#0f172a",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#3b82f6"
                    e.currentTarget.style.backgroundColor = "#1e293b"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#334155"
                    e.currentTarget.style.backgroundColor = "#0f172a"
                  }}
                >
                  <span style={{ fontSize: 24 }}>{role.icon}</span>
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#f8fafc",
                        margin: 0,
                      }}
                    >
                      {role.label}
                    </p>
                    <p
                      style={{
                        fontSize: 12,
                        color: "#64748b",
                        margin: "4px 0 0 0",
                      }}
                    >
                      {role.description}
                    </p>
                  </div>
                  <ArrowRight size={20} color="#3b82f6" />
                </button>
              ))}

              <button
                onClick={() => {
                  setStep("email")
                  setError("")
                }}
                style={{
                  marginTop: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "none",
                  border: "none",
                  color: "#3b82f6",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <ChevronLeft size={16} />
                Back to email
              </button>
            </div>
          )}

          {/* STEP 3: Password */}
          {step === "password" && (
            <form onSubmit={handlePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 7,
                  }}
                >
                  <label
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#cbd5e1",
                    }}
                  >
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    style={{
                      fontSize: 13,
                      color: "#3b82f6",
                      textDecoration: "none",
                    }}
                  >
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
                      width: "100%",
                      padding: "11px 44px 11px 14px",
                      borderRadius: 10,
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      color: "#f8fafc",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#3b82f6")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#334155")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#64748b",
                      padding: 0,
                    }}
                  >
                    {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: 11,
                  border: "none",
                  backgroundColor: loading ? "#2563eb" : "#3b82f6",
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: "0 4px 20px rgba(59,130,246,0.35)",
                  opacity: loading ? 0.85 : 1,
                }}
              >
                {loading ? (
                  <>
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        border: "2px solid rgba(255,255,255,0.4)",
                        borderTopColor: "#fff",
                        borderRadius: "50%",
                        display: "inline-block",
                        animation: "spin 0.7s linear infinite",
                      }}
                    />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in <ArrowRight size={17} />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("role-select")
                  setError("")
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "none",
                  border: "none",
                  color: "#3b82f6",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <ChevronLeft size={16} />
                Back to role selection
              </button>
            </form>
          )}
        </div>

        <p
          style={{
            textAlign: "center",
            marginTop: 24,
            fontSize: 14,
            color: "#64748b",
          }}
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            style={{
              color: "#3b82f6",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Sign up free
          </Link>
        </p>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )
}
