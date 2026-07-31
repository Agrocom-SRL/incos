/**
 * Rutas del submódulo Acompañamiento pedagógico (dominio ACADÉMICO) — fuente
 * única de URLs de alertas de riesgo, sesiones de refuerzo y panel.
 *
 * Reclasificación 2026-07-31: antes vivían en `tutorias/config/paths.js`
 * como `/tutorias/acompanamiento/*`; se reclasificaron por completo al dominio
 * ACADÉMICO (decisión 2026-07-29, docs/plan/titulacion-y-dominios-pendientes.md)
 * — ver `titulacion/config/paths.js` para las rutas de proyectos de
 * grado/pasantías que permanecen en Titulación (TIT).
 */

export const ACOMPANAMIENTO_BASE = '/academico/acompanamiento';

/** Alertas de riesgo pedagógico */
export const ALERTAS_RIESGO_LIST_PATH = `${ACOMPANAMIENTO_BASE}/alertas`;

/** Sesiones de refuerzo */
export const SESIONES_LIST_PATH = `${ACOMPANAMIENTO_BASE}/sesiones`;
export const sesionProgramarPath = `${ACOMPANAMIENTO_BASE}/sesiones/programar`;
export const sesionDetallePath = (id) => `${ACOMPANAMIENTO_BASE}/sesiones/${id}`;
export const sesionEditarPath = (id) => `${ACOMPANAMIENTO_BASE}/sesiones/${id}/editar`;

/** Panel de acompañamiento */
export const PANEL_ACOMPANAMIENTO_PATH = `${ACOMPANAMIENTO_BASE}/panel`;

/** Keys de menú (sidebar) — deben coincidir con los routes.jsx de cada submódulo. */
export const ACA_ALERTAS_MENU_KEY = 'ACA-ALERTAS';
export const ACA_SESIONES_MENU_KEY = 'ACA-SESIONES';
export const ACA_PANEL_MENU_KEY = 'ACA-PANEL';
