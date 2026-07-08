"use client"

import { useLocale } from "next-intl"
import { usePathname } from "next/navigation"
import { switchLocalePath } from "@/lib/locale-utils"

interface LanguageToggleProps {
  /** Render as a pill with both language labels (for header) or a compact icon-only button */
  variant?: "pill" | "compact"
}

export function LanguageToggle({ variant = "compact" }: LanguageToggleProps) {
  const locale = useLocale()
  const pathname = usePathname()

  const toggle = () => {
    const next = locale === "ar" ? "en" : "ar"
    window.location.href = switchLocalePath(pathname, next)
  }

  if (variant === "pill") {
    return (
      <button
        onClick={toggle}
        aria-label="Switch language"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors duration-150"
        style={{
          backgroundColor: "var(--sidebar-bg-active)",
          border: "1px solid var(--sidebar-border)",
          color: "var(--sidebar-text-hover)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--sidebar-bg-hover)")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--sidebar-bg-active)")}
      >
        <span style={{ opacity: locale === "en" ? 1 : 0.45 }}>EN</span>
        <span style={{ color: "var(--sidebar-border)" }}>|</span>
        <span style={{ opacity: locale === "ar" ? 1 : 0.45, fontFamily: "var(--font-arabic), system-ui" }}>ع</span>
      </button>
    )
  }

  return (
    <button
      onClick={toggle}
      aria-label="Switch language"
      className="flex items-center justify-center w-9 h-9 rounded-lg text-xs font-bold transition-colors duration-150"
      style={{ backgroundColor: "var(--bg-surface-muted)", color: "var(--text-secondary)" }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--border-default)")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-surface-muted)")}
    >
      {locale === "ar" ? "EN" : "ع"}
    </button>
  )
}
