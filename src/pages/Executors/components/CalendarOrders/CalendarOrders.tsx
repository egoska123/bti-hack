import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { CALENDAR_ORDERS_DATA } from '../../constants';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import styles from './CalendarOrders.module.css';

export const CalendarOrders = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Получаем даты из заказов для выделения в календаре
  const orderDates = CALENDAR_ORDERS_DATA.map((order) => {
    const [day, month, year] = order.date.split('.');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }).filter((date) => !isNaN(date.getTime()));

  // Форматируем дату для отображения в date picker
  const formatDateRange = (date: Date | undefined) => {
    if (!date) return 'Выберите дату';
    return format(date, 'dd MMM, yyyy', { locale: ru });
  };

  return (
    <div className={styles.container}>
      <div className={styles.ordersList}>
        {CALENDAR_ORDERS_DATA.map((order) => (
          <div key={order.id} className={styles.card}>
            <div className={styles.cardContent}>
              <div className={styles.header}>
                <div className={styles.visitNumber}>
                  <p className={styles.visitNumberText}>Выезд №{order.visitNumber}</p>
                </div>
                <div className={styles.date}>
                  <p className={styles.dateText}>{order.date}</p>
                </div>
              </div>
              <div className={styles.info}>
                <p className={styles.infoText}>Адрес: {order.address}</p>
              </div>
              <div className={styles.info}>
                <p className={styles.infoText}>Услуга: {order.service}</p>
              </div>
              <div className={styles.info}>
                <p className={styles.infoText}>Контекст: {order.context}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.calendarSection}>
        <div className={styles.datePicker}>
          <div className={styles.datePickerIcon}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.6667 2.66667H12V2C12 1.63181 11.7015 1.33333 11.3333 1.33333C10.9651 1.33333 10.6667 1.63181 10.6667 2V2.66667H5.33333V2C5.33333 1.63181 5.03486 1.33333 4.66667 1.33333C4.29848 1.33333 4 1.63181 4 2V2.66667H3.33333C2.59695 2.66667 2 3.26362 2 4V13.3333C2 14.0697 2.59695 14.6667 3.33333 14.6667H12.6667C13.403 14.6667 14 14.0697 14 13.3333V4C14 3.26362 13.403 2.66667 12.6667 2.66667ZM12.6667 13.3333H3.33333V6.66667H12.6667V13.3333Z" fill="currentColor"/>
            </svg>
          </div>
          <p className={styles.datePickerText}>
            {formatDateRange(selectedDate)}
          </p>
        </div>
        <div className={styles.calendarWrapper}>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            locale={ru}
            className={styles.calendar}
            modifiers={{
              hasOrder: orderDates,
            }}
            modifiersClassNames={{
              hasOrder: styles.hasOrder,
            }}
          />
        </div>
        <Button className={styles.selectButton} variant="default">
          Выбрать
        </Button>
      </div>
    </div>
  );
};

