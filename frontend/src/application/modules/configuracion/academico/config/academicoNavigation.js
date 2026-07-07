/**
 * State de navegación compartido entre tab y subrutas de CFG Académico.
 */

import {
  CARRERAS_LIST_PATH,
  MATERIAS_LIST_PATH,
  PLANES_LIST_PATH,
} from './paths';

export const CFG_ACADEMICO_MENU_KEY = 'CFG-ACADEMICO';

export const carrerasListNavigationState = (overrides = {}) => ({
  returnListPath: CARRERAS_LIST_PATH,
  menuSidebarKey: CFG_ACADEMICO_MENU_KEY,
  ...overrides,
});

export const materiasListNavigationState = (overrides = {}) => ({
  returnListPath: MATERIAS_LIST_PATH,
  menuSidebarKey: CFG_ACADEMICO_MENU_KEY,
  ...overrides,
});

export const planesListNavigationState = (overrides = {}) => ({
  returnListPath: PLANES_LIST_PATH,
  menuSidebarKey: CFG_ACADEMICO_MENU_KEY,
  ...overrides,
});

export const resolveReturnListPath = (location, fallback) =>
  location.state?.returnListPath || fallback;

export const resolveMenuSidebarKey = (location) => location.state?.menuSidebarKey;
