import type { FloorPlanElement, WallElement, DoorElement, WindowElement, ZoneElement } from '@/components/shared/2dPlan/types';

const pxPerMeter = 54.5; // Из MOCK_FLOOR_PLAN_DATA_INITIAL

const generateId = (type: string, index: number = 0): string => {
  return `${type}_${Date.now()}_${index}`;
};

export const createWallElement = (type: 'loadBearing' | 'partition' | 'exterior'): WallElement => {
  const id = generateId('wall');
  const baseX = 500;
  const baseY = 400;
  const length = 200;
  
  let loadBearing = false;
  let thickness = 0.11 * pxPerMeter; // Перегородка по умолчанию
  
  if (type === 'loadBearing') {
    loadBearing = true;
    thickness = 0.22 * pxPerMeter;
  } else if (type === 'exterior') {
    loadBearing = true;
    thickness = 0.22 * pxPerMeter;
  }
  
  return {
    id,
    type: 'wall',
    role: 'NEW',
    loadBearing,
    thickness,
    geometry: {
      kind: 'segment',
      points: [baseX, baseY, baseX + length, baseY],
    },
  };
};

export const createDoorElement = (type: 'single' | 'double' | 'sliding'): DoorElement => {
  const id = generateId('door');
  const baseX = 500;
  const baseY = 400;
  const length = 80;
  
  return {
    id,
    type: 'door',
    role: 'NEW',
    geometry: {
      kind: 'segment',
      points: [baseX, baseY, baseX + length, baseY],
    },
  };
};

export const createWindowElement = (type: 'standard' | 'panoramic' | 'attic'): WindowElement => {
  const id = generateId('window');
  const baseX = 500;
  const baseY = 400;
  const length = 120;
  
  return {
    id,
    type: 'window',
    role: 'NEW',
    windowType: 'STANDARD',
    sillHeight_m: 0.9,
    geometry: {
      kind: 'segment',
      points: [baseX, baseY, baseX + length, baseY],
    },
  };
};

export const createZoneElement = (zoneType: 'living_room' | 'bedroom' | 'kitchen' | 'bathroom'): ZoneElement => {
  const id = generateId('zone');
  const baseX = 500;
  const baseY = 400;
  const size = 200;
  
  return {
    id,
    type: 'zone',
    zoneType,
    relatedTo: [],
    geometry: {
      kind: 'polygon',
      points: [
        baseX, baseY,
        baseX + size, baseY,
        baseX + size, baseY + size,
        baseX, baseY + size,
      ],
    },
  };
};

export const createElement = (
  category: string,
  toolName: string
): FloorPlanElement | null => {
  switch (category) {
    case 'walls':
      if (toolName === 'Несущая стена') return createWallElement('loadBearing');
      if (toolName === 'Перегородка') return createWallElement('partition');
      if (toolName === 'Внешняя стена') return createWallElement('exterior');
      break;
    case 'doors':
      if (toolName === 'Одностворчатая') return createDoorElement('single');
      if (toolName === 'Двустворчатая') return createDoorElement('double');
      if (toolName === 'Раздвижная') return createDoorElement('sliding');
      break;
    case 'windows':
      if (toolName === 'Стандартное') return createWindowElement('standard');
      if (toolName === 'Панорамное') return createWindowElement('panoramic');
      if (toolName === 'Мансардное') return createWindowElement('attic');
      break;
    case 'zones':
      if (toolName === 'Гостиная') return createZoneElement('living_room');
      if (toolName === 'Спальня') return createZoneElement('bedroom');
      if (toolName === 'Кухня') return createZoneElement('kitchen');
      if (toolName === 'Ванная') return createZoneElement('bathroom');
      break;
  }
  return null;
};

