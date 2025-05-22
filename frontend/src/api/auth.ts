import apiClient from './client';
import { ApiResponse, User, AuthTokens } from '../types';

interface LoginData {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

interface AuthResponseData {
  user: User;
  tokens: AuthTokens;
}

export const login = async (data: LoginData): Promise<ApiResponse<AuthResponseData>> => {
  const response = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/login', data);
  return response.data;
};

export const register = async (data: RegisterData): Promise<ApiResponse<AuthResponseData>> => {
  const response = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/register', data);
  return response.data;
};

export const logout = async (): Promise<ApiResponse<null>> => {
  const response = await apiClient.post<ApiResponse<null>>('/auth/logout');
  return response.data;
};

export const getCurrentUser = async (): Promise<ApiResponse<User>> => {
  const response = await apiClient.get<ApiResponse<User>>('/users/me');
  return response.data;
};

export const updateTheme = async (theme: 'light' | 'dark'): Promise<ApiResponse<{theme_preference: string}>> => {
  const response = await apiClient.put<ApiResponse<{theme_preference: string}>>('/users/me/theme', { theme });
  return response.data;
};