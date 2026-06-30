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
    <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
      <h3 className="text-sm font-bold mb-4" style={{ color: "var(--text-primary)" }}>{title}</h3>
      <div className="space-y-1">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="flex items-center gap-3 p-2 rounded-xl transition-colors"
            style={{ textDecoration: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-surface-muted)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <div
              className="flex items-center justify-center w-11 h-11 rounded-xl text-lg flex-shrink-0"
              style={{ backgroundColor: `${item.thumbnailColor}20` }}
            >
              {item.thumbnail}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate leading-snug" style={{ color: "var(--text-primary)" }}>{item.title}</p>
              <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-tertiary)" }}>{item.meta}</p>
              {item.rating !== undefined && (
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-xs font-bold" style={{ color: "var(--warning)" }}>{item.rating}</span>
                  <Star size={10} fill="#F59E0B" style={{ color: "var(--warning)" }} />
                  {item.reviewCount !== undefined && (
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>({item.reviewCount.toLocaleString()})</span>
                  )}
                </div>
              )}
            </div>
            {item.priceLabel && (
              <span
                className="text-sm font-bold flex-shrink-0"
                style={{ color: item.priceLabel === "Free" ? "var(--success)" : "var(--text-primary)" }}
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
