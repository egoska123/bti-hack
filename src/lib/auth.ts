import { tokenUtils } from '@/api/httpClient';

/**
 * Проверяет, есть ли валидный токен доступа
 */
export const isAuthenticated = (): boolean => {
  const token = tokenUtils.getAccessToken();
  if (!token) {
    return false;
  }

  // Проверяем, не истек ли токен (базовая проверка по exp в JWT)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp;
    
    if (exp && Date.now() >= exp * 1000) {
      // Токен истек
      tokenUtils.clearTokens();
      return false;
    }
    
    return true;
  } catch (error) {
    // Если не удалось распарсить токен, считаем его невалидным
    tokenUtils.clearTokens();
    return false;
  }
};

