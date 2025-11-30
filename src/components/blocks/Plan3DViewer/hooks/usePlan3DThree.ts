import type { Plan } from '@/types/plan3d';
import { useThree3DSetup } from './useThree3DSetup';
import { useThree3DObjects } from './useThree3DObjects';
import { useThree3DWalkMode } from './useThree3DWalkMode';
import { useThree3DSelection } from './useThree3DSelection';
import type { Plan3DViewerProps } from '../types';

export const usePlan3DThree = (
  containerRef: React.RefObject<HTMLDivElement | null>,
  plan: Plan,
  props: Pick<
    Plan3DViewerProps,
    | 'mode'
    | 'walkSpeed'
    | 'rotationSpeed'
    | 'cameraHeight'
    | 'initialCameraPosition'
    | 'initialCameraRotation'
    | 'onElementSelect'
    | 'onObject3DSelect'
    | 'onCameraPositionChange'
    | 'onCameraRotationChange'
  >
) => {
  // Инициализация Three.js
  const {
    sceneRef,
    cameraRef,
    rendererRef,
    orbitControlsRef,
    pointerLockControlsRef,
  } = useThree3DSetup(
    containerRef,
    plan.meta,
    props.mode || 'view',
    props.initialCameraPosition,
    props.initialCameraRotation
  );

  // Создание 3D объектов
  const { wallsRef, floorsRef, objects3DRef, labelsRef } = useThree3DObjects(
    sceneRef,
    plan,
    props.mode || 'view'
  );

  // Режим прогулки
  useThree3DWalkMode(
    cameraRef,
    pointerLockControlsRef,
    rendererRef,
    wallsRef,
    floorsRef,
    plan,
    props.mode || 'view',
    props.walkSpeed,
    props.rotationSpeed,
    props.cameraHeight,
    props.onCameraPositionChange,
    props.onCameraRotationChange,
    sceneRef
  );

  // Выбор элементов
  useThree3DSelection(
    sceneRef,
    cameraRef,
    rendererRef,
    pointerLockControlsRef,
    props.mode || 'view',
    props.onElementSelect,
    props.onObject3DSelect
  );

  return {
    sceneRef,
    cameraRef,
    rendererRef,
    orbitControlsRef,
    pointerLockControlsRef,
    wallsRef,
    floorsRef,
    objects3DRef,
    labelsRef,
  };
};

