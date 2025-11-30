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

const isPointInSegment = (
  x: number,
  y: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  thickness: number
): boolean => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  if (length === 0) return false;

  const perpX = (-dy / length) * (thickness / 2);
  const perpY = (dx / length) * (thickness / 2);

  // Проверяем, находится ли точка внутри прямоугольника стены
  const v1x = x1 + perpX;
  const v1y = y1 + perpY;
  const v2x = x2 + perpX;
  const v2y = y2 + perpY;
  const v3x = x2 - perpX;
  const v3y = y2 - perpY;
  const v4x = x1 - perpX;
  const v4y = y1 - perpY;

  // Проверка через площадь треугольников
  const area1 = Math.abs(
    (v2x - v1x) * (y - v1y) - (x - v1x) * (v2y - v1y)
  );
  const area2 = Math.abs(
    (v3x - v2x) * (y - v2y) - (x - v2x) * (v3y - v2y)
  );
  const area3 = Math.abs(
    (v4x - v3x) * (y - v3y) - (x - v3x) * (v4y - v3y)
  );
  const area4 = Math.abs(
    (v1x - v4x) * (y - v4y) - (x - v4x) * (v1y - v4y)
  );

  const totalArea = length * thickness;
  const sumAreas = area1 + area2 + area3 + area4;

  return Math.abs(sumAreas - totalArea) < 1;
};

const isPointInPolygon = (x: number, y: number, points: number[]): boolean => {
  let inside = false;
  for (let i = 0, j = points.length - 2; i < points.length; j = i, i += 2) {
    const xi = points[i];
    const yi = points[i + 1];
    const xj = points[j];
    const yj = points[j + 1];

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

const isPointNearSegment = (
  x: number,
  y: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  threshold: number
): boolean => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  if (length === 0) return false;

  const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (length * length)));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;

  const dist = Math.sqrt((x - projX) ** 2 + (y - projY) ** 2);
  return dist <= threshold;
};

const isPointInCircle = (
  x: number,
  y: number,
  cx: number,
  cy: number,
  radius: number
): boolean => {
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= radius * radius;
};

export const hitTest = (
  x: number,
  y: number,
  elements: FloorPlanElement[]
): FloorPlanElement | null => {
  // Проверяем в обратном порядке (сначала метки, потом окна, двери, стены, зоны)
  for (let i = elements.length - 1; i >= 0; i--) {
    const element = elements[i];

    if (isLabelElement(element)) {
      const { x: labelX, y: labelY } = element.geometry;
      // Проверяем область метки (примерно 100x30 пикселей)
      if (
        x >= labelX - 50 &&
        x <= labelX + 50 &&
        y >= labelY - 15 &&
        y <= labelY + 15
      ) {
        return element;
      }
    } else if (isWindowElement(element)) {
      const [x1, y1, x2, y2] = element.geometry.points;
      if (isPointNearSegment(x, y, x1, y1, x2, y2, 10)) {
        return element;
      }
    } else if (isDoorElement(element)) {
      const [x1, y1, x2, y2] = element.geometry.points;
      if (isPointNearSegment(x, y, x1, y1, x2, y2, 8)) {
        return element;
      }
    } else if (isWallElement(element)) {
      const [x1, y1, x2, y2] = element.geometry.points;
      if (isPointInSegment(x, y, x1, y1, x2, y2, element.thickness)) {
        return element;
      }
    } else if (isZoneElement(element)) {
      if (isPointInPolygon(x, y, element.geometry.points)) {
        return element;
      }
    }
  }

  return null;
};

