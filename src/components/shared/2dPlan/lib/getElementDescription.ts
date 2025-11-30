import type {
  FloorPlanElement,
  WallElement,
  ZoneElement,
  DoorElement,
  WindowElement,
  LabelElement,
} from '../types';
import {
  isWallElement,
  isZoneElement,
  isDoorElement,
  isWindowElement,
  isLabelElement,
} from '../types';

const getWallDescription = (wall: WallElement, pxPerMeter: number): string => {
  const parts: string[] = ['Стена'];
  
  if (wall.loadBearing) {
    parts.push('несущая');
  }
  
  switch (wall.role) {
    case 'NEW':
      parts.push('(новая)');
      break;
    case 'MODIFIED':
      parts.push('(изменена)');
      break;
    case 'TO_DELETE':
      parts.push('(к удалению)');
      break;
    case 'EXISTING':
    default:
      break;
  }
  
  // Конвертируем толщину из пикселей в метры
  const thicknessM = wall.thickness / pxPerMeter;
  parts.push(`Толщина: ${thicknessM.toFixed(2)}м`);
  
  // Вычисляем длину стены
  const [x1, y1, x2, y2] = wall.geometry.points;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthPx = Math.sqrt(dx * dx + dy * dy);
  const lengthM = lengthPx / pxPerMeter;
  parts.push(`Длина: ${lengthM.toFixed(2)}м`);
  
  return parts.join(' ');
};

const getZoneDescription = (zone: ZoneElement): string => {
  const zoneTypeNames: Record<string, string> = {
    entrance_hall: 'Прихожая',
    kitchen: 'Кухня',
    living_room: 'Гостиная',
    bedroom: 'Спальня',
    bathroom: 'Ванная',
    laundry_room: 'Постирочная',
    kids_room: 'Детская',
    wardrobe: 'Гардеробная',
    home_office: 'Кабинет',
    balcony: 'Балкон',
    veranda: 'Веранда',
    loggia: 'Лоджия',
    dinning_room: 'Столовая',
    RISK: 'Зона риска',
    wet: 'Влажная зона',
  };
  
  const zoneName = zoneTypeNames[zone.zoneType] || zone.zoneType;
  return `Зона: ${zoneName}`;
};

const getDoorDescription = (door: DoorElement, pxPerMeter: number): string => {
  const parts: string[] = ['Дверь'];
  
  switch (door.role) {
    case 'NEW':
      parts.push('(новая)');
      break;
    case 'MODIFIED':
      parts.push('(изменена)');
      break;
    case 'TO_DELETE':
      parts.push('(к удалению)');
      break;
    case 'EXISTING':
    default:
      break;
  }
  
  // Вычисляем ширину двери
  const [x1, y1, x2, y2] = door.geometry.points;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const widthPx = Math.sqrt(dx * dx + dy * dy);
  const widthM = widthPx / pxPerMeter;
  parts.push(`Ширина: ${widthM.toFixed(2)}м`);
  
  return parts.join(' ');
};

const getWindowDescription = (window: WindowElement, pxPerMeter: number): string => {
  const parts: string[] = ['Окно'];
  
  switch (window.role) {
    case 'NEW':
      parts.push('(новое)');
      break;
    case 'MODIFIED':
      parts.push('(изменено)');
      break;
    case 'TO_DELETE':
      parts.push('(к удалению)');
      break;
    case 'EXISTING':
    default:
      break;
  }
  
  // Вычисляем ширину окна
  const [x1, y1, x2, y2] = window.geometry.points;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const widthPx = Math.sqrt(dx * dx + dy * dy);
  const widthM = widthPx / pxPerMeter;
  parts.push(`Ширина: ${widthM.toFixed(2)}м`);
  parts.push(`Подоконник: ${window.sillHeight_m}м`);
  
  return parts.join(' ');
};

const getLabelDescription = (label: LabelElement): string => {
  return `Метка: ${label.text}`;
};

export const getElementDescription = (element: FloorPlanElement, pxPerMeter: number = 40): string => {
  if (isWallElement(element)) {
    return getWallDescription(element, pxPerMeter);
  }
  if (isZoneElement(element)) {
    return getZoneDescription(element);
  }
  if (isDoorElement(element)) {
    return getDoorDescription(element, pxPerMeter);
  }
  if (isWindowElement(element)) {
    return getWindowDescription(element, pxPerMeter);
  }
  if (isLabelElement(element)) {
    return getLabelDescription(element);
  }
  return 'Элемент';
};

