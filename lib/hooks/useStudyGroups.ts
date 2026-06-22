"use client"

import { useState, useEffect, useCallback } from "react"
import { STUDY_GROUP_SEED } from "@/lib/data/studyGroups"
import type { StudyGroup } from "@/lib/data/studyGroups"

const STORAGE_KEY = "lms_study_groups"

function load(): StudyGroup[] {
  if (typeof window === "undefined") return STUDY_GROUP_SEED
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as StudyGroup[]) : STUDY_GROUP_SEED
  } catch {
    return STUDY_GROUP_SEED
  }
}

function save(groups: StudyGroup[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(groups))
}

// Tracks study groups (and their membership) client-side, no backend —
// same pattern as usePurchases / useWorkshopRegistrations. Lets an
// instructor create a group for a training and add/remove members, and
// lets a student join/leave a group.
export function useStudyGroups() {
  const [groups, setGroups] = useState<StudyGroup[]>(STUDY_GROUP_SEED)

  useEffect(() => {
    setGroups(load())
  }, [])

  const createGroup = useCallback((input: Omit<StudyGroup, "id">) => {
    const id = `sg-${Date.now()}`
    setGroups((prev) => {
      const next = [...prev, { id, ...input }]
      save(next)
      return next
    })
    return id
  }, [])

  const addMembers = useCallback((groupId: string, memberIds: string[]) => {
    setGroups((prev) => {
      const next = prev.map((g) =>
        g.id === groupId
          ? { ...g, memberIds: Array.from(new Set([...g.memberIds, ...memberIds])) }
          : g
      )
      save(next)
      return next
    })
  }, [])

  const removeMember = useCallback((groupId: string, memberId: string) => {
    setGroups((prev) => {
      const next = prev.map((g) =>
        g.id === groupId ? { ...g, memberIds: g.memberIds.filter((id) => id !== memberId) } : g
      )
      save(next)
      return next
    })
  }, [])

  const deleteGroup = useCallback((groupId: string) => {
    setGroups((prev) => {
      const next = prev.filter((g) => g.id !== groupId)
      save(next)
      return next
    })
  }, [])

  return { groups, createGroup, addMembers, removeMember, deleteGroup }
}
