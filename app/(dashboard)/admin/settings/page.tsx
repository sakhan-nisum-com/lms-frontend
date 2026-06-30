"use client"

import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { useSiteSettings } from "@/lib/hooks/useSiteSettings"
import type { PermissionKey, PermissionRole } from "@/lib/hooks/useSiteSettings"
import { Settings as SettingsIcon, ShieldAlert, Check } from "lucide-react"

const PERMISSION_LABELS: Record<PermissionKey, string> = {
  manageUsers: "Manage Users",
  manageCourses: "Manage Courses",
  moderateDiscussions: "Moderate Discussions",
  issueRefunds: "Issue Refunds",
  viewReports: "View Reports",
  manageSettings: "Manage Settings",
}

const ROLES: PermissionRole[] = ["student", "tutor", "admin"]

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className="relative rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ width: 38, height: 22, backgroundColor: checked ? "var(--accent)" : "var(--border-default)" }}
    >
      <span
        className="absolute top-0.5 rounded-full bg-white transition-all"
        style={{ width: 18, height: 18, left: checked ? 18 : 2 }}
      />
    </button>
  )
}

export default function AdminSettingsPage() {
  const { settings, updateSettings, permissions, togglePermission } = useSiteSettings()

  return (
    <DashboardLayout role="admin" userName="Morgan Patel">
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Settings</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Platform configuration and role permissions.
          </p>
        </div>

        {/* General */}
        <div className="rounded-2xl p-5 space-y-4 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
          <div className="flex items-center gap-2 mb-2">
            <SettingsIcon size={16} style={{ color: "var(--accent)" }} />
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>General</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text-secondary)" }}>Site Name</label>
              <input
                value={settings.siteName}
                onChange={(e) => updateSettings({ siteName: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
              />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text-secondary)" }}>Support Email</label>
              <input
                value={settings.supportEmail}
                onChange={(e) => updateSettings({ supportEmail: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text-secondary)" }}>Session Timeout (minutes)</label>
            <input
              type="number"
              value={settings.sessionTimeoutMinutes}
              onChange={(e) => updateSettings({ sessionTimeoutMinutes: Number(e.target.value) })}
              className="w-full max-w-[160px] px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
            />
          </div>

          <div className="space-y-3 pt-2" style={{ borderTop: "1px solid var(--border-default)" }}>
            {[
              { key: "maintenanceMode" as const, label: "Maintenance Mode", desc: "Temporarily block learner access while you make changes." },
              { key: "allowSelfRegistration" as const, label: "Allow Self-Registration", desc: "Let new users sign up without an admin invite." },
              { key: "requireEmailVerification" as const, label: "Require Email Verification", desc: "New accounts must verify their email before signing in." },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between gap-3 pt-3">
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{label}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{desc}</p>
                </div>
                <Toggle checked={settings[key]} onChange={() => updateSettings({ [key]: !settings[key] })} />
              </div>
            ))}
          </div>

          {settings.maintenanceMode && (
            <div className="flex items-center gap-2 rounded-lg px-3 py-2.5" style={{ backgroundColor: "#EF444415", border: "1px solid #EF444430" }}>
              <ShieldAlert size={14} style={{ color: "var(--danger)" }} />
              <p className="text-xs" style={{ color: "#FCA5A5" }}>
                Maintenance mode is ON — students and tutors will see a maintenance notice instead of the dashboard.
              </p>
            </div>
          )}
        </div>

        {/* Roles & permissions */}
        <div className="rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-default)" }}>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Roles &amp; Permissions</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>Control what each role can do across the platform.</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-default)" }}>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Permission</th>
                {ROLES.map((r) => (
                  <th key={r} className="text-center px-5 py-3 text-xs font-semibold uppercase tracking-wider capitalize" style={{ color: "var(--text-tertiary)" }}>
                    {r}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(Object.keys(PERMISSION_LABELS) as PermissionKey[]).map((key, i, arr) => (
                <tr key={key} style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--border-default)" : "none" }}>
                  <td className="px-5 py-3.5 font-medium" style={{ color: "var(--text-primary)" }}>{PERMISSION_LABELS[key]}</td>
                  {ROLES.map((role) => {
                    const locked = role === "admin" && key === "manageSettings"
                    return (
                      <td key={role} className="px-5 py-3.5 text-center">
                        {locked ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-md" style={{ backgroundColor: "#10B98120" }}>
                            <Check size={13} style={{ color: "#34D399" }} />
                          </span>
                        ) : (
                          <input
                            type="checkbox"
                            checked={permissions[role][key]}
                            onChange={() => togglePermission(role, key)}
                            className="w-4 h-4 cursor-pointer"
                            style={{ accentColor: "var(--accent)" }}
                          />
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}
