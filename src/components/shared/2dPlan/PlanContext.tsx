import { createContext, useContext, ReactNode } from 'react';
import type { FloorPlanElement } from './types';

export interface PlanContextValue {
  addElement: (element: FloorPlanElement) => void;
}

const PlanContext = createContext<PlanContextValue | null>(null);

export const usePlanContext = () => {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error('usePlanContext must be used within PlanProvider');
  }
  return context;
};

export interface PlanProviderProps {
  children: ReactNode;
  onAddElement: (element: FloorPlanElement) => void;
}

export const PlanProvider = ({ children, onAddElement }: PlanProviderProps) => {
  return (
    <PlanContext.Provider value={{ addElement: onAddElement }}>
      {children}
    </PlanContext.Provider>
  );
};

