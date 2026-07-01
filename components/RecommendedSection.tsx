import Link from "next/link"
import { Star } from "lucide-react"

export interface RecommendedItem {
  id: string
  href: string
  thumbnail: string
  thumbnailColor: string
  title: string
  meta: string
  rating?: number
  reviewCount?: number
  priceLabel?: string
}

interface RecommendedSectionProps {
  title: string
  items: RecommendedItem[]
}

export function RecommendedSection({ title, items }: RecommendedSectionProps) {
  if (items.length === 0) return null

  return (
    <div className="rounded-2xl p-5" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
      <h3 className="text-sm font-bold text-white mb-4">{title}</h3>
      <div className="space-y-1">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="flex items-center gap-3 p-2 rounded-xl transition-colors"
            style={{ textDecoration: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0F172A")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <div
              className="flex items-center justify-center w-11 h-11 rounded-xl text-lg flex-shrink-0"
              style={{ backgroundColor: `${item.thumbnailColor}20` }}
            >
              {item.thumbnail}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate leading-snug">{item.title}</p>
              <p className="text-xs truncate mt-0.5" style={{ color: "#64748B" }}>{item.meta}</p>
              {item.rating !== undefined && (
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-xs font-bold" style={{ color: "#F59E0B" }}>{item.rating}</span>
                  <Star size={10} fill="#F59E0B" style={{ color: "#F59E0B" }} />
                  {item.reviewCount !== undefined && (
                    <span className="text-xs" style={{ color: "#475569" }}>({item.reviewCount.toLocaleString()})</span>
                  )}
                </div>
              )}
            </div>
            {item.priceLabel && (
              <span
                className="text-sm font-bold flex-shrink-0"
                style={{ color: item.priceLabel === "Free" ? "#10B981" : "#F8FAFC" }}
              >
                {item.priceLabel}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
