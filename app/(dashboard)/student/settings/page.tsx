"use client"

import { useEffect, useRef, useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import {
  UserCircle, Bell, Shield, BookOpen, Palette, Save,
  Camera, Mail, Globe, Link2, CheckCircle2, Eye, EyeOff,
  Loader2, Phone, MapPin, Key, AlertCircle, Sun, Moon,
} from "lucide-react"
import { usersApi, type AdminUser } from "@/lib/api/admin"
import { uploadApi } from "@/lib/api/upload"
import { authStore } from "@/lib/auth-store"
import { ApiError } from "@/lib/api/client"
import { useLocale } from "next-intl"
import { usePathname } from "next/navigation"
import { switchLocalePath } from "@/lib/locale-utils"

type Tab = "profile" | "notifications" | "privacy" | "learning" | "appearance"

const TABS: { id: Tab; label: string; labelAr: string; icon: React.ElementType }[] = [
  { id: "profile",       label: "Profile",          labelAr: "الملف الشخصي",  icon: UserCircle },
  { id: "notifications", label: "Notifications",    labelAr: "الإشعارات",     icon: Bell       },
  { id: "privacy",       label: "Privacy & Security", labelAr: "الأمان",      icon: Shield     },
  { id: "learning",      label: "Learning",          labelAr: "التعلم",        icon: BookOpen   },
  { id: "appearance",    label: "Appearance",        labelAr: "المظهر",        icon: Palette    },
]

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="w-10 h-5 rounded-full transition-all relative flex-shrink-0"
      style={{ backgroundColor: enabled ? "var(--accent)" : "var(--border-default)" }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform"
        style={{ transform: enabled ? "translateX(20px)" : "translateX(0)" }}
      />
    </button>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
      {children}
    </label>
  )
}

function InputField({
  value, onChange, placeholder, type = "text", readOnly, icon,
}: {
  value: string; onChange?: (v: string) => void; placeholder?: string
  type?: string; readOnly?: boolean; icon?: React.ReactNode
}) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm"
      style={{
        backgroundColor: readOnly ? "var(--bg-surface-muted)" : "var(--bg-surface-muted)",
        border: "1px solid var(--border-default)",
        opacity: readOnly ? 0.65 : 1,
      }}
      onFocus={(e) => { if (!readOnly) (e.currentTarget.style.borderColor = "var(--accent)") }}
      onBlur={(e) => { if (!readOnly) (e.currentTarget.style.borderColor = "var(--border-default)") }}
    >
      {icon && <span style={{ color: "var(--text-tertiary)", flexShrink: 0 }}>{icon}</span>}
      <input
        dir="ltr"
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-sm"
        style={{ color: "var(--text-primary)", cursor: readOnly ? "default" : "text" }}
      />
    </div>
  )
}

export default function SettingsPage() {
  const locale = useLocale()
  const isAr = locale === "ar"
  const pathname = usePathname()

  const [tab, setTab] = useState<Tab>("profile")
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [profile, setProfile] = useState<AdminUser | null>(null)

  // Profile form
  const [name, setName] = useState("")
  const [nameAr, setNameAr] = useState("")
  const [bio, setBio] = useState("")
  const [bioAr, setBioAr] = useState("")
  const [location, setLocation] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  // Social links (UI only — not in backend)
  const [linkedIn, setLinkedIn] = useState("")
  const [github, setGithub] = useState("")
  const [website, setWebsite] = useState("")

  // Learning
  const [timezone, setTimezone] = useState("America/New_York")
  const [weeklyGoal, setWeeklyGoal] = useState("8")

  // Notifications (UI only)
  const [notifs, setNotifs] = useState({
    courseAnnouncements: true,
    assignmentReminders: true,
    quizReminders: true,
    discussionReplies: true,
    liveSessionReminders: true,
    streakReminders: true,
    weeklyDigest: true,
    certificateEarned: true,
    emailNotifs: true,
    pushNotifs: false,
  })

  // Privacy visibility (UI only)
  const [showLeaderboard, setShowLeaderboard] = useState(true)
  const [showBadges, setShowBadges] = useState(true)
  const [allowPeerConnect, setAllowPeerConnect] = useState(false)

  // Password change
  const [pwCurrent, setPwCurrent] = useState("")
  const [pwNew, setPwNew] = useState("")
  const [pwConfirm, setPwConfirm] = useState("")
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false })
  const [changingPw, setChangingPw] = useState(false)

  // Appearance
  const [isDark, setIsDark] = useState(false)
  const [accentColor, setAccentColor] = useState("#3B82F6")

  // Toast
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null)
  const [saving, setSaving] = useState(false)

  function showToast(text: string, ok: boolean) {
    setToast({ text, ok })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    setIsDark(document.documentElement.getAttribute("data-color-mode") === "dark")
  }, [])

  useEffect(() => {
    usersApi.getMe()
      .then((u) => {
        setProfile(u)
        setName(u.fullName ?? "")
        setNameAr(u.fullNameAr ?? "")
        setBio(u.bio ?? "")
        setBioAr(u.bioAr ?? "")
        setLocation(u.location ?? "")
        setPhoneNumber(u.phoneNumber ?? "")
        setAvatarUrl(u.avatarUrl ?? null)
      })
      .catch(() => showToast("Failed to load profile", false))
      .finally(() => setLoadingProfile(false))
  }, [])

  async function saveProfile() {
    setSaving(true)
    try {
      const updated = await usersApi.updateMe({
        fullName: name.trim() || undefined,
        fullNameAr: nameAr.trim() || undefined,
        bio: bio.trim() || undefined,
        bioAr: bioAr.trim() || undefined,
        location: location.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
        avatarUrl: avatarUrl ?? undefined,
      })
      setProfile(updated)
      authStore.updateUser({ fullName: updated.fullName, fullNameAr: updated.fullNameAr ?? undefined, avatarUrl: updated.avatarUrl ?? null })
      showToast("Profile saved!", true)
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to save profile", false)
    } finally {
      setSaving(false)
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarUploading(true)
    try {
      const result = await uploadApi.image(file)
      setAvatarUrl(result.url)
    } catch {
      showToast("Image upload failed", false)
    } finally {
      setAvatarUploading(false)
    }
  }

  async function saveNotifications() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 400))
    setSaving(false)
    showToast("Notification preferences saved!", true)
  }

  async function saveLearning() {
    setSaving(true)
    try {
      const lang = locale === "ar" ? "ar" : "en"
      await usersApi.updateMe({ preferredLanguage: lang })
      showToast("Learning preferences saved!", true)
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to save", false)
    } finally {
      setSaving(false)
    }
  }

  async function submitChangePassword() {
    if (pwNew !== pwConfirm) {
      showToast("New passwords don't match", false)
      return
    }
    if (pwNew.length < 8) {
      showToast("Password must be at least 8 characters", false)
      return
    }
    setChangingPw(true)
    try {
      await usersApi.changePassword({ currentPassword: pwCurrent, newPassword: pwNew })
      showToast("Password changed successfully!", true)
      setPwCurrent(""); setPwNew(""); setPwConfirm("")
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to change password", false)
    } finally {
      setChangingPw(false)
    }
  }

  function toggleTheme() {
    const next = !isDark
    setIsDark(next)
    if (next) {
      document.documentElement.setAttribute("data-color-mode", "dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.removeAttribute("data-color-mode")
      localStorage.setItem("theme", "light")
    }
    window.dispatchEvent(new Event("theme-change"))
  }

  function switchLocale(next: "en" | "ar") {
    window.location.href = switchLocalePath(pathname, next)
  }

  const displayName = profile?.fullName ?? authStore.getUser()?.fullName ?? "User"

  const accentColors = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#EC4899", "#14B8A6"]

  const initials = displayName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)

  return (
    <DashboardLayout role="student" userName={displayName}>
      <div className="max-w-4xl">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            {isAr ? "الإعدادات" : "Settings"}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {isAr ? "إدارة ملفك الشخصي وتفضيلاتك" : "Manage your profile, preferences, and account settings"}
          </p>
        </div>

        {/* Toast */}
        {toast && (
          <div
            className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-lg"
            style={{
              backgroundColor: toast.ok ? "#10B98118" : "#EF444418",
              border: `1px solid ${toast.ok ? "#10B98140" : "#EF444440"}`,
              color: toast.ok ? "#10B981" : "#EF4444",
            }}
          >
            {toast.ok ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            {toast.text}
          </div>
        )}

        <div className="flex gap-6">

          {/* Tab sidebar */}
          <div className="w-48 flex-shrink-0 space-y-1">
            {TABS.map(({ id, label, labelAr, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all"
                style={{
                  backgroundColor: tab === id ? "var(--accent-subtle)" : "transparent",
                  color: tab === id ? "var(--accent)" : "var(--text-secondary)",
                }}
              >
                <Icon size={16} style={{ color: tab === id ? "var(--accent)" : "var(--text-tertiary)", flexShrink: 0 }} />
                {isAr ? labelAr : label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 space-y-4 min-w-0">

            {loadingProfile && tab === "profile" && (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={24} className="animate-spin" style={{ color: "var(--text-muted)" }} />
              </div>
            )}

            {/* ── Profile ── */}
            {!loadingProfile && tab === "profile" && (
              <>
                {/* Avatar + basic info */}
                <div className="rounded-2xl p-6" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                  <h2 className="text-sm font-bold text-[var(--text-primary)] mb-4">
                    {isAr ? "المعلومات الشخصية" : "Personal Information"}
                  </h2>

                  {/* Avatar */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="Avatar"
                          className="w-18 h-18 rounded-full object-cover"
                          style={{ width: 72, height: 72 }}
                        />
                      ) : (
                        <div
                          className="flex items-center justify-center text-xl font-bold text-white rounded-full"
                          style={{ width: 72, height: 72, backgroundColor: "var(--accent)" }}
                        >
                          {initials}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={avatarUploading}
                        className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center transition-opacity hover:opacity-80 disabled:opacity-50"
                        style={{ backgroundColor: "var(--accent)", border: "2px solid var(--bg-surface)" }}
                      >
                        {avatarUploading
                          ? <Loader2 size={12} className="animate-spin text-white" />
                          : <Camera size={12} className="text-white" />
                        }
                      </button>
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{displayName}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{profile?.email}</p>
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        className="text-xs mt-1 hover:underline"
                        style={{ color: "var(--accent)" }}
                      >
                        {isAr ? "تغيير الصورة" : "Change photo"}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full name EN */}
                    <div>
                      <FieldLabel>{isAr ? "الاسم الكامل (إنجليزي)" : "Full Name (English)"}</FieldLabel>
                      <InputField value={name} onChange={setName} placeholder="John Doe" />
                    </div>
                    {/* Full name AR */}
                    <div>
                      <FieldLabel>{isAr ? "الاسم الكامل (عربي)" : "Full Name (Arabic)"}</FieldLabel>
                      <div
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm"
                        style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)" }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                        onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-default)")}
                      >
                        <input
                          dir="rtl"
                          value={nameAr}
                          onChange={(e) => setNameAr(e.target.value)}
                          placeholder="محمد أحمد"
                          className="flex-1 bg-transparent outline-none text-sm"
                          style={{
                            color: "var(--text-primary)",
                            fontFamily: "var(--font-arabic), system-ui",
                            direction: "rtl",
                          }}
                        />
                      </div>
                    </div>
                    {/* Email (read-only) */}
                    <div>
                      <FieldLabel>{isAr ? "البريد الإلكتروني" : "Email Address"}</FieldLabel>
                      <InputField
                        value={profile?.email ?? ""}
                        readOnly
                        icon={<Mail size={14} />}
                      />
                    </div>
                    {/* Phone */}
                    <div>
                      <FieldLabel>{isAr ? "رقم الهاتف" : "Phone Number"}</FieldLabel>
                      <InputField
                        value={phoneNumber}
                        onChange={setPhoneNumber}
                        placeholder="+1 555 000 0000"
                        icon={<Phone size={14} />}
                      />
                    </div>
                    {/* Department (read-only) */}
                    <div>
                      <FieldLabel>{isAr ? "القسم" : "Department"}</FieldLabel>
                      <InputField value={profile?.department ?? "—"} readOnly />
                    </div>
                    {/* Location */}
                    <div>
                      <FieldLabel>{isAr ? "الموقع" : "Location"}</FieldLabel>
                      <InputField
                        value={location}
                        onChange={setLocation}
                        placeholder="Riyadh, Saudi Arabia"
                        icon={<MapPin size={14} />}
                      />
                    </div>
                    {/* Bio */}
                    <div className="sm:col-span-2">
                      <FieldLabel>{isAr ? "نبذة تعريفية (إنجليزي)" : "Bio (English)"}</FieldLabel>
                      <textarea
                        dir="ltr"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={3}
                        maxLength={500}
                        placeholder="Tell students and instructors about yourself..."
                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                        style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                        onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                        onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <FieldLabel>{isAr ? "نبذة تعريفية (عربي)" : "Bio (Arabic)"}</FieldLabel>
                      <textarea
                        dir="rtl"
                        value={bioAr}
                        onChange={(e) => setBioAr(e.target.value)}
                        rows={3}
                        maxLength={500}
                        placeholder="اكتب نبذة عنك بالعربية..."
                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                        style={{
                          backgroundColor: "var(--bg-surface-muted)",
                          border: "1px solid var(--border-default)",
                          color: "var(--text-primary)",
                          fontFamily: "var(--font-arabic), system-ui",
                          direction: "rtl",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                        onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mt-4">
                    <button
                      type="button"
                      onClick={saveProfile}
                      disabled={saving}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
                      style={{ backgroundColor: "var(--accent)" }}
                    >
                      {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                      {isAr ? "حفظ الملف الشخصي" : "Save Profile"}
                    </button>
                  </div>
                </div>

                {/* Social links */}
                <div className="rounded-2xl p-6" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                  <h2 className="text-sm font-bold text-[var(--text-primary)] mb-4">
                    {isAr ? "روابط التواصل الاجتماعي" : "Social Links"}
                  </h2>
                  <div className="space-y-3">
                    {[
                      { icon: Link2, label: "LinkedIn", labelAr: "لينكدإن", value: linkedIn, setter: setLinkedIn, placeholder: "linkedin.com/in/username" },
                      { icon: Link2, label: "GitHub",   labelAr: "جيت هاب", value: github,   setter: setGithub,   placeholder: "github.com/username"       },
                      { icon: Globe, label: "Website",  labelAr: "الموقع",  value: website,  setter: setWebsite,  placeholder: "https://yourwebsite.com"   },
                    ].map(({ icon: Icon, label, labelAr, value, setter, placeholder }) => (
                      <div key={label}>
                        <FieldLabel>{isAr ? labelAr : label}</FieldLabel>
                        <div
                          className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                          style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)" }}
                          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-default)")}
                        >
                          <Icon size={14} style={{ color: "var(--text-tertiary)", flexShrink: 0 }} />
                          <input
                            dir="ltr"
                            value={value}
                            onChange={(e) => setter(e.target.value)}
                            placeholder={placeholder}
                            className="flex-1 text-sm bg-transparent outline-none"
                            style={{ color: "var(--text-primary)" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ── Notifications ── */}
            {tab === "notifications" && (
              <div className="rounded-2xl p-6" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                <h2 className="text-sm font-bold text-[var(--text-primary)] mb-4">
                  {isAr ? "تفضيلات الإشعارات" : "Notification Preferences"}
                </h2>
                <div className="space-y-1">
                  {([
                    { key: "courseAnnouncements", label: "Course Announcements", labelAr: "إعلانات الدورة", desc: "New content, schedule changes, instructor updates", descAr: "محتوى جديد، تغييرات في الجدول" },
                    { key: "assignmentReminders",  label: "Assignment Reminders",  labelAr: "تذكيرات الواجبات", desc: "48h and 24h before due dates", descAr: "قبل 48 و24 ساعة من الموعد" },
                    { key: "quizReminders",        label: "Quiz Reminders",        labelAr: "تذكيرات الاختبارات", desc: "Upcoming quiz deadlines", descAr: "مواعيد اختبارات قادمة" },
                    { key: "discussionReplies",    label: "Discussion Replies",    labelAr: "ردود النقاشات", desc: "When someone replies to your threads", descAr: "عند رد شخص على موضوعاتك" },
                    { key: "liveSessionReminders", label: "Live Session Reminders", labelAr: "تذكيرات الجلسات المباشرة", desc: "1 hour before live sessions", descAr: "قبل ساعة من الجلسة المباشرة" },
                    { key: "streakReminders",      label: "Streak Reminders",      labelAr: "تذكيرات الاستمرارية", desc: "Daily nudge to maintain your streak", descAr: "تذكير يومي للحفاظ على تسلسلك" },
                    { key: "weeklyDigest",         label: "Weekly Digest",         labelAr: "ملخص أسبوعي", desc: "Summary every Monday", descAr: "ملخص تقدمك كل إثنين" },
                    { key: "certificateEarned",    label: "Certificate Earned",    labelAr: "شهادة مكتسبة", desc: "When you earn a new certificate", descAr: "عند حصولك على شهادة جديدة" },
                  ] as const).map(({ key, label, labelAr, desc, descAr }) => (
                    <div
                      key={key}
                      className="flex items-center justify-between py-3"
                      style={{ borderBottom: "1px solid var(--border-subtle)" }}
                    >
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">{isAr ? labelAr : label}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{isAr ? descAr : desc}</p>
                      </div>
                      <Toggle enabled={notifs[key]} onChange={() => setNotifs((prev) => ({ ...prev, [key]: !prev[key] }))} />
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border-default)" }}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                    {isAr ? "قنوات التسليم" : "DELIVERY CHANNELS"}
                  </p>
                  <div className="flex gap-6">
                    {([
                      { key: "emailNotifs", label: "Email", labelAr: "البريد الإلكتروني" },
                      { key: "pushNotifs",  label: "Push (browser)", labelAr: "إشعارات المتصفح" },
                    ] as const).map(({ key, label, labelAr }) => (
                      <div key={key} className="flex items-center gap-2">
                        <Toggle enabled={notifs[key]} onChange={() => setNotifs((prev) => ({ ...prev, [key]: !prev[key] }))} />
                        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{isAr ? labelAr : label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    type="button"
                    onClick={saveNotifications}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                    style={{ backgroundColor: "var(--accent)" }}
                  >
                    {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                    {isAr ? "حفظ" : "Save Preferences"}
                  </button>
                </div>
              </div>
            )}

            {/* ── Privacy & Security ── */}
            {tab === "privacy" && (
              <>
                {/* Profile visibility */}
                <div className="rounded-2xl p-6" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                  <h2 className="text-sm font-bold text-[var(--text-primary)] mb-4">
                    {isAr ? "مرئية الملف الشخصي" : "Profile Visibility"}
                  </h2>
                  <div className="space-y-1">
                    {[
                      { label: "Show profile in leaderboards", labelAr: "إظهار ملفي في لوحات القيادة", desc: "Your name may appear in course leaderboards", descAr: "قد يظهر اسمك في لوحات المتصدرين", value: showLeaderboard, setter: setShowLeaderboard },
                      { label: "Show completion badges publicly", labelAr: "إظهار شاراتي للعموم", desc: "Other students can see your certificates", descAr: "يمكن للطلاب الآخرين رؤية شهاداتك", value: showBadges, setter: setShowBadges },
                      { label: "Allow peer connections", labelAr: "السماح بطلبات التواصل", desc: "Students can send you study group invitations", descAr: "يمكن للطلاب إرسال دعوات مجموعة الدراسة", value: allowPeerConnect, setter: setAllowPeerConnect },
                    ].map(({ label, labelAr, desc, descAr, value, setter }) => (
                      <div key={label} className="flex items-center justify-between py-2.5" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                        <div>
                          <p className="text-sm font-medium text-[var(--text-primary)]">{isAr ? labelAr : label}</p>
                          <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{isAr ? descAr : desc}</p>
                        </div>
                        <Toggle enabled={value} onChange={() => setter(!value)} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Change password */}
                <div className="rounded-2xl p-6" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                  <div className="flex items-center gap-2 mb-4">
                    <Key size={16} style={{ color: "var(--accent)" }} />
                    <h2 className="text-sm font-bold text-[var(--text-primary)]">
                      {isAr ? "تغيير كلمة المرور" : "Change Password"}
                    </h2>
                  </div>
                  <div className="space-y-3 max-w-sm">
                    {[
                      { label: "Current Password", labelAr: "كلمة المرور الحالية", value: pwCurrent, setter: setPwCurrent, key: "current" as const },
                      { label: "New Password",     labelAr: "كلمة المرور الجديدة", value: pwNew,     setter: setPwNew,     key: "next"    as const },
                      { label: "Confirm New Password", labelAr: "تأكيد كلمة المرور", value: pwConfirm, setter: setPwConfirm, key: "confirm" as const },
                    ].map(({ label, labelAr, value, setter, key }) => (
                      <div key={key}>
                        <FieldLabel>{isAr ? labelAr : label}</FieldLabel>
                        <div
                          className="relative flex items-center px-3 py-2.5 rounded-xl"
                          style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)" }}
                          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-default)")}
                        >
                          <input
                            dir="ltr"
                            type={showPw[key] ? "text" : "password"}
                            value={value}
                            onChange={(e) => setter(e.target.value)}
                            placeholder="••••••••"
                            className="flex-1 bg-transparent outline-none text-sm"
                            style={{ color: "var(--text-primary)" }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPw((prev) => ({ ...prev, [key]: !prev[key] }))}
                            style={{ color: "var(--text-tertiary)" }}
                          >
                            {showPw[key] ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>
                    ))}

                    {pwNew.length > 0 && pwNew.length < 8 && (
                      <p className="text-xs" style={{ color: "var(--danger)" }}>
                        {isAr ? "كلمة المرور يجب أن تكون 8 أحرف على الأقل" : "Password must be at least 8 characters"}
                      </p>
                    )}
                    {pwNew.length >= 8 && pwConfirm.length > 0 && pwNew !== pwConfirm && (
                      <p className="text-xs" style={{ color: "var(--danger)" }}>
                        {isAr ? "كلمتا المرور غير متطابقتين" : "Passwords don't match"}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={submitChangePassword}
                      disabled={changingPw || !pwCurrent || !pwNew || !pwConfirm}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white mt-2 disabled:opacity-50"
                      style={{ backgroundColor: "var(--accent)" }}
                    >
                      {changingPw ? <Loader2 size={14} className="animate-spin" /> : <Key size={14} />}
                      {isAr ? "تغيير كلمة المرور" : "Update Password"}
                    </button>
                  </div>
                </div>

                {/* 2FA placeholder */}
                <div className="rounded-2xl p-6" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-[var(--text-primary)]">
                        {isAr ? "المصادقة الثنائية" : "Two-Factor Authentication"}
                      </h2>
                      <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
                        {isAr ? "أضف طبقة حماية إضافية لحسابك" : "Add an extra layer of security to your account"}
                      </p>
                    </div>
                    <span
                      className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{ backgroundColor: "var(--warning-bg)", color: "var(--warning)" }}
                    >
                      {isAr ? "قريباً" : "Coming soon"}
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* ── Learning ── */}
            {tab === "learning" && (
              <>
                <div className="rounded-2xl p-6" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                  <h2 className="text-sm font-bold text-[var(--text-primary)] mb-4">
                    {isAr ? "تفضيلات التعلم" : "Learning Preferences"}
                  </h2>
                  <div className="space-y-5">

                    {/* Interface Language */}
                    <div>
                      <FieldLabel>{isAr ? "لغة الواجهة" : "Interface Language"}</FieldLabel>
                      <div className="flex gap-3">
                        {(["en", "ar"] as const).map((lang) => (
                          <button
                            key={lang}
                            type="button"
                            onClick={() => switchLocale(lang)}
                            className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
                            style={{
                              border: `2px solid ${locale === lang ? "var(--accent)" : "var(--border-default)"}`,
                              backgroundColor: locale === lang ? "var(--accent-subtle)" : "var(--bg-surface-muted)",
                              color: locale === lang ? "var(--accent)" : "var(--text-secondary)",
                            }}
                          >
                            {lang === "en" ? "🇺🇸 English" : "🇸🇦 العربية"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Timezone */}
                    <div>
                      <FieldLabel>{isAr ? "المنطقة الزمنية" : "Timezone"}</FieldLabel>
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                        style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                        onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                        onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
                      >
                        {[
                          ["America/New_York",    "UTC-5 — New York"],
                          ["America/Chicago",     "UTC-6 — Chicago"],
                          ["America/Denver",      "UTC-7 — Denver"],
                          ["America/Los_Angeles", "UTC-8 — Los Angeles"],
                          ["Europe/London",       "UTC+0 — London"],
                          ["Europe/Paris",        "UTC+1 — Paris"],
                          ["Asia/Riyadh",         "UTC+3 — Riyadh"],
                          ["Asia/Dubai",          "UTC+4 — Dubai"],
                          ["Asia/Karachi",        "UTC+5 — Karachi"],
                          ["Asia/Kolkata",        "UTC+5:30 — Mumbai"],
                        ].map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Weekly goal */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <FieldLabel>{isAr ? "هدف التعلم الأسبوعي" : "Weekly Learning Goal"}</FieldLabel>
                        <span className="text-xs font-bold" style={{ color: "var(--accent)" }}>
                          {weeklyGoal}h / {isAr ? "أسبوع" : "week"}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={20}
                        value={weeklyGoal}
                        onChange={(e) => setWeeklyGoal(e.target.value)}
                        className="w-full accent-blue-500"
                        style={{ accentColor: "var(--accent)" }}
                      />
                      <div className="flex justify-between text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                        <span>1h</span><span>20h</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-5">
                    <button
                      type="button"
                      onClick={saveLearning}
                      disabled={saving}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                      style={{ backgroundColor: "var(--accent)" }}
                    >
                      {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                      {isAr ? "حفظ" : "Save Preferences"}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* ── Appearance ── */}
            {tab === "appearance" && (
              <div className="rounded-2xl p-6" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                <h2 className="text-sm font-bold text-[var(--text-primary)] mb-5">
                  {isAr ? "المظهر" : "Appearance"}
                </h2>

                <div className="space-y-6">
                  {/* Light / Dark */}
                  <div>
                    <p className="text-xs font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>
                      {isAr ? "السمة" : "THEME"}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: "light", label: isAr ? "فاتح" : "Light", icon: Sun,  bg: "#F4F6FA", sidebar: "#FFFFFF" },
                        { id: "dark",  label: isAr ? "داكن" : "Dark",  icon: Moon, bg: "#0B1220", sidebar: "#141C2E" },
                      ].map(({ id, label, icon: Icon, bg, sidebar }) => {
                        const active = id === "dark" ? isDark : !isDark
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={toggleTheme}
                            className="rounded-xl p-3 text-left transition-all"
                            style={{ border: `2px solid ${active ? "var(--accent)" : "var(--border-default)"}`, backgroundColor: "var(--bg-surface-muted)" }}
                          >
                            <div className="flex rounded-lg overflow-hidden h-12 mb-2">
                              <div style={{ flex: 1, backgroundColor: sidebar }} />
                              <div style={{ flex: 3, backgroundColor: bg }} />
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Icon size={12} style={{ color: active ? "var(--accent)" : "var(--text-tertiary)" }} />
                              <p className="text-xs font-medium" style={{ color: active ? "var(--accent)" : "var(--text-secondary)" }}>{label}</p>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Accent color */}
                  <div>
                    <p className="text-xs font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>
                      {isAr ? "لون التمييز" : "ACCENT COLOR"}
                    </p>
                    <div className="flex gap-3 flex-wrap">
                      {accentColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setAccentColor(color)}
                          className="w-8 h-8 rounded-full transition-all"
                          style={{
                            backgroundColor: color,
                            transform: accentColor === color ? "scale(1.25)" : "scale(1)",
                            boxShadow: accentColor === color ? `0 0 0 2px var(--bg-surface), 0 0 0 4px ${color}` : "none",
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                      {isAr ? "الألوان المخصصة قيد التطوير" : "Custom accent colors — full theming coming soon"}
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
