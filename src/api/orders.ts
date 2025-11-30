import { api } from './httpClient';
import type { ApiResponse, PaginatedResponse, RequestConfig } from './types';
import { ORDERS_DATA } from '@/pages/Executors/constants';

export interface Order {
  id: string;
  orderNumber: string;
  clientName: string;
  address: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  date: string;
  amount: number;
}

export interface CreateOrderDto {
  clientName: string;
  address: string;
  amount: number;
}

export interface UpdateOrderDto {
  clientName?: string;
  address?: string;
  status?: Order['status'];
  date?: string;
  amount?: number;
}

export interface OrderFilters {
  status?: Order['status'];
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

// Получить список заказов (моковые данные)
export const getOrders = async (
  filters?: OrderFilters,
  config?: RequestConfig
): Promise<PaginatedResponse<Order>> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  let filteredOrders = [...ORDERS_DATA];
  
  if (filters?.status) {
    filteredOrders = filteredOrders.filter(order => order.status === filters.status);
  }
  
  if (filters?.dateFrom) {
    filteredOrders = filteredOrders.filter(order => order.date >= filters.dateFrom!);
  }
  
  if (filters?.dateTo) {
    filteredOrders = filteredOrders.filter(order => order.date <= filters.dateTo!);
  }
  
  const page = filters?.page || 1;
  const limit = filters?.limit || 10;
  const start = (page - 1) * limit;
  const end = start + limit;
  
  return {
    data: filteredOrders.slice(start, end),
    total: filteredOrders.length,
    page,
    limit,
    totalPages: Math.ceil(filteredOrders.length / limit),
  };
};

// Получить заказ по ID (моковые данные)
export const getOrderById = async (
  id: string,
  config?: RequestConfig
): Promise<Order> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const order = ORDERS_DATA.find(o => o.id === id);
  if (!order) {
    throw new Error('Заказ не найден');
  }
  return order;
};

// Создать заказ (моковые данные)
export const createOrder = async (
  data: CreateOrderDto,
  config?: RequestConfig
): Promise<Order> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const newOrder: Order = {
    id: 'mock-order-' + Date.now(),
    orderNumber: 'ORD-' + String(ORDERS_DATA.length + 1).padStart(3, '0'),
    clientName: data.clientName,
    address: data.address,
    status: 'pending',
    date: new Date().toISOString().split('T')[0],
    amount: data.amount,
  };
  return newOrder;
};

// Обновить заказ (моковые данные)
export const updateOrder = async (
  id: string,
  data: UpdateOrderDto,
  config?: RequestConfig
): Promise<Order> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const order = ORDERS_DATA.find(o => o.id === id);
  if (!order) {
    throw new Error('Заказ не найден');
  }
  return { ...order, ...data };
};

// Удалить заказ (моковые данные)
export const deleteOrder = async (
  id: string,
  config?: RequestConfig
): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 200));
};

// Интерфейс для заказа исполнителя из API
export interface ExecutorOrder {
  id: string;
  status: string;
  serviceTitle: string;
  totalPrice: number;
  createdAt: string;
  complexity: string;
  address: string;
  departmentCode: string;
}

// Получить список заказов исполнителя (моковые данные)
export const getExecutorOrders = async (
  config?: RequestConfig
): Promise<ExecutorOrder[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Преобразуем ORDERS_DATA в формат ExecutorOrder
  return ORDERS_DATA.map(order => ({
    id: order.id,
    status: order.status,
    serviceTitle: `Услуга для заказа ${order.orderNumber}`,
    totalPrice: order.amount,
    createdAt: order.date,
    complexity: 'medium',
    address: order.address,
    departmentCode: 'DEPT-001',
  }));
};

