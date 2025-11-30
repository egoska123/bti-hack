import { useState, useCallback, useRef } from 'react';
import type { FloorPlanData } from '../types';

interface HistoryState {
  data: FloorPlanData;
  timestamp: number;
}

export const useHistory = (initialData: FloorPlanData) => {
  const [history, setHistory] = useState<HistoryState[]>([
    { data: initialData, timestamp: Date.now() },
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const maxHistorySize = 50; // Максимальное количество записей в истории

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const addToHistory = useCallback((newData: FloorPlanData) => {
    setHistory((prevHistory) => {
      // Удаляем все записи после текущего индекса (если делаем новое действие после undo)
      const newHistory = prevHistory.slice(0, currentIndex + 1);
      
      // Добавляем новую запись
      const newState: HistoryState = {
        data: JSON.parse(JSON.stringify(newData)), // Глубокое копирование
        timestamp: Date.now(),
      };
      
      const updatedHistory = [...newHistory, newState];
      
      // Ограничиваем размер истории
      if (updatedHistory.length > maxHistorySize) {
        return updatedHistory.slice(-maxHistorySize);
      }
      
      return updatedHistory;
    });
    
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex + 1;
      // Ограничиваем индекс размером истории
      return Math.min(newIndex, maxHistorySize - 1);
    });
  }, [currentIndex]);

  const undo = useCallback((): FloorPlanData | null => {
    if (currentIndex <= 0) return null;
    
    // Получаем данные ДО обновления индекса
    const previousData = history[currentIndex - 1]?.data;
    
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex - 1;
      return Math.max(0, newIndex); // Не позволяем уйти ниже 0
    });
    
    return previousData ? JSON.parse(JSON.stringify(previousData)) : null;
  }, [currentIndex, history]);

  const redo = useCallback((): FloorPlanData | null => {
    if (currentIndex >= history.length - 1) return null;
    
    // Получаем данные ДО обновления индекса
    const nextData = history[currentIndex + 1]?.data;
    
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex + 1;
      return Math.min(history.length - 1, newIndex); // Не позволяем выйти за границы
    });
    
    return nextData ? JSON.parse(JSON.stringify(nextData)) : null;
  }, [currentIndex, history]);

  const getCurrentData = useCallback((): FloorPlanData => {
    return history[currentIndex]?.data || initialData;
  }, [currentIndex, history, initialData]);

  const reset = useCallback((newData: FloorPlanData) => {
    setHistory([{ data: newData, timestamp: Date.now() }]);
    setCurrentIndex(0);
  }, []);

  return {
    addToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    getCurrentData,
    reset,
  };
};

