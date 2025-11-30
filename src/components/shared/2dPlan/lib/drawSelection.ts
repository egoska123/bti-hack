import type {
  FloorPlanElement,
  WallElement,
  ZoneElement,
  DoorElement,
  WindowElement,
  LabelElement,
} from '../types';
import {
  isWallElement,
  isZoneElement,
  isDoorElement,
  isWindowElement,
  isLabelElement,
} from '../types';
import type { Colors } from './getColors';

const drawWallSelection = (ctx: CanvasRenderingContext2D, wall: WallElement, colors: Colors) => {
  const { geometry, thickness } = wall;
  const [x1, y1, x2, y2] = geometry.points;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  if (length === 0) return;

  const perpX = (-dy / length) * (thickness / 2);
  const perpY = (dx / length) * (thickness / 2);

  // Рисуем контур выделения
  ctx.beginPath();
  ctx.moveTo(x1 + perpX, y1 + perpY);
  ctx.lineTo(x2 + perpX, y2 + perpY);
  ctx.lineTo(x2 - perpX, y2 - perpY);
  ctx.lineTo(x1 - perpX, y1 - perpY);
  ctx.closePath();

  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = 3;
  ctx.setLineDash([5, 5]);
  ctx.stroke();
  ctx.setLineDash([]);
};

const drawZoneSelection = (ctx: CanvasRenderingContext2D, zone: ZoneElement, colors: Colors) => {
  const { points } = zone.geometry;

  if (points.length < 6) return;

  // Рисуем контур выделения
  ctx.beginPath();
  ctx.moveTo(points[0], points[1]);
  for (let i = 2; i < points.length; i += 2) {
    ctx.lineTo(points[i], points[i + 1]);
  }
  ctx.closePath();

  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = 3;
  ctx.setLineDash([5, 5]);
  ctx.stroke();
  ctx.setLineDash([]);
};

const drawDoorSelection = (ctx: CanvasRenderingContext2D, door: DoorElement, colors: Colors) => {
  const { geometry } = door;
  const [x1, y1, x2, y2] = geometry.points;

  // Рисуем контур выделения вокруг двери
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const perpX = (-dy / length) * 8;
  const perpY = (dx / length) * 8;

  ctx.beginPath();
  ctx.moveTo(x1 + perpX, y1 + perpY);
  ctx.lineTo(x2 + perpX, y2 + perpY);
  ctx.lineTo(x2 - perpX, y2 - perpY);
  ctx.lineTo(x1 - perpX, y1 - perpY);
  ctx.closePath();

  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = 3;
  ctx.setLineDash([5, 5]);
  ctx.stroke();
  ctx.setLineDash([]);
};

const drawWindowSelection = (ctx: CanvasRenderingContext2D, window: WindowElement, colors: Colors) => {
  const { geometry } = window;
  const [x1, y1, x2, y2] = geometry.points;

  // Рисуем контур выделения вокруг окна
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const perpX = (-dy / length) * 10;
  const perpY = (dx / length) * 10;

  ctx.beginPath();
  ctx.moveTo(x1 + perpX, y1 + perpY);
  ctx.lineTo(x2 + perpX, y2 + perpY);
  ctx.lineTo(x2 - perpX, y2 - perpY);
  ctx.lineTo(x1 - perpX, y1 - perpY);
  ctx.closePath();

  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = 3;
  ctx.setLineDash([5, 5]);
  ctx.stroke();
  ctx.setLineDash([]);
};

const drawLabelSelection = (ctx: CanvasRenderingContext2D, label: LabelElement, colors: Colors) => {
  const { geometry, text } = label;
  const { x, y } = geometry;

  ctx.font = '14px system-ui, Avenir, Helvetica, Arial, sans-serif';
  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;
  const textHeight = 20;
  const padding = 8;

  // Рисуем контур выделения вокруг метки
  ctx.beginPath();
  ctx.rect(
    x - textWidth / 2 - padding - 2,
    y - textHeight / 2 - padding - 2,
    textWidth + (padding + 2) * 2,
    textHeight + (padding + 2) * 2
  );

  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = 3;
  ctx.setLineDash([5, 5]);
  ctx.stroke();
  ctx.setLineDash([]);
};

export const drawSelection = (
  ctx: CanvasRenderingContext2D,
  element: FloorPlanElement,
  colors: Colors
) => {
  if (isWallElement(element)) {
    drawWallSelection(ctx, element, colors);
  } else if (isZoneElement(element)) {
    drawZoneSelection(ctx, element, colors);
  } else if (isDoorElement(element)) {
    drawDoorSelection(ctx, element, colors);
  } else if (isWindowElement(element)) {
    drawWindowSelection(ctx, element, colors);
  } else if (isLabelElement(element)) {
    drawLabelSelection(ctx, element, colors);
  }
};

