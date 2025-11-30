import type {
  WallElement,
  ZoneElement,
  DoorElement,
  WindowElement,
  LabelElement,
} from '../types';
import type { Colors } from './getColors';
import { getWallColor, getDoorColor, getWindowColor, getZoneColor } from './getColors';

export const drawWall = (ctx: CanvasRenderingContext2D, wall: WallElement, colors: Colors) => {
  const { geometry, role, loadBearing, thickness } = wall;
  const [x1, y1, x2, y2] = geometry.points;

  const wallColor = getWallColor(role, loadBearing, colors);

  // Вычисляем перпендикулярный вектор для толщины стены
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  if (length === 0) return;

  const perpX = (-dy / length) * (thickness / 2);
  const perpY = (dx / length) * (thickness / 2);

  // Создаем прямоугольник для стены
  ctx.beginPath();
  ctx.moveTo(x1 + perpX, y1 + perpY);
  ctx.lineTo(x2 + perpX, y2 + perpY);
  ctx.lineTo(x2 - perpX, y2 - perpY);
  ctx.lineTo(x1 - perpX, y1 - perpY);
  ctx.closePath();

  // Рисуем заливку
  ctx.fillStyle = wallColor;
  ctx.fill();

  // Рисуем контур
  ctx.strokeStyle = colors.stroke;
  ctx.lineWidth = 1;
  ctx.stroke();
};

export const drawZone = (ctx: CanvasRenderingContext2D, zone: ZoneElement, colors: Colors) => {
  const { geometry, zoneType } = zone;
  const { points } = geometry;

  if (points.length < 6) return; // Минимум 3 точки для полигона

  const zoneColor = getZoneColor(zoneType, colors);

  // Рисуем полигон
  ctx.beginPath();
  ctx.moveTo(points[0], points[1]);
  for (let i = 2; i < points.length; i += 2) {
    ctx.lineTo(points[i], points[i + 1]);
  }
  ctx.closePath();

  // Рисуем заливку
  ctx.fillStyle = zoneColor;
  ctx.fill();

  // Рисуем контур
  ctx.strokeStyle = colors.stroke;
  ctx.lineWidth = 1;
  ctx.stroke();
};

export const drawDoor = (ctx: CanvasRenderingContext2D, door: DoorElement, colors: Colors) => {
  const { geometry, role } = door;
  const [x1, y1, x2, y2] = geometry.points;

  const doorColor = getDoorColor(role, colors);

  // Рисуем линию двери
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);

  ctx.strokeStyle = doorColor;
  ctx.lineWidth = 4;
  ctx.stroke();

  // Рисуем дугу открытия двери (полукруг)
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);

  ctx.beginPath();
  ctx.arc(x1, y1, length, angle, angle + Math.PI, false);
  ctx.strokeStyle = doorColor;
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.stroke();
  ctx.setLineDash([]);
};

export const drawWindow = (ctx: CanvasRenderingContext2D, window: WindowElement, colors: Colors) => {
  const { geometry, role } = window;
  const [x1, y1, x2, y2] = geometry.points;

  const windowColor = getWindowColor(role, colors);

  // Рисуем линию окна
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);

  ctx.strokeStyle = windowColor;
  ctx.lineWidth = 6;
  ctx.stroke();

  // Рисуем перпендикулярные линии для обозначения окна
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const perpX = (-dy / length) * 5;
  const perpY = (dx / length) * 5;

  ctx.beginPath();
  ctx.moveTo(x1 + perpX, y1 + perpY);
  ctx.lineTo(x1 - perpX, y1 - perpY);
  ctx.moveTo(x2 + perpX, y2 + perpY);
  ctx.lineTo(x2 - perpX, y2 - perpY);

  ctx.strokeStyle = windowColor;
  ctx.lineWidth = 2;
  ctx.stroke();
};

export const drawLabel = (ctx: CanvasRenderingContext2D, label: LabelElement, colors: Colors) => {
  const { geometry, text } = label;
  const { x, y } = geometry;

  // Настройки текста
  ctx.font = '14px system-ui, Avenir, Helvetica, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Измеряем размер текста
  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;
  const textHeight = 20;

  // Рисуем фон для текста (полностью непрозрачный, чтобы был поверх зон)
  const padding = 8;
  // Используем белый непрозрачный фон вместо полупрозрачного
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(
    x - textWidth / 2 - padding,
    y - textHeight / 2 - padding,
    textWidth + padding * 2,
    textHeight + padding * 2
  );

  // Рисуем контур фона для лучшей видимости
  ctx.strokeStyle = colors.stroke;
  ctx.lineWidth = 1;
  ctx.strokeRect(
    x - textWidth / 2 - padding,
    y - textHeight / 2 - padding,
    textWidth + padding * 2,
    textHeight + padding * 2
  );

  // Рисуем текст
  ctx.fillStyle = colors.labelText;
  ctx.fillText(text, x, y);
};

