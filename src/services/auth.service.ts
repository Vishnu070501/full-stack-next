import { apiClient } from "@/utils/api";

export interface User {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface LoginData {
    email: string;
    password: string;
  }
  
  export interface SignUpData {
    name: string;
    email: string;
    password: string;
  }
  
  export interface LoginResponse {
    message: string;
    user: User;
    accessToken: string;
  }
  
  export interface UserProfile {
    user: User;
  }

export const authService = {
  signup: async (data: SignUpData) => {
    return apiClient.post<User>('/api/auth/signup', data);
  },
  login: async (data: LoginData) => {
    return apiClient.post<LoginResponse>('/api/auth/login', data);
  },

    // Protected route - needs token
    getProfile: async () => {
        return apiClient.get<UserProfile>('/api/auth/me');
        },
  // Add other auth-related methods here
  logout: async () => {
    try {
      // Call logout endpoint to clear refresh token cookie
      await apiClient.post('/api/auth/logout', {});
      
      // Clear access token from localStorage
      localStorage.removeItem('accessToken');
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Still remove access token even if API call fails
      localStorage.removeItem('accessToken');
      return { success: false };
    }
  },
  refreshToken: async () => {
    return apiClient.post<{ accessToken: string }>('/api/auth/refresh', {});
  }
};