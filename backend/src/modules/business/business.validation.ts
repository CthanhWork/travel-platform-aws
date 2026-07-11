import { z } from 'zod';

// Claim place validation
export const claimPlaceSchema = z.object({
  placeId: z.string().uuid('Invalid place ID'),
  businessName: z.string().min(3, 'Business name must be at least 3 characters').max(100),
  businessEmail: z.string().email('Invalid email address'),
  businessPhone: z.string().min(10, 'Phone number is too short').max(20).optional(),
  verificationDocUrl: z.string().url('Invalid document URL').optional(),
});

// Review claim validation (admin)
export const reviewClaimSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED'], {
    errorMap: () => ({ message: 'Status must be APPROVED or REJECTED' }),
  }),
  adminNote: z.string().max(500, 'Admin note is too long').optional(),
});

// Create booking validation
export const createBookingSchema = z.object({
  placeId: z.string().uuid('Invalid place ID'),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  numGuests: z.number().int().min(1, 'At least 1 guest required').max(50).optional(),
  specialRequests: z.string().max(1000, 'Special requests too long').optional(),
});

// Update booking status validation
export const updateBookingStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'], {
    errorMap: () => ({ message: 'Invalid booking status' }),
  }),
});

export type ClaimPlaceInput = z.infer<typeof claimPlaceSchema>;
export type ReviewClaimInput = z.infer<typeof reviewClaimSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
