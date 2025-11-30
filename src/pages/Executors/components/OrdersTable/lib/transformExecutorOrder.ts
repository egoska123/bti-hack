import type { ExecutorOrder } from '@/api/orders';
import type { OrderRow } from '../../../constants';

/**
 * Преобразует заказ исполнителя из API в формат для таблицы
 */
export const transformExecutorOrderToOrderRow = (executorOrder: ExecutorOrder): OrderRow => {
  // Маппинг статуса из API в статусы таблицы
  const statusMap: Record<string, OrderRow['status']> = {
    pending: 'pending',
    in_progress: 'in_progress',
    completed: 'completed',
    cancelled: 'cancelled',
  };

  // Преобразуем статус, если он не совпадает - используем 'pending' по умолчанию
  const status = statusMap[executorOrder.status.toLowerCase()] || 'pending';

  // Форматируем дату создания
  const date = new Date(executorOrder.createdAt).toISOString().split('T')[0];

  // Генерируем номер заказа из ID (первые 8 символов)
  const orderNumber = `ORD-${executorOrder.id.substring(0, 8).toUpperCase()}`;

  return {
    id: executorOrder.id,
    orderNumber,
    clientName: executorOrder.serviceTitle || 'Не указано',
    address: executorOrder.address,
    status,
    date,
    amount: executorOrder.totalPrice,
  };
};


