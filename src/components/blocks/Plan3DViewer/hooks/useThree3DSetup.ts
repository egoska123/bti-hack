import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import type { PlanMeta } from '@/types/plan3d';
import { DEFAULT_COLORS } from '../constants';

export const useThree3DSetup = (
  containerRef: React.RefObject<HTMLDivElement | null>,
  meta: PlanMeta,
  mode: 'view' | 'walk',
  initialCameraPosition?: { x: number; y: number; z: number },
  initialCameraRotation?: { x: number; y: number; z: number }
) => {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const orbitControlsRef = useRef<OrbitControls | null>(null);
  const pointerLockControlsRef = useRef<PointerLockControls | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Если уже инициализировано, не пересоздаем
    if (isInitializedRef.current) {
      return;
    }

    // Инициализация Three.js
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(DEFAULT_COLORS.background);

    // Добавляем освещение
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    // Перспективная камера для 3D
    const aspect = container.clientWidth / container.clientHeight;
    // Уменьшаем near для более близкого обзора в режиме прогулки
    const camera = new THREE.PerspectiveCamera(75, aspect, 0.01, 1000);

    // Позиционируем камеру ТОЛЬКО в режиме просмотра
    // В режиме walk позицию камеры устанавливает useThree3DWalkMode
    if (mode === 'view') {
      const pxPerMeter = meta.scale?.px_per_meter || 1;
      const centerX = meta.width / 2 / pxPerMeter;
      const centerZ = -meta.height / 2 / pxPerMeter;
      const distance = Math.max(meta.width, meta.height) / pxPerMeter;

      // В режиме просмотра устанавливаем позицию для обзора
      if (initialCameraPosition) {
        camera.position.set(
          initialCameraPosition.x,
          initialCameraPosition.y,
          initialCameraPosition.z
        );
      } else {
        camera.position.set(centerX, distance * 0.5, centerZ + distance);
      }

      if (initialCameraRotation) {
        camera.rotation.set(
          initialCameraRotation.x,
          initialCameraRotation.y,
          initialCameraRotation.z
        );
      } else {
        camera.lookAt(centerX, 0, centerZ);
      }
    }

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // OrbitControls для режима просмотра
    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.05;
    orbitControls.minDistance = 1;
    orbitControls.maxDistance = 100;
    
    // Устанавливаем target только в режиме просмотра
    if (mode === 'view') {
      const pxPerMeter = meta.scale?.px_per_meter || 1;
      const centerX = meta.width / 2 / pxPerMeter;
      const centerZ = -meta.height / 2 / pxPerMeter;
      orbitControls.target.set(centerX, 0, centerZ);
    }
    
    // Отключаем OrbitControls в режиме прогулки
    if (mode === 'walk') {
      orbitControls.enabled = false;
    }

    // PointerLockControls для режима прогулки
    const pointerLockControls = new PointerLockControls(camera, renderer.domElement);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    orbitControlsRef.current = orbitControls;
    pointerLockControlsRef.current = pointerLockControls;
    isInitializedRef.current = true;

    // DEBUG: логируем инициализацию камеры
    console.log('[Setup] Camera init, mode:', mode, {
      position: camera.position.clone(),
      rotation: camera.rotation.clone(),
    });

    // Анимационный цикл
    const animate = () => {
      rafIdRef.current = requestAnimationFrame(animate);

      if (mode === 'view' && orbitControls) {
        orbitControls.update();
      }

      renderer.render(scene, camera);
    };
    animate();

    // Обработка resize
    const handleResize = () => {
      if (!container || !camera || !renderer) return;

      const width = container.clientWidth;
      const height = container.clientHeight;
      const aspect = width / height;

      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Эффект для переключения режимов контролов
    const updateControlsMode = () => {
      if (mode === 'view') {
        orbitControls.enabled = true;
        if (document.pointerLockElement === renderer.domElement) {
          pointerLockControls.unlock();
        }
      } else {
        orbitControls.enabled = false;
      }
    };
    updateControlsMode();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      orbitControls.dispose();
      pointerLockControls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      isInitializedRef.current = false;
    };
  }, [containerRef, meta, mode, initialCameraPosition, initialCameraRotation]);

  return {
    sceneRef,
    cameraRef,
    rendererRef,
    orbitControlsRef,
    pointerLockControlsRef,
  };
};

