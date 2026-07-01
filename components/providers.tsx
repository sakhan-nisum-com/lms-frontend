"use client"

import { useEffect } from "react"
import { ensureScormServiceWorker } from "@/lib/scorm-sw-client"

// ChakraProvider is available but not mounted at root to avoid emotion SSR
// hydration mismatches. Add it per-layout when Chakra components are needed.
export function Providers({ children }: { children: React.ReactNode }) {
  // Bootstrap SCORM Service Worker at app start so it's ready before students navigate to SCORM pages
  useEffect(() => {
    ensureScormServiceWorker().catch((err) => {
      console.error("Failed to register SCORM Service Worker:", err)
      // Non-fatal — SCORM features simply won't work, app continues
    })
  }, [])

  return <>{children}</>
}
