"use client"

import { useState, useEffect, useCallback } from "react"
import type { ScormManifest } from "@/lib/scorm-import"

const STORAGE_KEY = "lms_scorm_packages"

export interface ScormPackageIndexEntry {
  id: string
  title: string
  uploadedAt: string
  manifest: ScormManifest
  launchHref: string
  sizeBytes?: number
}

type PackageIndex = ScormPackageIndexEntry[]

function load(): PackageIndex {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as PackageIndex
  } catch {
    return []
  }
}

function save(packages: PackageIndex) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(packages))
}

export function useScormPackages() {
  const [packages, setPackages] = useState<PackageIndex>([])

  useEffect(() => {
    setPackages(load())
  }, [])

  const addPackage = useCallback((entry: ScormPackageIndexEntry) => {
    setPackages((prev) => {
      const next = [...prev, entry]
      save(next)
      return next
    })
  }, [])

  const removePackage = useCallback((packageId: string) => {
    setPackages((prev) => {
      const next = prev.filter((p) => p.id !== packageId)
      save(next)
      return next
    })
  }, [])

  const getPackage = useCallback(
    (packageId: string): ScormPackageIndexEntry | undefined => {
      return packages.find((p) => p.id === packageId)
    },
    [packages]
  )

  const updatePackage = useCallback((packageId: string, patch: Partial<ScormPackageIndexEntry>) => {
    setPackages((prev) => {
      const idx = prev.findIndex((p) => p.id === packageId)
      if (idx === -1) return prev
      const next = [...prev]
      next[idx] = { ...next[idx], ...patch }
      save(next)
      return next
    })
  }, [])

  return { packages, addPackage, removePackage, getPackage, updatePackage }
}

export function useAllScormPackages(): PackageIndex {
  const [packages, setPackages] = useState<PackageIndex>([])

  useEffect(() => {
    setPackages(load())
  }, [])

  return packages
}
