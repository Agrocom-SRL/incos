/**
 * Constantes del dominio Académico — Acompañamiento pedagógico (módulo ACA).
 *
 * Sesiones de refuerzo (tabla `sesiones_refuerzo`, ancladas en
 * `asignaciones_docentes`) y sus estudiantes (`sesion_refuerzo_estudiantes`).
 * El riesgo pedagógico en sí (vista 156) no tiene tabla ni constantes propias.
 *
 * Nota (2026-07-31): estas constantes vivían en `tutorias.constants.js`
 * (módulo TUT). Se reclasificaron a ACADEMICO junto con el sub-grupo
 * Acompañamiento (antes bajo Tutorías/Titulación) porque sus datos se derivan
 * de `asignaciones_docentes` y de las vistas del centralizador, sin ninguna
 * FK a `proyectos_grado`/`modalidades_grado`.
 */

// ============================================
// SESIONES DE REFUERZO (tabla `sesiones_refuerzo`)
// ============================================

export const MODALIDADES_SESION_REFUERZO = {
  PRESENCIAL: 'PRESENCIAL',
  VIRTUAL: 'VIRTUAL',
};

export const MODALIDADES_SESION_REFUERZO_VALUES = Object.values(MODALIDADES_SESION_REFUERZO);

export const ESTADOS_SESION_REFUERZO = {
  PROGRAMADA: 'PROGRAMADA',
  REALIZADA: 'REALIZADA',
  CANCELADA: 'CANCELADA',
};

export const ESTADOS_SESION_REFUERZO_VALUES = Object.values(ESTADOS_SESION_REFUERZO);

// ============================================
// ESTUDIANTES DE SESIÓN (tabla `sesion_refuerzo_estudiantes`)
// ============================================

export const ORIGENES_ESTUDIANTE_SESION = {
  RIESGO: 'RIESGO',
  DOCENTE: 'DOCENTE',
  VOLUNTARIO: 'VOLUNTARIO',
};

export const ORIGENES_ESTUDIANTE_SESION_VALUES = Object.values(ORIGENES_ESTUDIANTE_SESION);

export const PROGRESOS_ESTUDIANTE_SESION = {
  SIN_EVALUAR: 'SIN_EVALUAR',
  EN_PROGRESO: 'EN_PROGRESO',
  MEJORADO: 'MEJORADO',
  SIN_MEJORA: 'SIN_MEJORA',
};

export const PROGRESOS_ESTUDIANTE_SESION_VALUES = Object.values(PROGRESOS_ESTUDIANTE_SESION);
