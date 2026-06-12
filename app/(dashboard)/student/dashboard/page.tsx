import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { BookOpen, Clock, Trophy, TrendingUp, Play, ChevronRight } from "lucide-react"

const stats = [
  { label: "Courses Enrolled", value: "12", icon: BookOpen, color: "#3B82F6" },
  { label: "Hours Learned", value: "48", icon: Clock, color: "#10B981" },
  { label: "Certificates", value: "3", icon: Trophy, color: "#F59E0B" },
  { label: "Streak (days)", value: "7", icon: TrendingUp, color: "#8B5CF6" },
]

const continueLearning = [
  {
    title: "React & Next.js Masterclass",
    progress: 68,
    thumbnail: "⚛️",
    nextLesson: "Server Components Deep Dive",
    duration: "24 min",
  },
  {
    title: "TypeScript Fundamentals",
    progress: 42,
    thumbnail: "🔷",
    nextLesson: "Generics & Utility Types",
    duration: "18 min",
  },
  {
    title: "System Design for Engineers",
    progress: 15,
    thumbnail: "🏗️",
    nextLesson: "Load Balancing Strategies",
    duration: "32 min",
  },
]

export default function StudentDashboardPage() {
  return (
    <DashboardLayout role="student" userName="Alex Johnson">
      <div className="space-y-8 max-w-6xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Good morning, Alex 👋</h1>
          <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>
            You&apos;re on a 7-day streak. Keep it up!
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="rounded-2xl p-5"
              style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
            >
              <div
                className="flex items-center justify-center w-10 h-10 rounded-xl mb-3"
                style={{ backgroundColor: `${color}20` }}
              >
                <Icon size={20} style={{ color }} />
              </div>
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-xs mt-0.5" style={{ color: "#64748B" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Continue Learning */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Continue Learning</h2>
            <button
              className="flex items-center gap-1 text-xs font-medium transition-colors"
              style={{ color: "#3B82F6" }}
            >
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {continueLearning.map((course) => (
              <div
                key={course.title}
                className="rounded-2xl p-5 flex items-center gap-5 cursor-pointer transition-colors duration-150"
                style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#3B82F640")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#334155")}
              >
                {/* Thumbnail */}
                <div
                  className="flex items-center justify-center w-12 h-12 rounded-xl text-2xl flex-shrink-0"
                  style={{ backgroundColor: "#334155" }}
                >
                  {course.thumbnail}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{course.title}</p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: "#64748B" }}>
                    Next: {course.nextLesson} · {course.duration}
                  </p>
                  {/* Progress bar */}
                  <div className="mt-2.5 h-1.5 rounded-full" style={{ backgroundColor: "#334155" }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${course.progress}%`, backgroundColor: "#3B82F6" }}
                    />
                  </div>
                  <p className="text-xs mt-1" style={{ color: "#64748B" }}>
                    {course.progress}% complete
                  </p>
                </div>

                {/* Play button */}
                <button
                  className="flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 transition-colors"
                  style={{ backgroundColor: "#3B82F6" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2563EB")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#3B82F6")}
                >
                  <Play size={16} fill="#fff" color="#fff" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Placeholder for upcoming content */}
        <div
          className="rounded-2xl p-8 text-center"
          style={{ backgroundColor: "#1E293B", border: "1px dashed #334155" }}
        >
          <BookOpen size={32} className="mx-auto mb-3" style={{ color: "#334155" }} />
          <p className="text-sm font-medium" style={{ color: "#475569" }}>
            Course catalog, quizzes, and certificates coming soon
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
