import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

export const useThree3DSelection = (
  sceneRef: React.RefObject<THREE.Scene | null>,
  cameraRef: React.RefObject<THREE.PerspectiveCamera | null>,
  rendererRef: React.RefObject<THREE.WebGLRenderer | null>,
  pointerLockControlsRef: React.RefObject<PointerLockControls | null>,
  mode: 'view' | 'walk',
  onElementSelect?: (elementId: string | null) => void,
  onObject3DSelect?: (objectId: string | null) => void
) => {
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  useEffect(() => {
    if (mode !== 'view') return; // Выбор только в режиме просмотра

    const camera = cameraRef.current;
    const scene = sceneRef.current;
    const renderer = rendererRef.current;
    if (!camera || !scene || !renderer) return;

    const handleClick = (event: MouseEvent) => {
      if (!camera || !scene || !renderer) return;

      // Вычисляем позицию мыши в нормализованных координатах
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Обновляем raycaster
      raycasterRef.current.setFromCamera(mouseRef.current, camera);

      // Получаем все объекты в сцене
      const intersectableObjects: THREE.Object3D[] = [];
      scene.traverse((object) => {
        if (
          object instanceof THREE.Mesh ||
          (object instanceof THREE.Group && object.userData.element)
        ) {
          intersectableObjects.push(object);
        }
      });

      // Проверяем пересечения
      const intersects = raycasterRef.current.intersectObjects(
        intersectableObjects,
        true
      );

      if (intersects.length > 0) {
        const intersected = intersects[0].object;

        // Проверяем тип объекта
        if (intersected.userData.element) {
          const element = intersected.userData.element;
          if (onElementSelect) {
            onElementSelect(element.id);
          }
        } else if (intersected.userData.object) {
          const object = intersected.userData.object;
          if (onObject3DSelect) {
            onObject3DSelect(object.id);
          }
        }
      } else {
        // Сброс выбора
        if (onElementSelect) {
          onElementSelect(null);
        }
        if (onObject3DSelect) {
          onObject3DSelect(null);
        }
      }
    };

    renderer.domElement.addEventListener('click', handleClick);

    return () => {
      renderer.domElement.removeEventListener('click', handleClick);
    };
  }, [
    mode,
    cameraRef,
    sceneRef,
    rendererRef,
    pointerLockControlsRef,
    onElementSelect,
    onObject3DSelect,
  ]);
};

