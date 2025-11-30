import { EditIcon } from '@/components/shared/SidebarItem/icons';
import styles from './Header.module.css';

export interface HeaderProps {
  className?: string;
  title?: string;
  showEditIcon?: boolean;
}

export const Header = ({ className, title = 'Новый чат', showEditIcon = true }: HeaderProps) => {
  return (
    <header className={`${styles.root} ${className || ''}`}>
      <div className={styles.leftSection}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>{title}</h1>
          {showEditIcon && (
            <button className={styles.editButton} aria-label="Редактировать" type="button">
              <EditIcon />
            </button>
          )}
        </div>
      </div>
      <div className={styles.rightSection}>
        <button className={styles.helpButton} aria-label="Помощь" type="button">
          <svg
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx={12} cy={12} r={10} stroke="currentColor" strokeWidth={1.5} />
            <path
              d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 17H12.01"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </header>
  );
};

