import { apiClient } from '@/lib/api-client';

export interface Review {
  id: string;
  rating: number;
  comment: string;
  userId: string;
  placeId: string;
  userName: string;
  userAvatar?: string;
  createdAt: string;
  helpfulCount: number;
  hasVoted?: boolean;
  reply?: {
    id: string;
    comment: string;
    createdAt: string;
  };
}

export const reviewsService = {
  async getReviews(placeId: string): Promise<Review[]> {
    const response = await apiClient.get(`/reviews/place/${placeId}`);
    return response.data;
  },

  async createReview(placeId: string, rating: number, comment: string): Promise<Review> {
    const response = await apiClient.post('/reviews', { placeId, rating, comment });
    return response.data;
  },

  async updateReview(reviewId: string, rating: number, comment: string): Promise<Review> {
    const response = await apiClient.put(`/reviews/${reviewId}`, { rating, comment });
    return response.data;
  },

  async deleteReview(reviewId: string): Promise<void> {
    await apiClient.delete(`/reviews/${reviewId}`);
  },

  async voteHelpful(reviewId: string): Promise<{ message: string }> {
    const response = await apiClient.post(`/reviews/${reviewId}/vote`);
    return response.data;
  },

  async replyToReview(reviewId: string, comment: string): Promise<{ message: string }> {
    const response = await apiClient.post(`/reviews/${reviewId}/reply`, { comment });
    return response.data;
  },
};
