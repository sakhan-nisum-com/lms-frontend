"use client"

import { useState } from "react"

interface BilingualInputProps {
  labelEn: string
  labelAr?: string
  valueEn: string
  valueAr: string
  onChangeEn: (v: string) => void
  onChangeAr: (v: string) => void
  placeholderEn?: string
  placeholderAr?: string
  multiline?: boolean
  rows?: number
  maxLength?: number
  required?: boolean
  accentColor?: string
}

export function BilingualInput({
  labelEn,
  labelAr,
  valueEn,
  valueAr,
  onChangeEn,
  onChangeAr,
  placeholderEn = "",
  placeholderAr = "",
  multiline = false,
  rows = 4,
  maxLength,
  required,
  accentColor = "var(--accent)",
}: BilingualInputProps) {
  const [lang, setLang] = useState<"en" | "ar">("en")
  const isAr = lang === "ar"
  const value = isAr ? valueAr : valueEn
  const placeholder = isAr ? placeholderAr : placeholderEn
  const onChange = isAr ? onChangeAr : onChangeEn

  const inputStyle = {
    backgroundColor: "var(--bg-surface-muted)",
    border: "1px solid var(--border-default)",
    color: "var(--text-primary)",
    fontFamily: isAr ? "var(--font-arabic), system-ui" : "inherit",
    direction: isAr ? "rtl" as const : "ltr" as const,
    textAlign: isAr ? "right" as const : "left" as const,
  }

  return (
    <div>
      {/* Label row */}
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
          {labelEn}
          {required && <span style={{ color: "var(--danger)" }}> *</span>}
        </label>
        <div className="flex items-center rounded-lg overflow-hidden" style={{ border: "1px solid var(--border-default)" }}>
          {(["en", "ar"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              className="px-2.5 py-1 text-xs font-bold transition-colors"
              style={{
                backgroundColor: lang === l ? accentColor : "transparent",
                color: lang === l ? "#fff" : "var(--text-tertiary)",
              }}
            >
              {l === "en" ? "EN" : "ع"}
            </button>
          ))}
        </div>
      </div>

      {/* Input or Textarea */}
      {multiline ? (
        <div className="relative">
          <textarea
            dir={isAr ? "rtl" : "ltr"}
            value={value}
            onChange={(e) => onChange(maxLength ? e.target.value.slice(0, maxLength) : e.target.value)}
            rows={rows}
            placeholder={placeholder}
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none placeholder-slate-600"
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = accentColor)}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-default)")}
          />
          {maxLength && (
            <span className="absolute bottom-2 end-3 text-xs pointer-events-none" style={{ color: "var(--text-muted)" }}>
              {value.length}/{maxLength}
            </span>
          )}
        </div>
      ) : (
        <input
          dir={isAr ? "rtl" : "ltr"}
          type="text"
          value={value}
          onChange={(e) => onChange(maxLength ? e.target.value.slice(0, maxLength) : e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none placeholder-slate-600"
          style={inputStyle}
          onFocus={(e) => (e.currentTarget.style.borderColor = accentColor)}
          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-default)")}
        />
      )}

      {/* Hint when other lang has content */}
      {!isAr && valueAr && (
        <p className="mt-1 text-xs" style={{ color: "var(--text-muted)", direction: "rtl", fontFamily: "var(--font-arabic)" }}>
          {valueAr}
        </p>
      )}
      {isAr && valueEn && (
        <p className="mt-1 text-xs truncate" style={{ color: "var(--text-muted)" }}>{valueEn}</p>
      )}
    </div>
  )
}
