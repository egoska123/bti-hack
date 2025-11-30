import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { checkWallCollision, getSafeCameraPosition } from '../lib/collisionDetection';
import { getLargestZone } from '../lib/getLargestZone';
import type { Plan } from '@/types/plan3d';
import {
  DEFAULT_CAMERA_HEIGHT,
  DEFAULT_WALK_SPEED,
  DEFAULT_ROTATION_SPEED,
  CAMERA_COLLISION_RADIUS,
} from '../constants';

interface WalkModeState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  run: boolean;
}

export const useThree3DWalkMode = (
  cameraRef: React.RefObject<THREE.PerspectiveCamera | null>,
  pointerLockControlsRef: React.RefObject<PointerLockControls | null>,
  rendererRef: React.RefObject<THREE.WebGLRenderer | null>,
  wallsRef: React.RefObject<THREE.Mesh[]>,
  floorsRef: React.RefObject<THREE.Mesh[]>,
  plan: Plan,
  mode: 'view' | 'walk',
  walkSpeed: number = DEFAULT_WALK_SPEED,
  rotationSpeed: number = DEFAULT_ROTATION_SPEED,
  cameraHeight: number = DEFAULT_CAMERA_HEIGHT / 100, // конвертируем см в метры
  onCameraPositionChange?: (position: { x: number; y: number; z: number }) => void,
  onCameraRotationChange?: (rotation: { x: number; y: number; z: number }) => void,
  sceneRef?: React.RefObject<THREE.Scene | null>
) => {
  const keysRef = useRef<WalkModeState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    run: false,
  });

  const velocityRef = useRef(new THREE.Vector3());
  const directionRef = useRef(new THREE.Vector3());
  const isInitializedRef = useRef(false);

  // Инициализация позиции камеры при переключении в режим прогулки
  useEffect(() => {
    console.log("[Walk] useEffect triggered, mode =", mode);
    
    if (mode !== 'walk') {
      isInitializedRef.current = false;
      return;
    }

    const camera = cameraRef.current;
    const controls = pointerLockControlsRef.current;
    if (!camera || !controls) return;

    // Ждем, пока стены будут созданы (небольшая задержка для гарантии)
    const initializeCamera = () => {
      // Находим зону с максимальной площадью
      const largestZone = getLargestZone(plan);
      
      if (!largestZone) {
        console.warn('[Walk] No zones found, using plan center');
        const pxPerMeter = plan.meta.scale?.px_per_meter || 1;
        const centerX = plan.meta.width / 2 / pxPerMeter;
        const centerZ = -plan.meta.height / 2 / pxPerMeter;
        camera.position.set(centerX, cameraHeight, centerZ + 0.5);
        camera.rotation.set(0, Math.PI, 0);
        camera.updateMatrixWorld(true);
        isInitializedRef.current = true;
        return;
      }

      // Вычисляем центр зоны в 3D координатах
      const spawnX = largestZone.center.x;
      const spawnZ = -largestZone.center.y; // Y → -Z
      const spawnY = cameraHeight;

      // Спавним камеру в центре зоны, отодвигаем на 0.5 метра вперёд
      camera.position.set(spawnX, spawnY, spawnZ + 0.5);
      
      // Устанавливаем направление взгляда вперёд по оси -Z
      camera.rotation.set(0, Math.PI, 0);
      
      camera.updateMatrixWorld(true);

      // Логируем информацию о стенах для отладки
      const walls = wallsRef.current;
      const wallsBbox = walls.map((wall) => {
        wall.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(wall);
        return {
          id: wall.userData.element?.id || 'unknown',
          bbox: {
            min: box.min.clone(),
            max: box.max.clone(),
            center: box.getCenter(new THREE.Vector3()).clone(),
          },
        };
      });

      console.log('=== SPAWN DEBUG ===');
      console.log('Largest zone id:', largestZone.element.id);
      console.log('Polygon area (m²):', largestZone.area);
      console.log('Center (px):', {
        x: largestZone.center.x * (plan.meta.scale?.px_per_meter || 1),
        y: largestZone.center.y * (plan.meta.scale?.px_per_meter || 1),
      });
      console.log('Center (meters):', largestZone.center);
      console.log('Final camera position:', camera.position.clone());
      console.log('Walls bbox list:', wallsBbox);
      console.log('==================');

      // После lock() устанавливаем позицию ещё раз (на случай, если controls изменили её)
      controls.addEventListener("lock", () => {
        requestAnimationFrame(() => {
          camera.position.set(spawnX, spawnY, spawnZ + 0.5);
          camera.rotation.set(0, Math.PI, 0);
          camera.updateMatrixWorld(true);
          console.log('[Walk] Camera after lock:', {
            pos: camera.position.clone(),
            rot: camera.rotation.clone(),
          });
        });
      });
      
      isInitializedRef.current = true;
    };

    // Ждем немного, чтобы стены успели создаться
    const timeoutId = setTimeout(initializeCamera, 100);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [mode, cameraRef, pointerLockControlsRef, rendererRef, wallsRef, plan, cameraHeight, sceneRef]);

  // Обработка нажатий клавиш
  useEffect(() => {
    if (mode !== 'walk') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
          keysRef.current.forward = true;
          break;
        case 'KeyS':
          keysRef.current.backward = true;
          break;
        case 'KeyA':
          keysRef.current.left = true;
          break;
        case 'KeyD':
          keysRef.current.right = true;
          break;
        case 'ShiftLeft':
          keysRef.current.run = true;
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
          keysRef.current.forward = false;
          break;
        case 'KeyS':
          keysRef.current.backward = false;
          break;
        case 'KeyA':
          keysRef.current.left = false;
          break;
        case 'KeyD':
          keysRef.current.right = false;
          break;
        case 'ShiftLeft':
          keysRef.current.run = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [mode]);

  // Анимация движения
  useEffect(() => {
    if (mode !== 'walk') return;

    const controls = pointerLockControlsRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    if (!controls || !camera || !renderer) return;

    // Обработка клика для активации pointer lock
    const handleClick = () => {
      const renderer = rendererRef.current;
      if (!renderer) return;

      // Разблокировка при повторном клике
      if (document.pointerLockElement === renderer.domElement) {
        controls.unlock();
        return;
      }

      // Только lock — без изменения позиции/rotation
      controls.lock();
    };

    renderer.domElement.addEventListener('click', handleClick);

    let lastTime = performance.now();

    const updateMovement = () => {
      if (mode !== 'walk') {
        requestAnimationFrame(updateMovement);
        return;
      }

      // До lock камера НЕ должна двигаться и НЕ должна переустанавливаться
      if (!controls.isLocked) {
        requestAnimationFrame(updateMovement);
        return;
      }

      const currentTime = performance.now();
      const delta = (currentTime - lastTime) / 1000; // в секундах
      lastTime = currentTime;

      if (!camera) {
        requestAnimationFrame(updateMovement);
        return;
      }

      const speed = keysRef.current.run ? walkSpeed * 2 : walkSpeed;
      const actualSpeed = speed * delta;

      // Векторы для локальных направлений камеры
      const forward = new THREE.Vector3();
      const right = new THREE.Vector3();
      const up = new THREE.Vector3(0, 1, 0);

      // Текущее направление камеры (куда смотрит)
      camera.getWorldDirection(forward);
      forward.y = 0; // Игнорируем вертикальный компонент
      forward.normalize();

      // Перпендикуляр вправо (векторное произведение forward × up)
      right.crossVectors(forward, up).normalize();

      // --- Движение по WASD ---
      const moveVector = new THREE.Vector3(0, 0, 0);

      // Вперёд (W)
      if (keysRef.current.forward) {
        moveVector.addScaledVector(forward, actualSpeed);
      }

      // Назад (S)
      if (keysRef.current.backward) {
        moveVector.addScaledVector(forward, -actualSpeed);
      }

      // Влево (A)
      if (keysRef.current.left) {
        moveVector.addScaledVector(right, -actualSpeed);
      }

      // Вправо (D)
      if (keysRef.current.right) {
        moveVector.addScaledVector(right, actualSpeed);
      }

      // Применяем движение с проверкой коллизий
      const oldPosition = camera.position.clone();
      const newPosition = camera.position.clone().add(moveVector);
      newPosition.y = cameraHeight; // Сохраняем высоту камеры

      const safePosition = getSafeCameraPosition(
        newPosition,
        oldPosition,
        wallsRef.current
      );

      camera.position.copy(safePosition);

      // Вызываем колбэки
      if (onCameraPositionChange) {
        onCameraPositionChange({
          x: camera.position.x,
          y: camera.position.y,
          z: camera.position.z,
        });
      }

      if (onCameraRotationChange) {
        onCameraRotationChange({
          x: camera.rotation.x,
          y: camera.rotation.y,
          z: camera.rotation.z,
        });
      }

      requestAnimationFrame(updateMovement);
    };

    updateMovement();

    return () => {
      if (renderer) {
        renderer.domElement.removeEventListener('click', handleClick);
      }
    };
  }, [
    mode,
    cameraRef,
    pointerLockControlsRef,
    rendererRef,
    wallsRef,
    plan,
    walkSpeed,
    cameraHeight,
    onCameraPositionChange,
    onCameraRotationChange,
  ]);

  // Переключение между режимами
  useEffect(() => {
    const controls = pointerLockControlsRef.current;
    const renderer = rendererRef.current;
    if (!controls || !renderer) return;

    if (mode === 'walk') {
      // В режиме прогулки активируем pointer lock при клике
      // (обработчик уже установлен в предыдущем useEffect)
    } else {
      // В режиме просмотра отключаем pointer lock
      if (document.pointerLockElement === renderer.domElement) {
        controls.unlock();
      }
    }
  }, [mode, pointerLockControlsRef, rendererRef]);
};
