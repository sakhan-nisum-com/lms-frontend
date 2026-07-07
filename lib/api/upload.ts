const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("lms_access_token")
}

export interface UploadResult {
  url: string
  filename: string
}

async function uploadFile(
  endpoint: string,
  file: File,
  onProgress?: (pct: number) => void,
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const form = new FormData()
    form.append("file", file)

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    })

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const body = JSON.parse(xhr.responseText)
        resolve(body.data as UploadResult)
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`))
      }
    })

    xhr.addEventListener("error", () => reject(new Error("Upload error")))

    xhr.open("POST", `${BASE}${endpoint}`)
    const token = getToken()
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`)
    xhr.send(form)
  })
}

export const uploadApi = {
  video: (file: File, onProgress?: (pct: number) => void) =>
    uploadFile("/api/v1/uploads/video", file, onProgress),

  image: (file: File, onProgress?: (pct: number) => void) =>
    uploadFile("/api/v1/uploads/image", file, onProgress),

  document: (file: File, onProgress?: (pct: number) => void) =>
    uploadFile("/api/v1/uploads/document", file, onProgress),
}
