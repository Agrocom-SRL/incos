/** Rutas del dominio Tutorías (TUT) — fuente única de URLs del módulo. */

export const TUTORIAS_BASE = '/tutorias';

/** Titulación — proyectos de grado */
export const PROYECTOS_GRADO_LIST_PATH = `${TUTORIAS_BASE}/titulacion`;
export const proyectoGradoRegistrarPath = `${TUTORIAS_BASE}/titulacion/registrar`;
export const proyectoGradoDetallePath = (id) => `${TUTORIAS_BASE}/titulacion/${id}`;
export const proyectoGradoEditarPath = (id) => `${TUTORIAS_BASE}/titulacion/${id}/editar`;

/** Portal del estudiante: su propio proyecto (wrapper TUT-MI-PROYECTO, patrón ACA-MI-BOLETIN). */
export const MI_PROYECTO_GRADO_PATH = `${TUTORIAS_BASE}/mi-proyecto`;

/** Acompañamiento — alertas de riesgo pedagógico */
export const ALERTAS_RIESGO_LIST_PATH = `${TUTORIAS_BASE}/acompanamiento/alertas`;

/** Acompañamiento — sesiones de reforzamiento */
export const SESIONES_LIST_PATH = `${TUTORIAS_BASE}/acompanamiento/sesiones`;
export const sesionProgramarPath = `${TUTORIAS_BASE}/acompanamiento/sesiones/programar`;
export const sesionDetallePath = (id) => `${TUTORIAS_BASE}/acompanamiento/sesiones/${id}`;
export const sesionEditarPath = (id) => `${TUTORIAS_BASE}/acompanamiento/sesiones/${id}/editar`;

/** Acompañamiento — panel */
export const PANEL_ACOMPANAMIENTO_PATH = `${TUTORIAS_BASE}/acompanamiento/panel`;

/** Keys de menú (sidebar) — deben coincidir con los routes.jsx de cada submódulo. */
export const TUT_TITULACION_MENU_KEY = 'TUT-TITULACION';
export const TUT_ALERTAS_MENU_KEY = 'TUT-ALERTAS';
export const TUT_SESIONES_MENU_KEY = 'TUT-SESIONES';
export const TUT_PANEL_MENU_KEY = 'TUT-PANEL';
/** Ruta sin ítem de menú (portal del estudiante). */
export const TUT_MI_PROYECTO_KEY = 'TUT-MI-PROYECTO';
