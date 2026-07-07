/**
 * State de navegación compartido entre tab y subrutas de CFG Recursos académicos.
 * Gemelo de `complementarios/config/navigation.js` / `academico/config/academicoNavigation.js`.
 */

import { PARALELOS_LIST_PATH } from './paths';

export const CFG_RECURSOS_MENU_KEY = 'CFG-RECURSOS';

export const paralelosListNavigationState = (overrides = {}) => ({
  returnListPath: PARALELOS_LIST_PATH,
  menuSidebarKey: CFG_RECURSOS_MENU_KEY,
  ...overrides,
});

export const resolveReturnListPath = (location, fallback) =>
  location.state?.returnListPath || fallback;

export const resolveMenuSidebarKey = (location) => location.state?.menuSidebarKey;
