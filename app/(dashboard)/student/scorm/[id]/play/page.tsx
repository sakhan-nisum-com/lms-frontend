"use client"

import { use } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { ScormPlayer } from "@/components/student/ScormPlayer"
import { useScormPackages } from "@/lib/hooks/useScormPackages"
import { flattenScos } from "@/lib/scorm-import"
import { ChevronLeft } from "lucide-react"

export default function ScormPlayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const scoId = searchParams.get("sco") || ""
  const attemptId = searchParams.get("attempt") || undefined

  const { getPackage } = useScormPackages()
  const pkg = getPackage(id)

  if (!pkg) {
    return (
      <DashboardLayout role="student" userName="Student">
        <div className="max-w-4xl mx-auto p-6 text-center">
          <p className="text-gray-400">Package not found</p>
        </div>
      </DashboardLayout>
    )
  }

  // Resolve the launch href for the requested SCO and calculate next lesson
  let launchHref = pkg.launchHref
  const allScos = flattenScos(pkg.manifest)
  let nextSco: { id: string; title: string } | null = null

  if (scoId) {
    const selectedSco = allScos.find((sco) => sco.id === scoId)
    if (selectedSco) {
      launchHref = selectedSco.href
    }

    // Calculate next SCO
    const currentIndex = allScos.findIndex((sco) => sco.id === scoId)
    if (currentIndex >= 0 && currentIndex < allScos.length - 1) {
      const nextScoObj = allScos[currentIndex + 1]
      nextSco = { id: nextScoObj.id, title: nextScoObj.title }
    }
  }

  const scoTitle =
    scoId && pkg.manifest.organizations[0]
      ? findScoTitle(pkg.manifest.organizations[0].items, scoId)
      : pkg.title

  const handleNextLesson = () => {
    if (nextSco) {
      router.push(`/student/scorm/${id}/play?sco=${nextSco.id}`)
    }
  }

  return (
    <DashboardLayout role="student" userName="Student">
      <div className="h-screen flex flex-col">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor: "#334155", backgroundColor: "#0F172A" }}>
          <button
            onClick={() => router.push(`/student/scorm/${id}`)}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="text-sm">Back to Details</span>
          </button>
          <div className="flex-1">
            <p className="text-sm text-gray-400">{pkg.title}</p>
            <p className="text-xs text-gray-500">{scoTitle}</p>
          </div>
        </div>

        {/* Player */}
        <div className="flex-1">
          <ScormPlayer
            packageId={id}
            scoId={scoId}
            launchHref={launchHref}
            attemptId={attemptId}
            nextSco={nextSco}
            onNextLesson={handleNextLesson}
          />
        </div>
      </div>
    </DashboardLayout>
  )
}

// Helper to find a SCO's title by ID in the manifest item tree
function findScoTitle(items: any[], targetId: string): string {
  for (const item of items) {
    if (item.identifier === targetId) {
      return item.title
    }
    if (item.children.length > 0) {
      const found = findScoTitle(item.children, targetId)
      if (found) return found
    }
  }
  return "Content"
}
