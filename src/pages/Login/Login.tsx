import { AuthForm } from '@/components/blocks/AuthForm';
import styles from './Login.module.css';

export const Login = () => {
  // Убрано: проверка авторизации (используются только моковые данные)

  return (
    <div className={styles.root}>
      <AuthForm />
    </div>
  );
};

