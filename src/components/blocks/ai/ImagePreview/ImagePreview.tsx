import styles from './ImagePreview.module.css';

export interface ImagePreviewProps {
  file: File;
  previewUrl: string;
  onRemove: () => void;
}

export const ImagePreview = ({ file, previewUrl, onRemove }: ImagePreviewProps) => {
  return (
    <div className={styles.root}>
      <img src={previewUrl} alt={file.name} className={styles.image} />
      <button
        type="button"
        className={styles.removeButton}
        onClick={onRemove}
        aria-label="Удалить изображение"
      >
        ×
      </button>
    </div>
  );
};

