/**
 * State de navegación compartido entre tab y subrutas de CFG Complementarios.
 * Gemelo de `academico/config/academicoNavigation.js`.
 */

import { DISCAPACIDAD_LIST_PATH, APODERADOS_LIST_PATH, IDIOMAS_LIST_PATH } from './paths';

export const CFG_COMPLEMENTARIOS_MENU_KEY = 'CFG-COMPLEMENTARIO';

export const discapacidadesListNavigationState = (overrides = {}) => ({
  returnListPath: DISCAPACIDAD_LIST_PATH,
  menuSidebarKey: CFG_COMPLEMENTARIOS_MENU_KEY,
  ...overrides,
});

export const apoderadosListNavigationState = (overrides = {}) => ({
  returnListPath: APODERADOS_LIST_PATH,
  menuSidebarKey: CFG_COMPLEMENTARIOS_MENU_KEY,
  ...overrides,
});

export const idiomasListNavigationState = (overrides = {}) => ({
  returnListPath: IDIOMAS_LIST_PATH,
  menuSidebarKey: CFG_COMPLEMENTARIOS_MENU_KEY,
  ...overrides,
});

export const resolveReturnListPath = (location, fallback) =>
  location.state?.returnListPath || fallback;

export const resolveMenuSidebarKey = (location) => location.state?.menuSidebarKey;
