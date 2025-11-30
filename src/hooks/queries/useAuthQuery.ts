import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './keys';
import {
  login,
  registerClient,
  logout,
  getCurrentUser,
  type LoginDto,
  type RegisterClientDto,
  type AuthResponse,
} from '@/api/auth';
import { tokenUtils } from '@/api/httpClient';

// Вход
export const useLoginMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginDto) => login(data),
    onSuccess: (data: AuthResponse) => {
      // Проверяем, что данные пришли корректно
      if (!data || !data.accessToken) {
        console.error('Некорректный ответ от сервера:', data);
        throw new Error('Некорректный ответ от сервера: отсутствует accessToken');
      }
      
      // Сохраняем токены (refreshToken может отсутствовать)
      tokenUtils.setTokens(data.accessToken, data.refreshToken || '');
      // Инвалидируем запрос текущего пользователя
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
    },
  });
};

// Регистрация клиента
export const useRegisterClientMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterClientDto) => registerClient(data),
    onSuccess: () => {
      // После успешной регистрации можно автоматически войти или показать сообщение
      // Инвалидируем запрос текущего пользователя
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
    },
  });
};

// Выход
export const useLogoutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      // Удаляем токены
      tokenUtils.clearTokens();
      // Очищаем кэш
      queryClient.clear();
    },
  });
};

// Получить текущего пользователя
export const useCurrentUserQuery = () => {
  return useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: () => getCurrentUser(),
    enabled: !!tokenUtils.getAccessToken(),
  });
};

