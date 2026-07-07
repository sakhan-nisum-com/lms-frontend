import { api } from "./client"
import type { AuthTokens } from "@/lib/auth-store"

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  fullName: string
  fullNameAr?: string
  email: string
  password: string
  role: "STUDENT" | "INSTRUCTOR"
}

export const authApi = {
  login: (req: LoginRequest) =>
    api.post<AuthTokens>("/api/v1/auth/login", req, false),

  register: (req: RegisterRequest) =>
    api.post<AuthTokens>("/api/v1/auth/register", req, false),

  refresh: (refreshToken: string) =>
    api.post<AuthTokens>("/api/v1/auth/refresh", { refreshToken }, false),
}
