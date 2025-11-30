import { useRef, useEffect, useState } from 'react';
import styles from './RotationControl.module.css';

export interface RotationControlProps {
  value: number; // угол в градусах (0-360)
  onChange: (angle: number) => void;
  size?: number; // размер контрола в пикселях
}

export const RotationControl = ({ value, onChange, size = 120 }: RotationControlProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const normalizeAngle = (angle: number): number => {
    let normalized = angle % 360;
    if (normalized < 0) normalized += 360;
    return normalized;
  };

  const getAngleFromEvent = (e: MouseEvent | React.MouseEvent): number => {
    if (!containerRef.current) return value;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const clientX = 'clientX' in e ? e.clientX : e.nativeEvent.clientX;
    const clientY = 'clientY' in e ? e.clientY : e.nativeEvent.clientY;
    
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    
    // Вычисляем угол в радианах, затем конвертируем в градусы
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    // Нормализуем угол (0-360)
    angle = normalizeAngle(angle + 90); // +90 чтобы 0° был сверху
    
    return angle;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    const newAngle = getAngleFromEvent(e);
    onChange(newAngle);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newAngle = getAngleFromEvent(e);
      onChange(newAngle);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onChange]);

  // Конвертируем градусы в радианы для CSS transform
  const rotationRad = ((value - 90) * Math.PI) / 180; // -90 чтобы 0° был сверху

  return (
    <div className={styles.container}>
      <label className={styles.label}>Поворот (°)</label>
      <div
        ref={containerRef}
        className={styles.rotationControl}
        style={{ width: `${size}px`, height: `${size}px` }}
        onMouseDown={handleMouseDown}
      >
        <svg
          width={size}
          height={size}
          className={styles.svg}
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Внешний круг */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 2}
            fill="none"
            stroke="var(--color-input)"
            strokeWidth="2"
            className={styles.circle}
          />
          {/* Деления (каждые 15 градусов) */}
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i * 15 - 90) * (Math.PI / 180);
            const isMajor = i % 6 === 0; // Каждые 90 градусов
            const innerRadius = size / 2 - (isMajor ? 8 : 4);
            const outerRadius = size / 2 - 2;
            const x1 = size / 2 + innerRadius * Math.cos(angle);
            const y1 = size / 2 + innerRadius * Math.sin(angle);
            const x2 = size / 2 + outerRadius * Math.cos(angle);
            const y2 = size / 2 + outerRadius * Math.sin(angle);
            
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="var(--color-muted-foreground)"
                strokeWidth={isMajor ? 2 : 1}
              />
            );
          })}
          {/* Указатель (стрелка) */}
          <line
            x1={size / 2}
            y1={size / 2}
            x2={size / 2}
            y2={8}
            stroke="var(--color-primary)"
            strokeWidth="3"
            strokeLinecap="round"
            transform={`rotate(${value} ${size / 2} ${size / 2})`}
            className={styles.pointer}
          />
          {/* Центральная точка */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r="4"
            fill="var(--color-primary)"
            className={styles.center}
          />
        </svg>
        {/* Отображение значения */}
        <div className={styles.valueDisplay}>
          {Math.round(value)}°
        </div>
      </div>
    </div>
  );
};

