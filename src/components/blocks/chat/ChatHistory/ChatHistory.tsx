import { useEffect, useRef, useState, useCallback } from 'react';
import type { ChatMessage } from '../types';
import { ChatMessage as ChatMessageComponent } from '../ChatMessage';
import { useChatContext } from '../ChatContext';
import type { LayoutMode } from '@/components/blocks/Layout';
import styles from './ChatHistory.module.css';

export interface ChatHistoryProps {
  messages: ChatMessage[];
  className?: string;
  mode?: LayoutMode;
  onModeChange?: (mode: LayoutMode) => void;
  onScrollToBottomChange?: (isScrolledToBottom: boolean) => void;
}

export const ChatHistory = ({ messages, className, mode, onModeChange, onScrollToBottomChange }: ChatHistoryProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isLoading } = useChatContext();
  const messagesListRef = useRef<HTMLDivElement>(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);

  // Проверка, прокручен ли чат до конца
  const checkScrollToBottom = useCallback(() => {
    if (!messagesListRef.current) return;
    
    const container = messagesListRef.current;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    
    // Проверяем, находится ли пользователь в пределах 50px от конца
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setIsScrolledToBottom(isAtBottom);
  }, []);

  // Отслеживание прокрутки
  useEffect(() => {
    const container = messagesListRef.current;
    if (!container) return;

    container.addEventListener('scroll', checkScrollToBottom);
    checkScrollToBottom(); // Проверяем при монтировании

    return () => {
      container.removeEventListener('scroll', checkScrollToBottom);
    };
  }, [checkScrollToBottom, messages]);

  // Уведомляем родителя об изменении состояния прокрутки
  useEffect(() => {
    if (onScrollToBottomChange) {
      onScrollToBottomChange(isScrolledToBottom);
    }
  }, [isScrolledToBottom, onScrollToBottomChange]);

  // Автопрокрутка к последнему сообщению при добавлении новых или при загрузке
  useEffect(() => {
    if (isScrolledToBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isScrolledToBottom, isLoading]);

  return (
    <div className={`${styles.root} ${className || ''}`}>
      <div ref={messagesListRef} className={styles.messagesList}>
        {messages.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>Начните диалог, задав вопрос</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessageComponent 
                key={message.id} 
                message={message} 
                mode={mode}
                onModeChange={onModeChange}
              />
            ))}
            {isLoading && (
              <div className={styles.loadingMessage}>
                <div className={styles.loadingDots}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <p className={styles.loadingText}>Ассистент печатает...</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
    </div>
  );
};

