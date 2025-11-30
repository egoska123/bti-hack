import { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import type { FloorPlanData, FloorPlanElement, PolygonGeometry } from './types';
import { MOCK_FLOOR_PLAN_DATA_INITIAL } from './constants';
import { usePlan2DThree } from './hooks/usePlan2DThree';
import { getElementDescription } from './lib/getElementDescription';
import { EditPanel } from './EditPanel';
import { useHistory } from './lib/useHistory';
import { getGlobalToast } from '@/components/ui/toast';
import { useSelectionContext } from '@/components/blocks/ai/SelectionContext';
import styles from './2dPlan.module.css';

// Хук для безопасного использования контекста (опционально)
const useSelectionContextSafe = () => {
  try {
    return useSelectionContext();
  } catch {
    return {
      isSelectionMode: false,
      addElement: () => {},
    };
  }
};

export interface Plan2DProps {
  data?: FloorPlanData;
  className?: string;
  onDataChange?: (data: FloorPlanData) => void;
  onAddElementRef?: React.MutableRefObject<((element: FloorPlanElement) => void) | null>;
}

export const Plan2D = ({ data, className, onDataChange, onAddElementRef }: Plan2DProps) => {
  const planData = data || MOCK_FLOOR_PLAN_DATA_INITIAL;
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredElement, setHoveredElement] = useState<FloorPlanElement | null>(null);
  const [selectedElement, setSelectedElement] = useState<FloorPlanElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [localPlanData, setLocalPlanData] = useState<FloorPlanData>(planData);
  const [editPanelPosition, setEditPanelPosition] = useState<{ x: number; y: number } | null>(null);
  
  // История изменений для undo/redo
  const { addToHistory, undo, redo, reset } = useHistory(planData);
  const isHistoryUpdateRef = useRef(false); // Флаг для предотвращения зацикливания при undo/redo
  
  // Копирование элементов
  const copiedElementRef = useRef<FloorPlanElement | null>(null);
  
  // Контекст выбора элементов для чата (опционально)
  const { isSelectionMode, addElement } = useSelectionContextSafe();
  
  // Используем глобальную функцию toast (устанавливается в Toaster)
  const showToast = (props: { title?: string; children?: React.ReactNode; duration?: number }) => {
    const toastFn = getGlobalToast();
    if (toastFn) {
      toastFn(props);
    } else {
      // Fallback - просто логируем в консоль
      console.log(props.title || 'Уведомление', props.children || '');
    }
  };
  
  const { sceneRef, cameraRef, rendererRef, controlsRef, updateElementPosition, updateElement } = usePlan2DThree(
    containerRef,
    localPlanData,
    selectedElement
  );

  // Функция для добавления нового элемента
  const handleAddElement = (element: FloorPlanElement) => {
    const updatedElements = [...localPlanData.elements, element];
    const updatedData = {
      ...localPlanData,
      elements: updatedElements,
    };
    
    setLocalPlanData(updatedData);
    setSelectedElement(element);
    addToHistory(updatedData);
    
    // useEffect в useThreeObjects автоматически пересоздаст все объекты при изменении localPlanData
    // Поэтому не нужно вызывать updateElement вручную
    
    if (onDataChange) {
      onDataChange(updatedData);
    }
  };

  // Экспортируем функцию через ref, если передан
  useEffect(() => {
    if (onAddElementRef) {
      onAddElementRef.current = handleAddElement;
    }
    return () => {
      if (onAddElementRef) {
        onAddElementRef.current = null;
      }
    };
  }, [onAddElementRef, localPlanData, updateElement, addToHistory, onDataChange]);

  // Синхронизируем локальные данные с внешними
  useEffect(() => {
    if (data && !isHistoryUpdateRef.current) {
      setLocalPlanData(data);
      reset(data);
    }
    isHistoryUpdateRef.current = false;
  }, [data, reset]);

  // Обработка Ctrl+Z и Ctrl+Shift+Z для undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Проверяем, что фокус не на инпуте (чтобы не мешать вводу текста)
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Ctrl+Z или Ctrl+Я (русская раскладка) для undo
      // Используем e.code для определения физической клавиши независимо от раскладки
      if (e.ctrlKey && (e.code === 'KeyZ' || e.key === 'z' || e.key === 'Z' || e.key === 'я' || e.key === 'Я') && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        
        const previousData = undo();
        if (previousData) {
          isHistoryUpdateRef.current = true;
          setLocalPlanData(previousData);
          // Обновляем выделение, если элемент был удален
          if (selectedElement) {
            const stillExists = previousData.elements.some((el: FloorPlanElement) => el.id === selectedElement.id);
            if (!stillExists) {
              setSelectedElement(null);
            } else {
              const updatedElement = previousData.elements.find((el: FloorPlanElement) => el.id === selectedElement.id);
              if (updatedElement) {
                setSelectedElement(updatedElement);
              }
            }
          }
          if (onDataChange) {
            onDataChange(previousData);
          }
        }
      }
      // Ctrl+Shift+Z, Ctrl+Shift+Я, Ctrl+Y или Ctrl+Н (русская раскладка) для redo
      if (
        (e.ctrlKey && e.shiftKey && (e.code === 'KeyZ' || e.key === 'z' || e.key === 'Z' || e.key === 'я' || e.key === 'Я')) ||
        (e.ctrlKey && (e.code === 'KeyY' || e.key === 'y' || e.key === 'Y' || e.key === 'н' || e.key === 'Н'))
      ) {
        e.preventDefault();
        e.stopPropagation();
        
        const nextData = redo();
        if (nextData) {
          isHistoryUpdateRef.current = true;
          setLocalPlanData(nextData);
          // Обновляем выделение
          if (selectedElement) {
            const stillExists = nextData.elements.some((el: FloorPlanElement) => el.id === selectedElement.id);
            if (!stillExists) {
              setSelectedElement(null);
            } else {
              const updatedElement = nextData.elements.find((el: FloorPlanElement) => el.id === selectedElement.id);
              if (updatedElement) {
                setSelectedElement(updatedElement);
              }
            }
          }
          if (onDataChange) {
            onDataChange(nextData);
          }
        }
      }
      
      // Ctrl+C или Ctrl+С (русская раскладка) для копирования
      if (e.ctrlKey && (e.code === 'KeyC' || e.key === 'c' || e.key === 'C' || e.key === 'с' || e.key === 'С')) {
        e.preventDefault();
        e.stopPropagation();
        
        if (selectedElement) {
          // Копируем элемент
          copiedElementRef.current = JSON.parse(JSON.stringify(selectedElement));
          showToast({
            title: 'Скопировано',
            children: 'Элемент скопирован в буфер обмена',
            duration: 2000,
          });
        }
      }
      
      // Ctrl+V или Ctrl+М (русская раскладка) для вставки
      if (e.ctrlKey && (e.code === 'KeyV' || e.key === 'v' || e.key === 'V' || e.key === 'м' || e.key === 'М')) {
        e.preventDefault();
        e.stopPropagation();
        
        if (copiedElementRef.current) {
          // Сохраняем в историю перед вставкой
          addToHistory(localPlanData);
          
          // Создаем новый элемент на основе скопированного
          const copiedElement = copiedElementRef.current;
          const newId = `${copiedElement.type}_${Date.now()}`;
          
          // Смещаем позицию на 50 пикселей вправо и вниз
          const offset = 50;
          let newElement: FloorPlanElement;
          
          if (copiedElement.type === 'wall') {
            const [x1, y1, x2, y2] = copiedElement.geometry.points;
            newElement = {
              ...copiedElement,
              id: newId,
              geometry: {
                ...copiedElement.geometry,
                points: [x1 + offset, y1 + offset, x2 + offset, y2 + offset] as [number, number, number, number],
              },
            };
          } else if (copiedElement.type === 'zone') {
            const newPoints = copiedElement.geometry.points.map((coord) => {
              return coord + offset; // Смещаем все координаты
            });
            newElement = {
              ...copiedElement,
              id: newId,
              geometry: {
                ...copiedElement.geometry,
                points: newPoints,
              },
            };
          } else if (copiedElement.type === 'door' || copiedElement.type === 'window') {
            const [x1, y1, x2, y2] = copiedElement.geometry.points;
            newElement = {
              ...copiedElement,
              id: newId,
              geometry: {
                ...copiedElement.geometry,
                points: [x1 + offset, y1 + offset, x2 + offset, y2 + offset] as [number, number, number, number],
              },
            };
          } else if (copiedElement.type === 'label') {
            const { x, y } = copiedElement.geometry;
            newElement = {
              ...copiedElement,
              id: newId,
              geometry: {
                ...copiedElement.geometry,
                x: x + offset,
                y: y + offset,
              },
            };
          } else {
            return; // Неизвестный тип элемента
          }
          
          // Добавляем новый элемент в данные
          const updatedElements = [...localPlanData.elements, newElement];
          const updatedData = {
            ...localPlanData,
            elements: updatedElements,
          };
          
          setLocalPlanData(updatedData);
          setSelectedElement(newElement);
          
          // Обновляем объект в Three.js сцене
          if (updateElement) {
            updateElement(newElement);
          }
          
          if (onDataChange) {
            onDataChange(updatedData);
          }
          
          showToast({
            title: 'Вставлено',
            children: 'Элемент вставлен',
            duration: 2000,
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true); // Используем capture phase
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [undo, redo, selectedElement, onDataChange, addToHistory, localPlanData, updateElement]);

  // Raycasting для определения элементов под курсором
  const raycasterRef = useRef<THREE.Raycaster | null>(null);
  const mouseRef = useRef(new THREE.Vector2());

  useEffect(() => {
    if (!rendererRef.current) return;
    raycasterRef.current = new THREE.Raycaster();
  }, [rendererRef.current]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!rendererRef.current || !cameraRef.current || !sceneRef.current || !raycasterRef.current) return;

    // Если режим выбора активен, меняем курсор
    if (isSelectionMode && containerRef.current) {
      containerRef.current.style.cursor = 'crosshair';
    }

    // Если перемещаем элемент (стену, дверь, окно или зону)
    if (isDragging && selectedElement && (selectedElement.type === 'wall' || selectedElement.type === 'door' || selectedElement.type === 'window' || selectedElement.type === 'zone') && dragStartWorldPosRef.current) {
      const rect = rendererRef.current.domElement.getBoundingClientRect();
      const worldX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const worldY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(worldX, worldY), cameraRef.current);
      
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);
      
      // Вычисляем общее смещение от начальной позиции
      const dx = intersection.x - dragStartWorldPosRef.current.x;
      const dy = intersection.y - dragStartWorldPosRef.current.y;
      
      // Обновляем позицию элемента
      if (updateElementPosition && selectedElement) {
        const currentElement = localPlanData.elements.find(el => el.id === selectedElement.id);
        
        if (currentElement && (currentElement.type === 'wall' || currentElement.type === 'door' || currentElement.type === 'window') && wallStartPosRef.current) {
          // Для элементов с сегментной геометрией
          const newX1 = wallStartPosRef.current.x1 + dx;
          const newY1 = wallStartPosRef.current.y1 + dy;
          const newX2 = wallStartPosRef.current.x2 + dx;
          const newY2 = wallStartPosRef.current.y2 + dy;
          
          const [currentX1, currentY1] = currentElement.geometry.points;
          const currentDx = newX1 - currentX1;
          const currentDy = newY1 - currentY1;
          
          updateElementPosition(selectedElement.id, currentDx, currentDy);
          
          // Обновляем локальные данные для стен, дверей и окон
          const updatedElements = localPlanData.elements.map(el => {
            if (el.id === selectedElement.id && (el.type === 'wall' || el.type === 'door' || el.type === 'window')) {
              return {
                ...el,
                geometry: {
                  ...el.geometry,
                  points: [newX1, newY1, newX2, newY2] as [number, number, number, number],
                },
              };
            }
            return el;
          });
          
          const updatedData = {
            ...localPlanData,
            elements: updatedElements,
          };
          setLocalPlanData(updatedData);
        } else if (currentElement && currentElement.type === 'zone' && zoneStartPosRef.current && selectedElement) {
          // Для зон с полигональной геометрией
          // Вычисляем новые координаты всех точек зоны на основе начальной позиции
          const newPoints = zoneStartPosRef.current.map((coord, index) => {
            if (index % 2 === 0) {
              // X координата
              return coord + dx;
            } else {
              // Y координата
              return coord + dy;
            }
          });
          
          // Вычисляем смещение от текущей позиции selectedElement (который может быть более актуальным)
          const [currentFirstX, currentFirstY] = selectedElement.geometry.points;
          const newFirstX = newPoints[0];
          const newFirstY = newPoints[1];
          const currentDx = newFirstX - currentFirstX;
          const currentDy = newFirstY - currentFirstY;
          
          // Обновляем геометрию напрямую через updateElementPosition с инкрементальным смещением
          // updateElementPosition обновит dataRef и визуальное представление
          if (updateElementPosition && (currentDx !== 0 || currentDy !== 0)) {
            updateElementPosition(selectedElement.id, currentDx, currentDy);
            
            // Обновляем selectedElement для синхронизации (чтобы следующее вычисление было правильным)
            if (selectedElement.type === 'zone') {
              setSelectedElement({
                ...selectedElement,
                geometry: {
                  kind: 'polygon',
                  points: newPoints,
                } as PolygonGeometry,
              });
            }
          }
          
          // Сохраняем финальное смещение для использования в handleMouseUp
          zoneFinalDxDyRef.current = { dx, dy };
        }
      }
      
      return;
    }

    // Обычный hover
    const rect = rendererRef.current.domElement.getBoundingClientRect();
    mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(sceneRef.current.children, true);

    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object;
      // Если это дочерний объект Group, получаем element из родителя
      let element = intersectedObject.userData.element as FloorPlanElement | undefined;
      if (!element && intersectedObject.parent instanceof THREE.Group) {
        element = intersectedObject.parent.userData.element as FloorPlanElement | undefined;
      }
    if (element) {
        setHoveredElement(element);
      setTooltipPosition({
        x: e.clientX,
        y: e.clientY - 10,
      });
        
        // Если это выделенная стена, меняем курсор
        if (selectedElement && selectedElement.id === element.id && element.type === 'wall' && !isSelectionMode) {
          if (containerRef.current) {
            containerRef.current.style.cursor = 'move';
          }
        }
        // Если режим выбора, показываем курсор crosshair
        else if (isSelectionMode && containerRef.current) {
          containerRef.current.style.cursor = 'crosshair';
        }
        return;
      }
    }

    setHoveredElement(null);
    
    // Восстанавливаем курсор
    if (containerRef.current && !isDragging) {
      if (isSelectionMode) {
        containerRef.current.style.cursor = 'crosshair';
      } else {
        containerRef.current.style.cursor = '';
      }
    }
  };

  const mouseDownPosRef = useRef<{ x: number; y: number } | null>(null);
  const dragStartWorldPosRef = useRef<{ x: number; y: number } | null>(null);
  const wallStartPosRef = useRef<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const zoneStartPosRef = useRef<number[] | null>(null); // Массив точек полигона [x1, y1, x2, y2, ...]
  const zoneFinalDxDyRef = useRef<{ dx: number; dy: number } | null>(null); // Финальное смещение зоны

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Сохраняем позицию начала клика для определения drag
    mouseDownPosRef.current = { x: e.clientX, y: e.clientY };
    
    // Если выделен элемент (стена, дверь, окно или зона), начинаем перемещение
    if (selectedElement && (selectedElement.type === 'wall' || selectedElement.type === 'door' || selectedElement.type === 'window' || selectedElement.type === 'zone') && rendererRef.current && cameraRef.current) {
      // Сохраняем текущее состояние в историю перед началом перетаскивания
      addToHistory(localPlanData);
      const rect = rendererRef.current.domElement.getBoundingClientRect();
      const worldX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const worldY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(worldX, worldY), cameraRef.current);
      
      // Получаем точку пересечения с плоскостью z=0
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);
      
      dragStartWorldPosRef.current = { x: intersection.x, y: intersection.y };
      
      // Сохраняем начальную позицию элемента
      const element = selectedElement;
      if (element.type === 'wall' || element.type === 'door' || element.type === 'window') {
        const [x1, y1, x2, y2] = element.geometry.points;
        wallStartPosRef.current = { x1, y1, x2, y2 };
        zoneStartPosRef.current = null;
      } else if (element.type === 'zone') {
        zoneStartPosRef.current = [...element.geometry.points]; // Копируем массив точек
        wallStartPosRef.current = null;
      }
      
      setIsDragging(true);
      
      // Отключаем OrbitControls при перемещении и блокируем зум
      if (controlsRef.current && cameraRef.current && rendererRef.current) {
        const camera = cameraRef.current;
        const controls = controlsRef.current;
        
        // ВАЖНО: Сохраняем ТЕКУЩИЕ параметры камеры ПЕРЕД отключением зума
        // Это гарантирует, что мы сохраним актуальный зум пользователя
        const savedParams = {
          left: camera.left,
          right: camera.right,
          top: camera.top,
          bottom: camera.bottom,
        };
        
        // Отключаем OrbitControls
        controls.enablePan = false;
        controls.enableZoom = false;
        
        // Блокируем wheel события напрямую на canvas
        const blockWheel = (e: WheelEvent) => {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          return false;
        };
        
        rendererRef.current.domElement.addEventListener('wheel', blockWheel, { 
          passive: false, 
          capture: true 
        });
        
        // Сохраняем обработчик для удаления
        (controls as any).__blockWheel = blockWheel;
        (controls as any).__savedParams = savedParams;
        
        // Перехватываем метод update() у OrbitControls для блокировки изменения параметров камеры
        const originalControlsUpdate = controls.update.bind(controls);
        (controls as any).__originalUpdate = originalControlsUpdate;
        
        controls.update = function() {
          // Вызываем оригинальный update
          const result = originalControlsUpdate();
          
          // Если зум отключен, восстанавливаем параметры
          if (!this.enableZoom && (this as any).__savedParams) {
            const savedParams = (this as any).__savedParams;
            camera.left = savedParams.left;
            camera.right = savedParams.right;
            camera.top = savedParams.top;
            camera.bottom = savedParams.bottom;
            camera.updateProjectionMatrix();
          }
          
          return result;
        };
        
        // Блокируем изменение параметров камеры через updateProjectionMatrix
        const originalUpdate = camera.updateProjectionMatrix.bind(camera);
        (camera as any).__originalUpdateProjectionMatrix = originalUpdate;
        
        camera.updateProjectionMatrix = function() {
          // Если зум отключен, восстанавливаем сохраненные параметры
          if (controls && !controls.enableZoom && (controls as any).__savedParams) {
            const params = (controls as any).__savedParams;
            camera.left = params.left;
            camera.right = params.right;
            camera.top = params.top;
            camera.bottom = params.bottom;
          }
          return originalUpdate();
        };
        
        // Сохраняем ссылку на восстановление
        (controls as any).__restoreZoom = () => {
          // Восстанавливаем оригинальный метод update у controls
          if ((controls as any).__originalUpdate) {
            controls.update = (controls as any).__originalUpdate;
            delete (controls as any).__originalUpdate;
          }
          
          // Восстанавливаем оригинальный метод updateProjectionMatrix
          if ((camera as any).__originalUpdateProjectionMatrix) {
            camera.updateProjectionMatrix = (camera as any).__originalUpdateProjectionMatrix;
            delete (camera as any).__originalUpdateProjectionMatrix;
          }
          
          // Удаляем обработчик wheel
          if (rendererRef.current && (controls as any).__blockWheel) {
            rendererRef.current.domElement.removeEventListener('wheel', (controls as any).__blockWheel, { capture: true });
            delete (controls as any).__blockWheel;
          }
          
          delete (controls as any).__savedParams;
          delete (controls as any).__restoreZoom;
        };
      }
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Закрываем панель редактирования при клике вне её
    if (editPanelPosition) {
      setEditPanelPosition(null);
    }
    
    // Если был drag (перетаскивание), не обрабатываем клик
    if (isDragging) {
      mouseDownPosRef.current = null;
      return;
    }
    
    // Проверяем, был ли это drag (панорамирование) или клик
    if (mouseDownPosRef.current) {
      const dx = Math.abs(e.clientX - mouseDownPosRef.current.x);
      const dy = Math.abs(e.clientY - mouseDownPosRef.current.y);
      // Если перемещение больше 5 пикселей - это был drag, не клик
      if (dx > 5 || dy > 5) {
        mouseDownPosRef.current = null;
        return;
      }
    }
    
    if (!rendererRef.current || !cameraRef.current || !sceneRef.current || !raycasterRef.current) return;

    const rect = rendererRef.current.domElement.getBoundingClientRect();
    mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(sceneRef.current.children, true);

    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object;
      // Если это дочерний объект Group, получаем element из родителя
      let element = intersectedObject.userData.element as FloorPlanElement | undefined;
      if (!element && intersectedObject.parent instanceof THREE.Group) {
        element = intersectedObject.parent.userData.element as FloorPlanElement | undefined;
      }
      if (element) {
        e.stopPropagation();
        
        // Если режим выбора активен - добавляем элемент в контекст чата
        if (isSelectionMode) {
          addElement(element);
          mouseDownPosRef.current = null;
          return;
        }
        
        // Обычное выделение элемента
        // Если кликнули на уже выделенный элемент - снимаем выделение
        if (selectedElement && selectedElement.id === element.id) {
          setSelectedElement(null);
        } else {
          setSelectedElement(element);
        }
        
        mouseDownPosRef.current = null;
        return;
      }
    }
    
    // Клик по пустому месту - снимаем выделение
    setSelectedElement(null);
    mouseDownPosRef.current = null;
  };

  const handleMouseUp = () => {
    if (isDragging && selectedElement) {
      // Для зон нужно обновить localPlanData в handleMouseUp (для стен/дверей/окон уже обновлено в handleMouseMove)
      if (selectedElement.type === 'zone' && zoneStartPosRef.current && zoneFinalDxDyRef.current) {
        // Вычисляем финальные координаты зоны
        const { dx, dy } = zoneFinalDxDyRef.current;
        const newPoints = zoneStartPosRef.current.map((coord, index) => {
          if (index % 2 === 0) {
            return coord + dx;
          } else {
            return coord + dy;
          }
        });
        
        // Обновляем localPlanData
        const updatedElements = localPlanData.elements.map(el => {
          if (el.id === selectedElement.id && el.type === 'zone') {
            return {
              ...el,
              geometry: {
                ...el.geometry,
                points: newPoints,
              },
            };
          }
          return el;
        });
        
        const updatedData = {
          ...localPlanData,
          elements: updatedElements,
        };
        
        setLocalPlanData(updatedData);
        addToHistory(updatedData);
        
        // Обновляем selectedElement
        setSelectedElement({
          ...selectedElement,
          geometry: {
            ...selectedElement.geometry,
            points: newPoints,
          } as PolygonGeometry,
        });
        
        if (onDataChange) {
          onDataChange(updatedData);
        }
      } else {
        // Для стен/дверей/окон данные уже обновлены в handleMouseMove
        addToHistory(localPlanData);
        
        if (onDataChange) {
          onDataChange(localPlanData);
        }
      }
      
      setIsDragging(false);
      dragStartWorldPosRef.current = null;
      wallStartPosRef.current = null;
      zoneStartPosRef.current = null;
      zoneFinalDxDyRef.current = null;
      
      // Включаем OrbitControls обратно и разблокируем зум
      if (controlsRef.current) {
        // Восстанавливаем оригинальный updateProjectionMatrix и удаляем блокировку wheel
        if ((controlsRef.current as any).__restoreZoom) {
          (controlsRef.current as any).__restoreZoom();
          delete (controlsRef.current as any).__restoreZoom;
        }
        
        controlsRef.current.enablePan = true;
        controlsRef.current.enableZoom = true;
      }
      
      // Восстанавливаем курсор
      if (containerRef.current) {
        containerRef.current.style.cursor = '';
      }
      
      // Выделение остается активным после перетаскивания
      // selectedElement не меняется, поэтому выделение сохраняется
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    // Блокируем зум во время перетаскивания
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
      return false;
    }
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    // Показываем панель редактирования только если элемент выделен
    if (!selectedElement) {
      e.preventDefault();
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    // Позиционируем панель рядом с курсором
    setEditPanelPosition({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleEditPanelClose = () => {
    setEditPanelPosition(null);
  };

  const handleEditPanelDelete = (elementId: string) => {
    // Сохраняем текущее состояние в историю перед удалением
    addToHistory(localPlanData);
    
    // Удаляем элемент из данных
    const updatedElements = localPlanData.elements.filter(el => el.id !== elementId);
    
    const updatedData = {
      ...localPlanData,
      elements: updatedElements,
    };
    
    setLocalPlanData(updatedData);
    
    // Снимаем выделение, если удаленный элемент был выделен
    if (selectedElement && selectedElement.id === elementId) {
      setSelectedElement(null);
    }
    
    // Закрываем панель
    setEditPanelPosition(null);
    
    // Вызываем callback для обновления данных
    if (onDataChange) {
      onDataChange(updatedData);
    }
  };

  const handleEditPanelSave = (editedElement: FloorPlanElement, shouldClose: boolean = true) => {
    // Сохраняем текущее состояние в историю перед изменением (только если это не вращение в реальном времени)
    if (shouldClose) {
      addToHistory(localPlanData);
    }
    
    // Обновляем элемент в данных
    const updatedElements = localPlanData.elements.map(el => {
      if (el.id === editedElement.id) {
        return editedElement;
      }
      return el;
    });

    const updatedData = {
      ...localPlanData,
      elements: updatedElements,
    };

    setLocalPlanData(updatedData);
    
    // Обновляем объект в Three.js сцене
    if (updateElement) {
      updateElement(editedElement);
    }
    
    // Обновляем выделенный элемент
    setSelectedElement(editedElement);
    
    // Вызываем callback для обновления данных
    if (onDataChange) {
      onDataChange(updatedData);
    }
    
    // Закрываем панель только если это финальное сохранение
    if (shouldClose) {
      setEditPanelPosition(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredElement(null);
    if (isDragging) {
      handleMouseUp();
    }
  };

  return (
    <div
        ref={containerRef}
        className={`${styles.root} ${className || ''} ${isDragging ? styles.dragging : ''}`}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
          onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
      {hoveredElement && (
        <div
          className={styles.tooltip}
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
          }}
        >
          {getElementDescription(hoveredElement, planData.meta.scale?.px_per_meter || 40)}
        </div>
      )}
      
      {editPanelPosition && selectedElement && (
        <EditPanel
          element={selectedElement}
          pxPerMeter={planData.meta.scale?.px_per_meter || 40}
          onClose={handleEditPanelClose}
          onSave={handleEditPanelSave}
          onDelete={handleEditPanelDelete}
          position={editPanelPosition}
        />
      )}
    </div>
  );
};

