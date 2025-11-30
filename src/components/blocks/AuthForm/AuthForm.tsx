import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/shared/Input';
import { Button } from '@/components/shared/Button';
import { useLoginMutation, useRegisterClientMutation } from '@/hooks/queries/useAuthQuery';
import replanLogo from '@/assets/icons/replan-logo.svg';
import brandBg from '@/assets/images/brand-bg.jpg';
import styles from './AuthForm.module.css';

export interface AuthFormProps {
  className?: string;
  mode?: 'login' | 'both'; // 'login' - только вход, 'both' - вход и регистрация
}

export const AuthForm = ({ className, mode = 'both' }: AuthFormProps) => {
  const [isLogin, setIsLogin] = useState(mode === 'login' ? true : false);
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterClientMutation();

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    // Очищаем форму при переключении
    setEmail('');
    setPassword('');
    setFullName('');
    setPhone('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLogin) {
      // Вход (моковые данные - просто редирект)
      try {
        await loginMutation.mutateAsync({ email, password });
        navigate('/editor');
      } catch (error) {
        // В моковом режиме ошибок не будет, но на всякий случай
        console.error('Ошибка входа:', error);
      }
    } else {
      // Регистрация (моковые данные - просто редирект)
      try {
        await registerMutation.mutateAsync({
          email,
          password,
          fullName,
          phone,
          is_admin: false,
        });
        // После успешной регистрации автоматически входим
        try {
          await loginMutation.mutateAsync({ email, password });
          navigate('/editor');
        } catch (loginError) {
          // В моковом режиме ошибок не будет
          console.error('Ошибка входа после регистрации:', loginError);
        }
      } catch (error) {
        // В моковом режиме ошибок не будет
        console.error('Ошибка регистрации:', error);
      }
    }
  };

  return (
    <div className={`${styles.root} ${className || ''}`}>
      <div className={styles.brandSection}>
        <div className={styles.brandBackground}>
          <img src={brandBg} alt="" className={styles.brandImage} aria-hidden="true" />
          <div className={styles.brandOverlay} />
        </div>
        <div className={styles.brandHeader}>
          <div className={styles.logo}>
            <img
              src={replanLogo}
              alt="RePlan"
              className={styles.logoIcon}
            />
            <p className={styles.logoText}>RePlan</p>
          </div>
        </div>
        <div className={styles.brandContent}>
        </div>
      </div>
      <div className={styles.formSection}>
        <div className={styles.formHeader}>
          <Button variant="accent" size="md" onClick={handleToggleMode} type="button">
            {isLogin ? 'Зарегистрироваться' : 'Войти'}
          </Button>
        </div>
        <div className={styles.formContent}>
          <div className={styles.authCard}>
            <div className={styles.authCardHeader}>
              <h1 className={styles.authTitle}>
                {isLogin ? 'Вход в аккаунт' : 'Регистрация аккаунта'}
              </h1>
            </div>
            <div className={styles.authCardContent}>
              <form className={styles.form} onSubmit={handleSubmit}>
                {!isLogin && (
                  <div className={styles.inputGroup}>
                    <Input
                      type="text"
                      placeholder="ФИО"
                      aria-label="ФИО"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                )}
                <div className={styles.inputGroup}>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    aria-label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                {!isLogin && (
                  <div className={styles.inputGroup}>
                    <Input
                      type="tel"
                      placeholder="Телефон"
                      aria-label="Телефон"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                )}
                <div className={styles.inputGroup}>
                  <Input
                    type="password"
                    placeholder="Пароль"
                    aria-label="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  variant="primary" 
                  size="lg" 
                  type="submit" 
                  className={styles.submitButton}
                  disabled={loginMutation.isPending || registerMutation.isPending}
                >
                  {loginMutation.isPending || registerMutation.isPending
                    ? 'Загрузка...'
                    : isLogin
                    ? 'Войти'
                    : 'Зарегистрироваться'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

