import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './keys';
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  getExecutorOrders,
  type Order,
  type CreateOrderDto,
  type UpdateOrderDto,
  type OrderFilters,
  type ExecutorOrder,
} from '@/api/orders';

// Получить список заказов
export const useOrdersQuery = (filters?: OrderFilters) => {
  return useQuery({
    queryKey: queryKeys.orders.list(filters),
    queryFn: () => getOrders(filters),
  });
};

// Получить заказ по ID
export const useOrderQuery = (id: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => getOrderById(id),
    enabled: enabled && !!id,
  });
};

// Создать заказ
export const useCreateOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrderDto) => createOrder(data),
    onSuccess: () => {
      // Инвалидируем список заказов после создания
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() });
    },
  });
};

// Обновить заказ
export const useUpdateOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderDto }) =>
      updateOrder(id, data),
    onSuccess: (_, variables) => {
      // Инвалидируем конкретный заказ и список
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() });
    },
  });
};

// Удалить заказ
export const useDeleteOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteOrder(id),
    onSuccess: () => {
      // Инвалидируем список заказов после удаления
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() });
    },
  });
};

// Получить список заказов исполнителя
export const useExecutorOrdersQuery = () => {
  return useQuery({
    queryKey: queryKeys.executorOrders.list(),
    queryFn: () => getExecutorOrders(),
  });
};

