import Link from "next/link"
import {
  GraduationCap,
  BookOpen,
  Users,
  BarChart3,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
  Play,
  Star,
} from "lucide-react"

const features = [
  {
    icon: BookOpen,
    title: "Rich Course Library",
    desc: "Structured courses with video, quizzes, and hands-on labs across every domain.",
    color: "#3B82F6",
  },
  {
    icon: BarChart3,
    title: "Progress Analytics",
    desc: "Real-time dashboards for completion rates, quiz scores, and engagement.",
    color: "#10B981",
  },
  {
    icon: Users,
    title: "Cohort Learning",
    desc: "Create learning groups, assign curricula, and track team-wide progress.",
    color: "#8B5CF6",
  },
  {
    icon: Shield,
    title: "Enterprise Ready",
    desc: "SSO, RBAC, compliance reporting, and audit logs built in from day one.",
    color: "#F59E0B",
  },
  {
    icon: Zap,
    title: "AI Learning Paths",
    desc: "Adaptive paths that adjust to each learner's pace, strengths, and goals.",
    color: "#EC4899",
  },
  {
    icon: GraduationCap,
    title: "Certifications",
    desc: "Issue verifiable certificates recognized by leading institutions.",
    color: "#06B6D4",
  },
]

const stats = [
  { value: "50K+", label: "Active Learners" },
  { value: "1,200+", label: "Courses" },
  { value: "98%", label: "Satisfaction" },
  { value: "200+", label: "Enterprises" },
]

const plans = [
  {
    name: "Academic",
    price: "Free",
    period: "",
    desc: "For students and independent learners",
    features: ["200+ free courses", "Progress tracking", "Community forums", "Basic certificates"],
    cta: "Get Started Free",
    href: "/register",
    hot: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/mo",
    desc: "For professionals leveling up",
    features: ["Full course library", "AI learning paths", "Priority support", "Verified certificates", "Offline access"],
    cta: "Start Free Trial",
    href: "/register",
    hot: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For teams and organizations",
    features: ["Everything in Pro", "SSO & SCIM", "Admin dashboard", "Compliance reports", "Dedicated CSM"],
    cta: "Contact Sales",
    href: "/contact",
    hot: false,
  },
]

export default function HomePage() {
  return (
    <div style={{ backgroundColor: "#0f172a", color: "#f8fafc", minHeight: "100vh" }}>

      {/* ── NAV ── */}
      <header
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
          backgroundColor: "rgba(15,23,42,0.85)",
          borderBottom: "1px solid #1e293b",
          backdropFilter: "blur(12px)",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GraduationCap size={20} color="#fff" />
            </div>
            <span style={{ fontWeight: 700, fontSize: 18, color: "#f8fafc" }}>LearnFlow</span>
          </Link>

          <nav style={{ display: "flex", alignItems: "center", gap: 32 }}>
            {["Features", "Pricing", "About"].map(l => (
              <Link key={l} href={`#${l.toLowerCase()}`} style={{ color: "#94a3b8", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>{l}</Link>
            ))}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link href="/login" style={{ color: "#94a3b8", fontSize: 14, fontWeight: 500, textDecoration: "none", padding: "8px 16px" }}>Sign in</Link>
            <Link href="/register" style={{
              backgroundColor: "#3b82f6", color: "#fff", fontSize: 14, fontWeight: 600,
              padding: "8px 18px", borderRadius: 8, textDecoration: "none",
            }}>
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ paddingTop: 160, paddingBottom: 100, textAlign: "center", position: "relative", overflow: "hidden" }}>
        {/* Glow blobs */}
        <div style={{
          position: "absolute", top: 40, left: "50%", transform: "translateX(-50%)",
          width: 900, height: 500, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(59,130,246,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: 200, left: "10%",
          width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(139,92,246,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px", position: "relative" }}>
          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            backgroundColor: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)",
            borderRadius: 100, padding: "6px 16px", marginBottom: 28,
          }}>
            <Star size={13} color="#60a5fa" fill="#60a5fa" />
            <span style={{ color: "#60a5fa", fontSize: 13, fontWeight: 600 }}>Trusted by 50,000+ learners worldwide</span>
          </div>

          <h1 style={{
            fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 800, lineHeight: 1.1,
            letterSpacing: "-0.03em", color: "#f8fafc", marginBottom: 24,
          }}>
            The Modern LMS for{" "}
            <span style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 50%, #a5f3fc 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              Every Learner
            </span>
          </h1>

          <p style={{ fontSize: 18, color: "#94a3b8", lineHeight: 1.7, marginBottom: 40, maxWidth: 580, margin: "0 auto 40px" }}>
            Structured learning paths, AI-powered recommendations, and real-time analytics — built for enterprises and universities alike.
          </p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
            <Link href="/register" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              backgroundColor: "#3b82f6", color: "#fff", fontWeight: 700,
              fontSize: 15, padding: "14px 28px", borderRadius: 12, textDecoration: "none",
              boxShadow: "0 0 0 1px rgba(59,130,246,0.5), 0 8px 32px rgba(59,130,246,0.35)",
            }}>
              Start Learning Free <ArrowRight size={17} />
            </Link>
            <button style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              backgroundColor: "#1e293b", color: "#cbd5e1", fontWeight: 600,
              fontSize: 15, padding: "14px 28px", borderRadius: 12, border: "1px solid #334155",
              cursor: "pointer",
            }}>
              <Play size={15} fill="#3b82f6" color="#3b82f6" /> Watch demo
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", justifyContent: "center", gap: 48, marginTop: 72, flexWrap: "wrap" }}>
            {stats.map(({ value, label }) => (
              <div key={label}>
                <div style={{ fontSize: 32, fontWeight: 800, color: "#f8fafc" }}>{value}</div>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: "96px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 style={{ fontSize: 40, fontWeight: 800, color: "#f8fafc", letterSpacing: "-0.02em" }}>
              Everything you need to grow
            </h2>
            <p style={{ color: "#94a3b8", fontSize: 17, marginTop: 12 }}>
              A complete toolkit for learners, instructors, and admins.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div
                key={title}
                style={{
                  backgroundColor: "#1e293b", border: "1px solid #334155",
                  borderRadius: 20, padding: "28px 28px 32px",
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 14, marginBottom: 20,
                  backgroundColor: `${color}18`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon size={22} color={color} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f8fafc", marginBottom: 10 }}>{title}</h3>
                <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding: "96px 24px", backgroundColor: "#0d1424" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 style={{ fontSize: 40, fontWeight: 800, color: "#f8fafc", letterSpacing: "-0.02em" }}>
              Simple, transparent pricing
            </h2>
            <p style={{ color: "#94a3b8", fontSize: 17, marginTop: 12 }}>Start free. Scale as you grow.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
            {plans.map((plan) => (
              <div
                key={plan.name}
                style={{
                  backgroundColor: plan.hot ? "#112240" : "#1e293b",
                  border: `1px solid ${plan.hot ? "#3b82f6" : "#334155"}`,
                  borderRadius: 24, padding: "32px 28px",
                  boxShadow: plan.hot ? "0 0 60px rgba(59,130,246,0.15)" : "none",
                  position: "relative", display: "flex", flexDirection: "column",
                }}
              >
                {plan.hot && (
                  <div style={{
                    position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)",
                    backgroundColor: "#3b82f6", color: "#fff", fontSize: 12,
                    fontWeight: 700, padding: "4px 16px", borderRadius: 100,
                    letterSpacing: "0.02em",
                  }}>
                    MOST POPULAR
                  </div>
                )}

                <div style={{ marginBottom: 28 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
                    {plan.name}
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                    <span style={{ fontSize: 44, fontWeight: 800, color: "#f8fafc", lineHeight: 1 }}>{plan.price}</span>
                    {plan.period && <span style={{ color: "#64748b", fontSize: 16 }}>{plan.period}</span>}
                  </div>
                  <p style={{ fontSize: 14, color: "#64748b" }}>{plan.desc}</p>
                </div>

                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", flex: 1 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, fontSize: 14, color: "#cbd5e1" }}>
                      <CheckCircle2 size={16} color="#3b82f6" style={{ flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link href={plan.href} style={{
                  display: "block", textAlign: "center", padding: "12px",
                  borderRadius: 12, fontSize: 14, fontWeight: 700,
                  textDecoration: "none", color: "#fff",
                  backgroundColor: plan.hot ? "#3b82f6" : "#334155",
                }}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "96px 24px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <div style={{
            backgroundColor: "#1e293b", border: "1px solid #334155",
            borderRadius: 28, padding: "72px 48px", overflow: "hidden", position: "relative",
          }}>
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              background: "radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.15) 0%, transparent 65%)",
            }} />
            <h2 style={{ fontSize: 40, fontWeight: 800, color: "#f8fafc", letterSpacing: "-0.02em", marginBottom: 16, position: "relative" }}>
              Ready to start learning?
            </h2>
            <p style={{ color: "#94a3b8", fontSize: 17, marginBottom: 36, position: "relative" }}>
              Join thousands of learners and teams already growing with LearnFlow.
            </p>
            <Link href="/register" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              backgroundColor: "#3b82f6", color: "#fff", fontWeight: 700,
              fontSize: 15, padding: "14px 32px", borderRadius: 12, textDecoration: "none",
              boxShadow: "0 8px 32px rgba(59,130,246,0.35)", position: "relative",
            }}>
              Create your free account <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid #1e293b", padding: "32px 24px", textAlign: "center", color: "#475569", fontSize: 14 }}>
        © 2025 LearnFlow · Built for learners, by learners
      </footer>
    </div>
  )
}
