import { apiClient } from '@/lib/api-client';

export interface Booking {
  id: string;
  userId: string;
  placeId: string;
  checkInDate: string;
  checkOutDate?: string;
  guests: number;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  specialRequests?: string;
  createdAt: string;
  place: {
    id: string;
    name: string;
    category: string;
    city: string;
    country: string;
  };
}

export interface BusinessClaim {
  id: string;
  userId: string;
  placeId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  claimReason: string;
  createdAt: string;
  place: {
    id: string;
    name: string;
    category: string;
    city: string;
    country: string;
  };
}

export interface CreateBookingRequest {
  placeId: string;
  checkInDate: string;
  checkOutDate?: string;
  guests: number;
  totalPrice: number;
  specialRequests?: string;
}

export const businessService = {
  // Business Claims
  async claimPlace(placeId: string, claimReason: string): Promise<BusinessClaim> {
    const response = await apiClient.post('/business/claim-place', { placeId, claimReason });
    return response.data;
  },

  async getMyClaims(): Promise<BusinessClaim[]> {
    const response = await apiClient.get('/business/my-claims');
    return response.data;
  },

  // Bookings
  async createBooking(data: CreateBookingRequest): Promise<Booking> {
    const response = await apiClient.post('/business/bookings', data);
    return response.data;
  },

  async getMyBookings(): Promise<Booking[]> {
    const response = await apiClient.get('/business/bookings/my-bookings');
    return response.data;
  },

  async updateBookingStatus(bookingId: string, status: string): Promise<Booking> {
    const response = await apiClient.put(`/business/bookings/${bookingId}/status`, { status });
    return response.data;
  },

  async cancelBooking(bookingId: string): Promise<{ message: string }> {
    const response = await apiClient.post(`/business/bookings/${bookingId}/cancel`);
    return response.data;
  },

  // Business Owner - View bookings for owned places
  async getPlaceBookings(): Promise<Booking[]> {
    const response = await apiClient.get('/business/bookings');
    return response.data;
  },
};

// Admin Service
export const adminService = {
  async getAllClaims(): Promise<BusinessClaim[]> {
    const response = await apiClient.get('/business/admin/claims');
    return response.data;
  },

  async reviewClaim(claimId: string, approved: boolean): Promise<{ message: string }> {
    const response = await apiClient.post(`/business/admin/claims/${claimId}/review`, { approved });
    return response.data;
  },

  async getDashboardStats(): Promise<any> {
    const response = await apiClient.get('/business/admin/dashboard');
    return response.data;
  },
};
