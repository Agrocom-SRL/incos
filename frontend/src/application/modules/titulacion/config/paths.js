/**
 * Rutas del dominio Titulación (TIT) — fuente única de URLs del módulo.
 *
 * Rename 2026-07-31 (`tutorias` → `titulacion`): las rutas de Acompañamiento
 * (`/titulacion/acompanamiento/*`) se reclasificaron al dominio ACADÉMICO — ver
 * `academico/acompanamiento/config/paths.js` (`/academico/acompanamiento/*`).
 */

export const TITULACION_BASE = '/titulacion';

/** Proyectos de grado (antes «Titulación» dentro del propio módulo Tutorías) */
export const PROYECTOS_GRADO_LIST_PATH = `${TITULACION_BASE}/proyectos-grado`;
export const proyectoGradoRegistrarPath = `${TITULACION_BASE}/proyectos-grado/registrar`;
export const proyectoGradoDetallePath = (id) => `${TITULACION_BASE}/proyectos-grado/${id}`;
export const proyectoGradoEditarPath = (id) => `${TITULACION_BASE}/proyectos-grado/${id}/editar`;

/** Portal del estudiante: su propio proyecto (wrapper TIT-MI-PROYECTO, patrón ACA-MI-BOLETIN). */
export const MI_PROYECTO_GRADO_PATH = `${TITULACION_BASE}/mi-proyecto`;

/** Pasantías — trámites de práctica laboral (P1-P19, schema 24) */
export const PASANTIAS_LIST_PATH = `${TITULACION_BASE}/pasantias`;
export const pasantiaRegistrarPath = `${TITULACION_BASE}/pasantias/registrar`;
export const pasantiaDetallePath = (id) => `${TITULACION_BASE}/pasantias/${id}`;
export const pasantiaEditarPath = (id) => `${TITULACION_BASE}/pasantias/${id}/editar`;

/** Pasantías — catálogo de empresas (ABM propio, empresa·LISTAR/CREAR/DETALLE/EDITAR/ACTIVAR/ELIMINAR) */
export const PASANTIAS_EMPRESAS_PATH = `${TITULACION_BASE}/pasantias/empresas`;
export const pasantiaEmpresaRegistrarPath = `${TITULACION_BASE}/pasantias/empresas/registrar`;
export const pasantiaEmpresaDetallePath = (empresaId) =>
  `${TITULACION_BASE}/pasantias/empresas/${empresaId}`;
export const pasantiaEmpresaEditarPath = (empresaId) =>
  `${TITULACION_BASE}/pasantias/empresas/${empresaId}/editar`;

/** Portal del estudiante: su trámite de pasantía (wrapper TIT-MI-PASANTIA, patrón TIT-MI-PROYECTO). */
export const MI_PASANTIA_PATH = `${TITULACION_BASE}/mi-pasantia`;

/**
 * Reportes de avance de tutoría (Requisitos 2 y 3 — extensión 2026-07-31).
 * Sin ítem de menú propio: se llega por los botones de cabecera de
 * ProyectosGradoList (breadcrumbParent TIT-PROYECTOS).
 */
export const REPORTE_AVANCE_CARRERA_PATH = `${TITULACION_BASE}/proyectos-grado/reportes/avance-carrera`;
export const PLANILLA_AVANCE_TERCER_ANIO_PATH = `${TITULACION_BASE}/proyectos-grado/reportes/planilla-tercer-anio`;

/** Keys de menú (sidebar) — deben coincidir con los routes.jsx de cada submódulo. */
export const TIT_PROYECTOS_MENU_KEY = 'TIT-PROYECTOS';
export const TIT_PASANTIAS_MENU_KEY = 'TIT-PASANTIAS';
/** Rutas sin ítem de menú (portal del estudiante). */
export const TIT_MI_PROYECTO_KEY = 'TIT-MI-PROYECTO';
export const TIT_MI_PASANTIA_KEY = 'TIT-MI-PASANTIA';
