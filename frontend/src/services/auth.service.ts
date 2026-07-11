import { apiClient } from '@/lib/api-client';
import { User } from '@/stores/auth-store';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface ApiUser {
  id: string;
  email: string;
  fullName: string;
  role: User['role'];
  avatarUrl?: string | null;
}

interface ApiAuthResponse {
  user: ApiUser;
  accessToken: string;
  refreshToken: string;
}

const toClientUser = (user: ApiUser): User => {
  const nameParts = user.fullName.trim().split(/\s+/);

  return {
    id: user.id,
    email: user.email,
    firstName: nameParts[0] || '',
    lastName: nameParts.slice(1).join(' '),
    role: user.role,
    avatarUrl: user.avatarUrl || undefined,
  };
};

const toAuthResponse = (data: ApiAuthResponse): AuthResponse => ({
  user: toClientUser(data.user),
  accessToken: data.accessToken,
  refreshToken: data.refreshToken,
});

export const authService = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/register', data);
    return toAuthResponse(response.data.data);
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login', data);
    return toAuthResponse(response.data.data);
  },

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      await apiClient.post('/auth/logout');
    }
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get('/auth/me');
    return toClientUser(response.data.data.user);
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },
};
