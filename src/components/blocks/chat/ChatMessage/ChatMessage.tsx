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

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Если изображение от ассистента и режим 'chat', переключаем на 'editor'
    if (isAssistant && mode === 'chat' && onModeChange) {
      console.log('[ChatMessage] Image clicked, switching to editor mode');
      onModeChange('editor');
    } else {
      console.log('[ChatMessage] Image click ignored:', {
        isAssistant,
        mode,
        hasOnModeChange: !!onModeChange,
      });
    }
  };

  // Проверяем, является ли изображение кликабельным (от ассистента в режиме чата)
  const isImageClickable = isAssistant && mode === 'chat' && onModeChange;

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
                className={`${styles.messageImage} ${isImageClickable ? styles.clickable : ''}`}
                onClick={isImageClickable ? handleImageClick : undefined}
                onMouseDown={(e) => {
                  if (isImageClickable) {
                    e.preventDefault();
                  }
                }}
                style={{ 
                  cursor: isImageClickable ? 'pointer' : 'default',
                  userSelect: 'none',
                }}
                draggable={false}
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

