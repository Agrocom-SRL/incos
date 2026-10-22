/** Rutas del dominio Capacitación (CAP) — fuente única de URLs del módulo. */

export const CAPACITACION_BASE = '/capacitacion';

/** Cursos de capacitación */
export const CURSOS_CAP_LIST_PATH = `${CAPACITACION_BASE}/cursos`;
export const cursoCapRegistrarPath = `${CAPACITACION_BASE}/cursos/registrar`;
export const cursoCapDetallePath = (id) => `${CAPACITACION_BASE}/cursos/${id}`;
export const cursoCapEditarPath = (id) => `${CAPACITACION_BASE}/cursos/${id}/editar`;

/** Participantes */
export const PARTICIPANTES_CAP_LIST_PATH = `${CAPACITACION_BASE}/participantes`;
export const participanteCapRegistrarPath = `${CAPACITACION_BASE}/participantes/nuevo`;
export const participanteCapEditarPath = (id) => `${CAPACITACION_BASE}/participantes/${id}/editar`;

/** Grupos (tabs «Horarios» y «Grupos»); el ABM de horarios cuelga de esta pantalla */
export const GRUPOS_CAP_LIST_PATH = `${CAPACITACION_BASE}/grupos`;
export const GRUPOS_TAB_HORARIOS = 'horarios';
export const GRUPOS_TAB_GRUPOS = 'grupos';
export const grupoCapTabPath = (tab) => `${GRUPOS_CAP_LIST_PATH}?tab=${tab}`;
export const horarioCapRegistrarPath = `${GRUPOS_CAP_LIST_PATH}/horarios/nuevo`;
export const horarioCapEditarPath = (id) => `${GRUPOS_CAP_LIST_PATH}/horarios/${id}/editar`;

/** Inscripciones y pagos */
export const INSCRIPCIONES_CAP_LIST_PATH = `${CAPACITACION_BASE}/inscripciones`;
export const inscripcionCapInscribirPath = `${CAPACITACION_BASE}/inscripciones/inscribir`;
export const inscripcionCapDetallePath = (id) => `${CAPACITACION_BASE}/inscripciones/${id}`;
export const inscripcionCapEditarPath = (id) => `${CAPACITACION_BASE}/inscripciones/${id}/editar`;
export const inscripcionCapRegistrarPagoPath = (id) =>
  `${CAPACITACION_BASE}/inscripciones/${id}/pagos/registrar`;
export const inscripcionCapEditarPagoPath = (id, pagoId) =>
  `${CAPACITACION_BASE}/inscripciones/${id}/pagos/${pagoId}/editar`;

/** Keys de menú (sidebar) — deben coincidir con los routes.jsx de cada submódulo. */
export const CAP_CURSOS_MENU_KEY = 'CAP-CURSOS';
export const CAP_PARTICIPANTES_MENU_KEY = 'CAP-PARTICIPANTES';
export const CAP_GRUPOS_MENU_KEY = 'CAP-GRUPOS';
export const CAP_INSCRIPCIONES_MENU_KEY = 'CAP-INSCRIPCIONES';
