"use client"

import { useEffect, useState } from "react"
import {
  User, Lock, Bell, CreditCard,
  Eye, EyeOff, Save, AlertTriangle,
  Mail, Globe, Link2, AtSign, Briefcase,
  MapPin, Phone, Clock, GraduationCap, Loader2, Check,
} from "lucide-react"
import { InstructorPageShell } from "@/components/instructor/InstructorPageShell"
import { usersApi, type UpdateProfileRequest, type AdminUser } from "@/lib/api/admin"
import { authStore } from "@/lib/auth-store"

const TABS = [
  { key: "profile",       label: "Profile",       icon: User       },
  { key: "account",       label: "Account",       icon: Lock       },
  { key: "notifications", label: "Notifications", icon: Bell       },
  { key: "payout",        label: "Payout",        icon: CreditCard },
]

const SPECIALIZATIONS = [
  "Software Engineering", "Data Science & AI", "Design & UX",
  "Business & Management", "Marketing", "Cybersecurity",
  "Cloud & DevOps", "Mobile Development", "Other",
]

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="relative inline-flex items-center w-10 h-5 rounded-full transition-colors flex-shrink-0"
      style={{ backgroundColor: checked ? "var(--accent)" : "var(--border-default)" }}
      aria-checked={checked} role="switch">
      <span className="inline-block w-3.5 h-3.5 rounded-full bg-white transition-transform"
        style={{ transform: checked ? "translateX(22px)" : "translateX(3px)" }} />
    </button>
  )
}

function Field({
  label, children, hint,
}: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>{label}</label>
      {children}
      {hint && <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{hint}</p>}
    </div>
  )
}

function Input({
  value, onChange, placeholder = "", type = "text", icon: Icon, readOnly = false,
}: {
  value: string
  onChange?: (v: string) => void
  placeholder?: string
  type?: string
  icon?: React.ElementType
  readOnly?: boolean
}) {
  return (
    <div className="relative">
      {Icon && (
        <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }} />
      )}
      <input
        type={type} value={value} readOnly={readOnly}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full py-2.5 rounded-xl text-sm outline-none transition-colors"
        style={{
          paddingLeft: Icon ? "2.5rem" : "0.875rem", paddingRight: "0.875rem",
          backgroundColor: readOnly ? "var(--bg-surface-muted)" : "var(--bg-surface)",
          border: "1px solid var(--border-default)", opacity: readOnly ? 0.6 : 1,
          color: "var(--text-primary)",
        }}
        onFocus={(e) => { if (!readOnly) e.target.style.borderColor = "var(--accent)" }}
        onBlur={(e) => { e.target.style.borderColor = "var(--border-default)" }}
      />
    </div>
  )
}

/* ── Profile Tab ─────────────────────────────────────────────────────────── */

function ProfileTab() {
  const [profile, setProfile] = useState<AdminUser | null>(null)
  const [form, setForm] = useState<UpdateProfileRequest>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    usersApi.getMe()
      .then((u) => {
        setProfile(u)
        setForm({
          fullName:          u.fullName ?? "",
          fullNameAr:        u.fullNameAr ?? "",
          headline:          u.headline ?? "",
          bio:               u.bio ?? "",
          bioAr:             u.bioAr ?? "",
          department:        u.department ?? "",
          location:          u.location ?? "",
          phoneNumber:       u.phoneNumber ?? "",
          specialization:    u.specialization ?? "",
          yearsOfExperience: u.yearsOfExperience ?? undefined,
          websiteUrl:        u.websiteUrl ?? "",
          linkedinUrl:       u.linkedinUrl ?? "",
          twitterUrl:        u.twitterUrl ?? "",
        })
      })
      .catch(() => setError("Failed to load profile."))
      .finally(() => setLoading(false))
  }, [])

  function upd(k: keyof UpdateProfileRequest, v: string | number | null) {
    setForm((p) => ({ ...p, [k]: v }))
  }

  async function save() {
    setSaving(true)
    setError(null)
    try {
      await usersApi.updateMe(form)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      setError("Failed to save changes.")
    } finally { setSaving(false) }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin" style={{ color: "var(--text-muted)" }} />
      </div>
    )
  }

  const initials = (profile?.fullName ?? "IN").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()

  return (
    <div className="space-y-6 max-w-2xl">
      {error && (
        <div className="px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: "#EF444418", color: "#F87171", border: "1px solid #EF444430" }}>
          {error}
        </div>
      )}

      {/* Avatar */}
      <div className="rounded-2xl p-5 shadow-sm"
        style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
        <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Profile Photo</h3>
        <div className="flex items-center gap-5">
          {profile?.avatarUrl ? (
            <img src={profile.avatarUrl} alt={profile.fullName}
              className="w-20 h-20 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="flex items-center justify-center w-20 h-20 rounded-full text-xl font-bold text-white flex-shrink-0"
              style={{ backgroundColor: "var(--accent)" }}>
              {initials}
            </div>
          )}
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{profile?.fullName}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{profile?.email}</p>
            <p className="text-xs mt-1 mb-2" style={{ color: "var(--text-muted)" }}>Paste an avatar URL below to update your photo</p>
            <Input value={form.avatarUrl ?? ""} onChange={(v) => upd("avatarUrl", v)} placeholder="https://..." />
          </div>
        </div>
      </div>

      {/* Identity */}
      <div className="rounded-2xl p-5 space-y-4 shadow-sm"
        style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Identity</h3>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Full name (EN)">
            <Input value={form.fullName ?? ""} onChange={(v) => upd("fullName", v)} placeholder="Ahmed Al-Rashid" />
          </Field>
          <Field label="Full name (AR)">
            <Input value={form.fullNameAr ?? ""} onChange={(v) => upd("fullNameAr", v)} placeholder="أحمد الرشيد" />
          </Field>
        </div>
        <Field label="Email address">
          <Input value={profile?.email ?? ""} readOnly icon={Mail} />
        </Field>
        <Field label="Headline" hint="A short tagline shown below your name, e.g. 'Senior Software Engineer & Educator'">
          <Input
            value={form.headline ?? ""}
            onChange={(v) => upd("headline", v.slice(0, 200))}
            placeholder="Senior Software Engineer & Educator"
          />
          <p className="text-xs mt-1 text-right" style={{ color: "var(--text-muted)" }}>
            {(form.headline ?? "").length}/200
          </p>
        </Field>
      </div>

      {/* Teaching profile */}
      <div className="rounded-2xl p-5 space-y-4 shadow-sm"
        style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Teaching Profile</h3>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Specialization">
            <div className="relative">
              <Briefcase size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10"
                style={{ color: "var(--text-muted)" }} />
              <select
                value={form.specialization ?? ""}
                onChange={(e) => upd("specialization", e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none appearance-none"
                style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}>
                <option value="">Select…</option>
                {SPECIALIZATIONS.map((s) => (
                  <option key={s} value={s} style={{ backgroundColor: "var(--bg-surface)" }}>{s}</option>
                ))}
              </select>
            </div>
          </Field>

          <Field label="Years of experience">
            <div className="relative">
              <Clock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "var(--text-muted)" }} />
              <input
                type="number" min={0} max={60}
                value={form.yearsOfExperience ?? ""}
                onChange={(e) => upd("yearsOfExperience", e.target.value === "" ? null : Number(e.target.value))}
                placeholder="e.g. 8"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-sm outline-none"
                style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
              />
            </div>
          </Field>
        </div>

        <Field label="Department / Institution">
          <Input value={form.department ?? ""} onChange={(v) => upd("department", v)}
            icon={GraduationCap} placeholder="Engineering Dept. / KAUST" />
        </Field>

        <Field label="Bio (EN)" hint="Displayed on your public tutor profile">
          <textarea
            rows={4}
            value={form.bio ?? ""}
            onChange={(e) => upd("bio", e.target.value.slice(0, 500))}
            placeholder="Tell students about your background, expertise, and teaching approach…"
            className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none resize-none"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
          />
          <p className="text-xs mt-1 text-right" style={{ color: "var(--text-muted)" }}>
            {(form.bio ?? "").length}/500
          </p>
        </Field>

        <Field label="Bio (AR)" hint="Arabic version shown when platform language is Arabic">
          <textarea
            rows={3}
            value={form.bioAr ?? ""}
            onChange={(e) => upd("bioAr", e.target.value.slice(0, 500))}
            placeholder="نبذة عنك بالعربية…"
            dir="rtl"
            className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none resize-none"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-primary)", fontFamily: "var(--font-arabic)" }}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
          />
        </Field>
      </div>

      {/* Contact & location */}
      <div className="rounded-2xl p-5 space-y-4 shadow-sm"
        style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Contact & Location</h3>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Phone">
            <Input value={form.phoneNumber ?? ""} onChange={(v) => upd("phoneNumber", v)}
              icon={Phone} placeholder="+966 5X XXX XXXX" />
          </Field>
          <Field label="Location">
            <Input value={form.location ?? ""} onChange={(v) => upd("location", v)}
              icon={MapPin} placeholder="Riyadh, Saudi Arabia" />
          </Field>
        </div>
      </div>

      {/* Social links */}
      <div className="rounded-2xl p-5 space-y-4 shadow-sm"
        style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Social Links</h3>
        <Field label="Website">
          <Input value={form.websiteUrl ?? ""} onChange={(v) => upd("websiteUrl", v)}
            icon={Globe} placeholder="https://yoursite.com" />
        </Field>
        <Field label="LinkedIn">
          <Input value={form.linkedinUrl ?? ""} onChange={(v) => upd("linkedinUrl", v)}
            icon={Link2} placeholder="https://linkedin.com/in/username" />
        </Field>
        <Field label="X / Twitter">
          <Input value={form.twitterUrl ?? ""} onChange={(v) => upd("twitterUrl", v)}
            icon={AtSign} placeholder="https://x.com/username" />
        </Field>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        style={{ backgroundColor: saved ? "#10B981" : "var(--accent)" }}>
        {saving ? <Loader2 size={15} className="animate-spin" />
          : saved ? <Check size={15} />
          : <Save size={15} />}
        {saving ? "Saving…" : saved ? "Saved!" : "Save changes"}
      </button>
    </div>
  )
}

/* ── Account Tab ─────────────────────────────────────────────────────────── */

function AccountTab() {
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew]         = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passwords, setPasswords] = useState({ current: "", newPw: "", confirm: "" })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function changePassword() {
    if (passwords.newPw !== passwords.confirm) {
      setError("New passwords do not match.")
      return
    }
    if (passwords.newPw.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    setSaving(true)
    setError(null)
    try {
      await usersApi.changePassword({ currentPassword: passwords.current, newPassword: passwords.newPw })
      setSuccess(true)
      setPasswords({ current: "", newPw: "", confirm: "" })
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError("Failed to change password. Check your current password.")
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="rounded-2xl p-5 space-y-4 shadow-sm"
        style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Change Password</h3>

        {error && (
          <div className="px-3 py-2 rounded-lg text-xs" style={{ backgroundColor: "#EF444418", color: "#F87171" }}>
            {error}
          </div>
        )}
        {success && (
          <div className="px-3 py-2 rounded-lg text-xs" style={{ backgroundColor: "#10B98118", color: "#34D399" }}>
            Password updated successfully.
          </div>
        )}

        {[
          { key: "current", label: "Current password",     show: showCurrent, setShow: setShowCurrent },
          { key: "newPw",   label: "New password",         show: showNew,     setShow: setShowNew     },
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
                className="w-full pl-9 pr-11 py-2.5 rounded-xl text-sm outline-none"
                style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
              />
              <button type="button" onClick={() => setShow(!show)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}>
                {show ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={changePassword}
          disabled={saving || !passwords.current || !passwords.newPw || !passwords.confirm}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
          style={{ backgroundColor: "var(--accent)" }}>
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? "Updating…" : "Update password"}
        </button>
      </div>

      <div className="rounded-2xl p-5" style={{ backgroundColor: "#EF444408", border: "1px solid #EF444430" }}>
        <div className="flex items-start gap-3">
          <AlertTriangle size={17} style={{ color: "var(--danger)", flexShrink: 0, marginTop: 1 }} />
          <div>
            <h3 className="text-sm font-semibold" style={{ color: "#FCA5A5" }}>Danger Zone</h3>
            <p className="text-xs mt-1 mb-4" style={{ color: "#6B2020" }}>
              Deleting your account is irreversible. All your courses, student data, and history will be permanently removed.
            </p>
            <button className="px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: "#EF444420", color: "var(--danger)", border: "1px solid #EF444430" }}>
              Delete account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Notifications Tab ────────────────────────────────────────────────────── */

function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    newEnrollment: true, newReview: true, studentMessage: true,
    payoutProcessed: true, courseApproved: true, weeklySummary: false, marketing: false,
  })

  const groups = [
    {
      title: "Course Activity",
      items: [
        { key: "newEnrollment",   label: "New student enrollment",     desc: "When a student enrolls in one of your courses" },
        { key: "newReview",       label: "New review received",        desc: "When a student leaves a review on your course" },
        { key: "courseApproved",  label: "Course approved / rejected", desc: "When your submitted course changes status" },
      ],
    },
    {
      title: "Student Interactions",
      items: [{ key: "studentMessage", label: "Student messages", desc: "When a student sends you a message" }],
    },
    {
      title: "Payments",
      items: [{ key: "payoutProcessed", label: "Payout processed", desc: "When a payout is sent to your account" }],
    },
    {
      title: "Reports",
      items: [
        { key: "weeklySummary", label: "Weekly performance summary", desc: "A weekly digest of your analytics" },
        { key: "marketing",     label: "Tips & product updates",     desc: "Best practices and new platform features" },
      ],
    },
  ]

  return (
    <div className="space-y-5 max-w-2xl">
      {groups.map((g) => (
        <div key={g.title} className="rounded-2xl overflow-hidden shadow-sm"
          style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
          <div className="px-5 py-3" style={{ borderBottom: "1px solid var(--border-default)" }}>
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>{g.title}</h3>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--border-default)" }}>
            {g.items.map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between px-5 py-4 gap-4">
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{label}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{desc}</p>
                </div>
                <Toggle checked={prefs[key as keyof typeof prefs]}
                  onChange={(v) => setPrefs((p) => ({ ...p, [key]: v }))} />
              </div>
            ))}
          </div>
        </div>
      ))}
      <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
        style={{ backgroundColor: "var(--accent)" }}>
        <Save size={15} /> Save preferences
      </button>
    </div>
  )
}

/* ── Payout Tab ──────────────────────────────────────────────────────────── */

function PayoutTab() {
  return (
    <div className="max-w-2xl">
      <div className="rounded-2xl p-8 flex flex-col items-center justify-center text-center"
        style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
        <CreditCard size={32} className="mb-3" style={{ color: "var(--text-muted)" }} />
        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Payout settings coming soon</p>
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Bank transfer and payment details will be configurable here.</p>
      </div>
    </div>
  )
}

/* ── Page ────────────────────────────────────────────────────────────────── */

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")
  const user = authStore.getUser()

  const panels: Record<string, React.ReactNode> = {
    profile:       <ProfileTab />,
    account:       <AccountTab />,
    notifications: <NotificationsTab />,
    payout:        <PayoutTab />,
  }

  return (
    <InstructorPageShell
      title="Settings"
      user={{ name: user?.fullName ?? "Instructor", email: user?.email ?? "" }}>
      <div className="flex flex-col sm:flex-row gap-6">
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
              }}>
              <Icon size={16} style={{ color: activeTab === key ? "var(--accent)" : "inherit", flexShrink: 0 }} />
              {label}
            </button>
          ))}
        </nav>
        <div className="flex-1 min-w-0">{panels[activeTab]}</div>
      </div>
    </InstructorPageShell>
  )
}
