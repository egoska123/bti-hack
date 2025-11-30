import { api } from './httpClient';
import type { ApiResponse, RequestConfig } from './types';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterClientDto {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  is_admin?: boolean;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

export interface RegisterClientResponse {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  isAdmin: boolean;
}

export interface AuthResponse {
  accessToken: string;
  tokenType?: string;
  refreshToken?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

// Вход (моковые данные)
export const login = async (
  data: LoginDto,
  config?: RequestConfig
): Promise<AuthResponse> => {
  // Имитация задержки сети
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Моковый ответ
  return {
    accessToken: 'mock-access-token-' + Date.now(),
    refreshToken: 'mock-refresh-token-' + Date.now(),
    user: {
      id: 'mock-user-id',
      email: data.email,
      name: 'Mock User',
    },
  };
};

// Регистрация клиента (моковые данные)
export const registerClient = async (
  data: RegisterClientDto,
  config?: RequestConfig
): Promise<RegisterClientResponse> => {
  // Имитация задержки сети
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Моковый ответ
  return {
    id: 'mock-client-id-' + Date.now(),
    email: data.email.trim(),
    fullName: data.fullName.trim(),
    phone: data.phone.trim(),
    isAdmin: data.is_admin ?? false,
  };
};

// Регистрация (старый метод, для обратной совместимости) - моковые данные
export const register = async (
  data: RegisterDto,
  config?: RequestConfig
): Promise<AuthResponse> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    accessToken: 'mock-access-token-' + Date.now(),
    refreshToken: 'mock-refresh-token-' + Date.now(),
    user: {
      id: 'mock-user-id',
      email: data.email,
      name: data.name,
    },
  };
};

// Выход (моковые данные)
export const logout = async (config?: RequestConfig): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 200));
};

// Получить текущего пользователя (моковые данные)
export const getCurrentUser = async (
  config?: RequestConfig
): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return {
    id: 'mock-user-id',
    email: 'mock@example.com',
    name: 'Mock User',
    role: 'user',
  };
};

// Обновить токен (моковые данные)
export const refreshToken = async (
  refreshToken: string,
  config?: RequestConfig
): Promise<AuthResponse> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return {
    accessToken: 'mock-access-token-' + Date.now(),
    refreshToken: 'mock-refresh-token-' + Date.now(),
  };
};

