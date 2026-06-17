"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { STUDENT_PROFILE } from "@/lib/data/courses"
import {
  UserCircle, Bell, Shield, BookOpen, Palette, Save,
  Camera, Mail, Globe, Link2, CheckCircle2,
} from "lucide-react"

type Tab = "profile" | "notifications" | "privacy" | "learning" | "appearance"

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "Profile", icon: UserCircle },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy & Security", icon: Shield },
  { id: "learning", label: "Learning", icon: BookOpen },
  { id: "appearance", label: "Appearance", icon: Palette },
]

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className="w-10 h-5 rounded-full transition-all relative flex-shrink-0"
      style={{ backgroundColor: enabled ? "#3B82F6" : "#334155" }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform"
        style={{ transform: enabled ? "translateX(20px)" : "translateX(0)" }}
      />
    </button>
  )
}

export default function SettingsPage() {
  const p = STUDENT_PROFILE
  const [tab, setTab] = useState<Tab>("profile")
  const [saved, setSaved] = useState(false)

  // Form state
  const [name, setName] = useState(p.name)
  const [bio, setBio] = useState(p.bio)
  const [jobTitle, setJobTitle] = useState(p.jobTitle)
  const [timezone, setTimezone] = useState(p.timezone)
  const [language, setLanguage] = useState(p.language)
  const [weeklyGoal, setWeeklyGoal] = useState(String(p.weeklyGoal))

  // Notification toggles
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

  const toggleNotif = (key: keyof typeof notifs) =>
    setNotifs((prev) => ({ ...prev, [key]: !prev[key] }))

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const [theme, setTheme] = useState<"dark" | "darker">("dark")
  const [accentColor, setAccentColor] = useState<string>("#3B82F6")
  const [compactMode, setCompactMode] = useState(false)

  const accentColors = [
    "#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#EC4899", "#14B8A6",
  ]

  return (
    <DashboardLayout role="student" userName={p.name}>
      <div className="max-w-4xl">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>Manage your profile, preferences, and account settings</p>
        </div>

        <div className="flex gap-6">

          {/* Tab sidebar */}
          <div className="w-48 flex-shrink-0 space-y-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all"
                style={{
                  backgroundColor: tab === id ? "#3B82F620" : "transparent",
                  color: tab === id ? "#60A5FA" : "#94A3B8",
                }}
              >
                <Icon size={16} style={{ color: tab === id ? "#3B82F6" : "#64748B", flexShrink: 0 }} />
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 space-y-4">

            {/* Profile */}
            {tab === "profile" && (
              <>
                <div className="rounded-2xl p-6" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
                  <h2 className="text-sm font-bold text-white mb-4">Personal Information</h2>

                  {/* Avatar */}
                  <div className="flex items-center gap-4 mb-5">
                    <div className="relative">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white"
                        style={{ backgroundColor: "#3B82F6" }}
                      >
                        {p.avatar}
                      </div>
                      <button
                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: "#334155", border: "2px solid #0F172A" }}
                      >
                        <Camera size={11} style={{ color: "#94A3B8" }} />
                      </button>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{p.name}</p>
                      <p className="text-xs" style={{ color: "#64748B" }}>{p.email}</p>
                      <button className="text-xs mt-1" style={{ color: "#3B82F6" }}>Change photo</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: "#94A3B8" }}>Full Name</label>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                        style={{ backgroundColor: "#0F172A", border: "1px solid #334155", color: "#F8FAFC" }}
                        onFocus={(e) => (e.target.style.borderColor = "#3B82F6")}
                        onBlur={(e) => (e.target.style.borderColor = "#334155")}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: "#94A3B8" }}>Job Title</label>
                      <input
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                        style={{ backgroundColor: "#0F172A", border: "1px solid #334155", color: "#F8FAFC" }}
                        onFocus={(e) => (e.target.style.borderColor = "#3B82F6")}
                        onBlur={(e) => (e.target.style.borderColor = "#334155")}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: "#94A3B8" }}>Email Address</label>
                      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm" style={{ backgroundColor: "#0F172A", border: "1px solid #334155" }}>
                        <Mail size={14} style={{ color: "#64748B" }} />
                        <span style={{ color: "#64748B" }}>{p.email}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: "#94A3B8" }}>Department</label>
                      <div className="px-3 py-2.5 rounded-xl text-sm" style={{ backgroundColor: "#0F172A", border: "1px solid #334155", color: "#64748B" }}>
                        {p.department}
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: "#94A3B8" }}>Bio</label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                        style={{ backgroundColor: "#0F172A", border: "1px solid #334155", color: "#F8FAFC" }}
                        onFocus={(e) => (e.target.style.borderColor = "#3B82F6")}
                        onBlur={(e) => (e.target.style.borderColor = "#334155")}
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl p-6" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
                  <h2 className="text-sm font-bold text-white mb-4">Social Links</h2>
                  <div className="space-y-3">
                    {[
                      { icon: Link2, label: "LinkedIn", value: p.linkedIn, placeholder: "linkedin.com/in/username" },
                      { icon: Link2, label: "GitHub", value: p.github, placeholder: "github.com/username" },
                      { icon: Globe, label: "Website", value: p.website, placeholder: "https://yourwebsite.com" },
                    ].map(({ icon: Icon, label, value, placeholder }) => (
                      <div key={label}>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: "#94A3B8" }}>{label}</label>
                        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ backgroundColor: "#0F172A", border: "1px solid #334155" }}>
                          <Icon size={14} style={{ color: "#64748B", flexShrink: 0 }} />
                          <input
                            defaultValue={value}
                            placeholder={placeholder}
                            className="flex-1 text-sm bg-transparent outline-none"
                            style={{ color: "#F8FAFC" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Notifications */}
            {tab === "notifications" && (
              <div className="rounded-2xl p-6" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
                <h2 className="text-sm font-bold text-white mb-4">Notification Preferences</h2>
                <div className="space-y-1">
                  {[
                    { key: "courseAnnouncements" as const, label: "Course Announcements", desc: "New content, schedule changes, instructor updates" },
                    { key: "assignmentReminders" as const, label: "Assignment Reminders", desc: "48h and 24h before due dates" },
                    { key: "quizReminders" as const, label: "Quiz Reminders", desc: "Upcoming quiz deadlines" },
                    { key: "discussionReplies" as const, label: "Discussion Replies", desc: "When someone replies to your threads" },
                    { key: "liveSessionReminders" as const, label: "Live Session Reminders", desc: "1 hour before live sessions" },
                    { key: "streakReminders" as const, label: "Streak Reminders", desc: "Daily nudge to maintain your learning streak" },
                    { key: "weeklyDigest" as const, label: "Weekly Digest", desc: "Summary of your week's progress every Monday" },
                    { key: "certificateEarned" as const, label: "Certificate Earned", desc: "When you earn a new certificate" },
                  ].map(({ key, label, desc }) => (
                    <div
                      key={key}
                      className="flex items-center justify-between py-3"
                      style={{ borderBottom: "1px solid #33415540" }}
                    >
                      <div>
                        <p className="text-sm font-medium text-white">{label}</p>
                        <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>{desc}</p>
                      </div>
                      <Toggle enabled={notifs[key]} onChange={() => toggleNotif(key)} />
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4" style={{ borderTop: "1px solid #334155" }}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#475569" }}>DELIVERY CHANNELS</p>
                  <div className="flex gap-4">
                    {[
                      { key: "emailNotifs" as const, label: "Email" },
                      { key: "pushNotifs" as const, label: "Push (browser)" },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center gap-2">
                        <Toggle enabled={notifs[key]} onChange={() => toggleNotif(key)} />
                        <span className="text-sm" style={{ color: "#94A3B8" }}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Privacy */}
            {tab === "privacy" && (
              <>
                <div className="rounded-2xl p-6" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
                  <h2 className="text-sm font-bold text-white mb-4">Profile Visibility</h2>
                  <div className="space-y-3">
                    {[
                      { label: "Show profile in leaderboards", desc: "Your name and progress may appear in course leaderboards", enabled: true },
                      { label: "Show completion badges publicly", desc: "Other students can see your earned certificates", enabled: true },
                      { label: "Allow peer connections", desc: "Other students can send you study group invitations", enabled: false },
                    ].map(({ label, desc, enabled }) => {
                      const [on, setOn] = useState(enabled)
                      return (
                        <div key={label} className="flex items-center justify-between py-2.5" style={{ borderBottom: "1px solid #33415540" }}>
                          <div>
                            <p className="text-sm font-medium text-white">{label}</p>
                            <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>{desc}</p>
                          </div>
                          <Toggle enabled={on} onChange={() => setOn(!on)} />
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="rounded-2xl p-6" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
                  <h2 className="text-sm font-bold text-white mb-4">Security</h2>
                  <div className="space-y-3">
                    <button
                      className="w-full text-left px-4 py-3 rounded-xl flex items-center justify-between"
                      style={{ backgroundColor: "#0F172A", border: "1px solid #334155" }}
                    >
                      <div>
                        <p className="text-sm font-medium text-white">Change Password</p>
                        <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>Last changed 3 months ago</p>
                      </div>
                      <span style={{ color: "#3B82F6", fontSize: 13 }}>Update →</span>
                    </button>
                    <button
                      className="w-full text-left px-4 py-3 rounded-xl flex items-center justify-between"
                      style={{ backgroundColor: "#0F172A", border: "1px solid #334155" }}
                    >
                      <div>
                        <p className="text-sm font-medium text-white">Two-Factor Authentication</p>
                        <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>Add an extra layer of security</p>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#EF444420", color: "#EF4444" }}>Not enabled</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Learning */}
            {tab === "learning" && (
              <>
                <div className="rounded-2xl p-6" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
                  <h2 className="text-sm font-bold text-white mb-4">Learning Preferences</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: "#94A3B8" }}>
                        Weekly Learning Goal (hours)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={1}
                          max={20}
                          value={weeklyGoal}
                          onChange={(e) => setWeeklyGoal(e.target.value)}
                          className="flex-1 accent-blue-500"
                        />
                        <span className="text-sm font-bold w-12 text-center text-white">{weeklyGoal}h/wk</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: "#94A3B8" }}>Timezone</label>
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                        style={{ backgroundColor: "#0F172A", border: "1px solid #334155", color: "#F8FAFC" }}
                      >
                        <option>America/New_York</option>
                        <option>America/Chicago</option>
                        <option>America/Denver</option>
                        <option>America/Los_Angeles</option>
                        <option>Europe/London</option>
                        <option>Asia/Karachi</option>
                        <option>Asia/Kolkata</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: "#94A3B8" }}>Language</label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                        style={{ backgroundColor: "#0F172A", border: "1px solid #334155", color: "#F8FAFC" }}
                      >
                        <option>English</option>
                        <option>Spanish</option>
                        <option>French</option>
                        <option>German</option>
                        <option>Arabic</option>
                        <option>Urdu</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl p-6" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
                  <h2 className="text-sm font-bold text-white mb-2">Learning Goal</h2>
                  <p className="text-xs mb-3" style={{ color: "#64748B" }}>Describe your professional learning objective.</p>
                  <textarea
                    defaultValue={p.learningGoal}
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                    style={{ backgroundColor: "#0F172A", border: "1px solid #334155", color: "#F8FAFC" }}
                    onFocus={(e) => (e.target.style.borderColor = "#3B82F6")}
                    onBlur={(e) => (e.target.style.borderColor = "#334155")}
                  />
                </div>
              </>
            )}

            {/* Appearance */}
            {tab === "appearance" && (
              <div className="rounded-2xl p-6" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
                <h2 className="text-sm font-bold text-white mb-4">Appearance</h2>

                <div className="space-y-5">
                  <div>
                    <p className="text-xs font-semibold mb-3" style={{ color: "#94A3B8" }}>THEME</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: "dark" as const, label: "Dark Navy", bg: "#0F172A", sidebar: "#1E293B" },
                        { id: "darker" as const, label: "Deep Black", bg: "#000000", sidebar: "#0F0F0F" },
                      ].map(({ id, label, bg, sidebar }) => (
                        <button
                          key={id}
                          onClick={() => setTheme(id)}
                          className="rounded-xl p-3 text-left transition-all"
                          style={{
                            border: `2px solid ${theme === id ? "#3B82F6" : "#334155"}`,
                            backgroundColor: "#0F172A",
                          }}
                        >
                          <div className="flex rounded-lg overflow-hidden h-12 mb-2">
                            <div style={{ flex: 1, backgroundColor: sidebar }} />
                            <div style={{ flex: 3, backgroundColor: bg }} />
                          </div>
                          <p className="text-xs font-medium" style={{ color: theme === id ? "#60A5FA" : "#94A3B8" }}>{label}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold mb-3" style={{ color: "#94A3B8" }}>ACCENT COLOR</p>
                    <div className="flex gap-3">
                      {accentColors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setAccentColor(color)}
                          className="w-8 h-8 rounded-full transition-transform"
                          style={{
                            backgroundColor: color,
                            transform: accentColor === color ? "scale(1.25)" : "scale(1)",
                            boxShadow: accentColor === color ? `0 0 0 2px #0F172A, 0 0 0 4px ${color}` : "none",
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-3" style={{ borderTop: "1px solid #334155" }}>
                    <div>
                      <p className="text-sm font-medium text-white">Compact Mode</p>
                      <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>Reduce spacing for more content on screen</p>
                    </div>
                    <Toggle enabled={compactMode} onChange={() => setCompactMode(!compactMode)} />
                  </div>
                </div>
              </div>
            )}

            {/* Save button */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  backgroundColor: saved ? "#10B981" : "#3B82F6",
                  color: "#fff",
                }}
              >
                {saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
                {saved ? "Saved!" : "Save Changes"}
              </button>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
