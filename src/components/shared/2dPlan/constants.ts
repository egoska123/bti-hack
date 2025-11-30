import type { FloorPlanData } from './types';

/**
 * Моковые данные для начального состояния плана этажа
 * Данные из json.json
 */
export const MOCK_FLOOR_PLAN_DATA_INITIAL: FloorPlanData = {
  meta: {
    width: 1000,
    height: 700,
    unit: 'px',
    scale: {
      px_per_meter: 50,
    },
    background: null,
  },
  elements: [
    // Внешние стены
    {
      id: 'wall_top',
      type: 'wall',
      role: 'EXISTING',
      loadBearing: true,
      thickness: 20,
      geometry: {
        kind: 'segment',
        points: [100, 100, 800, 100],
      },
    },
    {
      id: 'wall_right',
      type: 'wall',
      role: 'EXISTING',
      loadBearing: true,
      thickness: 20,
      geometry: {
        kind: 'segment',
        points: [800, 100, 800, 600],
      },
    },
    {
      id: 'wall_bottom',
      type: 'wall',
      role: 'EXISTING',
      loadBearing: true,
      thickness: 20,
      geometry: {
        kind: 'segment',
        points: [800, 600, 100, 600],
      },
    },
    {
      id: 'wall_left',
      type: 'wall',
      role: 'EXISTING',
      loadBearing: true,
      thickness: 20,
      geometry: {
        kind: 'segment',
        points: [100, 600, 100, 100],
      },
    },
    // Внутренние стены
    {
      id: 'wall_middle_vertical',
      type: 'wall',
      role: 'EXISTING',
      loadBearing: false,
      thickness: 15,
      geometry: {
        kind: 'segment',
        points: [450, 100, 450, 600],
      },
    },
    {
      id: 'wall_middle_horizontal',
      type: 'wall',
      role: 'EXISTING',
      loadBearing: false,
      thickness: 15,
      geometry: {
        kind: 'segment',
        points: [450, 400, 800, 400],
      },
    },
    // Зоны
    {
      id: 'zone_living',
      type: 'zone',
      zoneType: 'living_room',
      relatedTo: ['wall_top', 'wall_left', 'wall_bottom', 'wall_middle_vertical'],
      geometry: {
        kind: 'polygon',
        points: [100, 100, 450, 100, 450, 600, 100, 600],
      },
    },
    {
      id: 'zone_bedroom',
      type: 'zone',
      zoneType: 'bedroom',
      relatedTo: ['wall_top', 'wall_middle_vertical', 'wall_middle_horizontal', 'wall_right'],
      geometry: {
        kind: 'polygon',
        points: [450, 100, 800, 100, 800, 400, 450, 400],
      },
    },
    {
      id: 'zone_kitchen',
      type: 'zone',
      zoneType: 'kitchen',
      relatedTo: ['wall_middle_vertical', 'wall_right', 'wall_bottom', 'wall_middle_horizontal'],
      geometry: {
        kind: 'polygon',
        points: [450, 400, 800, 400, 800, 600, 450, 600],
      },
    },
    // Метки
    {
      id: 'label_living',
      type: 'label',
      text: 'Комната 16 м² (условно)',
      geometry: {
        kind: 'point',
        x: 275,
        y: 330,
      },
    },
    {
      id: 'label_bedroom',
      type: 'label',
      text: 'Комната 9.8 м² (условно)',
      geometry: {
        kind: 'point',
        x: 625,
        y: 250,
      },
    },
    {
      id: 'label_kitchen',
      type: 'label',
      text: 'Кухня/прихожая (упрощено)',
      geometry: {
        kind: 'point',
        x: 625,
        y: 500,
      },
    },
  ],
};

/**
 * Моковые данные для измененного состояния плана этажа
 * (после редактирования: добавлена новая стена, изменена роль стены, добавлена зона)
 */
export const MOCK_FLOOR_PLAN_DATA_MODIFIED: FloorPlanData = {
  meta: {
    width: 800,
    height: 600,
    unit: 'px',
    scale: {
      px_per_meter: 40,
    },
    background: {
      file_id: 'a9b9f0e2-1234-5678-9abc-def012345678',
      opacity: 0.7,
    },
  },
  elements: [
    {
      id: 'wall_1',
      type: 'wall',
      role: 'TO_DELETE', // было EXISTING, стало TO_DELETE
      loadBearing: true,
      thickness: 20,
      geometry: {
        kind: 'segment',
        points: [100, 100, 700, 100],
      },
    },
    {
      id: 'wall_2',
      type: 'wall',
      role: 'EXISTING',
      loadBearing: true,
      thickness: 20,
      geometry: {
        kind: 'segment',
        points: [700, 100, 700, 500],
      },
    },
    {
      id: 'wall_3',
      type: 'wall',
      role: 'EXISTING',
      loadBearing: true,
      thickness: 20,
      geometry: {
        kind: 'segment',
        points: [700, 500, 100, 500],
      },
    },
    {
      id: 'wall_4',
      type: 'wall',
      role: 'EXISTING',
      loadBearing: true,
      thickness: 20,
      geometry: {
        kind: 'segment',
        points: [100, 500, 100, 100],
      },
    },
    {
      id: 'wall_5',
      type: 'wall',
      role: 'NEW', // новая перегородка
      loadBearing: false,
      thickness: 10,
      geometry: {
        kind: 'segment',
        points: [400, 100, 400, 500],
      },
    },
    {
      id: 'zone_1',
      type: 'zone',
      zoneType: 'RISK',
      relatedTo: ['wall_1'],
      geometry: {
        kind: 'polygon',
        points: [90, 90, 710, 90, 710, 110, 90, 110],
      },
    },
    {
      id: 'label_room_1',
      type: 'label',
      text: 'Комната (после)',
      geometry: {
        kind: 'point',
        x: 250,
        y: 300,
      },
    },
    {
      id: 'label_room_2',
      type: 'label',
      text: 'Вторая зона',
      geometry: {
        kind: 'point',
        x: 550,
        y: 300,
      },
    },
  ],
};
