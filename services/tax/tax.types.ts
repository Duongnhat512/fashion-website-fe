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
        propertyPlantEquipment: number;
        intangibleAssets: number;
        longTermInvestments: number;
        otherNonCurrentAssets: number;
        totalNonCurrentAssets: number;
      };
      totalAssets: number;
    };
    liabilitiesAndEquity: {
      currentLiabilities: {
        shortTermLoans: number;
        payables: number;
        accruedExpenses: number;
        otherCurrentLiabilities: number;
        totalCurrentLiabilities: number;
      };
      nonCurrentLiabilities: {
        longTermLoans: number;
        otherNonCurrentLiabilities: number;
        totalNonCurrentLiabilities: number;
      };
      equity: {
        contributedCapital: number;
        retainedEarnings: number;
        otherEquity: number;
        totalEquity: number;
      };
      totalLiabilitiesAndEquity: number;
    };
  };
  incomeStatement: {
    revenue: {
      salesRevenue: number;
      otherRevenue: number;
      totalRevenue: number;
    };
    expenses: {
      costOfGoodsSold: number;
      operatingExpenses: number;
      financialExpenses: number;
      otherExpenses: number;
      totalExpenses: number;
    };
    profit: {
      grossProfit: number;
      operatingProfit: number;
      profitBeforeTax: number;
      netProfit: number;
    };
  };
  cashFlowStatement: {
    operatingActivities: {
      netProfit: number;
      adjustments: number;
      changesInWorkingCapital: number;
      netCashFromOperating: number;
    };
    investingActivities: {
      capitalExpenditures: number;
      investments: number;
      netCashFromInvesting: number;
    };
    financingActivities: {
      debtChanges: number;
      equityChanges: number;
      dividends: number;
      netCashFromFinancing: number;
    };
    netCashChange: number;
    cashAtBeginning: number;
    cashAtEnd: number;
  };
}