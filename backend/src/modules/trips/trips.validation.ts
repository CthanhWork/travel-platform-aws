import { z } from 'zod';

// Save/unsave place validation
export const savePlaceSchema = z.object({
  placeId: z.string().uuid('Invalid place ID'),
});

// Create trip validation
export const createTripSchema = z.object({
  name: z.string().min(3, 'Trip name must be at least 3 characters').max(100),
  description: z.string().max(500, 'Description is too long').optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  isPublic: z.boolean().optional().default(false),
}).refine((data) => !data.startDate || !data.endDate || data.endDate >= data.startDate, {
  message: 'End date must be on or after start date',
  path: ['endDate'],
});

// Update trip validation
export const updateTripSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().max(500).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  isPublic: z.boolean().optional(),
});

// Add place to trip validation
export const addPlaceToTripSchema = z.object({
  placeId: z.string().uuid('Invalid place ID'),
  day: z.number().int().min(1, 'Day must be at least 1'),
  orderInDay: z.number().int().min(1, 'Order must be at least 1'),
  note: z.string().max(500, 'Note is too long').optional(),
});

// Update place in trip validation
export const updatePlaceInTripSchema = z.object({
  day: z.number().int().min(1).optional(),
  orderInDay: z.number().int().min(1).optional(),
  note: z.string().max(500).optional(),
});

export type SavePlaceInput = z.infer<typeof savePlaceSchema>;
export type CreateTripInput = z.infer<typeof createTripSchema>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;
export type AddPlaceToTripInput = z.infer<typeof addPlaceToTripSchema>;
export type UpdatePlaceInTripInput = z.infer<typeof updatePlaceInTripSchema>;
