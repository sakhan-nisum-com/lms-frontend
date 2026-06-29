"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Upload, Trash2, Play } from "lucide-react"
import JSZip from "jszip"
import { parseManifest, flattenScos, findLaunchHref } from "@/lib/scorm-import"
import { putFile, deletePackageFiles } from "@/lib/scorm-storage"
import { useScormPackages } from "@/lib/hooks/useScormPackages"
import { useScormAttempts } from "@/lib/hooks/useScormAttempts"

export default function ScormCoursesPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { packages, addPackage, removePackage } = useScormPackages()
  const { attempts: allAttempts } = useScormAttempts()

  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ percent: number; phase: string } | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleUploadClick = () => {
    setUploadError(null)
    fileInputRef.current?.click()
  }

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadProgress({ percent: 0, phase: "Unzipping..." })
    setUploadError(null)

    try {
      // Generate unique package ID
      const packageId = `scorm-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

      // Step 1: Load and unzip
      const zip = await JSZip.loadAsync(file)
      const files = Object.entries(zip.files)
      const totalFiles = files.filter(([_, entry]) => !entry.dir).length

      setUploadProgress({ percent: 10, phase: "Reading files from ZIP..." })

      // Pre-read all blobs immediately while file access is still valid
      const fileBlobs: Array<[string, Blob]> = []
      let readCount = 0
      try {
        for (const [filePath, entry] of files) {
          if (entry.dir) continue

          const blob = await entry.async("blob")
          fileBlobs.push([filePath, blob])
          readCount++
          const progress = 5 + Math.round((readCount / totalFiles) * 5)
          setUploadProgress({ percent: progress, phase: `Reading files (${readCount}/${totalFiles})...` })
        }
      } catch (err) {
        console.error("[Upload] Failed to read file from ZIP:", err)
        throw new Error(`Failed to read file from ZIP: ${err instanceof Error ? err.message : "File access permission expired"}`)
      }

      let processedCount = 0

      setUploadProgress({ percent: 10, phase: "Storing files..." })

      // Step 2: Store all files in IndexedDB
      for (const [filePath, blob] of fileBlobs) {
        try {
          console.log(`[Upload] Storing file: ${filePath} (${blob.size} bytes)`)
          await putFile(packageId, filePath, blob)
          console.log(`[Upload] Successfully stored: ${filePath}`)
        } catch (err) {
          // Quota exceeded or other storage error
          console.error(`[Upload] Failed to store ${filePath}:`, err)
          await deletePackageFiles(packageId)
          throw new Error(`Storage error on ${filePath}: ${err instanceof Error ? err.message : "Failed to store files"}`)
        }

        processedCount++
        const progress = 10 + Math.round((processedCount / totalFiles) * 70)
        setUploadProgress({ percent: progress, phase: `Storing files (${processedCount}/${totalFiles})...` })
      }

      // Step 3: Locate and parse manifest
      setUploadProgress({ percent: 80, phase: "Parsing manifest..." })

      let manifestText: string | null = null

      // Try to find manifest at root level (most common)
      if (zip.file("imsmanifest.xml")) {
        manifestText = await zip.file("imsmanifest.xml")!.async("text")
      } else {
        // Search one level deep (some packages wrap in a folder)
        const possiblePaths = files
          .map(([path]) => path)
          .filter((p) => p.endsWith("imsmanifest.xml") && p.split("/").length <= 2)
        if (possiblePaths.length > 0) {
          manifestText = await zip.file(possiblePaths[0])!.async("text")
        }
      }

      if (!manifestText) {
        await deletePackageFiles(packageId)
        throw new Error("No imsmanifest.xml found in the ZIP file")
      }

      const manifest = parseManifest(manifestText)

      // Verify SCORM 1.2 (reject 2004 explicitly)
      if (manifest.schemaVersion.toLowerCase().includes("2004")) {
        await deletePackageFiles(packageId)
        throw new Error("SCORM 2004 packages are not yet supported — please use a SCORM 1.2 package")
      }

      const scos = flattenScos(manifest)
      if (scos.length === 0) {
        await deletePackageFiles(packageId)
        throw new Error("No playable content (SCOs) found in this package")
      }

      const launchHref = findLaunchHref(manifest)
      if (!launchHref) {
        await deletePackageFiles(packageId)
        throw new Error("Could not determine launch content")
      }

      // Step 4: Save package index entry
      setUploadProgress({ percent: 95, phase: "Finalizing..." })

      addPackage({
        id: packageId,
        title: manifest.title,
        uploadedAt: new Date().toISOString(),
        manifest,
        launchHref,
        sizeBytes: file.size,
      })

      setUploadProgress({ percent: 100, phase: "Complete" })

      // Navigate to the package detail page
      setTimeout(() => {
        router.push(`/student/scorm/${packageId}`)
      }, 500)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error during upload"
      setUploadError(message)
      setUploading(false)
      setUploadProgress(null)
    }
  }

  // Calculate completion stats for a package
  const getPackageStats = (packageId: string) => {
    const pkgAttempts = allAttempts.filter((a) => a.packageId === packageId)
    const completedCount = pkgAttempts.filter((a) => a.status !== "incomplete").length
    const passedCount = pkgAttempts.filter((a) => a.status === "passed").length
    const lastScore = pkgAttempts.length > 0 ? pkgAttempts[pkgAttempts.length - 1].scoreRaw : undefined

    return {
      total: pkgAttempts.length,
      completed: completedCount,
      passed: passedCount,
      completionPercent: pkgAttempts.length > 0 ? Math.round((completedCount / pkgAttempts.length) * 100) : 0,
      lastScore,
    }
  }

  const handleDeletePackage = (packageId: string, title: string) => {
    if (!confirm(`Delete "${title}" and all its attempt records? This cannot be undone.`)) {
      return
    }

    deletePackageFiles(packageId).catch((err) => {
      console.error("Failed to delete package files:", err)
    })

    removePackage(packageId)
  }

  return (
    <DashboardLayout role="student" userName="Student">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">SCORM Courses</h1>
          <p className="text-gray-400">Upload and manage SCORM 1.2 packages</p>
        </div>

        {/* Upload Section */}
        <div className="mb-8 p-6 rounded-2xl" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
          <div className="flex items-center gap-4 mb-4">
            <Upload size={20} className="text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Upload SCORM Package</h2>
          </div>

          <p className="text-sm text-gray-400 mb-4">
            Upload a SCORM 1.2 package (.zip). Supports exports from this app or third-party tools like Articulate, Captivate, and iSpring.
          </p>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            onChange={handleFileSelected}
            className="hidden"
            disabled={uploading}
          />

          {/* Upload button or progress */}
          {!uploading ? (
            <button
              onClick={handleUploadClick}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Upload size={16} />
              Choose File
            </button>
          ) : (
            <div>
              <p className="text-sm text-gray-400 mb-2">{uploadProgress?.phase}</p>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${uploadProgress?.percent || 0}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">{uploadProgress?.percent || 0}%</p>
            </div>
          )}

          {uploadError && (
            <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: "#7F1D1D", border: "1px solid #DC2626" }}>
              <p className="text-sm text-red-300">Error: {uploadError}</p>
            </div>
          )}
        </div>

        {/* Packages List */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Your Packages</h2>

          {packages.length === 0 ? (
            <div className="p-8 rounded-xl text-center" style={{ backgroundColor: "#0F172A", border: "1px dashed #334155" }}>
              <p className="text-gray-400">No SCORM packages uploaded yet</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {packages.map((pkg) => {
                const stats = getPackageStats(pkg.id)
                return (
                  <div key={pkg.id} className="p-4 rounded-xl flex items-start justify-between" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">{pkg.title}</h3>
                      <div className="flex gap-4 mt-2 text-xs text-gray-400">
                        <span>{flattenScos(pkg.manifest).length} lessons</span>
                        <span>{stats.completionPercent}% complete</span>
                        {stats.lastScore !== undefined && <span>Last score: {stats.lastScore}%</span>}
                        <span>Uploaded {new Date(pkg.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => router.push(`/student/scorm/${pkg.id}`)}
                        className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                      >
                        <Play size={14} />
                        Open
                      </button>
                      <button
                        onClick={() => handleDeletePackage(pkg.id, pkg.title)}
                        className="flex items-center gap-1 px-3 py-2 bg-red-900 hover:bg-red-800 text-red-200 text-sm rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
