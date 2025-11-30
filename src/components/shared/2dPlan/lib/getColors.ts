import type { ElementRole } from '../types';

const getCssVariable = (name: string): string => {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
};

export type Colors = {
  canvasBg: string;
  wallExisting: string;
  wallNew: string;
  wallModified: string;
  wallToDelete: string;
  wallLoadBearing: string;
  doorExisting: string;
  doorNew: string;
  doorModified: string;
  doorToDelete: string;
  windowExisting: string;
  windowNew: string;
  windowModified: string;
  windowToDelete: string;
  zoneRisk: string;
  zoneWet: string;
  zoneDefault: string;
  labelBg: string;
  labelText: string;
  stroke: string;
  primary: string;
};

export const getColors = (): Colors => {
  return {
    canvasBg: getCssVariable('--color-canvas-bg'),
    wallExisting: getCssVariable('--color-wall-existing'),
    wallNew: getCssVariable('--color-wall-new'),
    wallModified: getCssVariable('--color-wall-modified'),
    wallToDelete: getCssVariable('--color-wall-to-delete'),
    wallLoadBearing: getCssVariable('--color-wall-load-bearing'),
    doorExisting: getCssVariable('--color-door-existing'),
    doorNew: getCssVariable('--color-door-new'),
    doorModified: getCssVariable('--color-door-modified'),
    doorToDelete: getCssVariable('--color-door-to-delete'),
    windowExisting: getCssVariable('--color-window-existing'),
    windowNew: getCssVariable('--color-window-new'),
    windowModified: getCssVariable('--color-window-modified'),
    windowToDelete: getCssVariable('--color-window-to-delete'),
    zoneRisk: getCssVariable('--color-zone-risk'),
    zoneWet: getCssVariable('--color-zone-wet'),
    zoneDefault: getCssVariable('--color-zone-default'),
    labelBg: getCssVariable('--color-label-bg'),
    labelText: getCssVariable('--color-label-text'),
    stroke: getCssVariable('--color-stroke'),
    primary: getCssVariable('--color-primary'),
  };
};

export const getWallColor = (role: ElementRole, loadBearing: boolean | null, colors: Colors): string => {
  if (loadBearing) {
    return colors.wallLoadBearing;
  }
  switch (role) {
    case 'NEW':
      return colors.wallNew;
    case 'MODIFIED':
      return colors.wallModified;
    case 'TO_DELETE':
      return colors.wallToDelete;
    case 'EXISTING':
    default:
      return colors.wallExisting;
  }
};

export const getDoorColor = (role: ElementRole, colors: Colors): string => {
  switch (role) {
    case 'NEW':
      return colors.doorNew;
    case 'MODIFIED':
      return colors.doorModified;
    case 'TO_DELETE':
      return colors.doorToDelete;
    case 'EXISTING':
    default:
      return colors.doorExisting;
  }
};

export const getWindowColor = (role: ElementRole, colors: Colors): string => {
  switch (role) {
    case 'NEW':
      return colors.windowNew;
    case 'MODIFIED':
      return colors.windowModified;
    case 'TO_DELETE':
      return colors.windowToDelete;
    case 'EXISTING':
    default:
      return colors.windowExisting;
  }
};

export const getZoneColor = (zoneType: string, colors: Colors): string => {
  if (zoneType === 'RISK') {
    return colors.zoneRisk;
  }
  if (zoneType === 'wet') {
    return colors.zoneWet;
  }
  return colors.zoneDefault;
};

