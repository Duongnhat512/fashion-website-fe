import { API_CONFIG } from '../../lib/api.config';
import type { Product } from '../../types/product.types';
import type { CreateReviewDto, ReviewReply, Review, ReviewsResponse } from './review.types';

export type { Review } from './review.types';

class ReviewService {
  /**
   * Lấy tất cả reviews (cho admin)
   */
  async getAllReviews(page: number = 1, limit: number = 10): Promise<ReviewsResponse> {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REVIEWS.GET_ALL}?page=${page}&limit=${limit}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (!response.ok) {
        throw new Error('Không thể tải danh sách đánh giá');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Get all reviews error:', error);
      throw error;
    }
  }
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


    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true', 
      },
    });

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



  async createReview(data: CreateReviewDto | FormData, token: string): Promise<Review> {
    try {
      if (data instanceof FormData) {
        const response = await fetch(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REVIEWS.CREATE}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: data,
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Không thể tạo đánh giá');
        }

        const result = await response.json();
        return result.data;
      } else {
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
      }
    } catch (error) {
      console.error('Create review error:', error);
      throw error;
    }
  }


  async updateReview(
    reviewId: string,
    data: { rating?: number; comment?: string; images?: File[] },
    token: string
  ): Promise<Review> {
    try {
      const formData = new FormData();
      
      if (data.rating !== undefined) {
        formData.append('rating', data.rating.toString());
      }
      if (data.comment !== undefined) {
        formData.append('comment', data.comment);
      }
      if (data.images && data.images.length > 0) {
        data.images.forEach((file) => {
          formData.append('images', file);
        });
      }

      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REVIEWS.UPDATE.replace(
          ':id',
          reviewId
        )}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
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
