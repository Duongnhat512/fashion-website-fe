export interface Voucher {
  id: string;
  code: string;
  title?: string;
  description?: string;
  discountPercentage: number;
  maxDiscountValue?: number;
  minOrderValue?: number;
  usageLimit?: number;
  usageLimitPerUser?: number;
  usedCount: number;
  isActive: boolean;
  isStackable?: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface VoucherListResponse {
  data: Voucher[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateVoucherRequest {
  code: string;
  title?: string;
  description?: string;
  discountPercentage: number;
  maxDiscountValue?: number;
  minOrderValue?: number;
  usageLimit?: number;
  usageLimitPerUser?: number;
  isActive?: boolean;
  isStackable?: boolean;
  startDate: string;
  endDate: string;
}