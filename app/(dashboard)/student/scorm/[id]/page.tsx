"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { useScormPackages } from "@/lib/hooks/useScormPackages"
import { useScormAttempts } from "@/lib/hooks/useScormAttempts"
import { deletePackageFiles } from "@/lib/scorm-storage"
import { flattenScos, findLaunchHref } from "@/lib/scorm-import"
import { ChevronRight, Play, RotateCcw, Trash2, ChevronLeft } from "lucide-react"

export default function ScormDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { getPackage, removePackage } = useScormPackages()
  const { attempts: allAttempts, startAttempt } = useScormAttempts()

  const [selectedSco, setSelectedSco] = useState<string>("")
  const [deleting, setDeleting] = useState(false)

  const pkg = getPackage(id)

  if (!pkg) {
    return (
      <DashboardLayout role="student" userName="Student">
        <div className="max-w-4xl mx-auto p-6">
          <p className="text-gray-400">Package not found</p>
          <button
            onClick={() => router.push("/student/scorm")}
            className="mt-4 text-blue-400 hover:text-blue-300 flex items-center gap-2"
          >
            <ChevronLeft size={16} />
            Back to SCORM Courses
          </button>
        </div>
      </DashboardLayout>
    )
  }

  const scos = flattenScos(pkg.manifest)
  const pkgAttempts = allAttempts.filter((a) => a.packageId === id).sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())

  // Determine default SCO if not selected
  const launchScoId = selectedSco || scos[0]?.id || ""
  const selectedScoObj = scos.find((sco) => sco.id === selectedSco)
  const launchHref = selectedScoObj?.href || pkg.launchHref

  // Find latest attempt for the selected SCO
  const latestAttempt = scos.length > 0 && selectedSco
    ? pkgAttempts.find((a) => a.scoId === selectedSco)
    : undefined

  const canResume = latestAttempt && latestAttempt.status === "incomplete"

  const handleStart = () => {
    if (!launchScoId) return
    const attemptId = startAttempt(id, launchScoId)
    router.push(`/student/scorm/${id}/play?sco=${launchScoId}`)
  }

  const handleResume = () => {
    if (!latestAttempt) return
    router.push(`/student/scorm/${id}/play?sco=${launchScoId}&attempt=${latestAttempt.id}`)
  }

  const handleRetake = () => {
    if (!launchScoId) return
    const attemptId = startAttempt(id, launchScoId)
    router.push(`/student/scorm/${id}/play?sco=${launchScoId}`)
  }

  const handlePlaySco = (scoId: string) => {
    if (!scoId) return
    const scoAttempts = pkgAttempts.filter((a) => a.scoId === scoId)
    const latestScoAttempt = scoAttempts.length > 0 ? scoAttempts[0] : undefined
    const canResumeSco = latestScoAttempt && latestScoAttempt.status === "incomplete"

    if (canResumeSco && latestScoAttempt) {
      router.push(`/student/scorm/${id}/play?sco=${scoId}&attempt=${latestScoAttempt.id}`)
    } else {
      const attemptId = startAttempt(id, scoId)
      router.push(`/student/scorm/${id}/play?sco=${scoId}`)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Delete "${pkg.title}" and all attempt records? This cannot be undone.`)) {
      return
    }

    setDeleting(true)
    try {
      await deletePackageFiles(id)
      removePackage(id)
      router.push("/student/scorm")
    } catch (err) {
      console.error("Failed to delete package:", err)
      setDeleting(false)
    }
  }

  return (
    <DashboardLayout role="student" userName="Student">
      <div className="max-w-6xl mx-auto p-6">
        {/* Back link */}
        <button
          onClick={() => router.push("/student/scorm")}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6"
        >
          <ChevronLeft size={16} />
          <span className="text-sm">Back to SCORM Courses</span>
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{pkg.title}</h1>
          <p className="text-sm text-gray-400">
            Uploaded {new Date(pkg.uploadedAt).toLocaleDateString()} • {scos.length} lesson{scos.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Outline */}
          <div className="lg:col-span-1 p-4 rounded-xl" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
            <h3 className="text-sm font-semibold text-white mb-3">Course Outline</h3>
            <div className="space-y-2">
              {scos.map((sco) => (
                <div
                  key={sco.id}
                  onClick={() => setSelectedSco(sco.id)}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer"
                  style={{
                    backgroundColor: selectedSco === sco.id ? "#3B82F620" : "transparent",
                    color: selectedSco === sco.id ? "#60A5FA" : "#94A3B8",
                    border: selectedSco === sco.id ? "1px solid #3B82F640" : "1px solid transparent",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs">{sco.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePlaySco(sco.id)
                      }}
                      className="ml-auto flex-shrink-0 p-1 hover:opacity-80 transition-opacity bg-transparent border-0 cursor-pointer"
                    >
                      <Play size={12} className="text-blue-400" />
                    </button>
                  </div>
                  {sco.path.length > 0 && <div className="text-[10px] text-gray-500 mt-0.5">{sco.path.join(" > ")}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Details + History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleStart}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <Play size={16} />
                Start
              </button>

              {canResume && (
                <button
                  onClick={handleResume}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors"
                >
                  <RotateCcw size={16} />
                  Resume
                </button>
              )}

              {latestAttempt && latestAttempt.status !== "incomplete" && (
                <button
                  onClick={handleRetake}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                  <RotateCcw size={16} />
                  Retake
                </button>
              )}

              <button
                onClick={handleDelete}
                disabled={deleting}
                className="ml-auto flex items-center gap-2 px-4 py-2 bg-red-900 hover:bg-red-800 text-red-200 font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>

            {/* Attempt History */}
            <div className="p-4 rounded-xl" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
              <h3 className="text-sm font-semibold text-white mb-3">Attempt History</h3>

              {pkgAttempts.length === 0 ? (
                <p className="text-xs text-gray-400">No attempts yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ borderBottom: "1px solid #334155" }}>
                        <th className="text-left px-2 py-2 text-gray-400">Date</th>
                        <th className="text-left px-2 py-2 text-gray-400">Status</th>
                        <th className="text-left px-2 py-2 text-gray-400">Score</th>
                        <th className="text-left px-2 py-2 text-gray-400">Time Spent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pkgAttempts.map((attempt) => (
                        <tr key={attempt.id} style={{ borderBottom: "1px solid #334155" }}>
                          <td className="px-2 py-2 text-gray-300">
                            {new Date(attempt.startedAt).toLocaleDateString()} {new Date(attempt.startedAt).toLocaleTimeString()}
                          </td>
                          <td className="px-2 py-2">
                            <span
                              className="px-2 py-1 rounded text-xs font-medium"
                              style={{
                                backgroundColor:
                                  attempt.status === "passed"
                                    ? "#10B98118"
                                    : attempt.status === "failed"
                                      ? "#EF444418"
                                      : attempt.status === "completed"
                                        ? "#3B82F618"
                                        : "#64748B18",
                                color:
                                  attempt.status === "passed"
                                    ? "#10B981"
                                    : attempt.status === "failed"
                                      ? "#EF4444"
                                      : attempt.status === "completed"
                                        ? "#3B82F6"
                                        : "#64748B",
                              }}
                            >
                              {attempt.status}
                            </span>
                          </td>
                          <td className="px-2 py-2 text-gray-300">
                            {attempt.scoreRaw !== undefined ? `${attempt.scoreRaw}%` : "—"}
                          </td>
                          <td className="px-2 py-2 text-gray-300">
                            {formatSeconds(attempt.timeSpentSeconds)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function formatSeconds(secs: number): string {
  const hours = Math.floor(secs / 3600)
  const minutes = Math.floor((secs % 3600) / 60)
  const seconds = secs % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  } else {
    return `${seconds}s`
  }
}
