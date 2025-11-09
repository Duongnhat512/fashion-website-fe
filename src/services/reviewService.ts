import { API_CONFIG } from '../config/api.config';

export interface CreateReviewDto {
  productId: string;
  rating: number;
  comment: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
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

class ReviewService {
  /**
   * Lấy danh sách reviews của một sản phẩm
   */
  async getProductReviews(
    productId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ReviewsResponse> {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REVIEWS.GET_BY_PRODUCT.replace(
        ':productId',
        productId
      )}?page=${page}&limit=${limit}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Không thể tải danh sách đánh giá');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Get reviews error:', error);
      throw error;
    }
  }

  /**
   * Tạo review mới
   */
  async createReview(data: CreateReviewDto, token: string): Promise<Review> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REVIEWS.CREATE}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể tạo đánh giá');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Create review error:', error);
      throw error;
    }
  }

  /**
   * Cập nhật review
   */
  async updateReview(
    reviewId: string,
    data: { rating?: number; comment?: string },
    token: string
  ): Promise<Review> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REVIEWS.UPDATE.replace(
          ':id',
          reviewId
        )}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể cập nhật đánh giá');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Update review error:', error);
      throw error;
    }
  }

  /**
   * Xóa review
   */
  async deleteReview(reviewId: string, token: string): Promise<void> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REVIEWS.DELETE.replace(
          ':id',
          reviewId
        )}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể xóa đánh giá');
      }
    } catch (error) {
      console.error('Delete review error:', error);
      throw error;
    }
  }
}

export const reviewService = new ReviewService();
