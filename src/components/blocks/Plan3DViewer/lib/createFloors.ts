import * as THREE from 'three';
import type { PlanElement, PolygonGeometry, PlanMeta } from '@/types/plan3d';

// Создание пола/зоны из элемента плана
export const createFloor = (
  element: PlanElement,
  meta: PlanMeta
): THREE.Mesh | null => {
  const geometry = element.geometry;
  if (geometry.kind !== "polygon") return null;

  const polygonGeometry = geometry as PolygonGeometry;
  const { points } = polygonGeometry;

  if (points.length < 6) return null; // минимум 3 точки (6 координат)

  const pxPerMeter = meta.scale?.px_per_meter || 1;

  // 1. Конвертация пикселей → метры → 2D в плоскости XZ
  const pts3D: Array<{ x: number; z: number }> = [];

  for (let i = 0; i < points.length; i += 2) {
    const xPx = points[i];
    const yPx = points[i + 1];

    const xM = xPx / pxPerMeter;
    const yM = yPx / pxPerMeter;

    // X = X, Z = -Y, как и для стен
    const x3D = xM;
    const z3D = -yM;

    pts3D.push({ x: x3D, z: z3D });
  }

  // 2. Считаем bbox в МЕТРАХ
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;

  pts3D.forEach((p) => {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.z < minZ) minZ = p.z;
    if (p.z > maxZ) maxZ = p.z;
  });

  const centerX = (minX + maxX) / 2;
  const centerZ = (minZ + maxZ) / 2;

  // 3. Создаем Shape ВОКРУГ (0,0) в плоскости XY
  // X = x3D - centerX
  // Y = z3D - centerZ
  const shape = new THREE.Shape();

  pts3D.forEach((p, index) => {
    const sx = p.x - centerX;
    const sy = p.z - centerZ;
    if (index === 0) shape.moveTo(sx, sy);
    else shape.lineTo(sx, sy);
  });
  shape.closePath();

  // 4. Создаем ShapeGeometry (пока в плоскости XY)
  const floorGeometry = new THREE.ShapeGeometry(shape);

  // 5. Материал
  const material = new THREE.MeshStandardMaterial({
    color: element.style?.color || "#f5f5f5",
    side: THREE.DoubleSide,
  });

  if (element.style?.textureUrl) {
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(element.style.textureUrl);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(5, 5);
    material.map = texture;
    material.needsUpdate = true;
  }

  const mesh = new THREE.Mesh(floorGeometry, material);

  // 6. Поворачиваем пол в горизонтальную плоскость XZ
  // (то же самое, что было, только без дополнительной магии)
  mesh.rotation.x = -Math.PI / 2;

  // 7. Ставим пол в ЦЕНТР комнаты (в мировых координатах)
  mesh.position.set(centerX, 0, centerZ);

  mesh.userData = {
    element,
    type: "floor",
  };

  mesh.updateMatrixWorld(true);

  // DEBUG: логим размеры и позицию
  const bbox = new THREE.Box3().setFromObject(mesh);
  console.log("FLOOR DEBUG:", {
    center: bbox.getCenter(new THREE.Vector3()).clone(),
    size: bbox.getSize(new THREE.Vector3()).clone(),
    position: mesh.position.clone(),
  });

  return mesh;
};

// Создание всех полов из элементов плана
export const createFloors = (
  elements: PlanElement[],
  meta: PlanMeta
): THREE.Mesh[] => {
  const floors: THREE.Mesh[] = [];

  elements.forEach((element) => {
    if (element.type === 'zone' && element.geometry.kind === 'polygon') {
      const floor = createFloor(element, meta);
      if (floor) {
        floors.push(floor);
      }
    }
  });

  return floors;
};
