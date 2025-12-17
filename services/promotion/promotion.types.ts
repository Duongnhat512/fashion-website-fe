export interface Promotion {
  id: string;
  productIds: string[];
  products?: {
    id: string;
    name: string;
    slug: string;
    shortDescription: string;
    imageUrl: string;
    brand: string | null;
    status: string;
    tags: string;
    ratingAverage: number;
    ratingCount: number;
    createdAt: string;
    updatedAt: string;
  }[];
  categoryId: string | null;
  categoryName: string | null;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  name: string;
  startDate: string;
  endDate: string;
  active: boolean;
  note: string;
  createdAt: string;
  updatedAt: string;
  status: "draft" | "submitted" | "active" | "inactive";
}

export interface PromotionListResponse {
  data: Promotion[];
  total: number;
  page: number;
  limit: number;
}

export interface CreatePromotionRequest {
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  name: string;
  note: string;
  startDate: string;
  endDate: string;
  productIds?: string[];
  categoryId?: string;
}