import { api } from "./client"

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

export interface InitiatePaymentRequest {
  courseId: string
  couponCode?: string
  paymentMethod?: string
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
    api.post<InitiatePaymentResponse>("/api/v1/payments/initiate", req),

  verify: (paymentId: string, transactionId?: string) =>
    api.post<ApiPayment>(`/api/v1/payments/${paymentId}/verify`, { transactionId }),

  myHistory: () =>
    api.get<ApiPayment[]>("/api/v1/payments/my"),

  getById: (paymentId: string) =>
    api.get<ApiPayment>(`/api/v1/payments/${paymentId}`),
}
