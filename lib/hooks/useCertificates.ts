"use client"

import { useState, useEffect, useCallback } from "react"
import { certificatesApi, type ApiCertificate } from "@/lib/api/certificates"

export function useCertificates() {
  const [certificates, setCertificates] = useState<ApiCertificate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    certificatesApi.list()
      .then(setCertificates)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const getCertForCourse = useCallback(
    (courseId: string) => certificates.find((c) => c.courseId === courseId) ?? null,
    [certificates],
  )

  const earnCertificate = useCallback(async (courseId: string): Promise<ApiCertificate | null> => {
    try {
      const cert = await certificatesApi.earn(courseId)
      setCertificates((prev) => [...prev, cert])
      return cert
    } catch {
      return null
    }
  }, [])

  return { certificates, loading, getCertForCourse, earnCertificate }
}
