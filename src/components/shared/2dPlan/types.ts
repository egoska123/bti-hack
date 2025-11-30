// Meta Types

export type Unit = 'px' | 'm' | 'cm';

export interface ScaleMeta {
  px_per_meter: number; // > 0, для подсветки размеров
}

export interface BackgroundMeta {
  file_id: string; // UUID файла для отображения картинки
  opacity: number; // 0-1
}

export interface FloorPlanMeta {
  width: number;
  height: number;
  unit: Unit;
  scale?: ScaleMeta | null; // nullable
  background?: BackgroundMeta | null; // nullable, фон под схему (грузит пользователь)
}

// Geometry Types

export interface SegmentGeometry {
  kind: 'segment';
  points: [number, number, number, number]; // [x1, y1, x2, y2]
}

export interface PointGeometry {
  kind: 'point';
  x: number;
  y: number;
}

export interface PolygonGeometry {
  kind: 'polygon';
  points: number[]; // [x1, y1, x2, y2, ..., xn, yn]
}

export type Geometry = SegmentGeometry | PointGeometry | PolygonGeometry;

// Element Role Types

export type ElementRole = 'EXISTING' | 'TO_DELETE' | 'NEW' | 'MODIFIED';

// Zone Types

export type ZoneCategory =
  | 'public_zones'
  | 'utility_zones'
  | 'private_zones'
  | 'outdoor_zones';

export type ZoneType =
  // Общественные зоны
  | 'living_room' // Гостиная
  | 'dinning_room' // Столовая
  // Рабочие и хозяйственные зоны
  | 'kitchen' // Кухня
  | 'entrance_hall' // Прихожая
  | 'bathroom' // Санузел
  | 'laundry_room' // Постирочная
  // Приватные зоны
  | 'bedroom' // Спальня
  | 'kids_room' // Детская
  | 'wardrobe' // Гардеробная
  | 'home_office' // Кабинет/рабочий уголок
  // Открытые зоны
  | 'balcony' // Балкон
  | 'veranda' // Веранда
  | 'loggia' // Лоджия
  // Специальные зоны
  | 'RISK' // Зона риска
  | 'wet'; // Влажная зона

export type WindowType = 'STANDARD' | string; // Можно расширить при необходимости

// Element Types

export interface WallElement {
  id: string; // например: "wall_1"
  type: 'wall';
  role: ElementRole;
  loadBearing: boolean | null; // несущая? nullable
  thickness: number; // толщина стены
  geometry: SegmentGeometry; // для стен всегда "segment"
  rotation?: number; // угол поворота в градусах (0-360), опционально
}

export interface ZoneElement {
  id: string; // например: "zone_kitchen"
  type: 'zone';
  zoneType: ZoneType;
  relatedTo: string[]; // Список id элементов, к которым относится эта зона
  geometry: PolygonGeometry; // для зон всегда "polygon"
  rotation?: number; // угол поворота в градусах (0-360), опционально
}

export interface DoorElement {
  id: string; // например: "door_1"
  type: 'door';
  role: ElementRole;
  geometry: SegmentGeometry; // для дверей всегда "segment"
  rotation?: number; // угол поворота в градусах (0-360), опционально
}

export interface WindowElement {
  id: string; // например: "window_1"
  type: 'window';
  role: ElementRole;
  windowType: WindowType;
  sillHeight_m: number; // Высота подоконника от пола в метрах
  geometry: SegmentGeometry; // для окон всегда "segment"
  rotation?: number; // угол поворота в градусах (0-360), опционально
}

export interface LabelElement {
  id: string; // например: "label_kitchen"
  type: 'label';
  text: string; // Подпись
  geometry: PointGeometry; // для подписей всегда "point"
}

// Union Types

export type FloorPlanElement =
  | WallElement
  | ZoneElement
  | DoorElement
  | WindowElement
  | LabelElement;

// Main Data Type

export interface FloorPlanData {
  meta: FloorPlanMeta;
  elements: FloorPlanElement[];
}

// Type Guards

export const isWallElement = (element: FloorPlanElement): element is WallElement =>
  element.type === 'wall';

export const isZoneElement = (element: FloorPlanElement): element is ZoneElement =>
  element.type === 'zone';

export const isDoorElement = (element: FloorPlanElement): element is DoorElement =>
  element.type === 'door';

export const isWindowElement = (element: FloorPlanElement): element is WindowElement =>
  element.type === 'window';

export const isLabelElement = (element: FloorPlanElement): element is LabelElement =>
  element.type === 'label';

export const isSegmentGeometry = (geometry: Geometry): geometry is SegmentGeometry =>
  geometry.kind === 'segment';

export const isPointGeometry = (geometry: Geometry): geometry is PointGeometry =>
  geometry.kind === 'point';

export const isPolygonGeometry = (geometry: Geometry): geometry is PolygonGeometry =>
  geometry.kind === 'polygon';

