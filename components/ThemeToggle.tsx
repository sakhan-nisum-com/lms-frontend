"use client"

import { Moon, Sun } from "lucide-react"
import { useSyncExternalStore } from "react"

function subscribe(callback: () => void) {
  window.addEventListener("theme-change", callback)
  return () => window.removeEventListener("theme-change", callback)
}

function getSnapshot() {
  return document.documentElement.getAttribute("data-color-mode") === "dark"
}

function getServerSnapshot() {
  return false
}

export function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const toggle = () => {
    if (isDark) {
      document.documentElement.removeAttribute("data-color-mode")
      localStorage.setItem("theme", "light")
    } else {
      document.documentElement.setAttribute("data-color-mode", "dark")
      localStorage.setItem("theme", "dark")
    }
    window.dispatchEvent(new Event("theme-change"))
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="flex items-center justify-center w-9 h-9 rounded-lg transition-colors duration-150"
      style={{ backgroundColor: "var(--bg-surface-muted)", color: "var(--text-secondary)" }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--border-default)")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-surface-muted)")}
    >
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  )
}
