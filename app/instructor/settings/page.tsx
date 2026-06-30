"use client"

import { useState } from "react"
import {
  User,
  Lock,
  Bell,
  CreditCard,
  Camera,
  Eye,
  EyeOff,
  Save,
  AlertTriangle,
  Mail,
  Globe,
  Link2,
  AtSign,
  Briefcase,
  ChevronRight,
} from "lucide-react"
import { InstructorPageShell } from "@/components/instructor/InstructorPageShell"

const TABS = [
  { key: "profile",       label: "Profile",       icon: User      },
  { key: "account",       label: "Account",       icon: Lock      },
  { key: "notifications", label: "Notifications", icon: Bell      },
  { key: "payout",        label: "Payout",        icon: CreditCard },
]

const SPECIALTIES = [
  "Software Engineering", "Data Science & AI", "Design & UX",
  "Business & Management", "Marketing", "Cybersecurity", "Cloud & DevOps", "Other",
]

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="relative inline-flex items-center w-10 h-5 rounded-full transition-colors flex-shrink-0"
      style={{ backgroundColor: checked ? "var(--accent)" : "var(--border-default)" }}
      aria-checked={checked}
      role="switch"
    >
      <span
        className="inline-block w-3.5 h-3.5 rounded-full bg-white transition-transform"
        style={{ transform: checked ? "translateX(22px)" : "translateX(3px)" }}
      />
    </button>
  )
}

function InputField({
  label, value, onChange, type = "text", placeholder = "", icon: Icon, readOnly = false,
}: {
  label: string
  value: string
  onChange?: (v: string) => void
  type?: string
  placeholder?: string
  icon?: React.ElementType
  readOnly?: boolean
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>{label}</label>
      <div className="relative">
        {Icon && (
          <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }} />
        )}
        <input
          type={type}
          value={value}
          readOnly={readOnly}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className="w-full py-2.5 rounded-xl text-sm placeholder-slate-600 outline-none transition-colors"
          style={{
            paddingLeft: Icon ? "2.5rem" : "0.875rem",
            paddingRight: "0.875rem",
            backgroundColor: readOnly ? "var(--bg-surface-muted)" : "var(--bg-surface)",
            border: "1px solid var(--border-default)",
            opacity: readOnly ? 0.6 : 1,
            color: "var(--text-primary)",
          }}
          onFocus={(e) => { if (!readOnly) e.target.style.borderColor = "var(--accent)" }}
          onBlur={(e) => { e.target.style.borderColor = "var(--border-default)" }}
        />
      </div>
    </div>
  )
}

/* ───────────── Tab panels ───────────── */

function ProfileTab() {
  const [form, setForm] = useState({
    firstName: "Jane",
    lastName: "Smith",
    email: "jane@example.com",
    bio: "Senior software engineer with 10+ years building production React & Node.js applications. Passionate about teaching clean, maintainable code.",
    specialty: "Software Engineering",
    website: "https://janesmith.dev",
    linkedin: "linkedin.com/in/janesmith",
    twitter: "@janesmith",
  })

  function upd(k: keyof typeof form, v: string) {
    setForm((p) => ({ ...p, [k]: v }))
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Avatar */}
      <div
        className="rounded-2xl p-5 shadow-sm"
        style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
      >
        <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Profile Photo</h3>
        <div className="flex items-center gap-5">
          <div className="relative">
            <div
              className="flex items-center justify-center w-20 h-20 rounded-full text-2xl font-bold text-white"
              style={{ backgroundColor: "var(--accent)" }}
            >
              JS
            </div>
            <button
              className="absolute bottom-0 right-0 flex items-center justify-center w-7 h-7 rounded-full text-white transition-colors hover:opacity-80"
              style={{ backgroundColor: "var(--bg-surface)", border: "2px solid var(--bg-surface-muted)" }}
            >
              <Camera size={13} />
            </button>
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Jane Smith</p>
            <p className="text-xs mt-0.5 mb-3" style={{ color: "var(--text-tertiary)" }}>JPG or PNG, max 2MB</p>
            <button
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors hover:opacity-80"
              style={{ backgroundColor: "var(--border-default)", color: "var(--text-secondary)" }}
            >
              Upload new photo
            </button>
          </div>
        </div>
      </div>

      {/* Basic info */}
      <div
        className="rounded-2xl p-5 space-y-4 shadow-sm"
        style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
      >
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Basic Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <InputField label="First name" value={form.firstName} onChange={(v) => upd("firstName", v)} placeholder="Jane" />
          <InputField label="Last name"  value={form.lastName}  onChange={(v) => upd("lastName", v)}  placeholder="Smith" />
        </div>
        <InputField label="Email address" value={form.email} readOnly icon={Mail} />

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Teaching specialty</label>
          <div className="relative">
            <Briefcase size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" style={{ color: "var(--text-muted)" }} />
            <select
              value={form.specialty}
              onChange={(e) => upd("specialty", e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none appearance-none"
              style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
            >
              {SPECIALTIES.map((s) => (
                <option key={s} value={s} style={{ backgroundColor: "var(--bg-surface)" }}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Bio</label>
          <textarea
            rows={4}
            value={form.bio}
            onChange={(e) => upd("bio", e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm placeholder-slate-600 outline-none resize-none"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
          />
          <p className="text-xs mt-1 text-right" style={{ color: "var(--text-muted)" }}>{form.bio.length}/500</p>
        </div>
      </div>

      {/* Social links */}
      <div
        className="rounded-2xl p-5 space-y-4 shadow-sm"
        style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
      >
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Social Links</h3>
        <InputField label="Website"  value={form.website}  onChange={(v) => upd("website", v)}  icon={Globe}   placeholder="https://yoursite.com" />
        <InputField label="LinkedIn" value={form.linkedin} onChange={(v) => upd("linkedin", v)} icon={Link2}   placeholder="linkedin.com/in/username" />
        <InputField label="Twitter"  value={form.twitter}  onChange={(v) => upd("twitter", v)}  icon={AtSign}  placeholder="@username" />
      </div>

      <button
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90"
        style={{ backgroundColor: "var(--accent)" }}
      >
        <Save size={15} />
        Save changes
      </button>
    </div>
  )
}

function AccountTab() {
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew]         = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passwords, setPasswords] = useState({ current: "", newPw: "", confirm: "" })

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Change email */}
      <div
        className="rounded-2xl p-5 space-y-4 shadow-sm"
        style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
      >
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Email Address</h3>
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: "var(--bg-surface-muted)" }}>
          <Mail size={15} style={{ color: "var(--accent)" }} />
          <p className="text-sm flex-1" style={{ color: "var(--text-primary)" }}>jane@example.com</p>
          <button className="text-xs font-semibold transition-colors hover:text-blue-400" style={{ color: "var(--accent)" }}>
            Change
          </button>
        </div>
      </div>

      {/* Change password */}
      <div
        className="rounded-2xl p-5 space-y-4 shadow-sm"
        style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
      >
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Change Password</h3>
        {[
          { key: "current", label: "Current password",  show: showCurrent, setShow: setShowCurrent },
          { key: "newPw",   label: "New password",      show: showNew,     setShow: setShowNew     },
          { key: "confirm", label: "Confirm new password", show: showConfirm, setShow: setShowConfirm },
        ].map(({ key, label, show, setShow }) => (
          <div key={key}>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>{label}</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }} />
              <input
                type={show ? "text" : "password"}
                value={passwords[key as keyof typeof passwords]}
                onChange={(e) => setPasswords((p) => ({ ...p, [key]: e.target.value }))}
                placeholder="••••••••"
                className="w-full pl-9 pr-11 py-2.5 rounded-xl text-sm placeholder-slate-600 outline-none"
                style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors hover:text-slate-300"
                style={{ color: "var(--text-muted)" }}
              >
                {show ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
        ))}
        <button
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 mt-2"
          style={{ backgroundColor: "var(--accent)" }}
        >
          <Save size={14} />
          Update password
        </button>
      </div>

      {/* Danger zone */}
      <div
        className="rounded-2xl p-5"
        style={{ backgroundColor: "#EF444408", border: "1px solid #EF444430" }}
      >
        <div className="flex items-start gap-3">
          <AlertTriangle size={17} style={{ color: "var(--danger)", flexShrink: 0, marginTop: 1 }} />
          <div className="flex-1">
            <h3 className="text-sm font-semibold" style={{ color: "#FCA5A5" }}>Danger Zone</h3>
            <p className="text-xs mt-1 mb-4" style={{ color: "#6B2020" }}>
              Deleting your account is irreversible. All your courses, student data, and earnings history will be permanently removed.
            </p>
            <button
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors hover:opacity-80"
              style={{ backgroundColor: "#EF444420", color: "var(--danger)", border: "1px solid #EF444430" }}
            >
              Delete instructor account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    newEnrollment:  true,
    newReview:      true,
    studentMessage: true,
    payoutProcessed:true,
    courseApproved: true,
    weeklySummary:  false,
    marketing:      false,
  })

  const groups = [
    {
      title: "Course Activity",
      items: [
        { key: "newEnrollment",  label: "New student enrollment",       desc: "When a student enrolls in one of your courses"     },
        { key: "newReview",      label: "New review received",          desc: "When a student leaves a review on your course"     },
        { key: "courseApproved", label: "Course approved / rejected",   desc: "When your submitted course changes status"        },
      ],
    },
    {
      title: "Student Interactions",
      items: [
        { key: "studentMessage", label: "Student messages",             desc: "When a student sends you a message or question"   },
      ],
    },
    {
      title: "Payments",
      items: [
        { key: "payoutProcessed",label: "Payout processed",            desc: "When a payout is sent to your bank / PayPal"      },
      ],
    },
    {
      title: "Reports",
      items: [
        { key: "weeklySummary",  label: "Weekly performance summary",   desc: "A weekly digest of your course analytics"        },
        { key: "marketing",      label: "Tips & product updates",       desc: "Best practices and new LearnFlow features"       },
      ],
    },
  ]

  return (
    <div className="space-y-5 max-w-2xl">
      {groups.map((group) => (
        <div
          key={group.title}
          className="rounded-2xl overflow-hidden shadow-sm"
          style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
        >
          <div className="px-5 py-3" style={{ borderBottom: "1px solid var(--border-default)" }}>
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
              {group.title}
            </h3>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--border-default)" }}>
            {group.items.map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between px-5 py-4 gap-4">
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{label}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{desc}</p>
                </div>
                <Toggle
                  checked={prefs[key as keyof typeof prefs]}
                  onChange={(v) => setPrefs((p) => ({ ...p, [key]: v }))}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <button
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90"
        style={{ backgroundColor: "var(--accent)" }}
      >
        <Save size={15} />
        Save preferences
      </button>
    </div>
  )
}

function PayoutTab() {
  const [method, setMethod] = useState<"bank" | "paypal">("bank")

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Method selector */}
      <div
        className="rounded-2xl p-5 shadow-sm"
        style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
      >
        <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Payout Method</h3>
        <div className="grid grid-cols-2 gap-3">
          {(["bank", "paypal"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className="flex flex-col items-start gap-1 p-4 rounded-xl transition-colors"
              style={{
                backgroundColor: method === m ? "#3B82F620" : "var(--bg-surface-muted)",
                border: `1px solid ${method === m ? "var(--accent)" : "var(--border-default)"}`,
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center"
                  style={{ borderColor: method === m ? "var(--accent)" : "var(--text-muted)" }}
                >
                  {method === m && (
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--accent)" }} />
                  )}
                </div>
                <span className="text-sm font-semibold capitalize" style={{ color: "var(--text-primary)" }}>
                  {m === "bank" ? "Bank Transfer" : "PayPal"}
                </span>
              </div>
              <p className="text-xs ml-5" style={{ color: "var(--text-tertiary)" }}>
                {m === "bank" ? "Direct deposit, 3-5 business days" : "Instant to your PayPal account"}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Bank details */}
      {method === "bank" && (
        <div
          className="rounded-2xl p-5 space-y-4 shadow-sm"
          style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
        >
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Bank Account Details</h3>
          <InputField label="Account holder name" value="Jane Smith"           placeholder="Full legal name"    />
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Routing number" value="021000021"               placeholder="9-digit routing #"  />
            <InputField label="Account number" value="••••••3845"              placeholder="Account number"      readOnly />
          </div>
          <InputField label="Bank name"          value="Chase Bank"            placeholder="Bank name"           />
        </div>
      )}

      {/* PayPal */}
      {method === "paypal" && (
        <div
          className="rounded-2xl p-5 space-y-4 shadow-sm"
          style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
        >
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>PayPal Account</h3>
          <InputField label="PayPal email" value="jane@example.com" icon={Mail} placeholder="PayPal email address" />
        </div>
      )}

      {/* Payout history */}
      <div
        className="rounded-2xl overflow-hidden shadow-sm"
        style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
      >
        <div className="px-5 py-3.5" style={{ borderBottom: "1px solid var(--border-default)" }}>
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Payout History</h3>
        </div>
        <div className="divide-y" style={{ borderColor: "var(--border-default)" }}>
          {[
            { date: "Jun 2, 2025",  amount: "$840.00",  status: "paid" },
            { date: "May 26, 2025", amount: "$630.00",  status: "paid" },
            { date: "May 19, 2025", amount: "$510.00",  status: "paid" },
            { date: "May 12, 2025", amount: "$420.00",  status: "paid" },
          ].map((p, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3.5">
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{p.amount}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{p.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ color: "var(--success)", backgroundColor: "#10B98118" }}
                >
                  Paid
                </span>
                <button style={{ color: "var(--accent)" }}>
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90"
        style={{ backgroundColor: "var(--accent)" }}
      >
        <Save size={15} />
        Save payout settings
      </button>
    </div>
  )
}

/* ───────────── Page ───────────── */

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")

  const panels: Record<string, React.ReactNode> = {
    profile:       <ProfileTab />,
    account:       <AccountTab />,
    notifications: <NotificationsTab />,
    payout:        <PayoutTab />,
  }

  return (
    <InstructorPageShell
      title="Settings"
      user={{ name: "Jane Smith", email: "jane@example.com" }}
    >
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Tab nav */}
        <nav className="sm:w-48 flex sm:flex-col gap-1 shrink-0">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors text-left"
              style={{
                backgroundColor: activeTab === key ? "#3B82F620" : "transparent",
                color: activeTab === key ? "#60A5FA" : "var(--text-secondary)",
                border: activeTab === key ? "1px solid #3B82F630" : "1px solid transparent",
              }}
            >
              <Icon size={16} style={{ color: activeTab === key ? "var(--accent)" : "inherit", flexShrink: 0 }} />
              {label}
            </button>
          ))}
        </nav>

        {/* Panel */}
        <div className="flex-1 min-w-0">
          {panels[activeTab]}
        </div>
      </div>
    </InstructorPageShell>
  )
}
