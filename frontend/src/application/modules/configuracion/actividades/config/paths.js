/** Rutas CFG → Actividades (catálogo maestro, patrón ABM clásico tipo Docentes). */

export const ACTIVIDADES_BASE = '/configuracion/actividades';

export const actividadNuevaPath = `${ACTIVIDADES_BASE}/nueva`;
export const actividadDetallePath = (id) => `${ACTIVIDADES_BASE}/${id}`;
export const actividadEditarPath = (id) => `${ACTIVIDADES_BASE}/${id}/editar`;

export const CFG_ACTIVIDADES_MENU_KEY = 'CFG-ACTIVIDADES';

export const actividadesListNavigationState = (overrides = {}) => ({
  returnListPath: ACTIVIDADES_BASE,
  menuSidebarKey: CFG_ACTIVIDADES_MENU_KEY,
  ...overrides,
});

export const resolveReturnListPath = (location, fallback) =>
  location.state?.returnListPath || fallback;

export const resolveMenuSidebarKey = (location) => location.state?.menuSidebarKey;
