export interface CreatePaymentRequest {
  orderId: string;
  amount: number;
  orderDescription?: string;
  orderType?: string;
  language?: string;
}

export interface CreatePaymentResponse {
  paymentUrl: string;
}