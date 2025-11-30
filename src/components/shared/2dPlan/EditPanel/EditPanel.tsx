import { useState, useEffect, useRef } from 'react';
import type { FloorPlanElement } from '../types';
import { isWallElement, isZoneElement, isDoorElement, isWindowElement } from '../types';
import { RotationControl } from './RotationControl';
import styles from './EditPanel.module.css';

export interface EditPanelProps {
  element: FloorPlanElement;
  pxPerMeter: number;
  onClose: () => void;
  onSave: (element: FloorPlanElement, shouldClose?: boolean) => void;
  onDelete?: (elementId: string) => void;
  position: { x: number; y: number };
}

export const EditPanel = ({ element, pxPerMeter, onClose, onSave, onDelete, position }: EditPanelProps) => {
  const [editedElement, setEditedElement] = useState<FloorPlanElement>(element);
  // Храним оригинальную геометрию БЕЗ поворота для правильного применения поворота
  // При первом открытии панели сохраняем геометрию элемента как оригинальную
  const originalGeometryRef = useRef<{ points: number[] | [number, number, number, number]; kind: 'segment' | 'polygon' } | null>(null);
  const originalRotationRef = useRef<number>(
    (isWallElement(element) || isDoorElement(element) || isWindowElement(element) || isZoneElement(element))
      ? (element.rotation || 0)
      : 0
  );

  useEffect(() => {
    setEditedElement(element);
    // Сохраняем оригинальную геометрию при первом открытии панели
    // Если у элемента есть rotation, нужно "откатить" его, чтобы получить оригинальную геометрию
    if (originalGeometryRef.current === null) {
      const currentRotation = (isWallElement(element) || isDoorElement(element) || isWindowElement(element) || isZoneElement(element)) 
        ? (element.rotation || 0) 
        : 0;
      originalRotationRef.current = currentRotation;
      
      // Если элемент уже повернут, откатываем поворот, чтобы получить оригинальную геометрию
      if (currentRotation !== 0) {
        if (isWallElement(element) || isDoorElement(element) || isWindowElement(element)) {
          const [x1, y1, x2, y2] = element.geometry.points;
          const centerX = (x1 + x2) / 2;
          const centerY = (y1 + y2) / 2;
          // Откатываем поворот (поворачиваем в обратную сторону)
          const reverted = rotatePoints([x1, y1, x2, y2], centerX, centerY, -currentRotation);
          originalGeometryRef.current = {
            kind: 'segment',
            points: [reverted[0], reverted[1], reverted[2], reverted[3]] as [number, number, number, number],
          };
        } else if (isZoneElement(element)) {
          const points = element.geometry.points;
          let centerX = 0, centerY = 0;
          for (let i = 0; i < points.length; i += 2) {
            centerX += points[i];
            centerY += points[i + 1];
          }
          centerX /= points.length / 2;
          centerY /= points.length / 2;
          // Откатываем поворот
          const reverted = rotatePoints(points, centerX, centerY, -currentRotation);
          originalGeometryRef.current = {
            kind: 'polygon',
            points: reverted,
          };
        }
      } else {
        // Если поворота нет, просто сохраняем текущую геометрию
        if (isWallElement(element) || isDoorElement(element) || isWindowElement(element)) {
          originalGeometryRef.current = {
            kind: 'segment',
            points: element.geometry.points,
          };
        } else if (isZoneElement(element)) {
          originalGeometryRef.current = {
            kind: 'polygon',
            points: element.geometry.points,
          };
        }
      }
    }
  }, [element]);

  const handleSave = () => {
    onSave(editedElement, true);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(element.id);
      onClose();
    }
  };

  // Конвертация метров в пиксели
  const metersToPixels = (meters: number) => meters * pxPerMeter;
  // Конвертация пикселей в метры
  const pixelsToMeters = (pixels: number) => pixels / pxPerMeter;

  // Функция для вращения точек вокруг центра
  const rotatePoints = (
    points: number[],
    centerX: number,
    centerY: number,
    angleDegrees: number
  ): number[] => {
    const angleRad = (angleDegrees * Math.PI) / 180;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    
    const rotated: number[] = [];
    for (let i = 0; i < points.length; i += 2) {
      const x = points[i] - centerX;
      const y = points[i + 1] - centerY;
      
      // Поворот по часовой стрелке (меняем знак синуса)
      const rotatedX = x * cos + y * sin;
      const rotatedY = -x * sin + y * cos;
      
      rotated.push(rotatedX + centerX, rotatedY + centerY);
    }
    return rotated;
  };

  const handleRotationChange = (angle: number) => {
    // Используем сохраненную оригинальную геометрию для правильного применения поворота
    if (!originalGeometryRef.current) return;
    
    const originalGeometry = originalGeometryRef.current;
    let updatedElement: FloorPlanElement;
    
    // Применяем поворот на заданный угол к оригинальной геометрии
    if (originalGeometry.kind === 'segment') {
      const [x1, y1, x2, y2] = originalGeometry.points;
      const centerX = (x1 + x2) / 2;
      const centerY = (y1 + y2) / 2;
      const rotated = rotatePoints([x1, y1, x2, y2], centerX, centerY, angle);
      
      if (isWallElement(editedElement)) {
        updatedElement = {
          ...editedElement,
          rotation: angle,
          geometry: {
            kind: 'segment',
            points: [rotated[0], rotated[1], rotated[2], rotated[3]] as [number, number, number, number],
          },
        };
      } else if (isDoorElement(editedElement)) {
        updatedElement = {
          ...editedElement,
          rotation: angle,
          geometry: {
            kind: 'segment',
            points: [rotated[0], rotated[1], rotated[2], rotated[3]] as [number, number, number, number],
          },
        };
      } else if (isWindowElement(editedElement)) {
        updatedElement = {
          ...editedElement,
          rotation: angle,
          geometry: {
            kind: 'segment',
            points: [rotated[0], rotated[1], rotated[2], rotated[3]] as [number, number, number, number],
          },
        };
      } else {
        updatedElement = editedElement;
      }
    } else if (originalGeometry.kind === 'polygon' && isZoneElement(editedElement)) {
      const points = originalGeometry.points;
      // Вычисляем центр зоны из оригинальной геометрии
      let centerX = 0, centerY = 0;
      for (let i = 0; i < points.length; i += 2) {
        centerX += points[i];
        centerY += points[i + 1];
      }
      centerX /= points.length / 2;
      centerY /= points.length / 2;
      
      const rotated = rotatePoints(points, centerX, centerY, angle);
      
      updatedElement = {
        ...editedElement,
        rotation: angle,
        geometry: {
          kind: 'polygon',
          points: rotated,
        },
      };
    } else {
      // Для других типов элементов просто обновляем rotation
      updatedElement = { ...editedElement, rotation: angle } as FloorPlanElement;
    }
    
    setEditedElement(updatedElement);
    
    // Обновляем в реальном времени (не закрываем панель)
    onSave(updatedElement, false);
  };

  if (isWallElement(editedElement)) {
    const wall = editedElement;
    const [x1, y1, x2, y2] = wall.geometry.points;
    const lengthPx = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const lengthM = pixelsToMeters(lengthPx);
    const thicknessM = pixelsToMeters(wall.thickness);

    const [lengthInput, setLengthInput] = useState(lengthM.toFixed(2));
    const [thicknessInput, setThicknessInput] = useState(thicknessM.toFixed(2));

    useEffect(() => {
      setLengthInput(lengthM.toFixed(2));
      setThicknessInput(thicknessM.toFixed(2));
    }, [lengthM, thicknessM]);

    const handleLengthChange = (value: string) => {
      setLengthInput(value);
      const numValue = parseFloat(value.replace(',', '.')) || 0;
      if (numValue > 0) {
        const newLengthPx = metersToPixels(numValue);
        const scale = newLengthPx / lengthPx;
        const centerX = (x1 + x2) / 2;
        const centerY = (y1 + y2) / 2;
        const dx = (x2 - x1) / 2;
        const dy = (y2 - y1) / 2;
        
        const newPoints = [
          centerX - dx * scale,
          centerY - dy * scale,
          centerX + dx * scale,
          centerY + dy * scale,
        ] as [number, number, number, number];
        
        // Обновляем оригинальную геометрию для правильного применения поворота
        if (originalGeometryRef.current && originalGeometryRef.current.kind === 'segment') {
          originalGeometryRef.current = {
            kind: 'segment',
            points: newPoints,
          };
        }
        
        setEditedElement({
          ...wall,
          geometry: {
            ...wall.geometry,
            points: newPoints,
          },
        });
      }
    };

    const handleThicknessChange = (value: string) => {
      setThicknessInput(value);
      const numValue = parseFloat(value.replace(',', '.')) || 0;
      if (numValue > 0) {
        setEditedElement({
          ...wall,
          thickness: metersToPixels(numValue),
        });
      }
    };

    return (
      <div
        className={styles.panel}
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h3 className={styles.title}>Редактирование стены</h3>
          <button className={styles.closeButton} onClick={handleCancel} aria-label="Закрыть">
            ×
          </button>
        </div>
        <div className={styles.content}>
          <div className={styles.field}>
            <label className={styles.label}>Длина (м)</label>
            <input
              type="text"
              value={lengthInput}
              onChange={(e) => handleLengthChange(e.target.value)}
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Толщина (м)</label>
            <input
              type="text"
              value={thicknessInput}
              onChange={(e) => handleThicknessChange(e.target.value)}
              className={styles.input}
            />
          </div>
          <RotationControl
            value={wall.rotation || 0}
            onChange={handleRotationChange}
            size={100}
          />
        </div>
        <div className={styles.footer}>
          {onDelete && (
            <button className={`${styles.button} ${styles.buttonDanger}`} onClick={handleDelete}>
              Удалить
            </button>
          )}
          <button className={styles.button} onClick={handleCancel}>
            Отмена
          </button>
          <button className={`${styles.button} ${styles.buttonPrimary}`} onClick={handleSave}>
            Сохранить
          </button>
        </div>
      </div>
    );
  }

  if (isZoneElement(editedElement)) {
    const zone = editedElement;
    const points = zone.geometry.points;
    
    // Вычисляем размеры зоны (bounding box)
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (let i = 0; i < points.length; i += 2) {
      minX = Math.min(minX, points[i]);
      minY = Math.min(minY, points[i + 1]);
      maxX = Math.max(maxX, points[i]);
      maxY = Math.max(maxY, points[i + 1]);
    }
    
    const widthPx = maxX - minX;
    const heightPx = maxY - minY;
    const widthM = pixelsToMeters(widthPx);
    const heightM = pixelsToMeters(heightPx);

    const [widthInput, setWidthInput] = useState(widthM.toFixed(2));
    const [heightInput, setHeightInput] = useState(heightM.toFixed(2));

    useEffect(() => {
      setWidthInput(widthM.toFixed(2));
      setHeightInput(heightM.toFixed(2));
    }, [widthM, heightM]);

    const handleWidthChange = (value: string) => {
      setWidthInput(value);
      const numValue = parseFloat(value.replace(',', '.')) || 0;
      if (numValue > 0) {
        const newWidthPx = metersToPixels(numValue);
        const scale = newWidthPx / widthPx;
        const centerX = (minX + maxX) / 2;
        
        const newPoints = points.map((coord, index) => {
          if (index % 2 === 0) {
            // X координата
            return centerX + (coord - centerX) * scale;
          }
          return coord;
        });
        
        // Обновляем оригинальную геометрию для правильного применения поворота
        if (originalGeometryRef.current && originalGeometryRef.current.kind === 'polygon') {
          originalGeometryRef.current = {
            kind: 'polygon',
            points: newPoints,
          };
        }
        
        setEditedElement({
          ...zone,
          geometry: {
            ...zone.geometry,
            points: newPoints,
          },
        });
      }
    };

    const handleHeightChange = (value: string) => {
      setHeightInput(value);
      const numValue = parseFloat(value.replace(',', '.')) || 0;
      if (numValue > 0) {
        const newHeightPx = metersToPixels(numValue);
        const scale = newHeightPx / heightPx;
        const centerY = (minY + maxY) / 2;
        
        const newPoints = points.map((coord, index) => {
          if (index % 2 === 1) {
            // Y координата
            return centerY + (coord - centerY) * scale;
          }
          return coord;
        });
        
        // Обновляем оригинальную геометрию для правильного применения поворота
        if (originalGeometryRef.current && originalGeometryRef.current.kind === 'polygon') {
          originalGeometryRef.current = {
            kind: 'polygon',
            points: newPoints,
          };
        }
        
        setEditedElement({
          ...zone,
          geometry: {
            ...zone.geometry,
            points: newPoints,
          },
        });
      }
    };

    return (
      <div
        className={styles.panel}
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h3 className={styles.title}>Редактирование зоны</h3>
          <button className={styles.closeButton} onClick={handleCancel} aria-label="Закрыть">
            ×
          </button>
        </div>
        <div className={styles.content}>
          <div className={styles.field}>
            <label className={styles.label}>Ширина (м)</label>
            <input
              type="text"
              value={widthInput}
              onChange={(e) => handleWidthChange(e.target.value)}
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Высота (м)</label>
            <input
              type="text"
              value={heightInput}
              onChange={(e) => handleHeightChange(e.target.value)}
              className={styles.input}
            />
          </div>
          <RotationControl
            value={zone.rotation || 0}
            onChange={handleRotationChange}
            size={100}
          />
        </div>
        <div className={styles.footer}>
          {onDelete && (
            <button className={`${styles.button} ${styles.buttonDanger}`} onClick={handleDelete}>
              Удалить
            </button>
          )}
          <button className={styles.button} onClick={handleCancel}>
            Отмена
          </button>
          <button className={`${styles.button} ${styles.buttonPrimary}`} onClick={handleSave}>
            Сохранить
          </button>
        </div>
      </div>
    );
  }

  if (isDoorElement(editedElement)) {
    const door = editedElement;
    const [x1, y1, x2, y2] = door.geometry.points;
    const widthPx = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const widthM = pixelsToMeters(widthPx);

    const [widthInput, setWidthInput] = useState(widthM.toFixed(2));

    useEffect(() => {
      setWidthInput(widthM.toFixed(2));
    }, [widthM]);

    const handleWidthChange = (value: string) => {
      setWidthInput(value);
      const numValue = parseFloat(value.replace(',', '.')) || 0;
      if (numValue > 0) {
        const newWidthPx = metersToPixels(numValue);
        const scale = newWidthPx / widthPx;
        const centerX = (x1 + x2) / 2;
        const centerY = (y1 + y2) / 2;
        const dx = (x2 - x1) / 2;
        const dy = (y2 - y1) / 2;
        
        const newPoints = [
          centerX - dx * scale,
          centerY - dy * scale,
          centerX + dx * scale,
          centerY + dy * scale,
        ] as [number, number, number, number];
        
        // Обновляем оригинальную геометрию для правильного применения поворота
        if (originalGeometryRef.current && originalGeometryRef.current.kind === 'segment') {
          originalGeometryRef.current = {
            kind: 'segment',
            points: newPoints,
          };
        }
        
        setEditedElement({
          ...door,
          geometry: {
            ...door.geometry,
            points: newPoints,
          },
        });
      }
    };

    return (
      <div
        className={styles.panel}
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h3 className={styles.title}>Редактирование двери</h3>
          <button className={styles.closeButton} onClick={handleCancel} aria-label="Закрыть">
            ×
          </button>
        </div>
        <div className={styles.content}>
          <div className={styles.field}>
            <label className={styles.label}>Ширина (м)</label>
            <input
              type="text"
              value={widthInput}
              onChange={(e) => handleWidthChange(e.target.value)}
              className={styles.input}
            />
          </div>
          <RotationControl
            value={door.rotation || 0}
            onChange={handleRotationChange}
            size={100}
          />
        </div>
        <div className={styles.footer}>
          {onDelete && (
            <button className={`${styles.button} ${styles.buttonDanger}`} onClick={handleDelete}>
              Удалить
            </button>
          )}
          <button className={styles.button} onClick={handleCancel}>
            Отмена
          </button>
          <button className={`${styles.button} ${styles.buttonPrimary}`} onClick={handleSave}>
            Сохранить
          </button>
        </div>
      </div>
    );
  }

  if (isWindowElement(editedElement)) {
    const window = editedElement;
    const [x1, y1, x2, y2] = window.geometry.points;
    const widthPx = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const widthM = pixelsToMeters(widthPx);

    const [widthInput, setWidthInput] = useState(widthM.toFixed(2));
    const [sillHeightInput, setSillHeightInput] = useState(window.sillHeight_m.toFixed(2));

    useEffect(() => {
      setWidthInput(widthM.toFixed(2));
      setSillHeightInput(window.sillHeight_m.toFixed(2));
    }, [widthM, window.sillHeight_m]);

    const handleWidthChange = (value: string) => {
      setWidthInput(value);
      const numValue = parseFloat(value.replace(',', '.')) || 0;
      if (numValue > 0) {
        const newWidthPx = metersToPixels(numValue);
        const scale = newWidthPx / widthPx;
        const centerX = (x1 + x2) / 2;
        const centerY = (y1 + y2) / 2;
        const dx = (x2 - x1) / 2;
        const dy = (y2 - y1) / 2;
        
        const newPoints = [
          centerX - dx * scale,
          centerY - dy * scale,
          centerX + dx * scale,
          centerY + dy * scale,
        ] as [number, number, number, number];
        
        // Обновляем оригинальную геометрию для правильного применения поворота
        if (originalGeometryRef.current && originalGeometryRef.current.kind === 'segment') {
          originalGeometryRef.current = {
            kind: 'segment',
            points: newPoints,
          };
        }
        
        setEditedElement({
          ...window,
          geometry: {
            ...window.geometry,
            points: newPoints,
          },
        });
      }
    };

    const handleSillHeightChange = (value: string) => {
      setSillHeightInput(value);
      const numValue = parseFloat(value.replace(',', '.')) || 0;
      if (numValue >= 0) {
        setEditedElement({
          ...window,
          sillHeight_m: numValue,
        });
      }
    };

    return (
      <div
        className={styles.panel}
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h3 className={styles.title}>Редактирование окна</h3>
          <button className={styles.closeButton} onClick={handleCancel} aria-label="Закрыть">
            ×
          </button>
        </div>
        <div className={styles.content}>
          <div className={styles.field}>
            <label className={styles.label}>Ширина (м)</label>
            <input
              type="text"
              value={widthInput}
              onChange={(e) => handleWidthChange(e.target.value)}
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Подоконник (м)</label>
            <input
              type="text"
              value={sillHeightInput}
              onChange={(e) => handleSillHeightChange(e.target.value)}
              className={styles.input}
            />
          </div>
          <RotationControl
            value={window.rotation || 0}
            onChange={handleRotationChange}
            size={100}
          />
        </div>
        <div className={styles.footer}>
          {onDelete && (
            <button className={`${styles.button} ${styles.buttonDanger}`} onClick={handleDelete}>
              Удалить
            </button>
          )}
          <button className={styles.button} onClick={handleCancel}>
            Отмена
          </button>
          <button className={`${styles.button} ${styles.buttonPrimary}`} onClick={handleSave}>
            Сохранить
          </button>
        </div>
      </div>
    );
  }

  return null;
};

