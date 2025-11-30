import type { Plan, PlanElement, PolygonGeometry } from '@/types/plan3d';

// Вычисление площади полигона по формуле Shoelace
export const polygonArea = (points: number[]): number => {
  if (points.length < 6) return 0; // минимум 3 точки (6 координат)
  
  let area = 0;
  const n = points.length / 2;
  
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const xi = points[i * 2];
    const yi = points[i * 2 + 1];
    const xj = points[j * 2];
    const yj = points[j * 2 + 1];
    
    area += xi * yj - xj * yi;
  }
  
  return Math.abs(area) / 2;
};

// Вычисление центроида (центра масс) полигона
export const polygonCentroid = (points: number[]): { x: number; y: number } => {
  if (points.length < 6) {
    // Если недостаточно точек, возвращаем центр первых двух
    return { x: points[0] || 0, y: points[1] || 0 };
  }
  
  let cx = 0;
  let cy = 0;
  let area = 0;
  const n = points.length / 2;
  
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const xi = points[i * 2];
    const yi = points[i * 2 + 1];
    const xj = points[j * 2];
    const yj = points[j * 2 + 1];
    
    const cross = xi * yj - xj * yi;
    area += cross;
    cx += (xi + xj) * cross;
    cy += (yi + yj) * cross;
  }
  
  area /= 2;
  
  if (Math.abs(area) < 0.0001) {
    // Если площадь слишком мала, вычисляем простое среднее
    let sumX = 0;
    let sumY = 0;
    for (let i = 0; i < points.length; i += 2) {
      sumX += points[i];
      sumY += points[i + 1];
    }
    return {
      x: sumX / (points.length / 2),
      y: sumY / (points.length / 2),
    };
  }
  
  return {
    x: cx / (6 * area),
    y: cy / (6 * area),
  };
};

// Найти зону с максимальной площадью
export const getLargestZone = (
  plan: Plan
): {
  element: PlanElement & { geometry: PolygonGeometry };
  area: number;
  center: { x: number; y: number };
} | null => {
  const pxPerMeter = plan.meta.scale?.px_per_meter || 1;
  
  // Находим все зоны (полы)
  const zones = plan.elements.filter(
    (element): element is PlanElement & { geometry: PolygonGeometry } =>
      element.type === 'zone' && element.geometry.kind === 'polygon'
  );

  if (zones.length === 0) {
    return null;
  }

  // Вычисляем площадь каждой зоны и находим максимальную
  let largestZone = zones[0];
  let largestArea = 0;

  zones.forEach((zone) => {
    const { points } = zone.geometry;
    const areaPx = polygonArea(points);
    const areaM2 = areaPx / (pxPerMeter * pxPerMeter); // площадь в квадратных метрах
    
    if (areaM2 > largestArea) {
      largestArea = areaM2;
      largestZone = zone;
    }
  });

  // Вычисляем центроид самой большой зоны
  const centerPx = polygonCentroid(largestZone.geometry.points);
  const centerM = {
    x: centerPx.x / pxPerMeter,
    y: centerPx.y / pxPerMeter,
  };

  return {
    element: largestZone,
    area: largestArea,
    center: centerM,
  };
};

