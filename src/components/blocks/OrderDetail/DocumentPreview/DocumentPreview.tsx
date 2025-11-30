import styles from './DocumentPreview.module.css';

export interface DocumentPreviewProps {
  previewUrl: string;
  name?: string;
  onFullscreen?: () => void;
  className?: string;
}

export const DocumentPreview = ({ previewUrl, name, onFullscreen, className }: DocumentPreviewProps) => {
  return (
    <div className={`${styles.root} ${className || ''}`}>
      <div className={styles.imageContainer}>
        <img src={previewUrl} alt={name || 'Документ'} className={styles.image} />
        {onFullscreen && (
          <button
            type="button"
            className={styles.fullscreenButton}
            onClick={onFullscreen}
            aria-label="Открыть в полном размере"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={styles.fullscreenIcon}
            >
              <path
                d="M8 3H5C3.89543 3 3 3.89543 3 5V8M21 8V5C21 3.89543 20.1046 3 19 3H16M16 21H19C20.1046 21 21 20.1046 21 19V16M3 16V19C3 20.1046 3.89543 21 5 21H8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

