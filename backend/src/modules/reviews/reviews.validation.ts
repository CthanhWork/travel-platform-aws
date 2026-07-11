import { z } from 'zod';

// Create review validation
export const createReviewSchema = z.object({
  placeId: z.string().uuid('Invalid place ID'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  content: z.string().min(10, 'Review content must be at least 10 characters').max(2000, 'Review content is too long').optional(),
  images: z.array(z.string().url()).max(5, 'Maximum 5 images allowed').optional(),
});

// Update review validation
export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  content: z.string().min(10).max(2000).optional(),
  images: z.array(z.string().url()).max(5).optional(),
});

// Vote review validation
export const voteReviewSchema = z.object({
  helpful: z.boolean(),
});

// Report review validation
export const reportReviewSchema = z.object({
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(500, 'Reason is too long'),
});

// Reply to review validation
export const replyReviewSchema = z.object({
  content: z.string().min(5, 'Reply must be at least 5 characters').max(1000, 'Reply is too long'),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type VoteReviewInput = z.infer<typeof voteReviewSchema>;
export type ReportReviewInput = z.infer<typeof reportReviewSchema>;
export type ReplyReviewInput = z.infer<typeof replyReviewSchema>;
