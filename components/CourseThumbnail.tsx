import { Lock } from "lucide-react"
import type { Course } from "@/lib/data/courses"
import { getCourseImageUrl } from "@/lib/courseImage"

interface CourseThumbnailProps {
  course: Course
  heightClass?: string
  roundedClass?: string
  topLeftBadge?: React.ReactNode
  locked?: boolean
}

export function CourseThumbnail({ course, heightClass = "h-28", roundedClass = "", topLeftBadge, locked = false }: CourseThumbnailProps) {
  return (
    <div className={`relative overflow-hidden flex-shrink-0 ${heightClass} ${roundedClass}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={getCourseImageUrl(course)}
        alt={course.title}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(135deg, ${course.thumbnailColor}55 0%, #0F172A80 100%)` }}
      />
      {locked && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: "#0F172A55" }}>
          <div className="flex items-center justify-center w-9 h-9 rounded-full" style={{ backgroundColor: "#0F172AE6", border: "1px solid #ffffff30" }}>
            <Lock size={15} style={{ color: "#F8FAFC" }} />
          </div>
        </div>
      )}
      {topLeftBadge && <div className="absolute top-2 left-2">{topLeftBadge}</div>}
      <div
        className="absolute bottom-2 right-2 flex items-center justify-center w-8 h-8 rounded-lg text-lg"
        style={{ backgroundColor: "#0F172AE6", border: `1px solid ${course.thumbnailColor}60` }}
      >
        {course.thumbnail}
      </div>
    </div>
  )
}
