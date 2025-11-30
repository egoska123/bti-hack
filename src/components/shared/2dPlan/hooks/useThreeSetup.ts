import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { FloorPlanData } from '../types';
import { getColors } from '../lib/getColors';

export const useThreeSetup = (
  containerRef: React.RefObject<HTMLDivElement | null>,
  data: FloorPlanData
) => {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const rafIdRef = useRef<number | null>(null);
  // Сохраняем состояние камеры и контролов между обновлениями
  const savedCameraStateRef = useRef<{
    position: THREE.Vector3;
    target: THREE.Vector3;
    zoom: number;
  } | null>(null);
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
    scene.background = new THREE.Color(getColors().canvasBg || '#ffffff');

    const { meta } = data;
    const aspect = container.clientWidth / container.clientHeight;
    const viewSize = Math.max(meta.width, meta.height) * 1.2;

    // Ортографическая камера для 2D вида
    const camera = new THREE.OrthographicCamera(
      -viewSize * aspect,
      viewSize * aspect,
      viewSize,
      -viewSize,
      0.1,
      1000
    );
    camera.position.set(meta.width / 2, meta.height / 2, 100);
    camera.lookAt(meta.width / 2, meta.height / 2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.enableRotate = false; // Отключаем вращение для 2D вида
    controls.zoomSpeed = 2;
    controls.panSpeed = 1.5;
    controls.minDistance = 50;
    controls.maxDistance = 5000;
    controls.target.set(meta.width / 2, meta.height / 2, 0);
    
    // Блокируем wheel события напрямую на canvas при необходимости
    const handleWheel = (event: WheelEvent) => {
      if (!controls.enableZoom) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
      }
    };
    
    renderer.domElement.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    
    // Сохраняем ссылку на обработчик для cleanup
    (controls as any).__handleWheel = handleWheel;
    
    controls.update();
    
    // Сохраняем начальное состояние
    savedCameraStateRef.current = {
      position: camera.position.clone(),
      target: controls.target.clone(),
      zoom: camera.zoom,
    };

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    controlsRef.current = controls;
    isInitializedRef.current = true;

    // Анимационный цикл
    const animate = () => {
      rafIdRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Обработка resize
    const handleResize = () => {
      if (!container || !camera || !renderer) return;

      const width = container.clientWidth;
      const height = container.clientHeight;
      const aspect = width / height;
      const viewSize = Math.max(meta.width, meta.height) * 1.2;

      // Сохраняем текущий зум перед обновлением
      const currentZoom = camera.zoom;

      camera.left = -viewSize * aspect;
      camera.right = viewSize * aspect;
      camera.top = viewSize;
      camera.bottom = -viewSize;
      camera.updateProjectionMatrix();

      // Восстанавливаем зум после обновления
      camera.zoom = currentZoom;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      // Удаляем обработчик wheel
      if ((controls as any).__handleWheel) {
        renderer.domElement.removeEventListener('wheel', (controls as any).__handleWheel, { capture: true });
      }
      
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      isInitializedRef.current = false;
    };
  }, [containerRef]); // Убираем data из зависимостей, чтобы не пересоздавать setup при изменении элементов

  return { sceneRef, cameraRef, rendererRef, controlsRef };
};

