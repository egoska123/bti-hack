// Типы для 3D модели плана на основе JSON-схемы OrderPlanVersion

// ==================== Enums ====================

export type VersionType = 'ORIGINAL' | 'MODIFIED';

export type ElementRole = 'EXISTING' | 'TO_DELETE' | 'NEW' | 'MODIFIED';

export type OpeningType = 'door' | 'window' | 'arch' | 'custom';

export type Object3DType = 'chair' | 'table' | 'bed' | 'window' | 'door';

export type Unit = 'px';

// ==================== Meta Types ====================

export interface ScaleMeta {
  px_per_meter: number; // > 0
}

export interface BackgroundMeta {
  file_id: string;
  opacity: number; // 0-1
}

export interface PlanMeta {
  width: number; // >= 0
  height: number; // >= 0
  unit: Unit;
  scale?: ScaleMeta | null;
  background?: BackgroundMeta | null;
  ceiling_height_m?: number; // 1.8-5
}

// ==================== Style Types ====================

export interface ElementStyle {
  color?: string; // HEX формат: #RRGGBB или #RRGGBBAA
  textureUrl?: string | null; // URI для текстуры
}

// ==================== Geometry Types ====================

export interface Opening {
  id: string;
  type: OpeningType;
  from_m: number; // >= 0
  to_m: number; // >= 0
  bottom_m: number; // >= 0
  top_m: number; // >= 0
}

export interface WallGeometry {
  kind: 'segment';
  points: [number, number, number, number]; // [x1, y1, x2, y2] в пикселях
  openings?: Opening[];
}

export interface PolygonGeometry {
  kind: 'polygon';
  points: number[]; // [x1, y1, x2, y2, ..., xn, yn] в пикселях, минимум 6 элементов
}

export interface PointGeometry {
  kind: 'point';
  x: number;
  y: number;
}

export type Geometry = WallGeometry | PolygonGeometry | PointGeometry;

// ==================== Element Types ====================

export interface PlanElement {
  id: string;
  type: string; // Тип элемента (wall, zone, label и т.п.)
  role?: ElementRole;
  loadBearing?: boolean | null;
  thickness?: number | null;
  zoneType?: string;
  relatedTo?: string[];
  selected?: boolean; // default: false
  style?: ElementStyle;
  geometry: Geometry;
  [key: string]: unknown; // additionalProperties: true
}

// ==================== Object3D Types ====================

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface Object3DRotation {
  x?: number; // default: 0
  y?: number; // default: 0
  z?: number; // default: 0
}

export interface Object3D {
  id: string;
  type: Object3DType;
  position: Vector3D;
  size?: Vector3D | null;
  rotation?: Object3DRotation | null;
  wallId?: string | null;
  zoneId?: string | null;
  selected?: boolean; // default: false
  meta?: Record<string, unknown> | null;
}

// ==================== Plan Types ====================

export interface Plan {
  meta: PlanMeta;
  elements: PlanElement[];
  objects3d?: Object3D[];
}

// ==================== OrderPlanVersion Types ====================

export interface OrderPlanVersion {
  id: string; // UUID версии плана
  orderId: string; // UUID заказа
  versionType: VersionType;
  plan: Plan;
  comment?: string | null;
  createdById?: string | null;
  createdAt: string; // ISO date-time
}

// ==================== Type Guards ====================

export const isWallGeometry = (geometry: Geometry): geometry is WallGeometry =>
  geometry.kind === 'segment';

export const isPolygonGeometry = (
  geometry: Geometry
): geometry is PolygonGeometry => geometry.kind === 'polygon';

export const isPointGeometry = (geometry: Geometry): geometry is PointGeometry =>
  geometry.kind === 'point';

export const isObject3D = (obj: unknown): obj is Object3D => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'type' in obj &&
    'position' in obj &&
    typeof (obj as Object3D).id === 'string' &&
    typeof (obj as Object3D).type === 'string'
  );
};

