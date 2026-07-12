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

const toReview = (review: any): Review => ({
  id: review.id,
  rating: Number(review.rating),
  comment: review.content || '',
  userId: review.userId,
  placeId: review.placeId,
  userName: review.user?.fullName || review.userName || 'Traveler',
  userAvatar: review.user?.avatarUrl || review.userAvatar,
  createdAt: review.createdAt,
  helpfulCount: Number(review.helpfulCount || 0),
  hasVoted: review.hasVoted,
  reply: review.replies?.[0]
    ? {
        id: review.replies[0].id,
        comment: review.replies[0].content,
        createdAt: review.replies[0].createdAt,
      }
    : undefined,
});

export const reviewsService = {
  async getReviews(placeId: string): Promise<Review[]> {
    const response = await apiClient.get(`/reviews/place/${placeId}`);
    const reviews = response.data.data?.reviews;
    return Array.isArray(reviews) ? reviews.map(toReview) : [];
  },

  async createReview(placeId: string, rating: number, comment: string): Promise<Review> {
    const response = await apiClient.post('/reviews', { placeId, rating, content: comment });
    return toReview(response.data.data);
  },

  async updateReview(reviewId: string, rating: number, comment: string): Promise<Review> {
    const response = await apiClient.put(`/reviews/${reviewId}`, { rating, content: comment });
    return toReview(response.data.data);
  },

  async deleteReview(reviewId: string): Promise<void> {
    await apiClient.delete(`/reviews/${reviewId}`);
  },

  async voteHelpful(reviewId: string): Promise<{ message: string }> {
    const response = await apiClient.post(`/reviews/${reviewId}/vote`, { helpful: true });
    return response.data.data;
  },

  async replyToReview(reviewId: string, comment: string): Promise<{ message: string }> {
    const response = await apiClient.post(`/reviews/${reviewId}/reply`, { content: comment });
    return response.data.data;
  },
};
