import { forwardRef } from 'react';
import { usePromptInput } from './hooks/usePromptInput';
import { AttachIcon, FormulaIcon, SendIcon } from './icons';
import styles from './PromptInput.module.css';

export interface PromptInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  onSend?: (value: string) => void;
}

export const PromptInput = forwardRef<HTMLInputElement, PromptInputProps>(
  ({ className, onSend, ...props }, ref) => {
    const { value, handleSubmit, handleKeyDown, handleChange } = usePromptInput({ onSend });

    return (
      <form className={`${styles.root} ${className || ''}`} onSubmit={handleSubmit}>
        <button type="button" className={styles.attachButton} aria-label="Прикрепить файл">
          <AttachIcon />
        </button>
        <input
          ref={ref}
          type="text"
          className={styles.input}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Спросите что-нибудь..."
          {...props}
        />
        <button type="button" className={styles.mathButton} aria-label="Математические функции">
          <FormulaIcon />
        </button>
        <button type="submit" className={styles.sendButton} aria-label="Отправить">
          <SendIcon />
        </button>
      </form>
    );
  }
);

PromptInput.displayName = 'PromptInput';

