import { Product } from '../product/product.types';

export interface CreateReviewDto {
  productId: string;
  rating: number;
  comment: string;
}

export interface ReviewReply {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  comment: string;
  rating?: number;
  images?: string[];
  createdAt: string;
  replyToId?: string | null;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  images?: string[];
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  product?: Product;
  replies?: ReviewReply[];
}

export interface ReviewsResponse {
  reviews: Review[];
  pagination: {
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    page: number;
    limit: number;
  };
}