import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import type { RequestConfig } from './types';
import { HttpError, handleApiError, isAuthError } from './errors';

// Базовый URL API (можно вынести в переменные окружения)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://178.215.238.184:8000/api';

// Создание экземпляра axios
const httpClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 секунд
  headers: {
    'Content-Type': 'application/json',
  },
});

// Функция для получения токена доступа (можно заменить на получение из Redux или localStorage)
const getAccessToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

// Функция для получения refresh токена
const getRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken');
};

// Функция для сохранения токенов
const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

// Функция для удаления токенов
const clearTokens = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

// Флаг для предотвращения множественных запросов на обновление токена
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (error?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Интерсептор для запросов
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig & { skipAuth?: boolean; skipErrorHandler?: boolean }) => {
    // Добавление токена авторизации
    if (!config.skipAuth) {
      const token = getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерсептор для ответов
httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      skipAuth?: boolean;
      skipErrorHandler?: boolean;
    };

    // Если ошибка авторизации и это не был запрос на обновление токена
    if (isAuthError(error) && !originalRequest._retry && !originalRequest.skipAuth) {
      if (isRefreshing) {
        // Если уже идет обновление токена, добавляем запрос в очередь
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return httpClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        clearTokens();
        processQueue(new HttpError('Токен обновления не найден'), null);
        // Убрано: редирект на /login (используются только моковые данные)
        return Promise.reject(error);
      }

      try {
        // Запрос на обновление токена
        const response = await axios.post(
          `${API_BASE_URL}/v1/auth/refresh`,
          { refreshToken }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        setTokens(accessToken, newRefreshToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        processQueue(null, accessToken);
        isRefreshing = false;

        return httpClient(originalRequest);
      } catch (refreshError) {
        clearTokens();
        processQueue(refreshError, null);
        isRefreshing = false;
        // Убрано: редирект на /login (используются только моковые данные)
        return Promise.reject(refreshError);
      }
    }

    // Если не нужно обрабатывать ошибку автоматически
    if (originalRequest.skipErrorHandler) {
      return Promise.reject(error);
    }

    // Убрано: редирект на /login при ошибке авторизации (используются только моковые данные)
    if (isAuthError(error) && !originalRequest.skipAuth) {
      clearTokens();
    }

    return Promise.reject(handleApiError(error));
  }
);

// Базовые методы для HTTP запросов
export const api = {
  // GET запрос
  get: <T = unknown>(
    url: string,
    config?: AxiosRequestConfig & RequestConfig
  ): Promise<AxiosResponse<T>> => {
    return httpClient.get<T>(url, config);
  },

  // POST запрос
  post: <T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig & RequestConfig
  ): Promise<AxiosResponse<T>> => {
    return httpClient.post<T>(url, data, config);
  },

  // PUT запрос
  put: <T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig & RequestConfig
  ): Promise<AxiosResponse<T>> => {
    return httpClient.put<T>(url, data, config);
  },

  // PATCH запрос
  patch: <T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig & RequestConfig
  ): Promise<AxiosResponse<T>> => {
    return httpClient.patch<T>(url, data, config);
  },

  // DELETE запрос
  delete: <T = unknown>(
    url: string,
    config?: AxiosRequestConfig & RequestConfig
  ): Promise<AxiosResponse<T>> => {
    return httpClient.delete<T>(url, config);
  },
};

// Экспорт экземпляра для прямого доступа (если нужно)
export default httpClient;

// Экспорт утилит для работы с токенами
export const tokenUtils = {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
};

