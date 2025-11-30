import * as THREE from 'three';
import { CAMERA_COLLISION_RADIUS } from '../constants';

// Проверка коллизии камеры со стенами
export const checkWallCollision = (
  cameraPosition: THREE.Vector3,
  walls: THREE.Mesh[]
): boolean => {
  // Создаем сферу для камеры
  const cameraSphere = new THREE.Sphere(
    cameraPosition,
    CAMERA_COLLISION_RADIUS
  );

  for (const wall of walls) {
    // КРИТИЧЕСКОЕ: Обновляем матрицу стены перед вычислением boundingBox
    wall.updateMatrixWorld(true);
    
    // Обновляем bounding box стены
    if (!wall.userData.boundingBox) {
      wall.userData.boundingBox = new THREE.Box3();
    }
    wall.userData.boundingBox.setFromObject(wall);

    const wallBox = wall.userData.boundingBox as THREE.Box3 | undefined;
    if (!wallBox) continue;

    // Проверяем пересечение сферы камеры с bounding box стены
    if (cameraSphere.intersectsBox(wallBox)) {
      return true; // Коллизия обнаружена
    }
  }

  return false; // Коллизий нет
};

// Получение безопасной позиции камеры (с учетом коллизий)
export const getSafeCameraPosition = (
  newPosition: THREE.Vector3,
  oldPosition: THREE.Vector3,
  walls: THREE.Mesh[]
): THREE.Vector3 => {
  // Проверяем новую позицию
  if (!checkWallCollision(newPosition, walls)) {
    return newPosition;
  }

  // Если есть коллизия, возвращаем старую позицию
  return oldPosition;
};

// Проверка коллизии с 3D объектами
export const checkObject3DCollision = (
  cameraPosition: THREE.Vector3,
  objects: THREE.Group[]
): boolean => {
  const cameraSphere = new THREE.Sphere(
    cameraPosition,
    CAMERA_COLLISION_RADIUS
  );

  for (const obj of objects) {
    obj.userData.boundingBox?.setFromObject(obj);
    const objBox = obj.userData.boundingBox as THREE.Box3 | undefined;
    if (!objBox) continue;

    if (cameraSphere.intersectsBox(objBox)) {
      return true;
    }
  }

  return false;
};

