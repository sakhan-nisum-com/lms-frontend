"use client"

import { useState, useEffect, useCallback } from "react"
import { paymentsApi } from "@/lib/api/payments"
import type { TransactionStatus, PaymentMethod } from "@/lib/data/transactions"

export interface Transaction {
  id: string
  userId: string
  userName: string
  courseId: string
  courseName: string
  amount: number
  status: TransactionStatus
  method: PaymentMethod
  date: string
}

function normalizeStatus(s: string): TransactionStatus {
  return s.toLowerCase() as TransactionStatus
}

function normalizeMethod(m: string | null): PaymentMethod {
  if (!m) return "card"
  const lower = m.toLowerCase()
  if (lower === "card") return "card"
  if (lower === "paypal") return "paypal"
  if (lower === "invoice") return "invoice"
  if (lower === "wire") return "wire"
  return "card"
}

function toDateString(iso: string): string {
  return iso.split("T")[0]
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const page = await paymentsApi.adminListAll(0, 100)
      setTransactions(
        page.data.map((t) => ({
          id: t.id,
          userId: t.userId,
          userName: t.userName ?? "Unknown",
          courseId: t.courseId ?? "",
          courseName: t.courseName ?? t.description ?? "—",
          amount: Number(t.amount),
          status: normalizeStatus(t.status),
          method: normalizeMethod(t.paymentMethod),
          date: toDateString(t.createdAt),
        }))
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load transactions")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const refund = useCallback(
    async (id: string) => {
      await paymentsApi.adminRefund(id)
      await load()
    },
    [load]
  )

  return { transactions, refund, loading, error }
}
