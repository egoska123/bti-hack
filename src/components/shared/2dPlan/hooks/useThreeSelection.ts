import { useEffect } from 'react';
import * as THREE from 'three';
import type { FloorPlanElement } from '../types';

export const useThreeSelection = (
  sceneRef: React.RefObject<THREE.Scene | null>,
  objectsRef: React.RefObject<THREE.Object3D[]>,
  selectedElement: FloorPlanElement | null
) => {
  useEffect(() => {
    if (!sceneRef.current) return;

    // Используем более яркий цвет для выделения - синий для лучшей видимости
    const selectionColor = new THREE.Color('#2196f3');

    objectsRef.current.forEach((obj) => {
      const element = obj.userData.element as FloorPlanElement | undefined;
      if (!element) return;

      if (element.id === selectedElement?.id) {
        // Выделяем элемент - добавляем контур выделения с отступом
        if (!obj.userData.selectionLine) {
          let selectionGeometry: THREE.BufferGeometry | null = null;
          const offset = 8; // Отступ от края элемента
          
          if (obj instanceof THREE.Mesh) {
            // Для мешей (зоны, стены) используем оригинальную геометрию
            selectionGeometry = obj.geometry.clone();
          } else if (obj instanceof THREE.Line) {
            // Для линий создаем прямоугольник вокруг линии с отступом
            const lineGeometry = obj.geometry as THREE.BufferGeometry;
            const positions = lineGeometry.attributes.position;
            if (positions && positions.count >= 2) {
              const x1 = positions.getX(0);
              const y1 = positions.getY(0);
              const x2 = positions.getX(1);
              const y2 = positions.getY(1);
              
              const dx = x2 - x1;
              const dy = y2 - y1;
              const length = Math.sqrt(dx * dx + dy * dy);
              if (length > 0) {
                const lineOffset = 10;
                const finalPerpX = (-dy / length) * lineOffset;
                const finalPerpY = (dx / length) * lineOffset;
                
                const shape = new THREE.Shape();
                shape.moveTo(x1 + finalPerpX, y1 + finalPerpY);
                shape.lineTo(x2 + finalPerpX, y2 + finalPerpY);
                shape.lineTo(x2 - finalPerpX, y2 - finalPerpY);
                shape.lineTo(x1 - finalPerpX, y1 - finalPerpY);
                shape.closePath();
                selectionGeometry = new THREE.ShapeGeometry(shape);
              }
            }
          } else if (obj instanceof THREE.Group && element.type === 'window') {
            // Для окон (Group) создаем прямоугольник вокруг линии окна
            const windowElement = element as any;
            const [x1, y1, x2, y2] = windowElement.geometry.points;
            const dx = x2 - x1;
            const dy = y2 - y1;
            const length = Math.sqrt(dx * dx + dy * dy);
            if (length > 0) {
              const lineOffset = 12; // Увеличенный отступ для окон
              const finalPerpX = (-dy / length) * lineOffset;
              const finalPerpY = (dx / length) * lineOffset;
              
              const shape = new THREE.Shape();
              shape.moveTo(x1 + finalPerpX, y1 + finalPerpY);
              shape.lineTo(x2 + finalPerpX, y2 + finalPerpY);
              shape.lineTo(x2 - finalPerpX, y2 - finalPerpY);
              shape.lineTo(x1 - finalPerpX, y1 - finalPerpY);
              shape.closePath();
              selectionGeometry = new THREE.ShapeGeometry(shape);
            }
          } else if (obj instanceof THREE.Sprite) {
            // Для спрайтов (метки) создаем прямоугольник вокруг текста с отступом
            const sprite = obj as THREE.Sprite;
            const width = sprite.scale.x / 2;
            const height = sprite.scale.y / 2;
            const shape = new THREE.Shape();
            shape.moveTo(-width - offset, -height - offset);
            shape.lineTo(width + offset, -height - offset);
            shape.lineTo(width + offset, height + offset);
            shape.lineTo(-width - offset, height + offset);
            shape.closePath();
            selectionGeometry = new THREE.ShapeGeometry(shape);
          } else if (obj instanceof THREE.Group && (element.type === 'door' || element.type === 'window')) {
            // Для дверей и окон (Group) создаем прямоугольник вокруг линии
            const doorElement = element as any;
            const [x1, y1, x2, y2] = doorElement.geometry.points;
            const dx = x2 - x1;
            const dy = y2 - y1;
            const length = Math.sqrt(dx * dx + dy * dy);
            if (length > 0) {
              const lineOffset = 10;
              const finalPerpX = (-dy / length) * lineOffset;
              const finalPerpY = (dx / length) * lineOffset;
              
              const shape = new THREE.Shape();
              shape.moveTo(x1 + finalPerpX, y1 + finalPerpY);
              shape.lineTo(x2 + finalPerpX, y2 + finalPerpY);
              shape.lineTo(x2 - finalPerpX, y2 - finalPerpY);
              shape.lineTo(x1 - finalPerpX, y1 - finalPerpY);
              shape.closePath();
              selectionGeometry = new THREE.ShapeGeometry(shape);
            }
          }
          
          if (selectionGeometry) {
            const edges = new THREE.EdgesGeometry(selectionGeometry);
            const selectionMaterial = new THREE.LineDashedMaterial({
              color: selectionColor,
              linewidth: 4, // Увеличиваем толщину линии
              dashSize: 8, // Увеличиваем размер пунктира
              gapSize: 4,
            });
            const selectionLine = new THREE.LineSegments(edges, selectionMaterial);
            selectionLine.computeLineDistances();
            
            // Для спрайтов позиционируем выделение относительно позиции спрайта
            if (obj instanceof THREE.Sprite) {
              selectionLine.position.copy(obj.position);
            } else if (obj instanceof THREE.Group && (element.type === 'door' || element.type === 'window')) {
              // Для групп (двери, окна) позиционируем выделение на z=0
              selectionLine.position.set(0, 0, 0);
            }
            
            obj.userData.selectionLine = selectionLine;
            obj.add(selectionLine);
          }
        }
        
        // Также немного изменяем цвет самого элемента для лучшей видимости
        if (obj instanceof THREE.Mesh) {
          const material = obj.material as THREE.MeshBasicMaterial;
          if (!obj.userData.originalColor) {
            obj.userData.originalColor = material.color.clone();
          }
          // Делаем цвет немного ярче/светлее
          const originalColor = obj.userData.originalColor;
          const brighterColor = originalColor.clone().lerp(new THREE.Color(0xffffff), 0.2);
          material.color.copy(brighterColor);
        } else if (obj instanceof THREE.Line) {
          const material = obj.material as THREE.LineBasicMaterial | THREE.LineDashedMaterial;
          if (!obj.userData.originalColor) {
            obj.userData.originalColor = material.color.clone();
          }
          // Делаем цвет линии ярче
          const originalColor = obj.userData.originalColor;
          const brighterColor = originalColor.clone().lerp(new THREE.Color(0xffffff), 0.3);
          material.color.copy(brighterColor);
        } else if (obj instanceof THREE.Group && (element.type === 'door' || element.type === 'window')) {
          // Для дверей (Group) изменяем цвет всех дочерних элементов
          obj.children.forEach((child) => {
            if (child instanceof THREE.Mesh || child instanceof THREE.Line) {
              const material = child.material as THREE.MeshBasicMaterial | THREE.LineBasicMaterial | THREE.LineDashedMaterial;
              if (!child.userData.originalColor) {
                child.userData.originalColor = material.color.clone();
              }
              if (!child.userData.originalOpacity && 'opacity' in material) {
                child.userData.originalOpacity = material.opacity;
              }
              const originalColor = child.userData.originalColor;
              const brighterColor = originalColor.clone().lerp(new THREE.Color(0xffffff), 0.2);
              material.color.copy(brighterColor);
              // Увеличиваем непрозрачность при выделении
              if ('opacity' in material && child.userData.originalOpacity !== undefined) {
                material.opacity = Math.min(1, (child.userData.originalOpacity || 0.6) + 0.2);
              }
            }
          });
        }
      } else {
        // Снимаем выделение
        if (obj.userData.selectionLine) {
          obj.remove(obj.userData.selectionLine);
          obj.userData.selectionLine.geometry.dispose();
          obj.userData.selectionLine.material.dispose();
          delete obj.userData.selectionLine;
        }
        
        // Восстанавливаем оригинальный цвет элемента
        if (obj.userData.originalColor) {
          if (obj instanceof THREE.Mesh) {
            const material = obj.material as THREE.MeshBasicMaterial;
            material.color.copy(obj.userData.originalColor);
          } else if (obj instanceof THREE.Line) {
            const material = obj.material as THREE.LineBasicMaterial | THREE.LineDashedMaterial;
            material.color.copy(obj.userData.originalColor);
          }
        }
        
        if (obj instanceof THREE.Group && (element.type === 'door' || element.type === 'window')) {
          // Для дверей (Group) восстанавливаем цвет всех дочерних элементов
          obj.children.forEach((child) => {
            if (child instanceof THREE.Mesh || child instanceof THREE.Line) {
              if (child.userData.originalColor) {
                const material = child.material as THREE.MeshBasicMaterial | THREE.LineBasicMaterial | THREE.LineDashedMaterial;
                material.color.copy(child.userData.originalColor);
              }
              if (child.userData.originalOpacity !== undefined && 'opacity' in child.material) {
                child.material.opacity = child.userData.originalOpacity;
              }
            }
          });
        }
      }
    });
  }, [selectedElement, sceneRef, objectsRef]);
};

