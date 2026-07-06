/** Rutas CFG → Documentación (una pantalla por tipo, patrón CFG Académico). */

export const DOCUMENTACION_BASE = '/configuracion/documentacion';

export const documentacionListPath = (tipoKey) => `${DOCUMENTACION_BASE}/${tipoKey}`;
export const documentacionNuevaPath = (tipoKey) => `${DOCUMENTACION_BASE}/${tipoKey}/nueva`;
export const documentacionDetallePath = (tipoKey, id) => `${DOCUMENTACION_BASE}/${tipoKey}/${id}`;
export const documentacionEditarPath = (tipoKey, id) =>
  `${DOCUMENTACION_BASE}/${tipoKey}/${id}/editar`;

export const CFG_DOCUMENTACION_MENU_KEY = 'CFG-DOCUMENTACION';

export const documentacionListNavigationState = (tipoKey, overrides = {}) => ({
  returnListPath: documentacionListPath(tipoKey),
  menuSidebarKey: CFG_DOCUMENTACION_MENU_KEY,
  ...overrides,
});

export const resolveReturnListPath = (location, fallback) =>
  location.state?.returnListPath || fallback;

export const resolveMenuSidebarKey = (location) => location.state?.menuSidebarKey;
