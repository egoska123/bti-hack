// Типы для компонента Plan3DViewer

import type { OrderPlanVersion, Object3D, PlanElement } from '@/types/plan3d';

export interface Plan3DViewerProps {
  // Данные версии плана заказа (может быть объект или JSON строка)
  data: OrderPlanVersion | string;

  // Дополнительный CSS класс
  className?: string;

  // Режим отображения
  mode?: 'view' | 'walk';

  // Начальная позиция камеры (для режима прогулки)
  initialCameraPosition?: {
    x: number;
    y: number;
    z: number;
  };

  // Начальный поворот камеры (для режима прогулки)
  initialCameraRotation?: {
    x: number;
    y: number;
    z: number;
  };

  // Скорость движения (для режима прогулки)
  walkSpeed?: number;

  // Скорость поворота камеры (для режима прогулки)
  rotationSpeed?: number;

  // Высота камеры от пола в метрах (для режима прогулки)
  cameraHeight?: number;

  // Колбэк при изменении выбранного элемента
  onElementSelect?: (elementId: string | null) => void;

  // Колбэк при изменении выбранного 3D объекта
  onObject3DSelect?: (objectId: string | null) => void;

  // Колбэк при изменении позиции камеры (для режима прогулки)
  onCameraPositionChange?: (position: { x: number; y: number; z: number }) => void;

  // Колбэк при изменении поворота камеры (для режима прогулки)
  onCameraRotationChange?: (rotation: { x: number; y: number; z: number }) => void;
}

export interface CameraState {
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
  };
}

export interface WalkModeControls {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  turnLeft: boolean;
  turnRight: boolean;
  run: boolean;
}

export interface ViewModeControls {
  pan: {
    active: boolean;
    startX: number;
    startY: number;
  };
  rotate: {
    active: boolean;
    startX: number;
    startY: number;
  };
  zoom: {
    active: boolean;
    delta: number;
  };
}

export interface RenderableWall {
  element: PlanElement;
  geometry: {
    kind: 'segment';
    points: [number, number, number, number];
    openings?: Array<{
      id: string;
      type: string;
      from_m: number;
      to_m: number;
      bottom_m: number;
      top_m: number;
    }>;
  };
  style?: {
    color?: string;
    textureUrl?: string | null;
  };
  height: number; // высота стены в метрах
  thickness: number; // толщина стены в метрах
}

export interface RenderableZone {
  element: PlanElement;
  geometry: {
    kind: 'polygon';
    points: number[];
  };
  style?: {
    color?: string;
    textureUrl?: string | null;
  };
  height: number; // высота пола/потолка
}

export interface RenderableObject3D {
  object: Object3D;
  mesh?: unknown; // тип будет зависеть от используемой 3D библиотеки
}

export interface Plan3DViewerConfig {
  // Масштаб для конвертации пикселей в метры
  pixelsToMeters: number;

  // Высота потолка по умолчанию (если не указана в meta)
  defaultCeilingHeight: number;

  // Толщина стены по умолчанию (если не указана)
  defaultWallThickness: number;

  // Высота стены по умолчанию
  defaultWallHeight: number;

  // Включить отображение сетки
  showGrid: boolean;

  // Включить отображение осей
  showAxes: boolean;

  // Цвет фона
  backgroundColor: string;

  // Включить тени
  enableShadows: boolean;
}

