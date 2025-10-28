export interface Color {
  id: string;
  name: string;
  code: string;
  hex: string;
  imageUrl?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  size: string;
  price: number;
  discountPrice: number;
  discountPercent?: number;
  imageUrl: string;
  onSales?: boolean;
  saleNote?: string;
  color: Color;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  imageUrl: string;
  brand: string;
  status: string;
  tags: string;
  ratingAverage: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
  variants: ProductVariant[];
  categoryId: string;
}

export interface Pagination {
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  page: number;
  limit: number;
}

export interface PaginatedProductsResponse {
  products: Product[];
  pagination: Pagination;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
