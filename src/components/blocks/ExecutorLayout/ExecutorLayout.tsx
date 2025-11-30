import React, { useState } from 'react';
import { SidebarItem } from '@/components/shared/SidebarItem';
import { PanelLeftCloseIcon, PanelLeftIcon, LogoIcon, OrdersIcon, CalendarOrdersIcon, ToolsIcon } from '@/components/shared/SidebarItem/icons';
import { Header } from '@/components/blocks/Layout/Header';
import { CalendarOrders } from '@/pages/Executors/components/CalendarOrders';
import styles from './ExecutorLayout.module.css';

export interface ExecutorLayoutProps {
  children?: React.ReactNode;
  className?: string;
}

export const ExecutorLayout = ({ children, className }: ExecutorLayoutProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('orders');

  const handleToggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`${styles.root} ${className || ''}`}>
      <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
        {!isCollapsed && (
          <>
            <div className={styles.sidebarContent}>
              <div className={styles.sidebarHeader}>
                <div className={styles.logoSection}>
                  <div className={styles.logoIcon}>
                    <LogoIcon />
                  </div>
                  <p className={styles.logoText}>RePlan</p>
                </div>
                <button 
                  className={styles.collapseButton} 
                  onClick={handleToggleSidebar}
                  aria-label="Свернуть сайдбар" 
                  type="button"
                >
                  <PanelLeftCloseIcon />
                </button>
              </div>

              <div className={styles.sidebarSections}>
                <div className={styles.section}>
                  <SidebarItem 
                    icon={<OrdersIcon />}
                    variant={activeItem === 'orders' ? 'active' : 'default'}
                    onClick={() => setActiveItem('orders')}
                  >
                    Заявки
                  </SidebarItem>
                  <SidebarItem 
                    icon={<CalendarOrdersIcon />}
                    variant={activeItem === 'calendar' ? 'active' : 'default'}
                    onClick={() => setActiveItem('calendar')}
                  >
                    Календарь заказов
                  </SidebarItem>
                  <SidebarItem 
                    icon={<ToolsIcon />}
                    variant={activeItem === 'tools' ? 'active' : 'default'}
                    onClick={() => setActiveItem('tools')}
                  >
                    Инструменты
                  </SidebarItem>
                </div>
              </div>
            </div>

            <div className={styles.sidebarFooter}>
              <div className={styles.executorProfile}>
                <div className={styles.executorAvatar}>
                  <img 
                    src="/placeholder-executor.png" 
                    alt="Аватар исполнителя" 
                    className={styles.avatarImage}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const placeholder = target.nextElementSibling as HTMLElement;
                      if (placeholder) {
                        placeholder.style.display = 'flex';
                      }
                    }}
                  />
                  <div className={styles.avatarPlaceholder}>
                    А
                  </div>
                </div>
                <div className={styles.executorInfo}>
                  <p className={styles.executorName}>Анатолий</p>
                  <p className={styles.executorRole}>Исполнитель</p>
                </div>
              </div>
            </div>
          </>
        )}
        {isCollapsed && (
          <button 
            className={styles.expandButton} 
            onClick={handleToggleSidebar}
            aria-label="Развернуть сайдбар" 
            type="button"
          >
            <PanelLeftIcon />
          </button>
        )}
      </aside>
      <div className={styles.content}>
        <Header 
          title={
            activeItem === 'orders' 
              ? 'Заявки' 
              : activeItem === 'calendar' 
              ? 'Календарь заказов' 
              : 'Инструменты'
          } 
          showEditIcon={false} 
        />
        {activeItem === 'calendar' ? (
          <CalendarOrders />
        ) : (
          children
        )}
      </div>
    </div>
  );
};

