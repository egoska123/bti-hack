import * as THREE from 'three';
import type { Object3D as PlanObject3D, PlanMeta } from '@/types/plan3d';
import { loadGLBModel } from './loadGLBModel';
import { DEFAULT_OBJECT_SCALE } from '../constants';

// Конвертация 2D координат в 3D для Three.js
const convert2DTo3D = (x: number, y: number): { x: number; z: number } => {
  return { x, z: -y };
};

// Создание 3D объекта из данных плана
export const createObject3D = async (
  object: PlanObject3D,
  meta: PlanMeta
): Promise<THREE.Group | null> => {
  const pxPerMeter = meta.scale?.px_per_meter || 1;

  // Загружаем модель
  const model = await loadGLBModel(object.type);
  if (!model) return null;

  // position в схеме в метрах, но координаты X и Y нужно конвертировать как 2D координаты
  // Если position.x и position.y в пикселях, конвертируем в метры
  const x = object.position.x / pxPerMeter;
  const y = object.position.y; // Y уже в метрах (высота)
  const z = object.position.z / pxPerMeter;

  // Применяем позицию (X = X, Z = -Y, Y = вверх)
  const { x: x3D, z: z3D } = convert2DTo3D(x, z);
  model.position.set(x3D, y, z3D);

  // Применяем размеры
  if (object.size) {
    const scaleX = object.size.x / pxPerMeter;
    const scaleY = object.size.y / pxPerMeter;
    const scaleZ = object.size.z / pxPerMeter;
    model.scale.set(scaleX, scaleY, scaleZ);
  } else {
    // Используем дефолтный масштаб
    const defaultScale = DEFAULT_OBJECT_SCALE[object.type] || {
      x: 1,
      y: 1,
      z: 1,
    };
    model.scale.set(defaultScale.x, defaultScale.y, defaultScale.z);
  }

  // Применяем поворот
  if (object.rotation) {
    model.rotation.set(
      object.rotation.x || 0,
      object.rotation.y || 0,
      object.rotation.z || 0
    );
  }

  // Сохраняем данные объекта
  model.userData = {
    object,
    type: 'object3d',
    boundingBox: new THREE.Box3().setFromObject(model),
  };

  return model;
};

// Создание всех 3D объектов из плана
export const createObjects3D = async (
  objects: PlanObject3D[],
  meta: PlanMeta
): Promise<THREE.Group[]> => {
  const createdObjects: THREE.Group[] = [];

  for (const object of objects) {
    const created = await createObject3D(object, meta);
    if (created) {
      createdObjects.push(created);
    }
  }

  return createdObjects;
};

