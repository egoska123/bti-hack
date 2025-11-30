import { ChatHistory } from '../ChatHistory';
import { useChatContext } from '../ChatContext';
import type { LayoutMode } from '@/components/blocks/Layout';
import styles from './Chat.module.css';

export interface ChatProps {
  className?: string;
  mode?: LayoutMode;
  onModeChange?: (mode: LayoutMode) => void;
  onScrollToBottomChange?: (isScrolledToBottom: boolean) => void;
}

export const Chat = ({ className, mode, onModeChange, onScrollToBottomChange }: ChatProps) => {
  const { messages } = useChatContext();

  return (
    <div className={`${styles.root} ${className || ''}`}>
      <ChatHistory 
        messages={messages} 
        mode={mode} 
        onModeChange={onModeChange}
        onScrollToBottomChange={onScrollToBottomChange}
      />
    </div>
  );
};

