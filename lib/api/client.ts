const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("lms_access_token")
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = true,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  }
  if (auth) {
    const token = getToken()
    if (token) headers["Authorization"] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers })

  if (res.status === 204) return undefined as T

  const body = await res.json().catch(() => ({ message: res.statusText }))

  if (!res.ok) {
    throw new ApiError(res.status, body?.message ?? body?.error ?? "Request failed")
  }

  // Backend wraps all responses as { status, message, data, timestamp }
  return (body.data ?? body) as T
}

export const api = {
  get: <T>(path: string, auth = true) => request<T>(path, { method: "GET" }, auth),
  post: <T>(path: string, body: unknown, auth = true) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }, auth),
  put: <T>(path: string, body: unknown, auth = true) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }, auth),
  patch: <T>(path: string, body: unknown, auth = true) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }, auth),
  delete: <T>(path: string, auth = true) =>
    request<T>(path, { method: "DELETE" }, auth),
}
