import { forwardRef } from 'react';
import { DotsIcon } from './icons';
import styles from './SidebarItem.module.css';

export interface SidebarItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  children: React.ReactNode;
  variant?: 'default' | 'active' | 'disabled';
  badge?: number | string;
  hasSubmenu?: boolean;
  className?: string;
}

export const SidebarItem = forwardRef<HTMLButtonElement, SidebarItemProps>(
  (
    {
      icon,
      children,
      variant = 'default',
      badge,
      hasSubmenu = false,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || variant === 'disabled';
    const effectiveVariant = isDisabled ? 'disabled' : variant;

    return (
      <button
        ref={ref}
        className={`${styles.root} ${styles[effectiveVariant]} ${className || ''}`}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        {...props}
      >
        <div className={styles.container}>
          {icon && (
            <div className={styles.icon} aria-hidden="true">
              {icon}
            </div>
          )}
          <div className={styles.content}>
            <span className={styles.text}>{children}</span>
          </div>
          {badge !== undefined && (
            <div className={styles.badge} aria-label={`Уведомлений: ${badge}`}>
              {badge}
            </div>
          )}
          {hasSubmenu && (
            <div className={styles.submenuIndicator} aria-hidden="true">
              <DotsIcon />
            </div>
          )}
        </div>
      </button>
    );
  }
);

SidebarItem.displayName = 'SidebarItem';

