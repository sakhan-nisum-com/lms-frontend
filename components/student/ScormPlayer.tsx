"use client"

import { useEffect, useRef, useState } from "react"
import { ensureScormServiceWorker } from "@/lib/scorm-sw-client"
import { useScormAttempts } from "@/lib/hooks/useScormAttempts"

interface ScormPlayerProps {
  packageId: string
  scoId: string
  launchHref: string
  attemptId?: string
}

interface CmiData {
  [key: string]: any
}

export function ScormPlayer({ packageId, scoId, launchHref, attemptId }: ScormPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const secondsRef = useRef(0)
  const cmiDataRef = useRef<CmiData>({})
  const { startAttempt, updateAttempt, finishAttempt, getAttempt } = useScormAttempts()

  const currentAttemptIdRef = useRef(attemptId)

  // Initialize or resume attempt on mount
  useEffect(() => {
    if (!attemptId) {
      const newAttemptId = startAttempt(packageId, scoId)
      currentAttemptIdRef.current = newAttemptId
    } else {
      currentAttemptIdRef.current = attemptId
      // Load existing attempt's accumulated time
      const attempt = getAttempt(attemptId)
      if (attempt) {
        secondsRef.current = attempt.timeSpentSeconds
      }
    }
    // Note: startAttempt and getAttempt are stable (wrapped in useCallback with empty deps)
    // so we omit them from the dependency array to avoid infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId, packageId, scoId])

  // Ensure SW is ready, then set up the API bridge and timer
  useEffect(() => {
    let mounted = true
    let setupTimeout: NodeJS.Timeout | null = null

    const setupPlayer = async () => {
      try {
        console.log("[SCORM Player] Starting setup...")

        // Add a timeout to prevent infinite loading
        const swReadyPromise = ensureScormServiceWorker()
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Service Worker initialization timed out after 10 seconds")), 10000)
        )

        await Promise.race([swReadyPromise, timeoutPromise])

        if (!mounted) return

        console.log("[SCORM Player] SW ready, initializing API bridge...")

        // Initialize CMI data
        cmiDataRef.current = {
          "cmi.core.lesson_status": "not attempted",
          "cmi.core.score.raw": "0",
          "cmi.core.student_name": "Learner",
          "cmi.core.student_id": "unknown",
          "cmi.core.session_time": "0000:00:00.00",
        }

        // Define SCORM API on the window so the iframe can find it
        ;(window as any).API = {
          LMSInitialize: () => {
            console.log("[SCORM Player] LMSInitialize called")
            return "true"
          },

          LMSGetValue: (key: string) => {
            const val = cmiDataRef.current[key] ?? ""
            console.log(`[SCORM Player] LMSGetValue("${key}") -> "${val}"`)
            return val
          },

          LMSSetValue: (key: string, value: string) => {
            console.log(`[SCORM Player] LMSSetValue("${key}", "${value}")`)
            cmiDataRef.current[key] = value
            return "true"
          },

          LMSCommit: () => {
            console.log("[SCORM Player] LMSCommit called")
            // Flush CMI data to attempt record
            if (currentAttemptIdRef.current) {
              flushAttemptData()
            }
            return "true"
          },

          LMSFinish: () => {
            console.log("[SCORM Player] LMSFinish called")
            // Final flush and mark complete
            if (currentAttemptIdRef.current) {
              flushAttemptData(true)
            }
            return "true"
          },

          LMSGetLastError: () => "0",
          LMSGetErrorString: () => "",
          LMSGetDiagnostic: () => "",
        }

        // Start wall-clock timer
        timerRef.current = setInterval(() => {
          secondsRef.current++
        }, 1000)

        console.log("[SCORM Player] Setup complete, ready to play")
        setIsReady(true)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to initialize SCORM player"
        console.error("[SCORM Player] Setup failed:", errorMsg)
        if (mounted) {
          setError(errorMsg)
        }
      } finally {
        if (setupTimeout) clearTimeout(setupTimeout)
      }
    }

    setupPlayer()

    return () => {
      mounted = false
      if (setupTimeout) clearTimeout(setupTimeout)
    }
  }, [])

  // Flush CMI data to the attempt record
  const flushAttemptData = (finishing = false) => {
    const attemptId = currentAttemptIdRef.current
    if (!attemptId) return

    // Parse lesson status into our attempt status
    const lessonStatus = cmiDataRef.current["cmi.core.lesson_status"] ?? ""
    let status: "incomplete" | "completed" | "passed" | "failed" = "incomplete"
    if (lessonStatus === "completed") status = "completed"
    else if (lessonStatus === "passed") status = "passed"
    else if (lessonStatus === "failed") status = "failed"

    // Parse score
    const scoreStr = cmiDataRef.current["cmi.core.score.raw"] ?? "0"
    const scoreRaw = !isNaN(Number(scoreStr)) ? Math.round(Number(scoreStr)) : undefined

    // Parse session time (SCORM format: HHHH:MM:SS.SS)
    const sessionTimeStr = cmiDataRef.current["cmi.core.session_time"] ?? "0000:00:00.00"
    let reportedSessionTimeSeconds: number | undefined
    try {
      const parts = sessionTimeStr.split(":")
      if (parts.length === 3) {
        const h = parseInt(parts[0], 10)
        const m = parseInt(parts[1], 10)
        const s = parseFloat(parts[2])
        reportedSessionTimeSeconds = h * 3600 + m * 60 + Math.round(s)
      }
    } catch {
      // Ignore parse errors
    }

    const patch: any = {
      status,
      timeSpentSeconds: secondsRef.current,
    }

    if (scoreRaw !== undefined) {
      patch.scoreRaw = scoreRaw
    }

    if (reportedSessionTimeSeconds !== undefined) {
      patch.reportedSessionTimeSeconds = reportedSessionTimeSeconds
    }

    if (finishing) {
      finishAttempt(attemptId, patch)
    } else {
      updateAttempt(attemptId, patch)
    }
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      // Final flush on unload
      if (currentAttemptIdRef.current) {
        flushAttemptData(true)
      }

      // Clean up the API bridge
      delete (window as any).API
    }
  }, [])

  // Listen for iframe unload to flush final state
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentAttemptIdRef.current) {
        flushAttemptData(true)
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [])

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4" style={{ backgroundColor: "#0F172A" }}>
        <div className="text-center">
          <p className="text-red-400 font-semibold mb-2">Failed to load SCORM player</p>
          <p className="text-sm text-gray-400">{error}</p>
        </div>
      </div>
    )
  }

  if (!isReady) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "#0F172A" }}>
        <div className="text-center">
          <div className="inline-block w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mb-3"></div>
          <p className="text-sm text-gray-400">Preparing content…</p>
        </div>
      </div>
    )
  }

  const iframeSrc = `/scorm-content/${packageId}/${launchHref}`
  console.log("[SCORM Player] Iframe src:", iframeSrc)

  return (
    <iframe
      ref={iframeRef}
      src={iframeSrc}
      className="w-full h-full"
      style={{ border: "none" }}
      title="SCORM Content"
      sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
    />
  )
}
