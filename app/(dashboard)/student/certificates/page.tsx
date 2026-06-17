"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { CERTIFICATES, STUDENT_PROFILE } from "@/lib/data/courses"
import {
  Award, Download, Share2, ExternalLink, CheckCircle2,
  Calendar, Shield, Copy, Check,
} from "lucide-react"

export default function CertificatesPage() {
  const p = STUDENT_PROFILE
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [selected, setSelected] = useState(CERTIFICATES[0])

  const handleCopy = (credId: string) => {
    navigator.clipboard.writeText(credId).catch(() => {})
    setCopiedId(credId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <DashboardLayout role="student" userName={p.name}>
      <div className="space-y-6 max-w-6xl">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">My Certificates</h1>
          <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>
            {CERTIFICATES.length} certificates earned · Verifiable credentials on your profile
          </p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Certificates Earned", value: CERTIFICATES.length, color: "#F59E0B" },
            { label: "Skills Demonstrated", value: CERTIFICATES.reduce((s, c) => s + c.skills.length, 0), color: "#3B82F6" },
            { label: "Avg Grade", value: `${Math.round(CERTIFICATES.reduce((s, c) => s + c.grade, 0) / CERTIFICATES.length)}%`, color: "#10B981" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl p-4" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
              <p className="text-2xl font-bold" style={{ color }}>{value}</p>
              <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Certificate list */}
          <div className="space-y-3">
            {CERTIFICATES.map((cert) => (
              <button
                key={cert.id}
                className="w-full rounded-2xl p-4 text-left transition-all"
                style={{
                  backgroundColor: "#1E293B",
                  border: `1px solid ${selected?.id === cert.id ? cert.thumbnailColor + "60" : "#334155"}`,
                }}
                onClick={() => setSelected(cert)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center justify-center w-12 h-12 rounded-xl text-2xl flex-shrink-0"
                    style={{ backgroundColor: `${cert.thumbnailColor}15` }}
                  >
                    {cert.thumbnail}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{cert.courseName}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>Issued {cert.issuedDate}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Award size={11} style={{ color: "#F59E0B" }} />
                      <span className="text-xs font-semibold" style={{ color: "#F59E0B" }}>{cert.grade}% grade</span>
                    </div>
                  </div>
                  {selected?.id === cert.id && (
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cert.thumbnailColor }} />
                  )}
                </div>
              </button>
            ))}

            {/* In-progress towards certificate */}
            <div
              className="rounded-2xl p-4 opacity-60"
              style={{ backgroundColor: "#1E293B", border: "1px dashed #334155" }}
            >
              <p className="text-xs font-semibold mb-2" style={{ color: "#64748B" }}>IN PROGRESS</p>
              {[
                { title: "React & Next.js Masterclass", progress: 68, emoji: "⚛️", color: "#3B82F6" },
                { title: "TypeScript for Professionals", progress: 42, emoji: "🔷", color: "#2563EB" },
              ].map((c) => (
                <div key={c.title} className="flex items-center gap-2 mb-2 last:mb-0">
                  <span>{c.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white truncate">{c.title}</p>
                    <div className="h-1 rounded-full mt-1" style={{ backgroundColor: "#334155" }}>
                      <div className="h-full rounded-full" style={{ width: `${c.progress}%`, backgroundColor: c.color }} />
                    </div>
                  </div>
                  <span className="text-xs flex-shrink-0" style={{ color: "#64748B" }}>{c.progress}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Certificate detail */}
          {selected && (
            <div className="lg:col-span-2 space-y-4">
              {/* Certificate mockup */}
              <div
                className="rounded-2xl overflow-hidden relative"
                style={{ backgroundColor: "#0A1628", border: `2px solid ${selected.thumbnailColor}40` }}
              >
                {/* Background decoration */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse at 70% 30%, ${selected.thumbnailColor}12 0%, transparent 60%)`,
                  }}
                />

                <div className="relative p-8">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex items-center justify-center w-9 h-9 rounded-lg"
                        style={{ backgroundColor: "#3B82F6" }}
                      >
                        <Award size={18} color="#fff" />
                      </div>
                      <div>
                        <p className="text-xs font-bold" style={{ color: "#60A5FA" }}>LEARNFLOW</p>
                        <p className="text-xs" style={{ color: "#475569" }}>Certificate of Completion</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: "#10B981" }}>
                      <Shield size={13} />
                      <span>Verified</span>
                    </div>
                  </div>

                  {/* Main content */}
                  <div className="text-center mb-6">
                    <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#64748B" }}>
                      This certifies that
                    </p>
                    <h2 className="text-2xl font-black text-white mb-2">{p.name}</h2>
                    <p className="text-xs mb-3" style={{ color: "#64748B" }}>has successfully completed</p>
                    <h3
                      className="text-xl font-bold mb-1"
                      style={{ color: selected.thumbnailColor }}
                    >
                      {selected.courseName}
                    </h3>
                    <p className="text-sm" style={{ color: "#94A3B8" }}>Instructed by {selected.instructorName}</p>
                  </div>

                  {/* Grade and decoration */}
                  <div className="flex items-center justify-center gap-8 mb-6">
                    <div className="text-center">
                      <p className="text-3xl font-black" style={{ color: selected.thumbnailColor }}>{selected.grade}%</p>
                      <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>Final Grade</p>
                    </div>
                    <div className="text-5xl">{selected.thumbnail}</div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-white">{selected.issuedDate}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>Issue Date</p>
                    </div>
                  </div>

                  {/* Credential ID */}
                  <div
                    className="flex items-center justify-between p-3 rounded-xl"
                    style={{ backgroundColor: "#0F172A", border: "1px solid #334155" }}
                  >
                    <div>
                      <p className="text-xs" style={{ color: "#475569" }}>Credential ID</p>
                      <p className="text-sm font-mono font-semibold text-white">{selected.credentialId}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(selected.credentialId)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium"
                      style={{ backgroundColor: "#334155", color: "#94A3B8" }}
                    >
                      {copiedId === selected.credentialId ? <Check size={12} style={{ color: "#10B981" }} /> : <Copy size={12} />}
                      {copiedId === selected.credentialId ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="rounded-2xl p-5" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
                <h3 className="text-sm font-bold text-white mb-3">Skills Demonstrated</h3>
                <div className="flex flex-wrap gap-2">
                  {selected.skills.map((skill) => (
                    <span
                      key={skill}
                      className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg font-medium"
                      style={{ backgroundColor: `${selected.thumbnailColor}15`, color: selected.thumbnailColor }}
                    >
                      <CheckCircle2 size={11} /> {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Details & Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-2xl p-4" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2" style={{ color: "#94A3B8" }}>
                      <Calendar size={14} style={{ color: "#64748B" }} />
                      <span>Issued: <strong className="text-white">{selected.issuedDate}</strong></span>
                    </div>
                    {selected.expiryDate && (
                      <div className="flex items-center gap-2" style={{ color: "#94A3B8" }}>
                        <Calendar size={14} style={{ color: "#F59E0B" }} />
                        <span>Expires: <strong className="text-white">{selected.expiryDate}</strong></span>
                      </div>
                    )}
                    <div className="flex items-center gap-2" style={{ color: "#94A3B8" }}>
                      <Shield size={14} style={{ color: "#10B981" }} />
                      <span>Status: <strong style={{ color: "#10B981" }}>Verified</strong></span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl p-4 space-y-2" style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}>
                  <button
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ backgroundColor: "#3B82F6", color: "#fff" }}
                  >
                    <Download size={14} /> Download PDF
                  </button>
                  <button
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ backgroundColor: "#334155", color: "#94A3B8" }}
                  >
                    <Share2 size={14} /> Share Certificate
                  </button>
                  <button
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium"
                    style={{ backgroundColor: "transparent", color: "#64748B" }}
                  >
                    <ExternalLink size={12} /> Verify Online
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  )
}
