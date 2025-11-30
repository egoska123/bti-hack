import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { STATUS_LABELS, STATUS_COLORS, ORDERS_DATA, type OrderRow } from '../../constants';
import styles from './OrdersTable.module.css';

export const OrdersTable = () => {
  const navigate = useNavigate();
  
  // Используем моковые данные напрямую
  const orders = useMemo(() => {
    return ORDERS_DATA;
  }, []);

  const [localOrders, setLocalOrders] = useState<OrderRow[]>([]);
  const [editingCell, setEditingCell] = useState<{ rowId: string; field: keyof OrderRow } | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // Синхронизируем локальное состояние с моковыми данными
  useEffect(() => {
    if (orders.length > 0) {
      setLocalOrders(orders);
    }
  }, [orders]);

  // Используем локальные данные для редактирования, иначе моковые данные
  const displayOrders = localOrders.length > 0 ? localOrders : orders;

  const handleCellClick = (rowId: string, field: keyof OrderRow, currentValue: string | number) => {
    setEditingCell({ rowId, field });
    setEditValue(String(currentValue));
  };

  const handleCellBlur = () => {
    if (editingCell && editValue) {
      setLocalOrders((prev) =>
        prev.map((order) => {
          if (order.id === editingCell.rowId) {
            return {
              ...order,
              [editingCell.field]: editingCell.field === 'amount' ? Number(editValue) : editValue,
            };
          }
          return order;
        })
      );
    }
    setEditingCell(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCellBlur();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
      setEditValue('');
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Убрано: проверка isLoading и error (используются только моковые данные)

  return (
    <div className={styles.tableWrapper}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>№ заказа</TableHead>
            <TableHead>Клиент</TableHead>
            <TableHead>Адрес</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Дата</TableHead>
            <TableHead>Сумма</TableHead>
            <TableHead>Подробности</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayOrders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-lg)' }}>
                Заказы не найдены
              </TableCell>
            </TableRow>
          ) : (
            displayOrders.map((order) => (
            <TableRow key={order.id}>
              <TableCell
                className={styles.editableCell}
                onClick={() => handleCellClick(order.id, 'orderNumber', order.orderNumber)}
              >
                {editingCell?.rowId === order.id && editingCell?.field === 'orderNumber' ? (
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={handleCellBlur}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    className={styles.editInput}
                  />
                ) : (
                  order.orderNumber
                )}
              </TableCell>
              <TableCell
                className={styles.editableCell}
                onClick={() => handleCellClick(order.id, 'clientName', order.clientName)}
              >
                {editingCell?.rowId === order.id && editingCell?.field === 'clientName' ? (
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={handleCellBlur}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    className={styles.editInput}
                  />
                ) : (
                  order.clientName
                )}
              </TableCell>
              <TableCell
                className={styles.editableCell}
                onClick={() => handleCellClick(order.id, 'address', order.address)}
              >
                {editingCell?.rowId === order.id && editingCell?.field === 'address' ? (
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={handleCellBlur}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    className={styles.editInput}
                  />
                ) : (
                  order.address
                )}
              </TableCell>
              <TableCell>
                <span
                  className={styles.statusBadge}
                  style={{ color: STATUS_COLORS[order.status] }}
                >
                  {STATUS_LABELS[order.status]}
                </span>
              </TableCell>
              <TableCell
                className={styles.editableCell}
                onClick={() => handleCellClick(order.id, 'date', order.date)}
              >
                {editingCell?.rowId === order.id && editingCell?.field === 'date' ? (
                  <Input
                    type="date"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={handleCellBlur}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    className={styles.editInput}
                  />
                ) : (
                  formatDate(order.date)
                )}
              </TableCell>
              <TableCell
                className={styles.editableCell}
                onClick={() => handleCellClick(order.id, 'amount', order.amount)}
              >
                {editingCell?.rowId === order.id && editingCell?.field === 'amount' ? (
                  <Input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={handleCellBlur}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    className={styles.editInput}
                  />
                ) : (
                  formatAmount(order.amount)
                )}
              </TableCell>
              <TableCell>
                <Button
                  className={styles.detailsButton}
                  onClick={() => {
                    navigate(`/executors/orders/${order.id}`);
                  }}
                  type="button"
                >
                  Перейти
                </Button>
              </TableCell>
            </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

