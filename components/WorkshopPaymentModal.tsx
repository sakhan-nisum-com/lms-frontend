"use client"

import { useState } from "react"
import Link from "next/link"
import {
  X, CreditCard, Lock, CheckCircle2, Tag, ChevronLeft,
  Calendar, Clock, Zap, Download, BookOpen,
} from "lucide-react"
import type { Workshop } from "@/lib/data/workshops"
import { KIND_META } from "./WorkshopCard"

const VALID_COUPONS: Record<string, { discount: number; label: string }> = {
  LEARN10: { discount: 0.1, label: "10% off" },
  FIRST50: { discount: 0.5, label: "50% off" },
}

interface Props {
  workshop: Workshop
  onClose: () => void
  onSuccess: () => void
}

type Step = "summary" | "payment" | "success"

export function WorkshopPaymentModal({ workshop: ws, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<Step>("summary")
  const [couponInput, setCouponInput] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<{ discount: number; label: string } | null>(null)
  const [couponError, setCouponError] = useState("")
  const [cardName, setCardName] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [expiry, setExpiry] = useState("")
  const [cvv, setCvv] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const platformFee = parseFloat((ws.price * 0.05).toFixed(2))
  const discount = appliedCoupon ? parseFloat((ws.price * appliedCoupon.discount).toFixed(2)) : 0
  const total = parseFloat((ws.price + platformFee - discount).toFixed(2))

  const applyCoupon = () => {
    const key = couponInput.trim().toUpperCase()
    const match = VALID_COUPONS[key]
    if (match) {
      setAppliedCoupon(match)
      setCouponError("")
    } else {
      setAppliedCoupon(null)
      setCouponError("Invalid coupon code. Try LEARN10 or FIRST50.")
    }
  }

  const formatCardNumber = (v: string) =>
    v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ")

  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4)
    return d.length >= 3 ? d.slice(0, 2) + "/" + d.slice(2) : d
  }

  const isPayFormValid =
    cardName.trim().length > 0 &&
    cardNumber.replace(/\s/g, "").length === 16 &&
    expiry.length >= 4 &&
    cvv.length === 3

  const handlePay = async () => {
    if (!isPayFormValid || isProcessing) return
    setIsProcessing(true)
    await new Promise((r) => setTimeout(r, 1500))
    setIsProcessing(false)
    setStep("success")
    onSuccess()
  }

  const handleFreeRegister = () => {
    setStep("success")
    onSuccess()
  }

  const kindMeta = KIND_META[ws.kind]
  const KindIcon = kindMeta.icon

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.78)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-sm"
        style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)", maxHeight: "92vh", overflowY: "auto" }}
      >

        {/* ── Summary ── */}
        {step === "summary" && (
          <div>
            <div className="flex items-center justify-between p-5 pb-4" style={{ borderBottom: "1px solid var(--border-default)" }}>
              <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Complete Registration</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg"
                style={{ backgroundColor: "var(--border-default)", color: "var(--text-secondary)" }}
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Workshop info */}
              <div className="flex items-start gap-4 p-4 rounded-xl" style={{ backgroundColor: "var(--bg-surface-muted)" }}>
                <div
                  className="text-3xl flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl"
                  style={{ backgroundColor: "var(--bg-surface)" }}
                >
                  {ws.thumbnail}
                </div>
                <div className="flex-1 min-w-0">
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 mb-1"
                    style={{ backgroundColor: `${kindMeta.color}18`, color: kindMeta.color }}
                  >
                    <KindIcon size={9} /> {kindMeta.label}
                  </span>
                  <h3 className="text-sm font-bold leading-snug" style={{ color: "var(--text-primary)" }}>{ws.title}</h3>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{ws.instructor}</p>
                </div>
              </div>

              {/* Date / time */}
              <div className="flex items-center gap-4 text-xs" style={{ color: "var(--text-tertiary)" }}>
                <span className="flex items-center gap-1.5">
                  <Calendar size={12} />
                  {new Date(ws.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={12} /> {ws.time} – {ws.endTime}
                </span>
              </div>

              {/* Perks */}
              <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--bg-surface-muted)" }}>
                <p className="text-xs font-bold mb-2.5" style={{ color: "var(--text-primary)" }}>What you get</p>
                <div className="space-y-2">
                  {[
                    { icon: Zap, text: ws.duration + " live session" },
                    {
                      icon: BookOpen,
                      text: ws.exercises
                        ? `${ws.exercises.length} hands-on exercises`
                        : ws.speakers
                        ? `${ws.speakers.length} expert speakers`
                        : "Interactive content",
                    },
                    { icon: Download, text: "Recording + slides access" },
                    { icon: CheckCircle2, text: "Certificate of completion" },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                      <Icon size={12} style={{ color: "var(--success)", flexShrink: 0 }} />
                      {text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Price total */}
              <div
                className="flex items-center justify-between pt-4"
                style={{ borderTop: "1px solid var(--border-default)" }}
              >
                <span className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                  {ws.price === 0 ? "No payment required" : "Price"}
                </span>
                <span className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>
                  {ws.price === 0 ? "Free" : `$${ws.price}`}
                </span>
              </div>

              <button
                onClick={ws.price === 0 ? handleFreeRegister : () => setStep("payment")}
                className="w-full py-3 rounded-xl text-sm font-bold text-white"
                style={{ backgroundColor: "var(--accent)" }}
              >
                {ws.price === 0 ? "Register — It's Free" : "Continue to Payment →"}
              </button>
            </div>
          </div>
        )}

        {/* ── Payment ── */}
        {step === "payment" && (
          <div>
            <div
              className="flex items-center justify-between p-5 pb-4"
              style={{ borderBottom: "1px solid var(--border-default)" }}
            >
              <button
                onClick={() => setStep("summary")}
                className="flex items-center gap-1 text-xs font-semibold"
                style={{ color: "var(--text-tertiary)" }}
              >
                <ChevronLeft size={13} /> Back
              </button>
              <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Payment Details</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg"
                style={{ backgroundColor: "var(--border-default)", color: "var(--text-secondary)" }}
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Order summary */}
              <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--bg-surface-muted)" }}>
                <p className="text-xs font-bold mb-3" style={{ color: "var(--text-primary)" }}>Order Summary</p>
                <div className="space-y-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                  <div className="flex justify-between">
                    <span>Workshop fee</span>
                    <span className="font-semibold" style={{ color: "var(--text-primary)" }}>${ws.price}.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform fee (5%)</span>
                    <span className="font-semibold" style={{ color: "var(--text-primary)" }}>${platformFee.toFixed(2)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between" style={{ color: "var(--success)" }}>
                      <span>Coupon ({appliedCoupon.label})</span>
                      <span className="font-semibold">−${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div
                    className="flex justify-between pt-2 font-bold"
                    style={{ borderTop: "1px solid var(--bg-surface)" }}
                  >
                    <span style={{ color: "var(--text-primary)" }}>Total</span>
                    <span style={{ color: "var(--accent)", fontSize: 15 }}>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Coupon */}
              <div>
                <p className="text-xs font-bold mb-2 flex items-center gap-1.5" style={{ color: "var(--text-primary)" }}>
                  <Tag size={12} style={{ color: "var(--warning)" }} /> Coupon Code
                </p>
                <div className="flex gap-2">
                  <input
                    value={couponInput}
                    onChange={(e) => { setCouponInput(e.target.value); setCouponError("") }}
                    onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                    placeholder="e.g. LEARN10"
                    className="flex-1 px-3 py-2 rounded-xl text-xs outline-none font-mono uppercase"
                    style={{
                      backgroundColor: "var(--bg-surface-muted)",
                      border: `1px solid ${couponError ? "var(--danger)" : appliedCoupon ? "var(--success)" : "var(--border-default)"}`,
                      color: "var(--text-primary)",
                    }}
                  />
                  <button
                    onClick={applyCoupon}
                    className="px-3 py-2 rounded-xl text-xs font-semibold"
                    style={{ backgroundColor: "var(--border-default)", color: "var(--text-secondary)" }}
                  >
                    Apply
                  </button>
                </div>
                {couponError && (
                  <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>{couponError}</p>
                )}
                {appliedCoupon && (
                  <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "var(--success)" }}>
                    <CheckCircle2 size={11} /> {appliedCoupon.label} applied!
                  </p>
                )}
              </div>

              {/* Card details */}
              <div>
                <p className="text-xs font-bold mb-2.5 flex items-center gap-1.5" style={{ color: "var(--text-primary)" }}>
                  <CreditCard size={12} style={{ color: "var(--accent)" }} /> Card Details
                </p>
                <div className="space-y-2">
                  <input
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Name on card"
                    className="w-full px-3 py-2.5 rounded-xl text-xs outline-none"
                    style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                  />
                  <div className="relative">
                    <input
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs outline-none font-mono"
                      style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                    />
                    <CreditCard size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="px-3 py-2.5 rounded-xl text-xs outline-none font-mono"
                      style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                    />
                    <input
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                      placeholder="CVV"
                      maxLength={3}
                      className="px-3 py-2.5 rounded-xl text-xs outline-none font-mono"
                      style={{ backgroundColor: "var(--bg-surface-muted)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                <Lock size={11} style={{ flexShrink: 0 }} />
                <span>Your payment is secured with 256-bit SSL encryption</span>
              </div>

              <button
                onClick={handlePay}
                disabled={!isPayFormValid || isProcessing}
                className="w-full py-3 rounded-xl text-sm font-bold transition-colors"
                style={{
                  backgroundColor: isPayFormValid && !isProcessing ? "var(--accent)" : "var(--bg-surface-muted)",
                  color: isPayFormValid && !isProcessing ? "#fff" : "var(--text-muted)",
                  border: isPayFormValid && !isProcessing ? "none" : "1px solid var(--border-default)",
                  cursor: isPayFormValid && !isProcessing ? "pointer" : "not-allowed",
                }}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Processing…
                  </span>
                ) : (
                  `Pay $${total.toFixed(2)}`
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── Success ── */}
        {step === "success" && (
          <div className="p-8 text-center">
            <div
              className="w-18 h-18 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{
                width: 72,
                height: 72,
                backgroundColor: "#10B98115",
                border: "2px solid var(--success)",
              }}
            >
              <CheckCircle2 size={36} style={{ color: "var(--success)" }} />
            </div>

            <h2 className="text-xl font-black mb-1" style={{ color: "var(--text-primary)" }}>You&apos;re Registered!</h2>
            <p className="text-xs mb-1" style={{ color: "var(--text-tertiary)" }}>Confirmation sent to</p>
            <p className="text-sm font-semibold mb-6" style={{ color: "#60A5FA" }}>imazhar@nisum.com</p>

            <div className="p-4 rounded-xl mb-6 text-left" style={{ backgroundColor: "var(--bg-surface-muted)" }}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{ws.thumbnail}</span>
                <div>
                  <p className="text-sm font-bold leading-snug" style={{ color: "var(--text-primary)" }}>{ws.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                    {new Date(ws.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    {" · "}{ws.time}
                  </p>
                </div>
              </div>
              {ws.price > 0 && (
                <div
                  className="mt-3 pt-3 flex justify-between text-xs"
                  style={{ borderTop: "1px solid var(--bg-surface)", color: "var(--text-tertiary)" }}
                >
                  <span>Amount paid</span>
                  <span className="font-bold" style={{ color: "var(--text-primary)" }}>${total.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Link
                href="/student/my-workshops"
                onClick={onClose}
                className="block w-full py-3 rounded-xl text-sm font-bold text-white"
                style={{ backgroundColor: "var(--accent)" }}
              >
                View in My Workshops
              </Link>
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: "var(--border-default)", color: "var(--text-secondary)" }}
              >
                Browse More Workshops
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
