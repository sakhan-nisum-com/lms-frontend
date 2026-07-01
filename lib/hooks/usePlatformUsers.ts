"use client"

import { useState, useEffect, useCallback } from "react"
import { PLATFORM_USERS } from "@/lib/data/platformUsers"
import type { PlatformUser, PlatformRole, PlatformUserStatus } from "@/lib/data/platformUsers"

const STORAGE_KEY = "lms_platform_users"

function load(): PlatformUser[] {
  if (typeof window === "undefined") return PLATFORM_USERS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as PlatformUser[]) : PLATFORM_USERS
  } catch {
    return PLATFORM_USERS
  }
}

function save(users: PlatformUser[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
}

type NewUserInput = Pick<PlatformUser, "name" | "email" | "role" | "department" | "location">

// Admin-facing directory of every platform user (students, tutors, admins),
// client-side only — same pattern as useStudyGroups / useDiscussions.
export function usePlatformUsers() {
  const [users, setUsers] = useState<PlatformUser[]>(PLATFORM_USERS)

  useEffect(() => {
    setUsers(load())
  }, [])

  const addUser = useCallback((input: NewUserInput) => {
    const id = `usr-${Date.now()}`
    const today = new Date().toISOString().slice(0, 10)
    const user: PlatformUser = {
      ...input,
      id,
      avatar: input.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase(),
      status: "pending",
      joinedDate: today,
      lastActive: today,
    }
    setUsers((prev) => {
      const next = [user, ...prev]
      save(next)
      return next
    })
    return id
  }, [])

  const setStatus = useCallback((id: string, status: PlatformUserStatus) => {
    setUsers((prev) => {
      const next = prev.map((u) => (u.id === id ? { ...u, status } : u))
      save(next)
      return next
    })
  }, [])

  const setRole = useCallback((id: string, role: PlatformRole) => {
    setUsers((prev) => {
      const next = prev.map((u) => (u.id === id ? { ...u, role } : u))
      save(next)
      return next
    })
  }, [])

  const updateUser = useCallback((id: string, patch: Partial<Omit<PlatformUser, "id">>) => {
    setUsers((prev) => {
      const next = prev.map((u) => (u.id === id ? { ...u, ...patch } : u))
      save(next)
      return next
    })
  }, [])

  const removeUser = useCallback((id: string) => {
    setUsers((prev) => {
      const next = prev.filter((u) => u.id !== id)
      save(next)
      return next
    })
  }, [])

  return { users, addUser, setStatus, setRole, updateUser, removeUser }
}
