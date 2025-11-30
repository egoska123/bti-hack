import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { FloorPlanData, FloorPlanElement, ZoneElement } from '../types';
import {
  isWallElement,
  isZoneElement,
  isDoorElement,
  isWindowElement,
} from '../types';
import { getColors } from '../lib/getColors';
import {
  getWallColor,
  getDoorColor,
  getWindowColor,
  getZoneColor,
} from '../lib/getColors';
import { createThreeObjects } from '../lib/createThreeObjects';

// Функция для парсинга CSS цвета в Three.js Color с учетом прозрачности
const parseColorWithOpacity = (cssColor: string): { color: THREE.Color; opacity: number } => {
  const rgbaMatch = cssColor.match(/rgba?\(([^)]+)\)/);
  if (rgbaMatch) {
    const values = rgbaMatch[1].split(',').map(v => v.trim());
    const r = parseInt(values[0]);
    const g = parseInt(values[1]);
    const b = parseInt(values[2]);
    const a = values[3] ? parseFloat(values[3]) : 1;
    return {
      color: new THREE.Color(r / 255, g / 255, b / 255),
      opacity: a,
    };
  }
  return {
    color: new THREE.Color(cssColor),
    opacity: 1,
  };
};

export const useThreeObjects = (
  sceneRef: React.RefObject<THREE.Scene | null>,
  data: FloorPlanData
) => {
  const objectsRef = useRef<THREE.Object3D[]>([]);
  const dataRef = useRef<FloorPlanData>(data);
  
  // Обновляем ref данных
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Создание и обновление объектов при изменении данных
  useEffect(() => {
    if (!sceneRef.current) return;

    // Удаляем старые объекты
    objectsRef.current.forEach((obj) => {
      if (obj instanceof THREE.Mesh || obj instanceof THREE.Line || obj instanceof THREE.Sprite) {
        if (obj.geometry) {
          obj.geometry.dispose();
        }
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Line) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((mat) => mat.dispose());
          } else {
            obj.material.dispose();
          }
        } else if (obj instanceof THREE.Sprite) {
          obj.material.map?.dispose();
          obj.material.dispose();
        }
      }
      sceneRef.current?.remove(obj);
    });

    // Создаем новые объекты
    const objects = createThreeObjects(data);
    objects.forEach((obj) => sceneRef.current?.add(obj));
    objectsRef.current = objects;
  }, [data, sceneRef]);

  // Функция для обновления позиции элемента
  const updateElementPosition = (elementId: string, dx: number, dy: number) => {
    if (!sceneRef.current) return;
    
    const element = dataRef.current.elements.find(el => el.id === elementId);
    if (!element || (element.type !== 'wall' && element.type !== 'door' && element.type !== 'window' && element.type !== 'zone')) return;
    
    // Обновляем геометрию элемента в dataRef
    if (element.type === 'wall' || element.type === 'door' || element.type === 'window') {
      // Для элементов с сегментной геометрией
      const [x1, y1, x2, y2] = element.geometry.points;
      element.geometry.points = [x1 + dx, y1 + dy, x2 + dx, y2 + dy] as [number, number, number, number];
    } else if (element.type === 'zone') {
      // Для зон обновляем все точки полигона
      element.geometry.points = element.geometry.points.map((coord, index) => {
        if (index % 2 === 0) {
          // X координата
          return coord + dx;
        } else {
          // Y координата
          return coord + dy;
        }
      });
    }
    
    // Находим объект в сцене и обновляем его
    const obj = objectsRef.current.find(o => o.userData.element?.id === elementId);
    
    if (element.type === 'wall' && obj && obj instanceof THREE.Mesh) {
      const wallElement = element;
      const { geometry: originalGeometry, thickness } = wallElement;
      const [newX1, newY1, newX2, newY2] = originalGeometry.points;
      
      const dx_wall = newX2 - newX1;
      const dy_wall = newY2 - newY1;
      const length = Math.sqrt(dx_wall * dx_wall + dy_wall * dy_wall);
      if (length === 0) return;
      
      const perpX = (-dy_wall / length) * (thickness / 2);
      const perpY = (dx_wall / length) * (thickness / 2);
      
      const shape = new THREE.Shape();
      shape.moveTo(newX1 + perpX, newY1 + perpY);
      shape.lineTo(newX2 + perpX, newY2 + perpY);
      shape.lineTo(newX2 - perpX, newY2 - perpY);
      shape.lineTo(newX1 - perpX, newY1 - perpY);
      shape.closePath();
      
      // Удаляем старую геометрию
      obj.geometry.dispose();
      
      // Создаем новую геометрию
      const wallGeometry = new THREE.ShapeGeometry(shape);
      obj.geometry = wallGeometry;
      
      // Обновляем контур
      obj.children.forEach(child => {
        if (child instanceof THREE.LineSegments && child !== obj.userData.selectionLine) {
          child.geometry.dispose();
          const edges = new THREE.EdgesGeometry(wallGeometry);
          child.geometry = edges;
        }
      });
      
      // Обновляем выделение если есть
      if (obj.userData.selectionLine) {
        obj.userData.selectionLine.geometry.dispose();
        const edges = new THREE.EdgesGeometry(wallGeometry);
        obj.userData.selectionLine.geometry = edges;
        obj.userData.selectionLine.computeLineDistances();
      }
    } else if ((element.type === 'door' || element.type === 'window') && obj) {
      // Для дверей и окон нужно пересоздать объект через updateElement
      // Это проще, чем обновлять все линии в группе
      updateElement(element);
    } else if (element.type === 'zone' && obj && obj instanceof THREE.Mesh) {
      // Для зон обновляем геометрию полигона
      // Точки уже обновлены в dataRef в начале функции updateElementPosition
      // Получаем актуальный элемент из dataRef после обновления
      const updatedElement = dataRef.current.elements.find(el => el.id === elementId);
      if (!updatedElement || updatedElement.type !== 'zone') return;
      
      const { points } = updatedElement.geometry;

      const shape = new THREE.Shape();
      for (let i = 0; i < points.length; i += 2) {
        if (i === 0) {
          shape.moveTo(points[i], points[i + 1]);
        } else {
          shape.lineTo(points[i], points[i + 1]);
        }
      }
      shape.closePath();

      const zoneGeometry = new THREE.ShapeGeometry(shape);
      const zoneColor = getZoneColor(updatedElement.zoneType, getColors());
      const { color, opacity } = parseColorWithOpacity(zoneColor);
      
      // Удаляем старую геометрию
      obj.geometry.dispose();
      
      // Создаем новую геометрию
      obj.geometry = zoneGeometry;
      
      // Обновляем материал если нужно
      if (obj.material instanceof THREE.MeshBasicMaterial) {
        obj.material.color.copy(color);
        obj.material.opacity = opacity;
        obj.material.transparent = opacity < 1;
      }
      
      // Обновляем контур
      obj.children.forEach(child => {
        if (child instanceof THREE.LineSegments && child !== obj.userData.selectionLine) {
          child.geometry.dispose();
          const edges = new THREE.EdgesGeometry(zoneGeometry);
          child.geometry = edges;
        }
      });
      
      // Обновляем выделение если есть
      if (obj.userData.selectionLine) {
        obj.userData.selectionLine.geometry.dispose();
        const edges = new THREE.EdgesGeometry(zoneGeometry);
        obj.userData.selectionLine.geometry = edges;
        obj.userData.selectionLine.computeLineDistances();
      }
    }
  };

  // Функция для обновления элемента (при изменении размеров) или добавления нового
  const updateElement = (element: FloorPlanElement) => {
    if (!sceneRef.current) return;
    
    const colors = getColors();
    
    // Находим объект в сцене
    const obj = objectsRef.current.find(o => o.userData.element?.id === element.id);
    
    // Если объект существует, удаляем его
    if (obj) {
      sceneRef.current.remove(obj);
      if (obj instanceof THREE.Mesh || obj instanceof THREE.Line || obj instanceof THREE.Sprite) {
        if (obj.geometry) {
          obj.geometry.dispose();
        }
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Line) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((mat) => mat.dispose());
          } else {
            obj.material.dispose();
          }
        } else if (obj instanceof THREE.Sprite) {
          obj.material.map?.dispose();
          obj.material.dispose();
        }
      } else if (obj instanceof THREE.Group) {
        // Для групп удаляем все дочерние элементы
        obj.children.forEach((child) => {
          if (child instanceof THREE.Mesh || child instanceof THREE.Line) {
            if (child.geometry) {
              child.geometry.dispose();
            }
            if (Array.isArray(child.material)) {
              child.material.forEach((mat) => mat.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
      }
    }
    
    // Создаем новый объект с обновленной геометрией (или новый элемент)
    let newObj: THREE.Object3D | null = null;
    
    if (isWallElement(element)) {
      const { geometry, role, loadBearing, thickness } = element;
      const [x1, y1, x2, y2] = geometry.points;
      const wallColor = getWallColor(role, loadBearing, colors);

      const dx = x2 - x1;
      const dy = y2 - y1;
      const length = Math.sqrt(dx * dx + dy * dy);
      if (length === 0) return;

      const perpX = (-dy / length) * (thickness / 2);
      const perpY = (dx / length) * (thickness / 2);

      const shape = new THREE.Shape();
      shape.moveTo(x1 + perpX, y1 + perpY);
      shape.lineTo(x2 + perpX, y2 + perpY);
      shape.lineTo(x2 - perpX, y2 - perpY);
      shape.lineTo(x1 - perpX, y1 - perpY);
      shape.closePath();

      const wallGeometry = new THREE.ShapeGeometry(shape);
      const color = new THREE.Color(wallColor);
      const material = new THREE.MeshBasicMaterial({
        color: color,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(wallGeometry, material);
      mesh.userData = { element, originalColor: color.clone() };
      
      const edges = new THREE.EdgesGeometry(wallGeometry);
      const edgeMaterial = new THREE.LineBasicMaterial({ 
        color: colors.stroke,
        linewidth: 1,
      });
      const edgesLine = new THREE.LineSegments(edges, edgeMaterial);
      mesh.add(edgesLine);
      
      newObj = mesh;
    } else if (isZoneElement(element)) {
      const zoneColor = getZoneColor(element.zoneType, colors);
      const { points } = element.geometry;

      const shape = new THREE.Shape();
      for (let i = 0; i < points.length; i += 2) {
        if (i === 0) {
          shape.moveTo(points[i], points[i + 1]);
        } else {
          shape.lineTo(points[i], points[i + 1]);
        }
      }

      const zoneGeometry = new THREE.ShapeGeometry(shape);
      const { color, opacity } = parseColorWithOpacity(zoneColor);
      
      const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: opacity < 1,
        opacity: opacity,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(zoneGeometry, material);
      mesh.userData = { element, originalColor: color.clone(), originalOpacity: opacity };
      
      const edges = new THREE.EdgesGeometry(zoneGeometry);
      const edgeMaterial = new THREE.LineBasicMaterial({ 
        color: colors.stroke,
        linewidth: 1,
      });
      const edgesLine = new THREE.LineSegments(edges, edgeMaterial);
      mesh.add(edgesLine);
      
      newObj = mesh;
    } else if (isDoorElement(element)) {
      const { geometry, role } = element;
      const [x1, y1, x2, y2] = geometry.points;
      const doorColor = getDoorColor(role, colors);
      // Делаем цвет двери менее акцентным - смешиваем с серым
      const baseColor = new THREE.Color(doorColor);
      const mutedColor = baseColor.clone().lerp(new THREE.Color(0x888888), 0.5);

      // Создаем группу для всех элементов двери
      const doorGroup = new THREE.Group();
      doorGroup.userData = { element, originalColor: mutedColor.clone() };

      // 1. Линия проема двери (от x1,y1 до x2,y2) - сплошная
      const wallLineMaterial = new THREE.LineBasicMaterial({ 
        color: mutedColor, 
        linewidth: 1,
        opacity: 0.8,
        transparent: true,
      });
      const wallLinePoints = [
        new THREE.Vector3(x1, y1, 0.1),
        new THREE.Vector3(x2, y2, 0.1),
      ];
      const wallLineGeometry = new THREE.BufferGeometry().setFromPoints(wallLinePoints);
      const wallLine = new THREE.Line(wallLineGeometry, wallLineMaterial);
      doorGroup.add(wallLine);

      // 2. Линия створки двери (перпендикулярно от петли)
      const hingeX = x1;
      const hingeY = y1;
      const doorEndX = x2;
      const doorEndY = y2;
      
      // Вычисляем длину двери и направление
      const dx = doorEndX - hingeX;
      const dy = doorEndY - hingeY;
      const doorLength = Math.sqrt(dx * dx + dy * dy);
      
      if (doorLength > 0) {
        const angle = Math.atan2(dy, dx);
        
        // Линия створки идет перпендикулярно от петли
        const leafEndX = hingeX + Math.cos(angle + Math.PI / 2) * doorLength;
        const leafEndY = hingeY + Math.sin(angle + Math.PI / 2) * doorLength;
        
        const doorLeafMaterial = new THREE.LineBasicMaterial({ 
          color: mutedColor, 
          linewidth: 1,
          opacity: 0.7,
          transparent: true,
        });
        const doorLeafPoints = [
          new THREE.Vector3(hingeX, hingeY, 0.1),
          new THREE.Vector3(leafEndX, leafEndY, 0.1),
        ];
        const doorLeafGeometry = new THREE.BufferGeometry().setFromPoints(doorLeafPoints);
        const doorLeafLine = new THREE.Line(doorLeafGeometry, doorLeafMaterial);
        doorGroup.add(doorLeafLine);

        // 3. Пунктирная дуга открытия двери (четверть круга от конца створки)
        const perpAngle = angle + Math.PI / 2;
        const startAngle = perpAngle; // Начинаем от направления створки
        const endAngle = angle; // Заканчиваем вдоль линии проема (к концу двери)
        
        const arcPoints: THREE.Vector3[] = [];
        const arcSegments = 16;
        
        for (let i = 0; i <= arcSegments; i++) {
          const t = i / arcSegments;
          const currentAngle = startAngle + (endAngle - startAngle) * t;
          const arcX = hingeX + Math.cos(currentAngle) * doorLength;
          const arcY = hingeY + Math.sin(currentAngle) * doorLength;
          arcPoints.push(new THREE.Vector3(arcX, arcY, 0.1));
        }
        
        const arcGeometry = new THREE.BufferGeometry().setFromPoints(arcPoints);
        
        const arcMaterial = new THREE.LineDashedMaterial({ 
          color: mutedColor, 
          linewidth: 1,
          dashSize: 2,
          gapSize: 2,
          opacity: 0.5,
          transparent: true,
        });
        const arcLine = new THREE.Line(arcGeometry, arcMaterial);
        arcLine.computeLineDistances();
        doorGroup.add(arcLine);

        // 4. Пунктирная замыкающая линия от петли до конца двери (красная линия на фото)
        const closingLineMaterial = new THREE.LineDashedMaterial({ 
          color: mutedColor, 
          linewidth: 1,
          dashSize: 2,
          gapSize: 2,
          opacity: 0.7,
          transparent: true,
        });
        const closingLinePoints = [
          new THREE.Vector3(hingeX, hingeY, 0.1), // От петли
          new THREE.Vector3(doorEndX, doorEndY, 0.1), // До конца двери
        ];
        const closingLineGeometry = new THREE.BufferGeometry().setFromPoints(closingLinePoints);
        const closingLine = new THREE.Line(closingLineGeometry, closingLineMaterial);
        closingLine.computeLineDistances(); // Необходимо для пунктирной линии
        doorGroup.add(closingLine);
      }

      newObj = doorGroup;
    } else if (isWindowElement(element)) {
      const { geometry, role } = element;
      const [x1, y1, x2, y2] = geometry.points;
      const windowColor = getWindowColor(role, colors);
      const color = new THREE.Color(windowColor);

      // Вычисляем направление линии
      const dx = x2 - x1;
      const dy = y2 - y1;
      const length = Math.sqrt(dx * dx + dy * dy);
      
      if (length > 0) {
        // Создаем группу для окна (несколько параллельных линий для эффекта толщины)
        const windowGroup = new THREE.Group();
        windowGroup.userData = { element, originalColor: color.clone() };

        // Создаем несколько параллельных линий для эффекта толстой линии
        const lineWidth = 6; // Толщина в пикселях
        const numLines = 3; // Количество параллельных линий
        
        for (let i = 0; i < numLines; i++) {
          const offset = (i - (numLines - 1) / 2) * (lineWidth / numLines);
          const perpX = (-dy / length) * offset;
          const perpY = (dx / length) * offset;

          const material = new THREE.LineBasicMaterial({ 
            color: color,
            linewidth: 1,
          });
          const points = [
            new THREE.Vector3(x1 + perpX, y1 + perpY, 0.1),
            new THREE.Vector3(x2 + perpX, y2 + perpY, 0.1),
          ];
          const windowGeometry = new THREE.BufferGeometry().setFromPoints(points);
          const line = new THREE.Line(windowGeometry, material);
          windowGroup.add(line);
        }

        newObj = windowGroup;
      }
    }
    
    if (newObj) {
      // Добавляем новый объект в сцену
      sceneRef.current.add(newObj);
      
      // Обновляем ссылку в массиве объектов
      const index = objectsRef.current.findIndex(o => o.userData.element?.id === element.id);
      if (index !== -1) {
        objectsRef.current[index] = newObj;
      } else {
        objectsRef.current.push(newObj);
      }
    }
  };

  return { objectsRef, updateElementPosition, updateElement };
};

