import { useParams } from 'react-router-dom';
import { ExecutorLayout } from '@/components/blocks/ExecutorLayout';
import { ModelPreview } from '@/components/blocks/OrderDetail/ModelPreview';
import { DocumentPreview } from '@/components/blocks/OrderDetail/DocumentPreview';
import { ORDERS_DATA } from '../constants';
import { ORDER_DETAILS_MOCK } from './constants';
import styles from './OrderDetail.module.css';

export const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();

  const order = ORDERS_DATA.find((o) => o.id === id);
  const orderDetail = id ? ORDER_DETAILS_MOCK[id] : null;

  if (!order) {
    return (
      <div className={styles.root}>
        <ExecutorLayout>
          <div className={styles.content}>
            <p>Заявка не найдена</p>
          </div>
        </ExecutorLayout>
      </div>
    );
  }

  // Используем данные из констант или дефолтные значения
  const description = orderDetail?.description || [
    'Снос стен: 1,2',
    'Перепланировка комнат',
  ];

  const visitDates = orderDetail?.visitDates || [
    '12.12.2025 12:00-16:00',
    '13.12.2025 12:00-16:00',
    '14.12.2025 12:00-16:00',
  ];

  const model2DUrl = orderDetail?.model2DUrl || '';
  const model3DUrl = orderDetail?.model3DUrl || '';
  const documents = orderDetail?.documents || [];

  const handleModelFullscreen = (type: '2d' | '3d') => {
    // TODO: Реализовать открытие в полном размере
    console.log(`Open ${type} model in fullscreen`);
  };

  const handleDocumentFullscreen = (documentId: string) => {
    // TODO: Реализовать открытие документа в полном размере
    console.log(`Open document ${documentId} in fullscreen`);
  };

  return (
    <div className={styles.root}>
      <ExecutorLayout>
        <div className={styles.wrapper}>
          <div className={styles.content}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Описание:</h2>
            <ol className={styles.list}>
              {description.map((item, index) => (
                <li key={index} className={styles.listItem}>
                  {item}
                </li>
              ))}
            </ol>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Даты посещения:</h2>
            <ol className={styles.list}>
              {visitDates.map((date, index) => (
                <li key={index} className={styles.listItem}>
                  {date}
                </li>
              ))}
            </ol>
          </div>

          <div className={styles.modelsContainer}>
            <ModelPreview
              previewUrl={model2DUrl}
              title="2D модель"
              onFullscreen={() => handleModelFullscreen('2d')}
            />
            <ModelPreview
              previewUrl={model3DUrl}
              title="3D модель:"
              onFullscreen={() => handleModelFullscreen('3d')}
            />
          </div>

          <div className={styles.documentsSection}>
            <div className={styles.documentsHeader}>
              <h2 className={styles.documentsTitle}>Прикреплённые документ</h2>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={styles.documentIcon}
              >
                <path
                  d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14 2V8H20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 13H8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 17H8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 9H9H8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className={styles.documentsList}>
              {documents.map((doc) => (
                <DocumentPreview
                  key={doc.id}
                  previewUrl={doc.previewUrl}
                  name={doc.name}
                  onFullscreen={() => handleDocumentFullscreen(doc.id)}
                />
              ))}
            </div>
          </div>
        </div>
        </div>
      </ExecutorLayout>
    </div>
  );
};

