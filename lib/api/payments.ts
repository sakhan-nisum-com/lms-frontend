import { api } from "./client"
import type { PageResponse } from "./courses"

export interface ApiPayment {
  id: string
  studentId: string
  courseId: string
  courseName: string
  amount: number
  currency: string
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED"
  paymentMethod: string | null
  transactionId: string | null
  createdAt: string
}

export interface ApiTransaction {
  id: string
  userId: string
  courseId: string | null
  workshopId: string | null
  amount: number
  currency: string
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED" | "CANCELLED"
  paymentMethod: string | null
  description: string | null
  createdAt: string
  userName: string | null
  courseName: string | null
}

export interface InitiatePaymentRequest {
  courseId: string
  paymentMethod: "CARD" | "PAYPAL" | "INVOICE" | "WIRE" | "APPLE_PAY" | "GOOGLE_PAY"
  currency?: string
}

export interface InitiatePaymentResponse {
  paymentId: string
  amount: number
  currency: string
  discountedAmount: number
  couponApplied: boolean
  redirectUrl: string | null
}

export const paymentsApi = {
  initiate: (req: InitiatePaymentRequest) =>
    api.post<ApiTransaction>("/api/v1/payments/initiate", req),

  confirm: (transactionId: string, stripeChargeId: string) =>
    api.post<ApiTransaction>(`/api/v1/payments/${transactionId}/confirm?stripeChargeId=${encodeURIComponent(stripeChargeId)}`, null),

  myHistory: () =>
    api.get<ApiPayment[]>("/api/v1/payments/my"),

  getById: (paymentId: string) =>
    api.get<ApiPayment>(`/api/v1/payments/${paymentId}`),

  adminListAll: (page = 0, size = 50) =>
    api.get<PageResponse<ApiTransaction>>(`/api/v1/payments?page=${page}&size=${size}`),

  adminRefund: (transactionId: string, reason?: string) => {
    const qs = reason ? `?reason=${encodeURIComponent(reason)}` : ""
    return api.post<ApiTransaction>(`/api/v1/payments/${transactionId}/refund${qs}`, null)
  },
}
