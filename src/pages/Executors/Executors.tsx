import { ExecutorLayout } from '@/components/blocks/ExecutorLayout';
import { OrdersTable } from './components/OrdersTable';
import styles from './Executors.module.css';

export const Executors = () => {
  return (
    <div className={styles.root}>
      <ExecutorLayout>
        <div className={styles.content}>
          <OrdersTable />
        </div>
      </ExecutorLayout>
    </div>
  );
};

