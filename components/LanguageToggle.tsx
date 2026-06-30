"use client"

import { useLocale, useTranslations } from "next-intl"
import { useTransition } from "react"
import { setUserLocale } from "@/lib/actions/locale-actions"

export function LanguageToggle() {
  const locale = useLocale()
  const t = useTranslations("common")
  const [isPending, startTransition] = useTransition()

  const toggle = () => {
    const next = locale === "ar" ? "en" : "ar"
    startTransition(() => {
      setUserLocale(next)
    })
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      aria-label={t("toggleLanguage")}
      className="flex items-center justify-center w-9 h-9 rounded-lg text-xs font-bold transition-colors duration-150 disabled:opacity-60"
      style={{ backgroundColor: "var(--bg-surface-muted)", color: "var(--text-secondary)" }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--border-default)")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-surface-muted)")}
    >
      {locale === "ar" ? "EN" : "ع"}
    </button>
  )
}
