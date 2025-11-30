import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import type { Object3DType } from '@/types/plan3d';
import { GLB_MODEL_PATHS, DEFAULT_OBJECT_SCALE } from '../constants';

// Кэш загруженных моделей
const modelCache = new Map<string, THREE.Group>();

// Загрузка GLB модели
export const loadGLBModel = async (
  type: Object3DType
): Promise<THREE.Group | null> => {
  // Проверяем кэш
  if (modelCache.has(type)) {
    const cached = modelCache.get(type);
    if (cached) {
      // Клонируем модель из кэша
      return cached.clone();
    }
  }

  const modelPath = GLB_MODEL_PATHS[type];
  if (!modelPath) {
    console.warn(`Model path not found for type: ${type}`);
    // Создаем простую заглушку
    return createPlaceholderModel(type);
  }

  try {
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync(modelPath);

    // Извлекаем группу из загруженной модели
    const model = gltf.scene;

    // Сохраняем в кэш
    modelCache.set(type, model);

    // Клонируем для использования
    return model.clone();
  } catch (error) {
    console.error(`Failed to load model for type ${type}:`, error);
    // Возвращаем заглушку при ошибке загрузки
    return createPlaceholderModel(type);
  }
};

// Создание заглушки модели (простой Box)
const createPlaceholderModel = (type: Object3DType): THREE.Group => {
  const group = new THREE.Group();
  const scale = DEFAULT_OBJECT_SCALE[type] || { x: 1, y: 1, z: 1 };

  const geometry = new THREE.BoxGeometry(scale.x, scale.y, scale.z);
  const material = new THREE.MeshStandardMaterial({
    color: 0x888888,
    wireframe: false,
  });

  const mesh = new THREE.Mesh(geometry, material);
  group.add(mesh);

  return group;
};

// Предзагрузка всех моделей
export const preloadModels = async (types: Object3DType[]): Promise<void> => {
  const loadPromises = types.map((type) => loadGLBModel(type));
  await Promise.all(loadPromises);
};

