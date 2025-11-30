import type { ChatMessage as ChatMessageType } from '../types';
import type { LayoutMode } from '@/components/blocks/Layout';
import { formatMessageTime } from '../lib/formatMessageTime';
import styles from './ChatMessage.module.css';

export interface ChatMessageProps {
  message: ChatMessageType;
  className?: string;
  mode?: LayoutMode;
  onModeChange?: (mode: LayoutMode) => void;
}

export const ChatMessage = ({ message, className, mode, onModeChange }: ChatMessageProps) => {
  const isUser = message.senderType === 'user';
  const isAssistant = message.senderType === 'assistant';

  const handleImageClick = () => {
    // Если изображение от ассистента и режим 'chat', переключаем на 'editor'
    if (isAssistant && mode === 'chat' && onModeChange) {
      onModeChange('editor');
    }
    // Если режим 'editor', ничего не делаем
  };

  return (
    <div
      className={`${styles.root} ${isUser ? styles.user : ''} ${isAssistant ? styles.assistant : ''} ${className || ''}`}
    >
      <div className={styles.content}>
        {message.images && message.images.length > 0 && (
          <div className={styles.imagesContainer}>
            {message.images.map((imageUrl, index) => (
              <img
                key={index}
                src={imageUrl}
                alt={`Изображение ${index + 1}`}
                className={`${styles.messageImage} ${isAssistant && mode === 'chat' ? styles.clickable : ''}`}
                onClick={isAssistant ? handleImageClick : undefined}
                style={{ cursor: isAssistant && mode === 'chat' ? 'pointer' : 'default' }}
              />
            ))}
          </div>
        )}
        {message.messageText && (
          <div className={styles.messageText}>{message.messageText}</div>
        )}
        <div className={styles.timestamp}>{formatMessageTime(message.createdAt)}</div>
      </div>
    </div>
  );
};

