// IndexedDB access layer for SCORM package files
// KEEP IN SYNC WITH public/scorm-sw.js

const DB_NAME = "lms-scorm"
const DB_VERSION = 1
const FILES_STORE = "files"

// Singleton db promise to avoid multiple openings
let dbPromise: Promise<IDBDatabase> | null = null

export async function openScormDb(): Promise<IDBDatabase> {
  if (typeof window === "undefined") {
    throw new Error("IndexedDB not available in non-browser context")
  }

  if (dbPromise) return dbPromise

  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)

    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(FILES_STORE)) {
        db.createObjectStore(FILES_STORE) // key is provided externally
      }
    }

    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(new Error("Failed to open IndexedDB"))
  })

  return dbPromise
}

// Normalize and combine packageId + filePath into a storage key
// KEEP IN SYNC WITH public/scorm-sw.js
export function fileKey(packageId: string, filePath: string): string {
  // Normalize path: strip leading ./, collapse //, lowercase nothing (paths are case-sensitive)
  let normalized = filePath.replace(/^\.\//g, "").replace(/\/+/g, "/")
  return `${packageId}/${normalized}`
}

// Guess content type from file extension
// KEEP IN SYNC WITH public/scorm-sw.js
export function guessContentType(filePath: string): string {
  const ext = filePath.toLowerCase().split(".").pop() || ""
  const typeMap: Record<string, string> = {
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

interface StoredFile {
  blob: Blob
  contentType: string
}

// Store a file in IndexedDB
export async function putFile(packageId: string, filePath: string, blob: Blob, contentType?: string): Promise<void> {
  const db = await openScormDb()
  const key = fileKey(packageId, filePath)
  const ct = contentType || guessContentType(filePath)

  return new Promise((resolve, reject) => {
    const tx = db.transaction([FILES_STORE], "readwrite")
    const store = tx.objectStore(FILES_STORE)
    const req = store.put({ blob, contentType: ct }, key)

    req.onerror = () => reject(new Error(`Failed to store ${filePath}`))
    tx.oncomplete = () => resolve()
  })
}

// Retrieve a file from IndexedDB
export async function getFile(packageId: string, filePath: string): Promise<StoredFile | undefined> {
  const db = await openScormDb()
  const key = fileKey(packageId, filePath)

  return new Promise((resolve, reject) => {
    const tx = db.transaction([FILES_STORE], "readonly")
    const store = tx.objectStore(FILES_STORE)
    const req = store.get(key)

    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(new Error(`Failed to retrieve ${filePath}`))
  })
}

// Delete all files for a package
export async function deletePackageFiles(packageId: string): Promise<void> {
  const db = await openScormDb()
  const prefix = `${packageId}/`

  return new Promise((resolve, reject) => {
    const tx = db.transaction([FILES_STORE], "readwrite")
    const store = tx.objectStore(FILES_STORE)

    // Open a cursor and delete all keys matching the prefix
    const req = store.openCursor()
    req.onsuccess = (e) => {
      const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result
      if (cursor) {
        const key = cursor.key as string
        if (key.startsWith(prefix)) {
          cursor.delete()
        }
        cursor.continue()
      }
    }

    req.onerror = () => reject(new Error("Failed to delete package files"))
    tx.oncomplete = () => resolve()
  })
}

// Estimate storage usage
export async function estimateUsage(): Promise<{ usage: number; quota: number } | null> {
  if (!navigator.storage || !navigator.storage.estimate) {
    return null
  }

  try {
    const estimate = await navigator.storage.estimate()
    return { usage: estimate.usage || 0, quota: estimate.quota || 0 }
  } catch {
    return null
  }
}
