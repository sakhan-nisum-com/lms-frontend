"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronRight } from "lucide-react"
import { ensureScormServiceWorker } from "@/lib/scorm-sw-client"
import { useScormAttempts } from "@/lib/hooks/useScormAttempts"

interface NextSco {
  id: string
  title: string
}

interface ScormPlayerProps {
  packageId: string
  scoId: string
  launchHref: string
  attemptId?: string
  nextSco?: NextSco | null
  onNextLesson?: () => void
}

interface CmiData {
  [key: string]: any
}

export function ScormPlayer({
  packageId,
  scoId,
  launchHref,
  attemptId,
  nextSco,
  onNextLesson
}: ScormPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)
  const [quizScore, setQuizScore] = useState<number | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const overlayTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const secondsRef = useRef(0)
  const cmiDataRef = useRef<CmiData>({})
  const { startAttempt, updateAttempt, finishAttempt, getAttempt } = useScormAttempts()

  const currentAttemptIdRef = useRef(attemptId)
  const completionHandledRef = useRef(false)

  // Reset completion state when lesson changes
  useEffect(() => {
    setIsCompleted(false)
    setShowOverlay(false)
    setIsReady(false)
    setQuizScore(null)
    completionHandledRef.current = false
    if (overlayTimeoutRef.current) {
      clearTimeout(overlayTimeoutRef.current)
    }
  }, [scoId])

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

            // Check if lesson is now completed
            if (key === "cmi.core.lesson_status" &&
                (value === "completed" || value === "passed") &&
                !completionHandledRef.current) {
              completionHandledRef.current = true
              console.log("[SCORM Player] Lesson completed detected!")
              if (mounted) {
                setIsCompleted(true)
              }
            }

            // Extract score whenever it's set
            if (key === "cmi.core.score.raw" && value) {
              if (!isNaN(Number(value))) {
                const score = Math.round(Number(value))
                console.log("[SCORM Player] Score extracted:", score)
                setQuizScore(score)
              }
            }

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
            if (!completionHandledRef.current) {
              completionHandledRef.current = true
              if (mounted) {
                // Extract and store the score
                const scoreStr = cmiDataRef.current["cmi.core.score.raw"] ?? ""
                if (scoreStr && !isNaN(Number(scoreStr))) {
                  setQuizScore(Math.round(Number(scoreStr)))
                }
                setIsCompleted(true)
              }
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
  }, [packageId, scoId])

  // Flush CMI data to the attempt record (both state and localStorage)
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

    // Also directly update localStorage to ensure persistence even if React state update doesn't complete
    try {
      const stored = JSON.parse(localStorage.getItem("lms_scorm_attempts") ?? "[]")
      const idx = stored.findIndex((a: any) => a.id === attemptId)
      if (idx !== -1) {
        const completedAt = finishing ? new Date().toISOString() : stored[idx].completedAt
        stored[idx] = {
          ...stored[idx],
          ...patch,
          ...(finishing && { completedAt }),
        }
        localStorage.setItem("lms_scorm_attempts", JSON.stringify(stored))
        console.log("[SCORM Player] Flushed to localStorage:", stored[idx])
      }
    } catch (err) {
      console.error("[SCORM Player] Failed to update localStorage:", err)
    }
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      if (overlayTimeoutRef.current) {
        clearTimeout(overlayTimeoutRef.current)
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

  // Schedule overlay display after completion is detected
  useEffect(() => {
    if (!isCompleted) return
    const t = setTimeout(() => setShowOverlay(true), 2000)
    return () => clearTimeout(t)
  }, [isCompleted])

  // Debug: Log overlay state
  useEffect(() => {
    if (showOverlay) {
      console.log("[SCORM Player] Overlay state:", { showOverlay, nextSco: !!nextSco, onNextLesson: !!onNextLesson, quizScore })
    }
  }, [showOverlay, nextSco, onNextLesson, quizScore])

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
    <div className="relative w-full h-full">
      <iframe
        ref={iframeRef}
        src={iframeSrc}
        className="w-full h-full"
        style={{ border: "none" }}
        title="SCORM Content"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
      />

      {/* Completion Overlay */}
      {showOverlay && nextSco && onNextLesson && (
        <div
          className="absolute inset-0 flex items-center justify-center p-4"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(4px)"
          }}
        >
          <div
            className="rounded-2xl p-8 text-center max-w-md"
            style={{ backgroundColor: "#1E293B", border: "2px solid #10B981" }}
          >
            <div className="mb-4 text-4xl">🎉</div>
            <h2 className="text-2xl font-bold text-white mb-2">Lesson Complete!</h2>
            <p className="text-gray-300 mb-6">Great job! You've completed this lesson.</p>

            {quizScore !== null && (
              <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: "#0F172A" }}>
                <p className="text-sm text-gray-400 mb-1">Your Score</p>
                <p className="text-3xl font-bold text-green-400">{quizScore}%</p>
              </div>
            )}

            <button
              onClick={onNextLesson}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Next: {nextSco.title}
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Completion without next lesson */}
      {showOverlay && !nextSco && (
        <div
          className="absolute inset-0 flex items-center justify-center p-4"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(4px)"
          }}
        >
          <div
            className="rounded-2xl p-8 text-center max-w-md"
            style={{ backgroundColor: "#1E293B", border: "2px solid #10B981" }}
          >
            <div className="mb-4 text-4xl">✨</div>
            <h2 className="text-2xl font-bold text-white mb-2">Course Complete!</h2>
            <p className="text-gray-300 mb-6">You've finished all the lessons in this course. Congratulations!</p>

            {quizScore !== null && (
              <div className="p-4 rounded-lg" style={{ backgroundColor: "#0F172A" }}>
                <p className="text-sm text-gray-400 mb-1">Final Score</p>
                <p className="text-3xl font-bold text-green-400">{quizScore}%</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
