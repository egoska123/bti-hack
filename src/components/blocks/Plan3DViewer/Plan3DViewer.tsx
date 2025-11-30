import { useRef, useState, useMemo } from 'react';
import type { Plan3DViewerProps } from './types';
import type { OrderPlanVersion } from '@/types/plan3d';
import { usePlan3DThree } from './hooks/usePlan3DThree';
import styles from './Plan3DViewer.module.css';

// Компонент для просмотра 3D плана и прогулки от первого лица
// Компонент отображает 3D модель плана на основе данных OrderPlanVersion.
// Поддерживает два режима:
// - view: режим просмотра с возможностью вращения, масштабирования и панорамирования
// - walk: режим прогулки от первого лица с управлением клавиатурой
export const Plan3DViewer = ({
  data,
  className,
  mode = 'view',
  initialCameraPosition,
  initialCameraRotation,
  walkSpeed = 2.0,
  rotationSpeed = 0.05,
  cameraHeight = 1.7,
  onElementSelect,
  onObject3DSelect,
  onCameraPositionChange,
  onCameraRotationChange,
}: Plan3DViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentMode, setCurrentMode] = useState<'view' | 'walk'>(mode);

  // Парсим данные внутри компонента
  const planVersion = useMemo<OrderPlanVersion | null>(() => {
    try {
      if (typeof data === 'string') {
        return JSON.parse(data) as OrderPlanVersion;
      }
      return data;
    } catch (error) {
      console.error('Failed to parse JSON data:', error);
      return null;
    }
  }, [data]);

  // Если данные невалидны, показываем сообщение об ошибке
  if (!planVersion) {
    return (
      <div className={`${styles.root} ${className || ''}`}>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>Ошибка загрузки данных плана</p>
        </div>
      </div>
    );
  }

  // Инициализация Three.js и создание сцены
  usePlan3DThree(containerRef, planVersion.plan, {
    mode: currentMode,
    walkSpeed,
    rotationSpeed,
    cameraHeight,
    initialCameraPosition,
    initialCameraRotation,
    onElementSelect,
    onObject3DSelect,
    onCameraPositionChange,
    onCameraRotationChange,
  });

  // Переключение режимов
  const handleModeToggle = () => {
    const newMode = currentMode === 'view' ? 'walk' : 'view';
    setCurrentMode(newMode);
  };

  return (
    <div className={`${styles.root} ${className || ''}`} data-mode={currentMode}>
      <div ref={containerRef} className={styles.canvasContainer} />
      
      {/* Панель управления */}
      <div className={styles.controls}>
        <button
          type="button"
          onClick={handleModeToggle}
          className={styles.modeButton}
          aria-label={currentMode === 'view' ? 'Переключить в режим прогулки' : 'Переключить в режим просмотра'}
        >
          {currentMode === 'view' ? 'Прогулка' : 'Просмотр'}
        </button>
        
        {currentMode === 'walk' && (
          <div className={styles.walkInstructions}>
            <p>WASD - движение</p>
            <p>Shift - бег</p>
            <p>Мышь - поворот камеры</p>
            <p>Клик - активировать управление</p>
          </div>
        )}
      </div>
    </div>
  );
};

