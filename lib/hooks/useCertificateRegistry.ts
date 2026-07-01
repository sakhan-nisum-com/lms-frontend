"use client"

import { useState, useEffect, useCallback } from "react"
import { CERTIFICATE_REGISTRY } from "@/lib/data/certificateRegistry"
import type { RegistryCertificate } from "@/lib/data/certificateRegistry"

const STORAGE_KEY = "lms_certificate_registry"

function load(): RegistryCertificate[] {
  if (typeof window === "undefined") return CERTIFICATE_REGISTRY
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as RegistryCertificate[]) : CERTIFICATE_REGISTRY
  } catch {
    return CERTIFICATE_REGISTRY
  }
}

function save(items: RegistryCertificate[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

// Admin-facing registry of every certificate issued platform-wide,
// client-side only — same pattern as the other localStorage-backed hooks.
export function useCertificateRegistry() {
  const [certificates, setCertificates] = useState<RegistryCertificate[]>(CERTIFICATE_REGISTRY)

  useEffect(() => {
    setCertificates(load())
  }, [])

  const revoke = useCallback((id: string) => {
    setCertificates((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, state: "revoked" as const } : c))
      save(next)
      return next
    })
  }, [])

  return { certificates, revoke }
}
