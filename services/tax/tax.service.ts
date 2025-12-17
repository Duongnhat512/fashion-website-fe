import { API_CONFIG } from '../../lib/api.config';
import type { VATReport, CITReport, FinancialReport } from './tax.types';

class TaxService {
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    };
  }

  private async makeRequest<T>(url: string): Promise<T> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${url}`, {
        method: 'GET',
        headers: {
          ...this.getAuthHeaders(),
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'API request failed');
      }

      return result.data;
    } catch (error) {
      console.error('Tax API request failed:', error);
      throw error;
    }
  }

  async getVATReport(year?: number, month?: number, quarter?: number): Promise<VATReport> {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());
    if (quarter) params.append('quarter', quarter.toString());

    const query = params.toString();
    return this.makeRequest<VATReport>(
      `${API_CONFIG.ENDPOINTS.TAX_REPORTS.VAT}${query ? `?${query}` : ''}`
    );
  }

  async getCITReport(year: number): Promise<CITReport> {
    const params = new URLSearchParams();
    params.append('year', year.toString());

    const query = params.toString();
    return this.makeRequest<CITReport>(
      `${API_CONFIG.ENDPOINTS.TAX_REPORTS.CIT}${query ? `?${query}` : ''}`
    );
  }

  async getFinancialReport(year: number): Promise<FinancialReport> {
    const params = new URLSearchParams();
    params.append('year', year.toString());

    const query = params.toString();
    return this.makeRequest<FinancialReport>(
      `${API_CONFIG.ENDPOINTS.TAX_REPORTS.FINANCIAL}${query ? `?${query}` : ''}`
    );
  }

  async exportVATReport(year?: number, month?: number, quarter?: number, format: 'pdf' = 'pdf'): Promise<Blob> {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());
    if (quarter) params.append('quarter', quarter.toString());
    params.append('format', format);

    const query = params.toString();
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TAX_REPORTS.VAT_EXPORT}${query ? `?${query}` : ''}`, {
      method: 'GET',
      headers: {
        ...this.getAuthHeaders(),
        "ngrok-skip-browser-warning": "true",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.blob();
  }

  async exportCITReport(year: number, format: 'pdf' = 'pdf'): Promise<Blob> {
    const params = new URLSearchParams();
    params.append('year', year.toString());
    params.append('format', format);

    const query = params.toString();
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TAX_REPORTS.CIT_EXPORT}${query ? `?${query}` : ''}`, {
      method: 'GET',
      headers: {
        ...this.getAuthHeaders(),
        "ngrok-skip-browser-warning": "true",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.blob();
  }

  async exportFinancialReport(year: number, format: 'pdf' = 'pdf'): Promise<Blob> {
    const params = new URLSearchParams();
    params.append('year', year.toString());
    params.append('format', format);

    const query = params.toString();
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TAX_REPORTS.FINANCIAL_EXPORT}${query ? `?${query}` : ''}`, {
      method: 'GET',
      headers: {
        ...this.getAuthHeaders(),
        "ngrok-skip-browser-warning": "true",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.blob();
  }
}

export const taxService = new TaxService();
export default taxService;
