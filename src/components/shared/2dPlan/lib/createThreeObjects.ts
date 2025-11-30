import * as THREE from 'three';
import type { FloorPlanData, FloorPlanElement } from '../types';
import {
  isWallElement,
  isZoneElement,
  isDoorElement,
  isWindowElement,
  isLabelElement,
} from '../types';
import { getColors } from './getColors';
import {
  getWallColor,
  getDoorColor,
  getWindowColor,
  getZoneColor,
} from './getColors';

// Функция для парсинга CSS цвета в Three.js Color с учетом прозрачности
const parseColorWithOpacity = (cssColor: string): { color: THREE.Color; opacity: number } => {
  // Проверяем формат rgba
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
  
  // Обычный hex или названия цветов
  return {
    color: new THREE.Color(cssColor),
    opacity: 1,
  };
};

export const createThreeObjects = (data: FloorPlanData): THREE.Object3D[] => {
  const colors = getColors();
  const objects: THREE.Object3D[] = [];

  // Сортируем элементы: сначала зоны, потом стены, двери, окна, затем метки
  const sortedElements = [...data.elements].sort((a, b) => {
    const order = { zone: 0, wall: 1, door: 2, window: 3, label: 4 };
    return (order[a.type as keyof typeof order] || 99) - (order[b.type as keyof typeof order] || 99);
  });

  sortedElements.forEach((element) => {
    if (isZoneElement(element)) {
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
      
      // Парсим цвет с прозрачностью из CSS переменной
      const { color, opacity } = parseColorWithOpacity(zoneColor);
      
      const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: opacity < 1,
        opacity: opacity,
        side: THREE.DoubleSide,
      });
      
      const mesh = new THREE.Mesh(zoneGeometry, material);
      mesh.userData = { element, originalColor: color.clone(), originalOpacity: opacity };
      
      // Добавляем контур
      const edges = new THREE.EdgesGeometry(zoneGeometry);
      const edgeMaterial = new THREE.LineBasicMaterial({ 
        color: colors.stroke,
        linewidth: 1,
      });
      const edgesLine = new THREE.LineSegments(edges, edgeMaterial);
      mesh.add(edgesLine);
      
      objects.push(mesh);
    } else if (isWallElement(element)) {
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
      
      // Добавляем контур
      const edges = new THREE.EdgesGeometry(wallGeometry);
      const edgeMaterial = new THREE.LineBasicMaterial({ 
        color: colors.stroke,
        linewidth: 1,
      });
      const edgesLine = new THREE.LineSegments(edges, edgeMaterial);
      mesh.add(edgesLine);
      
      objects.push(mesh);
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

      objects.push(doorGroup);
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

        objects.push(windowGroup);
      }
    } else if (isLabelElement(element)) {
      const { geometry, text } = element;
      const { x, y } = geometry;

      // Используем Canvas для текста
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return;

      context.font = '14px system-ui, Avenir, Helvetica, Arial, sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      const metrics = context.measureText(text);
      const textWidth = metrics.width;
      const textHeight = 20;
      const padding = 8;

      canvas.width = textWidth + padding * 2;
      canvas.height = textHeight + padding * 2;

      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.strokeStyle = colors.stroke;
      context.lineWidth = 1;
      context.strokeRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = colors.labelText;
      context.font = '14px system-ui, Avenir, Helvetica, Arial, sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(text, canvas.width / 2, canvas.height / 2);

      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(material);
      sprite.position.set(x, y, 1);
      sprite.scale.set(canvas.width, canvas.height, 1);
      sprite.userData = { element };
      objects.push(sprite);
    }
  });

  return objects;
};

