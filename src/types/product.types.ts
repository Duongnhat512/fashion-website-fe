export interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  imageUrl: string;
  brand: string;
  categoryId: string;
  status: string;
  tags: string;
  ratingAverage: number;
  ratingCount: number;
  variants: ProductVariant[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  size: string;
  price: number;
  salePrice?: number;
  stock: number;
  color: Color;
  images: string[];
}

export interface Color {
  id: string;
  name: string;
  code: string;
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