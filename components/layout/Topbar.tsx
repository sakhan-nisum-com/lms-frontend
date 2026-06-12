"use client"

import { Bell, Search, ChevronDown } from "lucide-react"
import { useState } from "react"

interface TopbarProps {
  userName?: string
  userAvatar?: string
  role?: "student" | "tutor"
}

export function Topbar({
  userName = "John Doe",
  role = "student",
}: TopbarProps) {
  const [searchFocused, setSearchFocused] = useState(false)

  return (
    <header
      className="flex items-center justify-between px-6 py-3 flex-shrink-0"
      style={{
        backgroundColor: "#1E293B",
        borderBottom: "1px solid #334155",
        height: "64px",
      }}
    >
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "#64748B" }}
        />
        <input
          type="text"
          placeholder="Search courses, lessons..."
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg outline-none transition-all duration-200"
          style={{
            backgroundColor: "#334155",
            color: "#F8FAFC",
            border: `1px solid ${searchFocused ? "#3B82F6" : "transparent"}`,
          }}
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 ml-4">
        {/* Notifications */}
        <button
          className="relative flex items-center justify-center w-9 h-9 rounded-lg transition-colors duration-150"
          style={{ backgroundColor: "#334155", color: "#94A3B8" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#475569"
            e.currentTarget.style.color = "#F8FAFC"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#334155"
            e.currentTarget.style.color = "#94A3B8"
          }}
        >
          <Bell size={16} />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ backgroundColor: "#3B82F6" }}
          />
        </button>

        {/* Profile */}
        <button
          className="flex items-center gap-2.5 rounded-lg px-3 py-1.5 transition-colors duration-150"
          style={{ backgroundColor: "#334155" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#475569")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#334155")
          }
        >
          <div
            className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white flex-shrink-0"
            style={{ backgroundColor: "#3B82F6" }}
          >
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold text-white leading-none">
              {userName}
            </p>
            <p className="text-xs capitalize" style={{ color: "#94A3B8" }}>
              {role}
            </p>
          </div>
          <ChevronDown size={14} style={{ color: "#64748B" }} />
        </button>
      </div>
    </header>
  )
}
