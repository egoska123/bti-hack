import * as THREE from 'three';
import type { PlanElement, WallGeometry, PlanMeta } from '@/types/plan3d';
import { DEFAULT_WALL_THICKNESS, DEFAULT_CEILING_HEIGHT } from '../constants';

// Конвертация 2D координат в 3D для Three.js
// X = X, Z = -Y, Y = вверх
const convert2DTo3D = (x: number, y: number): { x: number; z: number } => {
  return { x, z: -y };
};

// Создание стены из элемента плана
export const createWall = (
  element: PlanElement,
  meta: PlanMeta
): THREE.Mesh | null => {
  const geometry = element.geometry;
  if (geometry.kind !== 'segment') return null;

  const wallGeometry = geometry as WallGeometry;
  const [x1, y1, x2, y2] = wallGeometry.points;

  const pxPerMeter = meta.scale?.px_per_meter || 1;

  // 1. Конвертируем пиксели в метры
  const x1M = x1 / pxPerMeter;
  const y1M = y1 / pxPerMeter;
  const x2M = x2 / pxPerMeter;
  const y2M = y2 / pxPerMeter;

  // 2. Преобразуем 2D координаты в 3D: X = X, Z = -Y
  const start3D = convert2DTo3D(x1M, y1M);
  const end3D = convert2DTo3D(x2M, y2M);

  // 3. Вычисляем длину стены (в метрах)
  const dx = end3D.x - start3D.x;
  const dz = end3D.z - start3D.z;
  const lengthM = Math.sqrt(dx * dx + dz * dz);

  if (lengthM === 0) return null;

  // 4. Высота стены = ceiling_height_m (уже в метрах)
  const ceilingHeightM = meta.ceiling_height_m || DEFAULT_CEILING_HEIGHT;
  const height = ceilingHeightM; // в метрах

  // 5. Толщина стены (конвертируем из пикселей в метры)
  const thickness = element.thickness
    ? element.thickness / pxPerMeter
    : DEFAULT_WALL_THICKNESS;

  // 6. Создаем геометрию стены (в метрах): length, height, thickness
  const wallBox = new THREE.BoxGeometry(lengthM, height, thickness);

  // 7. Вычисляем угол поворота стены: Math.atan2(dz, dx)
  const angle = Math.atan2(dz, dx);

  // Создаем меш
  const material = new THREE.MeshStandardMaterial({
    color: element.style?.color || '#cccccc',
    side: THREE.DoubleSide,
  });

  // Загружаем текстуру, если есть
  if (element.style?.textureUrl) {
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(element.style.textureUrl);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    // Растягиваем текстуру по длине и высоте стены
    texture.repeat.set(lengthM / 2, height / 2);
    material.map = texture;
    material.needsUpdate = true;
  }

  const mesh = new THREE.Mesh(wallBox, material);

  // 8. Позиционируем стену: центр по X и Z, высота = height/2
  const centerX = (start3D.x + end3D.x) / 2;
  const centerZ = (start3D.z + end3D.z) / 2;
  mesh.position.set(centerX, height / 2, centerZ);

  // 9. Вращаем стену вокруг оси Y
  mesh.rotation.y = angle;

  // КРИТИЧЕСКОЕ: Обновляем матрицу перед вычислением boundingBox
  mesh.updateMatrixWorld(true);

  // Сохраняем данные элемента для коллизий
  // boundingBox будет пересчитываться динамически в collisionDetection
  mesh.userData = {
    element,
    type: 'wall',
    boundingBox: new THREE.Box3().setFromObject(mesh),
  };
  
  // Отладка: выводим информацию о созданной стене
  console.log('Wall created:', {
    elementId: element.id,
    points: [x1, y1, x2, y2],
    pxPerMeter,
    pixelsToMeters: {
      x1: `${x1}px → ${x1M}m`,
      y1: `${y1}px → ${y1M}m`,
      x2: `${x2}px → ${x2M}m`,
      y2: `${y2}px → ${y2M}m`,
    },
    start3D,
    end3D,
    lengthM,
    height,
    thickness,
    position: mesh.position.clone(),
    rotation: mesh.rotation.clone(),
    boundingBox: mesh.userData.boundingBox.clone(),
  });

  return mesh;
};

// Создание всех стен из элементов плана
export const createWalls = (
  elements: PlanElement[],
  meta: PlanMeta
): THREE.Mesh[] => {
  const walls: THREE.Mesh[] = [];

  elements.forEach((element) => {
    if (element.type === 'wall' && element.geometry.kind === 'segment') {
      const wall = createWall(element, meta);
      if (wall) {
        walls.push(wall);
      }
    }
  });

  return walls;
};

