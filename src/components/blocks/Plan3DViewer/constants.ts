// Константы для Plan3DViewer

// Дефолтные значения для 3D объектов
export const DEFAULT_OBJECT_SCALE = {
  chair: { x: 0.5, y: 0.5, z: 0.5 },
  table: { x: 1.0, y: 1.0, z: 1.0 },
  bed: { x: 2.0, y: 0.5, z: 1.5 },
  window: { x: 1.0, y: 1.0, z: 0.1 },
  door: { x: 0.9, y: 2.1, z: 0.1 },
};

// Дефолтная высота потолка (в метрах)
export const DEFAULT_CEILING_HEIGHT = 2.5;

// Дефолтная толщина стены (в метрах)
export const DEFAULT_WALL_THICKNESS = 0.2;

// Дефолтная высота камеры в режиме прогулки (в см, конвертируется в метры)
export const DEFAULT_CAMERA_HEIGHT = 170;

// Скорость движения в режиме прогулки (метры в секунду)
export const DEFAULT_WALK_SPEED = 2.0;

// Скорость поворота камеры (радианы в секунду)
export const DEFAULT_ROTATION_SPEED = 0.05;

// Радиус коллизии камеры (в метрах)
export const CAMERA_COLLISION_RADIUS = 0.3;

// Пути к GLB моделям (будут загружаться из assets)
export const GLB_MODEL_PATHS: Record<string, string> = {
  chair: '/models/chair.glb',
  table: '/models/table.glb',
  bed: '/models/bed.glb',
  window: '/models/window.glb',
  door: '/models/door.glb',
};

// Цвета по умолчанию
export const DEFAULT_COLORS = {
  wall: '#cccccc',
  floor: '#f5f5f5',
  ceiling: '#ffffff',
  background: '#f5f5f5', // Нейтральный светло-серый, подходит для 3D редактора
};

// Моковые данные для тестирования
// Данные из json.json
export const MOCK_PLAN_DATA = {
  id: 'ce938abe-4d9a-4f32-bd5a-1ff233537527',
  orderId: 'a4704115-6aea-407a-a6a7-23b0696a6424',
  versionType: 'MODIFIED' as const,
  createdAt: '2025-11-29T21:40:51.812413',
  plan: {
    meta: {
      width: 1000,
      height: 700,
      unit: 'px' as const,
      scale: {
        px_per_meter: 50,
      },
      background: null,
      ceiling_height_m: 2.75,
    },
    elements: [
      {
        id: 'wall_top',
        type: 'wall',
        role: 'EXISTING' as const,
        loadBearing: true,
        thickness: 20,
        zoneType: null,
        relatedTo: null,
        selected: false,
        style: {
          color: '#b45a3c',
          textureUrl: null,
        },
        geometry: {
          kind: 'segment' as const,
          points: [100, 100, 800, 100] as [number, number, number, number],
          openings: null,
        },
      },
      {
        id: 'wall_right',
        type: 'wall',
        role: 'EXISTING' as const,
        loadBearing: true,
        thickness: 20,
        zoneType: null,
        relatedTo: null,
        selected: false,
        style: {
          color: '#b45a3c',
          textureUrl: null,
        },
        geometry: {
          kind: 'segment' as const,
          points: [800, 100, 800, 600] as [number, number, number, number],
          openings: null,
        },
      },
      {
        id: 'wall_bottom',
        type: 'wall',
        role: 'EXISTING' as const,
        loadBearing: true,
        thickness: 20,
        zoneType: null,
        relatedTo: null,
        selected: false,
        style: {
          color: '#b45a3c',
          textureUrl: null,
        },
        geometry: {
          kind: 'segment' as const,
          points: [800, 600, 100, 600] as [number, number, number, number],
          openings: [
            {
              id: 'door_entrance',
              type: 'door',
              from_m: 5.5,
              to_m: 6.3,
              bottom_m: 0,
              top_m: 2,
            },
          ],
        },
      },
      {
        id: 'wall_left',
        type: 'wall',
        role: 'EXISTING' as const,
        loadBearing: true,
        thickness: 20,
        zoneType: null,
        relatedTo: null,
        selected: false,
        style: {
          color: '#b45a3c',
          textureUrl: null,
        },
        geometry: {
          kind: 'segment' as const,
          points: [100, 600, 100, 100] as [number, number, number, number],
          openings: null,
        },
      },
      {
        id: 'wall_middle_vertical',
        type: 'wall',
        role: 'EXISTING' as const,
        loadBearing: false,
        thickness: 15,
        zoneType: null,
        relatedTo: null,
        selected: false,
        style: {
          color: '#a0a0a0',
          textureUrl: null,
        },
        geometry: {
          kind: 'segment' as const,
          points: [450, 100, 450, 600] as [number, number, number, number],
          openings: [
            {
              id: 'door_living_to_hall',
              type: 'door',
              from_m: 3.5,
              to_m: 4.3,
              bottom_m: 0,
              top_m: 2,
            },
          ],
        },
      },
      {
        id: 'wall_middle_horizontal',
        type: 'wall',
        role: 'EXISTING' as const,
        loadBearing: false,
        thickness: 15,
        zoneType: null,
        relatedTo: null,
        selected: false,
        style: {
          color: '#a0a0a0',
          textureUrl: null,
        },
        geometry: {
          kind: 'segment' as const,
          points: [450, 400, 800, 400] as [number, number, number, number],
          openings: [
            {
              id: 'door_bedroom_to_hall',
              type: 'door',
              from_m: 0.8,
              to_m: 1.6,
              bottom_m: 0,
              top_m: 2,
            },
          ],
        },
      },
      {
        id: 'zone_living',
        type: 'zone',
        role: 'EXISTING' as const,
        loadBearing: null,
        thickness: null,
        zoneType: 'living_room',
        relatedTo: ['wall_top', 'wall_left', 'wall_bottom', 'wall_middle_vertical'],
        selected: true,
        style: {
          color: '#FFE5CC',
          textureUrl: null,
        },
        geometry: {
          kind: 'polygon' as const,
          points: [100, 100, 450, 100, 450, 600, 100, 600],
        },
      },
      {
        id: 'zone_bedroom',
        type: 'zone',
        role: 'EXISTING' as const,
        loadBearing: null,
        thickness: null,
        zoneType: 'bedroom',
        relatedTo: ['wall_top', 'wall_middle_vertical', 'wall_middle_horizontal', 'wall_right'],
        selected: true,
        style: {
          color: '#CCE5FF',
          textureUrl: null,
        },
        geometry: {
          kind: 'polygon' as const,
          points: [450, 100, 800, 100, 800, 400, 450, 400],
        },
      },
      {
        id: 'zone_kitchen',
        type: 'zone',
        role: 'EXISTING' as const,
        loadBearing: null,
        thickness: null,
        zoneType: 'kitchen',
        relatedTo: ['wall_middle_vertical', 'wall_right', 'wall_bottom', 'wall_middle_horizontal'],
        selected: true,
        style: {
          color: '#FFF7CC',
          textureUrl: null,
        },
        geometry: {
          kind: 'polygon' as const,
          points: [450, 400, 800, 400, 800, 600, 450, 600],
        },
      },
      {
        id: 'label_living',
        type: 'label',
        role: 'EXISTING' as const,
        loadBearing: null,
        thickness: null,
        zoneType: null,
        relatedTo: ['zone_living'],
        selected: false,
        style: null,
        text: 'Комната 16 м² (условно)',
        geometry: {
          kind: 'point' as const,
          x: 275,
          y: 330,
        },
      },
      {
        id: 'label_bedroom',
        type: 'label',
        role: 'EXISTING' as const,
        loadBearing: null,
        thickness: null,
        zoneType: null,
        relatedTo: ['zone_bedroom'],
        selected: false,
        style: null,
        text: 'Комната 9.8 м² (условно)',
        geometry: {
          kind: 'point' as const,
          x: 625,
          y: 250,
        },
      },
      {
        id: 'label_kitchen',
        type: 'label',
        role: 'EXISTING' as const,
        loadBearing: null,
        thickness: null,
        zoneType: null,
        relatedTo: ['zone_kitchen'],
        selected: false,
        style: null,
        text: 'Кухня/прихожая (упрощено)',
        geometry: {
          kind: 'point' as const,
          x: 625,
          y: 500,
        },
      },
    ],
    objects3d: [
      {
        id: 'sofa_living',
        type: 'bed',
        position: {
          x: 3.5,
          y: 0,
          z: 11.2,
        },
        size: {
          x: 2.2,
          y: 0.9,
          z: 0.9,
        },
        rotation: {
          x: 0,
          y: 0,
          z: 0,
        },
        wallId: null,
        zoneId: 'zone_living',
        selected: false,
        meta: {
          note: 'Диван в гостиной (условно)',
        },
      },
      {
        id: 'bed_main',
        type: 'bed',
        position: {
          x: 15,
          y: 0,
          z: 3,
        },
        size: {
          x: 3,
          y: 0.6,
          z: 1.6,
        },
        rotation: {
          x: 0,
          y: 1.57,
          z: 0,
        },
        wallId: null,
        zoneId: 'zone_bedroom',
        selected: false,
        meta: {
          note: 'Кровать в спальне (условно)',
        },
      },
      {
        id: 'table_kitchen',
        type: 'table',
        position: {
          x: 15,
          y: 0.75,
          z: 9,
        },
        size: {
          x: 1.4,
          y: 0.2,
          z: 0.8,
        },
        rotation: {
          x: 0,
          y: 0,
          z: 0,
        },
        wallId: null,
        zoneId: 'zone_kitchen',
        selected: false,
        meta: {
          usage: 'dining',
        },
      },
      {
        id: 'door_entrance_3d',
        type: 'door',
        position: {
          x: 10.1,
          y: 1.2,
          z: 12,
        },
        size: {
          x: 1,
          y: 2.5,
          z: 0.5,
        },
        rotation: {
          x: 0,
          y: 0,
          z: 0,
        },
        wallId: 'wall_bottom',
        zoneId: 'zone_kitchen',
        selected: true,
        meta: {
          openingDirection: 'inside',
        },
      },
      {
        id: 'window_living_3d',
        type: 'window',
        position: {
          x: 3.5,
          y: 1.4,
          z: 2.2,
        },
        size: {
          x: 1.2,
          y: 1.2,
          z: 0.1,
        },
        rotation: {
          x: 0,
          y: 0,
          z: 0,
        },
        wallId: 'wall_top',
        zoneId: 'zone_living',
        selected: false,
        meta: {
          isBalcony: false,
        },
      },
      {
        id: 'window_bedroom_3d',
        type: 'window',
        position: {
          x: 11.5,
          y: 1.4,
          z: 2.2,
        },
        size: {
          x: 1.2,
          y: 1.2,
          z: 0.1,
        },
        rotation: {
          x: 0,
          y: 0,
          z: 0,
        },
        wallId: 'wall_top',
        zoneId: 'zone_bedroom',
        selected: false,
        meta: {
          isBalcony: false,
        },
      },
    ],
  },
};

