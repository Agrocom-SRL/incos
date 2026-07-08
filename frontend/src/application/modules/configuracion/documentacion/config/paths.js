/** Rutas CFG → Documentación (una sola pantalla, patrón ABM clásico tipo Actividades). */

export const DOCUMENTACION_BASE = '/configuracion/documentacion';

export const documentacionNuevaPath = `${DOCUMENTACION_BASE}/nueva`;
export const documentacionDetallePath = (id) => `${DOCUMENTACION_BASE}/${id}`;
export const documentacionEditarPath = (id) => `${DOCUMENTACION_BASE}/${id}/editar`;

export const CFG_DOCUMENTACION_MENU_KEY = 'CFG-DOCUMENTACION';

export const documentacionListNavigationState = (overrides = {}) => ({
  returnListPath: DOCUMENTACION_BASE,
  menuSidebarKey: CFG_DOCUMENTACION_MENU_KEY,
  ...overrides,
});

export const resolveReturnListPath = (location, fallback) =>
  location.state?.returnListPath || fallback;

export const resolveMenuSidebarKey = (location) => location.state?.menuSidebarKey;
