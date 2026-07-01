// Service Worker registration & readiness client

let swRegPromise: Promise<ServiceWorkerRegistration> | null = null

export async function ensureScormServiceWorker(): Promise<ServiceWorkerRegistration> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    throw new Error("Service Workers not supported in this environment")
  }

  if (swRegPromise) return swRegPromise

  swRegPromise = (async () => {
    try {
      console.log("[SCORM SW Client] Registering Service Worker at /scorm-sw.js...")

      // Check if already registered
      const existing = await navigator.serviceWorker.getRegistrations()
      let registration = existing.find(r => r.scope.includes("/scorm-content/"))

      if (!registration) {
        registration = await navigator.serviceWorker.register("/scorm-sw.js", {
          scope: "/scorm-content/",
        })
        console.log("[SCORM SW Client] New registration created")
      } else {
        console.log("[SCORM SW Client] Using existing registration")
      }

      // Wait for the registration's active worker
      console.log("[SCORM SW Client] Waiting for worker to become active...")

      // Poll for active worker (more reliable than events)
      let attempts = 0
      while (!registration.active && attempts < 100) {
        await new Promise(resolve => setTimeout(resolve, 100))
        // Re-fetch registration to get latest state
        const updated = await navigator.serviceWorker.getRegistration("/scorm-content/")
        if (updated) {
          registration = updated
        }
        attempts++
      }

      if (!registration.active) {
        throw new Error("Service Worker failed to become active after 10 seconds")
      }

      console.log("[SCORM SW Client] Worker is active and ready")
      return registration
    } catch (err) {
      console.error("[SCORM SW Client] Registration failed:", err)
      swRegPromise = null // Reset so we can retry
      throw err
    }
  })()

  return swRegPromise
}
