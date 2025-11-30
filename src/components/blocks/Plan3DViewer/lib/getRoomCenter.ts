import type { Plan, PlanElement, PolygonGeometry } from '@/types/plan3d';

// Вычисление центра комнаты на основе зон (полов)
export const getRoomCenter = (plan: Plan): { x: number; z: number } | null => {
  const pxPerMeter = plan.meta.scale?.px_per_meter || 1;
  
  // Находим все зоны (полы)
  const zones = plan.elements.filter(
    (element): element is PlanElement & { geometry: PolygonGeometry } =>
      element.type === 'zone' && element.geometry.kind === 'polygon'
  );

  if (zones.length === 0) {
    // Если нет зон, вычисляем центр на основе размеров плана
    const centerX = plan.meta.width / 2 / pxPerMeter;
    const centerZ = -plan.meta.height / 2 / pxPerMeter;
    return { x: centerX, z: centerZ };
  }

  // Вычисляем общий центр всех зон
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;

  zones.forEach((zone) => {
    const { points } = zone.geometry;
    
    for (let i = 0; i < points.length; i += 2) {
      const x2D = points[i];
      const y2D = points[i + 1];

      // Конвертируем пиксели в метры
      const xMeters = x2D / pxPerMeter;
      const yMeters = y2D / pxPerMeter;

      // Преобразуем 2D координаты в 3D: X = X, Z = -Y
      const x3D = xMeters;
      const z3D = -yMeters;

      minX = Math.min(minX, x3D);
      maxX = Math.max(maxX, x3D);
      minZ = Math.min(minZ, z3D);
      maxZ = Math.max(maxZ, z3D);
    }
  });

  const centerX = (minX + maxX) / 2;
  const centerZ = (minZ + maxZ) / 2;

  return { x: centerX, z: centerZ };
};

