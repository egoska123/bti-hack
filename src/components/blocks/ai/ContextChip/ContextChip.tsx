import styles from './ContextChip.module.css';

export interface ContextChipProps {
  elementId: string;
  label: string;
  onRemove: (elementId: string) => void;
}

export const ContextChip = ({ elementId, label, onRemove }: ContextChipProps) => {
  return (
    <div className={styles.root}>
      <span className={styles.label}>{label}</span>
      <button
        type="button"
        className={styles.removeButton}
        onClick={() => onRemove(elementId)}
        aria-label="Удалить из контекста"
      >
        ×
      </button>
    </div>
  );
};

