import { API_CONFIG } from '../config/api.config';

export interface VATReport {
  reportPeriod: {
    month: number;
    year: number;
  };
  companyInfo: {
    name: string;
    taxCode: string;
    address: string;
    phone: string;
    email: string;
  };
  outputVat: {
    details: Array<{
      invoiceSerial: string;
      invoiceNumber: string;
      invoiceDate: string;
      partnerName: string;
      partnerTaxCode: string;
      itemName: string;
      netValue: number;
      vatRate: number;
      vatAmount: number;
      totalValue: number;
      status: string;
    }>;
    totalNetRevenue: number;
    totalVatAmount: number;
    summaryByRate: Array<{
      rate: number;
      netValue: number;
      vatAmount: number;
    }>;
  };
  inputVat: {
    details: Array<{
      invoiceSerial: string;
      invoiceNumber: string;
      invoiceDate: string;
      partnerName: string;
      partnerTaxCode: string;
      itemName: string;
      netValue: number;
      vatRate: number;
      vatAmount: number;
      totalValue: number;
      status: string;
    }>;
    totalNetCost: number;
    totalVatDeductible: number;
    summaryByRate: Array<{
      rate: number;
      netValue: number;
      vatAmount: number;
    }>;
  };
  taxSummary: {
    vatPayable: number;
    isNegative: boolean;
    vatCarriedForward: number;
  };
}

export interface CITReport {
  period: {
    year: number;
    fromDate: string;
    toDate: string;
    isAnnual: boolean;
  };
  companyInfo: {
    name: string;
    taxCode: string;
    businessSector: string;
    sectorPercentage: number;
  };
  revenue: {
    salesRevenue: number;
    financialRevenue: number;
    otherIncome: number;
    totalRevenue: number;
  };
  expenses: {
    costOfGoodsSold: number;
    sellingExpenses: number;
    adminExpenses: number;
    financialExpenses: number;
    otherExpenses: number;
    totalDeductibleExpenses: number;
  };
  taxCalculation: {
    profitBeforeTax: number;
    carryForwardLoss: number;
    taxableIncome: number;
    taxRate: number;
    citAmount: number;
  };
}

export interface FinancialReport {
  fiscalYear: number;
  currency: string;
  reportDate: string;
  preparedDate: string;
  companyInfo: {
    name: string;
    taxCode: string;
    address: string;
    legalRepresentative: string;
  };
  balanceSheet: {
    assets: {
      currentAssets: {
        cash: number;
        inventory: number;
        receivables: number;
        shortTermInvestments: number;
        otherCurrentAssets: number;
        totalCurrentAssets: number;
      };
      nonCurrentAssets: {
        fixedAssets: number;
        longTermInvestments: number;
        intangibleAssets: number;
        otherNonCurrentAssets: number;
        totalNonCurrentAssets: number;
      };
      totalAssets: number;
    };
    resources: {
      liabilities: {
        shortTermDebt: {
          accountsPayable: number;
          taxPayable: number;
          accruedExpenses: number;
          shortTermLoans: number;
          otherShortTermLiabilities: number;
          totalShortTermDebt: number;
        };
        longTermDebt: {
          longTermLoans: number;
          otherLongTermLiabilities: number;
          totalLongTermDebt: number;
        };
        totalLiabilities: number;
      };
      equity: {
        ownerCapital: number;
        retainedEarnings: number;
        currentYearProfit: number;
        otherEquity: number;
        totalEquity: number;
      };
      totalResources: number;
    };
  };
  incomeStatement: {
    revenue: {
      salesRevenue: number;
      financialRevenue: number;
      otherRevenue: number;
      totalRevenue: number;
    };
    deductions: {
      salesReturns: number;
      discounts: number;
      allowances: number;
      totalDeductions: number;
    };
    netRevenue: number;
    costOfGoodsSold: number;
    grossProfit: number;
    operatingExpenses: {
      sellingExpenses: number;
      adminExpenses: number;
      totalOperatingExpenses: number;
    };
    operatingProfit: number;
    otherProfit: {
      otherIncome: number;
      otherExpenses: number;
      netOtherProfit: number;
    };
    profitBeforeTax: number;
    currentCit: number;
    profitAfterTax: number;
  };
}

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