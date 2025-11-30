/**
 * Константы для ключей запросов TanStack Query
 * Используются для инвалидации и управления кэшем
 */

export const queryKeys = {
  // Auth
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
    profile: () => [...queryKeys.auth.all, 'profile'] as const,
  },

  // Orders
  orders: {
    all: ['orders'] as const,
    lists: () => [...queryKeys.orders.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.orders.lists(), filters] as const,
    details: () => [...queryKeys.orders.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.orders.details(), id] as const,
  },

  // Users
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },

  // Executors
  executors: {
    all: ['executors'] as const,
    lists: () => [...queryKeys.executors.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.executors.lists(), filters] as const,
    details: () => [...queryKeys.executors.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.executors.details(), id] as const,
  },

  // Executor Orders
  executorOrders: {
    all: ['executorOrders'] as const,
    lists: () => [...queryKeys.executorOrders.all, 'list'] as const,
    list: () => [...queryKeys.executorOrders.lists()] as const,
  },
} as const;

