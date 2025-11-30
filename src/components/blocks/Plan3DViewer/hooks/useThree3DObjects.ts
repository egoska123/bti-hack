import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { Plan, PlanElement } from '@/types/plan3d';
import { createWalls } from '../lib/createWalls';
import { createFloors } from '../lib/createFloors';
import { createObjects3D } from '../lib/createObjects3D';

export const useThree3DObjects = (
  sceneRef: React.RefObject<THREE.Scene | null>,
  plan: Plan,
  mode: 'view' | 'walk' = 'view'
) => {
  const wallsRef = useRef<THREE.Mesh[]>([]);
  const floorsRef = useRef<THREE.Mesh[]>([]);
  const objects3DRef = useRef<THREE.Group[]>([]);
  const labelsRef = useRef<THREE.Object3D[]>([]);

  // Создание объектов при изменении плана
  useEffect(() => {
    console.log("[Objects] RENDER OBJECTS EFFECT RUN");
    
    if (!sceneRef.current) return;

    // Удаляем старые объекты ТОЛЬКО в режиме view
    // В режиме walk объекты должны оставаться статичными
    if (mode === 'view') {
      console.warn("[Objects] OBJECTS REMOVED FROM SCENE");
      wallsRef.current.forEach((wall) => {
        wall.geometry.dispose();
        if (Array.isArray(wall.material)) {
          wall.material.forEach((mat) => mat.dispose());
        } else {
          wall.material.dispose();
        }
        sceneRef.current?.remove(wall);
      });

      floorsRef.current.forEach((floor) => {
        floor.geometry.dispose();
        if (Array.isArray(floor.material)) {
          floor.material.forEach((mat) => mat.dispose());
        } else {
          floor.material.dispose();
        }
        sceneRef.current?.remove(floor);
      });

      objects3DRef.current.forEach((obj) => {
        obj.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach((mat) => mat.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
        sceneRef.current?.remove(obj);
      });

      labelsRef.current.forEach((label) => {
        if (label instanceof THREE.Sprite) {
          label.material.map?.dispose();
          label.material.dispose();
        }
        sceneRef.current?.remove(label);
      });
    } else {
      // В режиме walk не очищаем сцену
      console.log("[Objects] WALK MODE - skipping scene cleanup");
    }

    // Создаем новые объекты ТОЛЬКО если их еще нет в сцене или в режиме view
    // В режиме walk используем существующие объекты
    let walls: THREE.Mesh[];
    let floors: THREE.Mesh[];
    
    if (mode === 'view' || wallsRef.current.length === 0) {
      walls = createWalls(plan.elements, plan.meta);
      floors = createFloors(plan.elements, plan.meta);

      walls.forEach((wall) => {
        console.log("[Objects] ADDING wall", wall.uuid);
        sceneRef.current?.add(wall);
      });
      floors.forEach((floor) => {
        console.log("[Objects] ADDING floor", floor.uuid);
        sceneRef.current?.add(floor);
      });

      wallsRef.current = walls;
      floorsRef.current = floors;
    } else {
      // В режиме walk используем существующие объекты
      walls = wallsRef.current;
      floors = floorsRef.current;
      console.log("[Objects] WALK MODE - using existing objects", {
        walls: walls.length,
        floors: floors.length,
      });
    }

    // ДИАГНОСТИКА: Сравниваем размеры стен и пола
    const currentWalls = walls;
    const currentFloors = floors;
    
    if (currentWalls.length > 0 && currentFloors.length > 0) {
      const pxPerMeter = plan.meta.scale?.px_per_meter || 1;
      
      // Обновляем матрицы перед вычислением boundingBox
      currentWalls.forEach((wall) => wall.updateMatrixWorld(true));
      currentFloors.forEach((floor) => floor.updateMatrixWorld(true));
      
      const firstWall = currentWalls[0];
      const firstFloor = currentFloors[0];
      
      const wallBbox = new THREE.Box3().setFromObject(firstWall);
      const floorBbox = new THREE.Box3().setFromObject(firstFloor);
      
      const wallSize = wallBbox.getSize(new THREE.Vector3());
      const floorSize = floorBbox.getSize(new THREE.Vector3());
      
      console.log('=== SCALE COMPARISON ===');
      console.log('Plan dimensions (pixels):', {
        width: plan.meta.width,
        height: plan.meta.height,
        pxPerMeter,
      });
      console.log('Plan dimensions (meters):', {
        width: plan.meta.width / pxPerMeter,
        height: plan.meta.height / pxPerMeter,
      });
      console.log('First wall size (meters):', wallSize.clone());
      console.log('First floor size (meters):', floorSize.clone());
      console.log('Wall position:', firstWall.position.clone());
      console.log('Floor position:', firstFloor.position.clone());
      console.log('Wall bbox:', {
        min: wallBbox.min.clone(),
        max: wallBbox.max.clone(),
        center: wallBbox.getCenter(new THREE.Vector3()).clone(),
      });
      console.log('Floor bbox:', {
        min: floorBbox.min.clone(),
        max: floorBbox.max.clone(),
        center: floorBbox.getCenter(new THREE.Vector3()).clone(),
      });
      console.log('========================');
    }

    // Создаем 3D объекты асинхронно
    if (plan.objects3d && plan.objects3d.length > 0) {
      createObjects3D(plan.objects3d, plan.meta).then((objects) => {
        objects.forEach((obj) => sceneRef.current?.add(obj));
        objects3DRef.current = objects;
      });
    }

    // Создаем метки (PointGeometry)
    const labels: THREE.Object3D[] = [];
    plan.elements.forEach((element) => {
      if (element.geometry.kind === 'point') {
        const { x, y } = element.geometry;
        const pxPerMeter = plan.meta.scale?.px_per_meter || 1;
        const x3D = x / pxPerMeter;
        const z3D = -y / pxPerMeter;

        // Создаем простой биллборд с текстом
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return;

        const text = element.type === 'label' ? (element as any).text : element.id;
        context.font = '24px Arial';
        context.fillStyle = '#000000';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(material);
        sprite.position.set(x3D, 2, z3D);
        sprite.scale.set(2, 2, 1);

        labels.push(sprite);
      }
    });

    labels.forEach((label) => sceneRef.current?.add(label));
    labelsRef.current = labels;

    console.log('=== WALK MODE WALLS CHECK ===');
    // Проверяем, есть ли стены в сцене
    const wallsToCheck = wallsRef.current;
    console.log('Walls count:', wallsToCheck.length);
    // Проверяем bounding box каждой стены
    wallsToCheck.forEach((wall, i) => {
      wall.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(wall);
      console.log(`Wall ${i}:`, {
        pos: wall.position.clone(),
        rot: wall.rotation.clone(),
        bbox: {
          min: box.min.clone(),
          max: box.max.clone(),
          center: box.getCenter(new THREE.Vector3()).clone(),
        }
      });
    });
    // Проверяем материал (двусторонний?)
    wallsToCheck.forEach((wall, i) => {
      if (wall.material.side !== THREE.DoubleSide) {
        console.warn('Wall has FrontSide material!', i);
      }
    });
    // Проверяем слои и видимость
    wallsToCheck.forEach((wall, i) => {
      console.log(`Wall ${i} visible:`, wall.visible, 'layer:', wall.layers.mask);
    });

    // === DEBUG: FORCE ADD WALLS AND FLOORS ===
    setTimeout(() => {
      console.log('=== FORCE ADD CHECK ===');
      const wallsToAdd = wallsRef.current;
      const floorsToAdd = floorsRef.current;
      console.log('Walls array:', wallsToAdd);
      console.log('Floors array:', floorsToAdd);

      const scene = sceneRef.current;
      if (scene) {
        wallsToAdd.forEach((w) => {
          if (scene.children.includes(w)) {
            console.log('WALL already in scene:', w.uuid);
          } else {
            scene.add(w);
            console.log('WALL ADDED:', w.uuid);
          }
        });

        floorsToAdd.forEach((f) => {
          if (scene.children.includes(f)) {
            console.log('FLOOR already in scene:', f.uuid);
          } else {
            scene.add(f);
            console.log('FLOOR ADDED:', f.uuid);
          }
        });

        console.log('Scene children NOW:', scene.children.map((o) => o.type));
      }
    }, 300);
    
    // Финальный лог состояния сцены
    if (sceneRef.current) {
      console.log("[Objects] FINAL SCENE CHILDREN", sceneRef.current.children.map((o) => o.type));
    }
  }, [plan, sceneRef, mode]);

  return {
    wallsRef,
    floorsRef,
    objects3DRef,
    labelsRef,
  };
};

