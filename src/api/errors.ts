import type { AxiosError } from 'axios';
import type { ApiError } from './types';

export class HttpError extends Error {
  status?: number;
  code?: string;
  errors?: Record<string, string[]>;

  constructor(message: string, status?: number, code?: string, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof HttpError) {
    return {
      message: error.message,
      status: error.status,
      code: error.code,
      errors: error.errors,
    };
  }

  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError<{ 
      message?: string; 
      errors?: Record<string, string[]>;
      detail?: Array<{ loc: (string | number)[]; msg: string; type: string }>;
    }>;
    
    if (axiosError.response) {
      const { status, data } = axiosError.response;
      
      // Обработка ошибок валидации FastAPI (422)
      if (status === 422 && data?.detail && Array.isArray(data.detail)) {
        const validationErrors: Record<string, string[]> = {};
        data.detail.forEach((item) => {
          const field = item.loc[item.loc.length - 1]?.toString() || 'unknown';
          if (!validationErrors[field]) {
            validationErrors[field] = [];
          }
          validationErrors[field].push(item.msg);
        });
        
        return {
          message: 'Ошибка валидации данных',
          status,
          code: axiosError.code,
          errors: validationErrors,
        };
      }
      
      return {
        message: data?.message || axiosError.message || 'Произошла ошибка при выполнении запроса',
        status,
        code: axiosError.code,
        errors: data?.errors,
      };
    }

    if (axiosError.request) {
      return {
        message: 'Сервер не отвечает. Проверьте подключение к интернету',
        code: axiosError.code,
      };
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message || 'Произошла неизвестная ошибка',
    };
  }

  return {
    message: 'Произошла неизвестная ошибка',
  };
};

export const isNetworkError = (error: unknown): boolean => {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code?: string }).code;
    return code === 'ECONNABORTED' || code === 'ERR_NETWORK' || code === 'ETIMEDOUT';
  }
  return false;
};

export const isAuthError = (error: unknown): boolean => {
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status?: number }).status;
    return status === 401 || status === 403;
  }
  return false;
};

