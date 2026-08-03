/**
 * Rutas y permiso del ítem de menú Supervisión docente (DOC · fichas de
 * seguimiento en clase) — fuente única de URLs y del permiso, mismo patrón
 * que `tutorias/config/paths.js` + `tutoriasPermisos.js`.
 */

export const SUPERVISION_LIST_PATH = '/docentes/supervision';
export const fichaSeguimientoRegistrarPath = `${SUPERVISION_LIST_PATH}/registrar`;
export const fichaSeguimientoDetallePath = (id) => `${SUPERVISION_LIST_PATH}/${id}`;
export const fichaSeguimientoEditarPath = (id) => `${SUPERVISION_LIST_PATH}/${id}/editar`;

/** Key de menú (sidebar) — debe coincidir con `routes.jsx` del módulo Docentes. */
export const DOC_SUPERVISION_MENU_KEY = 'DOC-SUPERVISION';

/**
 * Permiso único del recurso (LISTAR/DETALLE/CREAR/EDITAR/EXPORTAR). Fuente
 * única para rutas, `ActionButton`, `TableActions` y el gate de portal
 * (misma acción en las 3 capas, ver skill `incos-rbac`).
 */
export const SUPERVISION_FICHA_PERMISO = 'docentes.supervision.ficha';
