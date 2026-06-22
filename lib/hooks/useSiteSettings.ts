"use client"

import { useState, useEffect, useCallback } from "react"

export interface SiteSettings {
  siteName: string
  supportEmail: string
  maintenanceMode: boolean
  allowSelfRegistration: boolean
  requireEmailVerification: boolean
  sessionTimeoutMinutes: number
}

export type PermissionKey =
  | "manageUsers"
  | "manageCourses"
  | "moderateDiscussions"
  | "issueRefunds"
  | "viewReports"
  | "manageSettings"

export type PermissionRole = "student" | "tutor" | "admin"

export type PermissionMatrix = Record<PermissionRole, Record<PermissionKey, boolean>>

const SETTINGS_KEY = "lms_site_settings"
const PERMISSIONS_KEY = "lms_permission_matrix"

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "LearnFlow",
  supportEmail: "support@learnflow.io",
  maintenanceMode: false,
  allowSelfRegistration: true,
  requireEmailVerification: true,
  sessionTimeoutMinutes: 60,
}

const DEFAULT_PERMISSIONS: PermissionMatrix = {
  student: { manageUsers: false, manageCourses: false, moderateDiscussions: false, issueRefunds: false, viewReports: false, manageSettings: false },
  tutor: { manageUsers: false, manageCourses: true, moderateDiscussions: true, issueRefunds: false, viewReports: true, manageSettings: false },
  admin: { manageUsers: true, manageCourses: true, moderateDiscussions: true, issueRefunds: true, viewReports: true, manageSettings: true },
}

function loadSettings(): SiteSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as SiteSettings) } : DEFAULT_SETTINGS
  } catch {
    return DEFAULT_SETTINGS
  }
}

function loadPermissions(): PermissionMatrix {
  if (typeof window === "undefined") return DEFAULT_PERMISSIONS
  try {
    const raw = localStorage.getItem(PERMISSIONS_KEY)
    return raw ? (JSON.parse(raw) as PermissionMatrix) : DEFAULT_PERMISSIONS
  } catch {
    return DEFAULT_PERMISSIONS
  }
}

// Platform-wide settings and the role permission matrix, client-side only —
// same pattern as the other localStorage-backed hooks.
export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS)
  const [permissions, setPermissions] = useState<PermissionMatrix>(DEFAULT_PERMISSIONS)

  useEffect(() => {
    setSettings(loadSettings())
    setPermissions(loadPermissions())
  }, [])

  const updateSettings = useCallback((patch: Partial<SiteSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch }
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const togglePermission = useCallback((role: PermissionRole, key: PermissionKey) => {
    setPermissions((prev) => {
      const next = { ...prev, [role]: { ...prev[role], [key]: !prev[role][key] } }
      localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return { settings, updateSettings, permissions, togglePermission }
}
