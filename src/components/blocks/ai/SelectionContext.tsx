import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { FloorPlanElement } from '@/components/shared/2dPlan/types';

interface SelectionContextType {
  isSelectionMode: boolean;
  selectedElements: FloorPlanElement[];
  setSelectionMode: (isActive: boolean) => void;
  addElement: (element: FloorPlanElement) => void;
  removeElement: (elementId: string) => void;
  clearSelection: () => void;
}

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

export const useSelectionContext = () => {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error('useSelectionContext must be used within SelectionProvider');
  }
  return context;
};

export const SelectionProvider = ({ children }: { children: ReactNode }) => {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedElements, setSelectedElements] = useState<FloorPlanElement[]>([]);

  const setSelectionMode = useCallback((isActive: boolean) => {
    setIsSelectionMode(isActive);
    if (!isActive) {
      setSelectedElements([]);
    }
  }, []);

  const addElement = useCallback((element: FloorPlanElement) => {
    setSelectedElements((prev) => {
      // Проверяем, не добавлен ли уже этот элемент
      if (prev.some((el) => el.id === element.id)) {
        return prev;
      }
      return [...prev, element];
    });
  }, []);

  const removeElement = useCallback((elementId: string) => {
    setSelectedElements((prev) => prev.filter((el) => el.id !== elementId));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedElements([]);
  }, []);

  return (
    <SelectionContext.Provider
      value={{
        isSelectionMode,
        selectedElements,
        setSelectionMode,
        addElement,
        removeElement,
        clearSelection,
      }}
    >
      {children}
    </SelectionContext.Provider>
  );
};

