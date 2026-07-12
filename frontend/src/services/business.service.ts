import { apiClient } from '@/lib/api-client';

export interface Booking {
  id: string;
  userId: string;
  placeId: string;
  bookingDate: string;
  numGuests?: number;
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
  businessName: string;
  businessEmail: string;
  businessPhone?: string;
  adminNote?: string;
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
  bookingDate: string;
  numGuests?: number;
  specialRequests?: string;
}

export interface CreateClaimRequest {
  placeId: string;
  businessName: string;
  businessEmail: string;
  businessPhone?: string;
  verificationDocUrl?: string;
}

const toBooking = (booking: any): Booking => ({
  ...booking,
  checkInDate: booking.bookingDate,
  guests: booking.numGuests || 1,
  totalPrice: 0,
});

export const businessService = {
  // Business Claims
  async claimPlace(data: CreateClaimRequest): Promise<BusinessClaim> {
    const response = await apiClient.post('/business/claims', data);
    return response.data.data;
  },

  async getMyClaims(): Promise<BusinessClaim[]> {
    const response = await apiClient.get('/business/claims/my');
    return response.data.data;
  },

  // Bookings
  async createBooking(data: CreateBookingRequest): Promise<Booking> {
    const response = await apiClient.post('/business/bookings', data);
    return toBooking(response.data.data);
  },

  async getMyBookings(): Promise<Booking[]> {
    const response = await apiClient.get('/business/bookings/my');
    return Array.isArray(response.data.data) ? response.data.data.map(toBooking) : [];
  },

  async updateBookingStatus(bookingId: string, status: string): Promise<Booking> {
    const response = await apiClient.put(`/business/bookings/${bookingId}/status`, { status });
    return toBooking(response.data.data);
  },

  async cancelBooking(bookingId: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/business/bookings/${bookingId}`);
    return response.data.data;
  },

  // Business Owner - View bookings for owned places
  async getPlaceBookings(placeId?: string): Promise<Booking[]> {
    let targetPlaceId = placeId;
    if (!targetPlaceId) {
      const claims = await this.getMyClaims();
      targetPlaceId = claims.find((claim) => claim.status === 'APPROVED')?.placeId;
    }
    if (!targetPlaceId) return [];
    const response = await apiClient.get(`/business/places/${targetPlaceId}/bookings`);
    return Array.isArray(response.data.data) ? response.data.data.map(toBooking) : [];
  },
};

// Admin Service
export const adminService = {
  async getAllClaims(): Promise<BusinessClaim[]> {
    const response = await apiClient.get('/business/claims/pending');
    return response.data.data;
  },

  async reviewClaim(claimId: string, approved: boolean): Promise<{ message: string }> {
    const response = await apiClient.put(`/business/claims/${claimId}`, {
      status: approved ? 'APPROVED' : 'REJECTED',
    });
    return response.data.data;
  },

  async getDashboardStats(): Promise<any> {
    const response = await apiClient.get('/business/admin/dashboard');
    return response.data.data;
  },
};
