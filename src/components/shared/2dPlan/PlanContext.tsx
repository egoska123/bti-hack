import { createContext, useContext, ReactNode, useRef, useEffect } from 'react';
import type { FloorPlanElement } from './types';

export interface PlanContextValue {
  addElement: (element: FloorPlanElement) => void;
  registerAddElementHandler: (handler: ((element: FloorPlanElement) => void) | null) => void;
}

const PlanContext = createContext<PlanContextValue | null>(null);

export const usePlanContext = () => {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error('usePlanContext must be used within PlanProvider');
  }
  return context;
};

// Безопасная версия, которая не выбрасывает ошибку, если контекст недоступен
export const usePlanContextSafe = () => {
  return useContext(PlanContext);
};

export interface PlanProviderProps {
  children: ReactNode;
  onAddElement?: (element: FloorPlanElement) => void;
}

export const PlanProvider = ({ children, onAddElement }: PlanProviderProps) => {
  const handlerRef = useRef<((element: FloorPlanElement) => void) | null>(null);

  const registerAddElementHandler = (handler: ((element: FloorPlanElement) => void) | null) => {
    handlerRef.current = handler;
  };

  const addElement = (element: FloorPlanElement) => {
    // Сначала пробуем использовать зарегистрированный обработчик из Plan2D
    if (handlerRef.current) {
      handlerRef.current(element);
      return;
    }
    // Если нет, используем переданный обработчик (для обратной совместимости)
    if (onAddElement) {
      onAddElement(element);
    }
  };

  return (
    <PlanContext.Provider value={{ addElement, registerAddElementHandler }}>
      {children}
    </PlanContext.Provider>
  );
};

