import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarItem } from '@/components/shared/SidebarItem';
import { PlusIcon, SparklesIcon, InboxIcon, InfoIcon, PanelLeftCloseIcon, PanelLeftIcon, LogoIcon } from '@/components/shared/SidebarItem/icons';
import Ai01 from '@/components/blocks/ai/ai-prompt-input-01';
import { SelectionProvider } from '@/components/blocks/ai/SelectionContext';
import { Chat } from '@/components/blocks/chat';
import { ChatProvider } from '@/components/blocks/chat/ChatContext';
import { EditorTools } from './EditorTools';
import { Header } from './Header';
import { PlanProvider } from '@/components/shared/2dPlan/PlanContext';
import type { FloorPlanElement } from '@/components/shared/2dPlan/types';
import styles from './Layout.module.css';

export type LayoutMode = 'editor' | 'chat';

export interface LayoutProps {
  children?: React.ReactNode;
  className?: string;
  mode?: LayoutMode;
  onModeChange?: (mode: LayoutMode) => void;
}

export const Layout = ({ children, className, mode: initialMode = 'editor', onModeChange }: LayoutProps) => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mode, setMode] = useState<LayoutMode>(initialMode);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'toEditor' | 'toChat' | null>(null);
  const [isChatScrolledToBottom, setIsChatScrolledToBottom] = useState(true);
  const addElementRef = useRef<((element: FloorPlanElement) => void) | null>(null);
  const isEditorMode = mode === 'editor';
  const isChatMode = mode === 'chat';
  const showLoadingOverlay = isTransitioning && !isChatScrolledToBottom;

  const handleAddElement = (element: FloorPlanElement) => {
    if (addElementRef.current) {
      addElementRef.current(element);
    }
  };

  // Синхронизируем внутреннее состояние с пропсом
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const handleModeChange = (newMode: LayoutMode) => {
    if (newMode === 'editor' && mode === 'chat') {
      // Запускаем анимацию перехода
      setIsTransitioning(true);
      setTransitionDirection('toEditor');
      // После завершения анимации переключаем режим
      setTimeout(() => {
        setMode(newMode);
        setIsTransitioning(false);
        setTransitionDirection(null);
        if (onModeChange) {
          onModeChange(newMode);
        }
      }, 500); // Длительность анимации
    } else if (newMode === 'chat' && mode === 'editor') {
      // Запускаем анимацию перехода в режим чата
      setIsTransitioning(true);
      setTransitionDirection('toChat');
      setTimeout(() => {
        setMode(newMode);
        setIsTransitioning(false);
        setTransitionDirection(null);
        if (onModeChange) {
          onModeChange(newMode);
        }
      }, 500); // Длительность анимации
    } else {
      setMode(newMode);
      setIsTransitioning(false);
      setTransitionDirection(null);
      if (onModeChange) {
        onModeChange(newMode);
      }
    }
  };

  const handleToggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <SelectionProvider>
      <ChatProvider>
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
                {isEditorMode ? (
                  <PlanProvider onAddElement={handleAddElement}>
                    <div className={styles.section}>
                      <div className={styles.sectionTitle}>Инструменты редактирования</div>
                      <EditorTools />
                    </div>
                  </PlanProvider>
                ) : (
                  <>
                    <div className={styles.section}>
                      <SidebarItem icon={<SparklesIcon />}>Новый файл</SidebarItem>
                      <SidebarItem icon={<InboxIcon />}>Библиотека</SidebarItem>
                    </div>

                    <div className={styles.section}>
                      <div className={styles.sectionTitle}>Проекты</div>
                      <SidebarItem icon={<PlusIcon />}>Новый проект</SidebarItem>
                    </div>

                    <div className={styles.section}>
                      <div className={styles.sectionTitle}>Ваши чаты</div>
                      <SidebarItem hasSubmenu>Ванная комната</SidebarItem>
                      <SidebarItem hasSubmenu>Кухня</SidebarItem>
                      <SidebarItem hasSubmenu>Спальная</SidebarItem>
                      <SidebarItem hasSubmenu>Гостиная</SidebarItem>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className={styles.sidebarFooter}>
              {isEditorMode ? (
                <button
                  className={styles.closeModelButton}
                  onClick={() => handleModeChange('chat')}
                  type="button"
                >
                  Закрыть модель
                </button>
              ) : (
                <SidebarItem 
                  icon={<InfoIcon />}
                  onClick={() => {
                    navigate('/');
                  }}
                >
                  Важная информация
                </SidebarItem>
              )}
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
        <Header />
        {isEditorMode && !isTransitioning && (
          <div className={styles.contentWrapper}>
            {children && (
              <main className={styles.main}>
                {React.isValidElement(children) 
                  ? React.cloneElement(children as React.ReactElement<any>, { onAddElementRef: addElementRef })
                  : children
                }
              </main>
            )}
            <aside className={styles.chatSidebar}>
              <Chat mode={mode} onModeChange={handleModeChange} />
              <div className={styles.chatInput}>
                <Ai01 mode="editor" />
              </div>
            </aside>
          </div>
        )}
        {(isChatMode || (isTransitioning && transitionDirection === 'toChat')) && (
          <div className={`${styles.chatContainer} ${isTransitioning && transitionDirection === 'toEditor' ? styles.slidingOut : ''} ${isTransitioning && transitionDirection === 'toChat' ? styles.slidingInFromRight : ''}`}>
            <Chat 
              mode={isTransitioning && transitionDirection === 'toChat' ? 'chat' : mode} 
              onModeChange={handleModeChange}
              onScrollToBottomChange={setIsChatScrolledToBottom}
            />
            {showLoadingOverlay && (
              <div className={styles.loadingOverlay}>
                <div className={styles.loadingContent}>
                  <div className={styles.loadingSpinner}></div>
                  <p className={styles.loadingText}>Прокрутите до конца, чтобы увидеть чат</p>
                </div>
              </div>
            )}
            <div className={styles.chatInput}>
              <Ai01 mode="chat" />
            </div>
          </div>
        )}
        {isTransitioning && (
          <div className={`${styles.contentWrapper} ${styles.slidingIn}`}>
            {children && <main className={styles.main}>{children}</main>}
            <aside className={styles.chatSidebar}>
              <Chat mode="editor" onModeChange={handleModeChange} />
              <div className={styles.chatInput}>
                <Ai01 mode="editor" />
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
      </ChatProvider>
    </SelectionProvider>
  );
};

