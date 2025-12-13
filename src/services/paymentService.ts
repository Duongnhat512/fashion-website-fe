import { API_CONFIG } from "../config/api.config";

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

class PaymentService {
  private async makeRequest<T>(url: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${url}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
          ...(options?.headers || {}),
        },
      });

      const text = await response.text();
      const json = JSON.parse(text || "{}");

      if (!response.ok) {
        throw new Error(json.message || `HTTP error ${response.status}`);
      }

      const paymentUrl = json?.data?.response || json?.data?.paymentUrl;
      if (!paymentUrl) {
        throw new Error("Không tìm thấy link thanh toán trong phản hồi từ server");
      }

      return { paymentUrl } as T;
    } catch (err: any) {
      console.error("❌ PaymentService Error:", err);
      throw new Error(err.message || "Không thể kết nối đến máy chủ");
    }
  }

  async createPaymentUrl(data: CreatePaymentRequest): Promise<CreatePaymentResponse> {
    const token = localStorage.getItem("authToken");

    return this.makeRequest<CreatePaymentResponse>(
      API_CONFIG.ENDPOINTS.PAYMENTS.CREATE_URL,
      {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(data),
      }
    );
  }
}

export const paymentService = new PaymentService();
export default paymentService;
