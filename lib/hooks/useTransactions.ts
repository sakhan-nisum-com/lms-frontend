"use client"

import { useState, useEffect, useCallback } from "react"
import { TRANSACTIONS } from "@/lib/data/transactions"
import type { Transaction } from "@/lib/data/transactions"

const STORAGE_KEY = "lms_transactions"

function load(): Transaction[] {
  if (typeof window === "undefined") return TRANSACTIONS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Transaction[]) : TRANSACTIONS
  } catch {
    return TRANSACTIONS
  }
}

function save(items: Transaction[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

// Admin view over the platform's transaction ledger, client-side only —
// same pattern as the other localStorage-backed hooks. Lets an admin
// issue a refund on top of the seeded transaction history.
export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>(TRANSACTIONS)

  useEffect(() => {
    setTransactions(load())
  }, [])

  const refund = useCallback((id: string) => {
    setTransactions((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, status: "refunded" as const } : t))
      save(next)
      return next
    })
  }, [])

  return { transactions, refund }
}
