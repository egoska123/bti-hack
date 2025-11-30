import type { FloorPlanElement } from '../types';
import {
  isWallElement,
  isZoneElement,
  isDoorElement,
  isWindowElement,
  isLabelElement,
} from '../types';

export const getElementShortLabel = (element: FloorPlanElement): string => {
  if (isWallElement(element)) {
    return 'Стена';
  }
  if (isZoneElement(element)) {
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
    return zoneTypeNames[element.zoneType] || 'Зона';
  }
  if (isDoorElement(element)) {
    return 'Дверь';
  }
  if (isWindowElement(element)) {
    return 'Окно';
  }
  if (isLabelElement(element)) {
    return element.text || 'Метка';
  }
  return 'Элемент';
};

