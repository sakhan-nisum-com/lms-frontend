"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { settingsApi } from "@/lib/api/admin"
import { authStore } from "@/lib/auth-store"
import { Settings as SettingsIcon, Save, Loader2, Check } from "lucide-react"

interface SettingField { key: string; label: string; desc?: string; type: "text" | "email" | "number" | "toggle" }

const FIELDS: SettingField[] = [
  { key: "site_name",                label: "Site Name",                  desc: "The platform name shown in the header.",                 type: "text" },
  { key: "support_email",            label: "Support Email",               desc: "Where user support requests are sent.",                  type: "email" },
  { key: "contact_phone",            label: "Contact Phone",               type: "text" },
  { key: "session_timeout_minutes",  label: "Session Timeout (minutes)",   desc: "Auto-logout inactive users after this many minutes.",   type: "number" },
  { key: "max_upload_size_mb",       label: "Max Upload Size (MB)",        desc: "Maximum video/file upload size per lesson.",            type: "number" },
  { key: "maintenance_mode",         label: "Maintenance Mode",            desc: "Blocks learner access during maintenance.",             type: "toggle" },
  { key: "allow_self_registration",  label: "Allow Self-Registration",     desc: "Let new users sign up without an admin invite.",        type: "toggle" },
  { key: "require_email_verification", label: "Require Email Verification", desc: "Users must verify email before signing in.",           type: "toggle" },
  { key: "enable_certificates",      label: "Enable Certificates",         desc: "Issue completion certificates to students.",            type: "toggle" },
  { key: "enable_payments",          label: "Enable Payments",             desc: "Allow paid courses and transactions.",                  type: "toggle" },
]

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange}
      className="relative rounded-full transition-colors flex-shrink-0"
      style={{ width: 40, height: 22, backgroundColor: checked ? "var(--accent)" : "var(--border-default)" }}>
      <span className="absolute top-0.5 rounded-full bg-white transition-all"
        style={{ width: 18, height: 18, left: checked ? 20 : 2 }} />
    </button>
  )
}

export default function AdminSettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const user = authStore.getUser()

  useEffect(() => {
    settingsApi.getAll()
      .then((data) => setValues(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function get(key: string, fallback = "") {
    return values[key] ?? fallback
  }

  function set(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  async function save(key: string, value: string) {
    setSaving(key)
    try {
      await settingsApi.upsert(key, value)
      setSaved(key)
      setTimeout(() => setSaved(null), 2000)
    } catch {} finally { setSaving(null) }
  }

  async function saveText(key: string) {
    await save(key, get(key))
  }

  async function toggle(key: string) {
    const current = get(key, "false")
    const next = current === "true" ? "false" : "true"
    set(key, next)
    await save(key, next)
  }

  if (loading) {
    return (
      <DashboardLayout role="admin" userName={user?.fullName ?? "Admin"}>
        <div className="flex items-center justify-center py-32">
          <Loader2 size={28} className="animate-spin" style={{ color: "var(--text-muted)" }} />
        </div>
      </DashboardLayout>
    )
  }

  const textFields = FIELDS.filter((f) => f.type !== "toggle")
  const toggleFields = FIELDS.filter((f) => f.type === "toggle")

  return (
    <DashboardLayout role="admin" userName={user?.fullName ?? "Admin"}>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Platform Settings</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Configure site-wide behaviour. Changes take effect immediately.
          </p>
        </div>

        {/* Text / number fields */}
        <div className="rounded-2xl p-5 space-y-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
          <div className="flex items-center gap-2">
            <SettingsIcon size={15} style={{ color: "var(--accent)" }} />
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>General</h2>
          </div>
          {textFields.map((f) => (
            <div key={f.key}>
              <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>{f.label}</label>
              {f.desc && <p className="text-xs mb-1.5" style={{ color: "var(--text-muted)" }}>{f.desc}</p>}
              <div className="flex gap-2">
                <input
                  type={f.type}
                  value={get(f.key)}
                  onChange={(e) => set(f.key, e.target.value)}
                  onBlur={() => saveText(f.key)}
                  onKeyDown={(e) => e.key === "Enter" && saveText(f.key)}
                  className="flex-1 px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                />
                <button onClick={() => saveText(f.key)} disabled={saving === f.key}
                  className="flex items-center justify-center w-10 h-10 rounded-lg disabled:opacity-50 flex-shrink-0"
                  style={{ backgroundColor: saved === f.key ? "#10B98120" : "var(--accent) + \"20\"", color: saved === f.key ? "#10B981" : "var(--accent)" }}>
                  {saving === f.key ? <Loader2 size={14} className="animate-spin" /> : saved === f.key ? <Check size={14} /> : <Save size={14} />}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Toggle fields */}
        <div className="rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
          <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid var(--border-default)" }}>
            <SettingsIcon size={15} style={{ color: "#8B5CF6" }} />
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Feature Flags</h2>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--border-default)" }}>
            {toggleFields.map((f) => (
              <div key={f.key} className="flex items-center justify-between gap-4 px-5 py-4">
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{f.label}</p>
                  {f.desc && <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{f.desc}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {saving === f.key && <Loader2 size={13} className="animate-spin" style={{ color: "var(--text-muted)" }} />}
                  <Toggle checked={get(f.key, "false") === "true"} onChange={() => toggle(f.key)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
