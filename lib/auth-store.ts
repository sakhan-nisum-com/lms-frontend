"use client"

export interface AuthUser {
  id: string
  fullName: string
  fullNameAr: string | null
  email: string
  role: "ADMIN" | "INSTRUCTOR" | "STUDENT"
  status: string
  avatarUrl: string | null
  preferredLanguage: string
  emailVerified: boolean
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

const ACCESS_KEY = "lms_access_token"
const REFRESH_KEY = "lms_refresh_token"
const USER_KEY = "lms_user"

export const authStore = {
  save(tokens: AuthTokens) {
    localStorage.setItem(ACCESS_KEY, tokens.accessToken)
    localStorage.setItem(REFRESH_KEY, tokens.refreshToken)
    localStorage.setItem(USER_KEY, JSON.stringify(tokens.user))
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
    localStorage.removeItem(USER_KEY)
  },
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_KEY)
  },
  getUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  },
  isLoggedIn(): boolean {
    return !!localStorage.getItem(ACCESS_KEY)
  },
  /** Map backend role to frontend route segment */
  dashboardPath(): string {
    const user = this.getUser()
    if (!user) return "/login"
    switch (user.role) {
      case "ADMIN": return "/admin/dashboard"
      case "INSTRUCTOR": return "/instructor/dashboard"
      default: return "/student/dashboard"
    }
  },
}
