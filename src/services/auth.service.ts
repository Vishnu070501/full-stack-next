import { apiClient } from "@/utils/api";

export interface SignUpData {
  name: string;
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface LoginData {
    email: string;
    password: string;
  }
  
  export interface LoginResponse {
    user: User;
    accessToken: string;
    message: string;
  }
export const authService = {
  signup: async (data: SignUpData) => {
    return apiClient.post<User>('/api/auth/signup', data);
  },
  login: async (data: LoginData) => {
    return apiClient.post<LoginResponse>('/api/auth/login', data);
  },
  // Add other auth-related methods here
};