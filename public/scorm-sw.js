// Service Worker for SCORM virtual filesystem
// Serves IndexedDB-stored package files at /scorm-content/
// KEEP IN SYNC WITH lib/scorm-storage.ts

console.log("[SCORM SW] Script loaded")

const DB_NAME = "lms-scorm"
const DB_VERSION = 1
const FILES_STORE = "files"

// Singleton db promise
let dbPromise = null

function getDb() {
  if (dbPromise) return dbPromise

  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)

    req.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(FILES_STORE)) {
        db.createObjectStore(FILES_STORE)
      }
    }

    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(new Error("Failed to open IndexedDB in SW"))
  })

  return dbPromise
}

// Normalize path: strip leading ./, collapse //
// KEEP IN SYNC WITH lib/scorm-storage.ts
function fileKey(packageId, filePath) {
  let normalized = filePath.replace(/^\.\//g, "").replace(/\/+/g, "/")
  return `${packageId}/${normalized}`
}

// Guess content type from extension
// KEEP IN SYNC WITH lib/scorm-storage.ts
function guessContentType(filePath) {
  const ext = filePath.toLowerCase().split(".").pop() || ""
  const typeMap = {
    html: "text/html",
    htm: "text/html",
    js: "application/javascript",
    css: "text/css",
    json: "application/json",
    xml: "application/xml",
    txt: "text/plain",
    md: "text/markdown",
    pdf: "application/pdf",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    svg: "image/svg+xml",
    woff: "font/woff",
    woff2: "font/woff2",
    ttf: "font/ttf",
    mp3: "audio/mpeg",
    mp4: "video/mp4",
    webm: "video/webm",
  }
  return typeMap[ext] || "application/octet-stream"
}

// Fetch a file from IndexedDB and return it
async function getFile(packageId, filePath) {
  const db = await getDb()
  const key = fileKey(packageId, filePath)

  return new Promise((resolve, reject) => {
    const tx = db.transaction([FILES_STORE], "readonly")
    const store = tx.objectStore(FILES_STORE)
    const req = store.get(key)

    req.onsuccess = () => {
      const result = req.result
      if (!result) {
        console.log(`[SCORM SW] File not found in IndexedDB: ${key}`)
      } else {
        console.log(`[SCORM SW] Retrieved from IndexedDB: ${key} (${result.blob.size} bytes)`)
      }
      resolve(result)
    }
    req.onerror = () => {
      console.error(`[SCORM SW] IndexedDB error retrieving ${key}:`, req.error)
      reject(new Error(`Failed to retrieve ${filePath}`))
    }
  })
}

// Install: skip waiting (activate immediately)
self.addEventListener("install", (event) => {
  event.waitUntil(Promise.resolve().then(() => self.skipWaiting()))
})

// Activate: claim existing clients
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim())
})

// Fetch: serve SCORM package files from IndexedDB
self.addEventListener("fetch", (e) => {
  try {
    const url = new URL(e.request.url)
    const pathname = url.pathname

    // Only intercept /scorm-content/* requests
    if (!pathname.startsWith("/scorm-content/")) {
      return // Fall through to network
    }

    console.log(`[SCORM SW] Intercepted fetch: ${pathname}`)
    e.respondWith(handleScormFetch(pathname).catch((err) => {
      console.error(`[SCORM SW] Error handling fetch: ${err.message}`)
      return new Response(`Error: ${err.message}`, { status: 500 })
    }))
  } catch (err) {
    // If even parsing fails, let it fall through
    return
  }
})

async function handleScormFetch(pathname) {
  // Parse /scorm-content/{packageId}/{filePath}
  const trimmed = pathname.slice("/scorm-content/".length)
  const firstSlash = trimmed.indexOf("/")

  if (firstSlash === -1) {
    // No file path provided (just /scorm-content/{packageId} or /scorm-content/)
    return new Response("Not found", { status: 404 })
  }

  const packageId = trimmed.slice(0, firstSlash)
  const filePath = trimmed.slice(firstSlash + 1)

  if (!packageId || !filePath) {
    return new Response("Not found", { status: 404 })
  }

  try {
    const file = await getFile(packageId, filePath)
    if (!file) {
      return new Response("Not found", { status: 404 })
    }

    return new Response(file.blob, {
      status: 200,
      headers: {
        "Content-Type": file.contentType || guessContentType(filePath),
        "Cache-Control": "no-cache",
      },
    })
  } catch (err) {
    console.error("[SCORM SW] Error serving file:", err)
    return new Response("Internal server error", { status: 500 })
  }
}
