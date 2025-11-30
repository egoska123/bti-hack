import type { FloorPlanData, FloorPlanElement } from '../types';
import { useThreeSetup } from './useThreeSetup';
import { useThreeObjects } from './useThreeObjects';
import { useThreeSelection } from './useThreeSelection';

export const usePlan2DThree = (
  containerRef: React.RefObject<HTMLDivElement | null>,
  data: FloorPlanData,
  selectedElement: FloorPlanElement | null
) => {
  // Инициализация Three.js (сцена, камера, рендерер, контролы)
  const { sceneRef, cameraRef, rendererRef, controlsRef } = useThreeSetup(containerRef, data);
  
  // Управление объектами (создание, обновление позиции и размеров)
  const { objectsRef, updateElementPosition, updateElement } = useThreeObjects(sceneRef, data);
  
  // Логика выделения элементов
  useThreeSelection(sceneRef, objectsRef, selectedElement);

  return { sceneRef, cameraRef, rendererRef, controlsRef, updateElementPosition, updateElement };
};

