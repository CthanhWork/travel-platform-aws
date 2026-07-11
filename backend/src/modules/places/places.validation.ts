import { z } from 'zod';

// Create place validation
export const createPlaceSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(200),
  description: z.string().optional(),
  category: z.enum(['HOTEL', 'RESTAURANT', 'ATTRACTION', 'TOUR']),
  city: z.string().min(2, 'City is required'),
  address: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  priceRange: z.string().optional(),
  images: z.array(z.string().url()).max(10, 'Maximum 10 images allowed').optional(),
  openingHours: z.record(z.any()).optional(),
  amenities: z.record(z.any()).optional(),
});

// Update place validation
export const updatePlaceSchema = z.object({
  name: z.string().min(3).max(200).optional(),
  description: z.string().optional(),
  category: z.enum(['HOTEL', 'RESTAURANT', 'ATTRACTION', 'TOUR']).optional(),
  city: z.string().min(2).optional(),
  address: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  priceRange: z.string().optional(),
  images: z.array(z.string().url()).max(10).optional(),
  openingHours: z.record(z.any()).optional(),
  amenities: z.record(z.any()).optional(),
});

// Search places validation
export const searchPlacesSchema = z.object({
  q: z.string().optional(),
  category: z.enum(['HOTEL', 'RESTAURANT', 'ATTRACTION', 'TOUR']).optional(),
  city: z.string().optional(),
  priceRange: z.string().optional(),
  minRating: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 20),
  sortBy: z.enum(['rating', 'reviews', 'recent']).optional().default('rating'),
});

// Upload URL validation
export const uploadUrlSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileType: z.string().regex(/^image\/(jpeg|jpg|png|webp)$/, 'Invalid file type'),
});

export type CreatePlaceInput = z.infer<typeof createPlaceSchema>;
export type UpdatePlaceInput = z.infer<typeof updatePlaceSchema>;
export type SearchPlacesInput = z.infer<typeof searchPlacesSchema>;
export type UploadUrlInput = z.infer<typeof uploadUrlSchema>;
