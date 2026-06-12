import Link from "next/link"
import {
  GraduationCap,
  BookOpen,
  Users,
  BarChart3,
  Shield,
  Zap,
  ArrowRight,
  Star,
  CheckCircle2,
} from "lucide-react"

const features = [
  {
    icon: BookOpen,
    title: "Rich Course Library",
    description:
      "Access hundreds of structured courses with video, quizzes, and hands-on projects across every domain.",
  },
  {
    icon: BarChart3,
    title: "Progress Analytics",
    description:
      "Real-time dashboards track completion rates, quiz scores, and time-on-task for every learner.",
  },
  {
    icon: Users,
    title: "Team & Cohort Learning",
    description:
      "Create learning groups, assign curricula, and monitor team-wide progress in one place.",
  },
  {
    icon: Shield,
    title: "Enterprise Ready",
    description:
      "SSO, role-based access, compliance reporting, and audit logs built in from day one.",
  },
  {
    icon: Zap,
    title: "AI-Powered Paths",
    description:
      "Adaptive learning paths that adjust to each learner's pace, strengths, and career goals.",
  },
  {
    icon: GraduationCap,
    title: "Certifications",
    description:
      "Issue verifiable certificates on course completion, recognized by leading institutions.",
  },
]

const stats = [
  { value: "50K+", label: "Active Learners" },
  { value: "1,200+", label: "Courses" },
  { value: "98%", label: "Satisfaction Rate" },
  { value: "200+", label: "Enterprise Clients" },
]

const plans = [
  {
    name: "Academic",
    price: "Free",
    period: "",
    description: "For students and independent learners",
    features: [
      "Access 200+ free courses",
      "Progress tracking",
      "Community forums",
      "Basic certificates",
    ],
    cta: "Get Started Free",
    href: "/register",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For professionals leveling up",
    features: [
      "Full course library",
      "AI learning paths",
      "Priority support",
      "Verified certificates",
      "Offline downloads",
    ],
    cta: "Start Free Trial",
    href: "/register",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For teams and organizations",
    features: [
      "Everything in Pro",
      "SSO & SCIM",
      "Admin dashboard",
      "Compliance reports",
      "Dedicated CSM",
    ],
    cta: "Contact Sales",
    href: "/contact",
    highlighted: false,
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0F172A", color: "#F8FAFC" }}>
      {/* Navbar */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4"
        style={{
          backgroundColor: "#0F172A",
          borderBottom: "1px solid #1E293B",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center rounded-lg"
            style={{ width: 36, height: 36, backgroundColor: "#3B82F6" }}
          >
            <GraduationCap size={20} color="#fff" />
          </div>
          <span className="font-bold text-lg text-white">LearnFlow</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: "#94A3B8" }}>
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="#about" className="hover:text-white transition-colors">About</Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-150 hover:text-white"
            style={{ color: "#94A3B8" }}
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-150 text-white hover:opacity-90"
            style={{ backgroundColor: "#3B82F6" }}
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center text-center pt-40 pb-24 px-6 overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ backgroundColor: "#3B82F6" }}
        />

        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-6"
          style={{ backgroundColor: "#1D4ED820", color: "#60A5FA", border: "1px solid #3B82F630" }}
        >
          <Star size={12} />
          Trusted by 50,000+ learners worldwide
        </div>

        <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight text-white max-w-4xl">
          Learn Without{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #3B82F6, #60A5FA, #93C5FD)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Limits
          </span>
        </h1>

        <p className="mt-6 text-lg md:text-xl max-w-2xl leading-relaxed" style={{ color: "#94A3B8" }}>
          The modern LMS built for enterprises and universities alike. Structured
          learning paths, AI-powered recommendations, and real-time analytics — all in one platform.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mt-10">
          <Link
            href="/register"
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90"
            style={{ backgroundColor: "#3B82F6", boxShadow: "0 0 24px #3B82F640" }}
          >
            Start Learning Free
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 rounded-xl text-sm font-medium transition-colors duration-150 hover:border-slate-500"
            style={{
              backgroundColor: "#1E293B",
              color: "#CBD5E1",
              border: "1px solid #334155",
            }}
          >
            Sign in to your account
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-10 mt-20">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-bold text-white">{value}</div>
              <div className="text-sm mt-1" style={{ color: "#64748B" }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Everything you need to grow</h2>
            <p className="mt-4 text-base max-w-xl mx-auto" style={{ color: "#94A3B8" }}>
              A complete toolkit for learners, instructors, and administrators.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-2xl p-6 transition-all duration-200 hover:border-blue-600"
                style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
              >
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-xl mb-4"
                  style={{ backgroundColor: "#3B82F620" }}
                >
                  <Icon size={20} style={{ color: "#3B82F6" }} />
                </div>
                <h3 className="font-semibold text-base text-white mb-2">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#94A3B8" }}>{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Simple, transparent pricing</h2>
            <p className="mt-4 text-base" style={{ color: "#94A3B8" }}>Start free. Scale as you grow.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className="rounded-2xl p-6 flex flex-col relative"
                style={{
                  backgroundColor: plan.highlighted ? "#1D3A6B" : "#1E293B",
                  border: `1px solid ${plan.highlighted ? "#3B82F6" : "#334155"}`,
                  boxShadow: plan.highlighted ? "0 0 40px #3B82F620" : "none",
                }}
              >
                {plan.highlighted && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: "#3B82F6" }}
                  >
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3
                    className="text-xs font-semibold uppercase tracking-wider mb-1"
                    style={{ color: "#94A3B8" }}
                  >
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    {plan.period && <span style={{ color: "#64748B" }}>{plan.period}</span>}
                  </div>
                  <p className="text-sm mt-2" style={{ color: "#64748B" }}>{plan.description}</p>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm" style={{ color: "#CBD5E1" }}>
                      <CheckCircle2 size={15} style={{ color: "#3B82F6", flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className="block text-center py-2.5 rounded-xl text-sm font-semibold transition-colors duration-150 text-white hover:opacity-90"
                  style={{ backgroundColor: plan.highlighted ? "#3B82F6" : "#334155" }}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 md:px-12">
        <div
          className="max-w-3xl mx-auto text-center rounded-3xl py-16 px-8 relative overflow-hidden"
          style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
        >
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{ background: "radial-gradient(circle at 50% 50%, #3B82F6, transparent 70%)" }}
          />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 relative">
            Ready to start learning?
          </h2>
          <p className="text-base mb-8 relative" style={{ color: "#94A3B8" }}>
            Join thousands of learners and teams already growing with LearnFlow.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold text-white transition-colors duration-150 relative hover:opacity-90"
            style={{ backgroundColor: "#3B82F6" }}
          >
            Create your free account
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-8 px-6 text-center text-sm"
        style={{ color: "#475569", borderTop: "1px solid #1E293B" }}
      >
        © 2025 LearnFlow. Built for learners, by learners.
      </footer>
    </div>
  )
}
