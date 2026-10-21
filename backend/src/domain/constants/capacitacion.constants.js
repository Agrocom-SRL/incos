/**
 * Constantes del dominio Capacitación (módulo CAP)
 *
 * Cursos cortos de capacitación abiertos a público externo (participantes sin
 * usuario/rol en el sistema). Independiente de la cadena formal
 * paralelos_gestion → oferta_cursos → asignaciones_docentes.
 */

// ============================================
// CURSOS DE CAPACITACIÓN (tabla `capacitaciones`)
// ============================================

/**
 * Estados del curso de capacitación
 * PROPUESTO: en definición | ABIERTO: acepta inscripciones | EN_CURSO: ya
 * iniciado | CERRADO: finalizado | CANCELADO: no se dictará
 */
export const ESTADOS_CAPACITACION = {
  PROPUESTO: 'PROPUESTO',
  ABIERTO: 'ABIERTO',
  EN_CURSO: 'EN_CURSO',
  CERRADO: 'CERRADO',
  CANCELADO: 'CANCELADO',
};

/**
 * Array de estados de curso válidos (útil para validators)
 */
export const ESTADOS_CAPACITACION_VALUES = Object.values(ESTADOS_CAPACITACION);

// ============================================
// INSCRIPCIONES (tabla `capacitacion_inscritos`)
// ============================================

/**
 * Estados de la inscripción de un participante a una capacitación.
 * PENDIENTE: pago parcial, aún no completa el monto obligatorio (default) |
 * INSCRITO: monto obligatorio cancelado (a tiempo o con pago atrasado, ambos
 * se tratan exactamente igual, sin penalización) | RETIRADO: se retiró
 * estando inscrito | ANULADO: decisión administrativa MANUAL (nunca
 * automática por incumplir el compromiso de pago).
 */
export const ESTADOS_INSCRIPCION_CAPACITACION = {
  PENDIENTE: 'PENDIENTE',
  INSCRITO: 'INSCRITO',
  RETIRADO: 'RETIRADO',
  ANULADO: 'ANULADO',
};

/**
 * Array de estados de inscripción válidos (útil para validators)
 */
export const ESTADOS_INSCRIPCION_CAPACITACION_VALUES = Object.values(
  ESTADOS_INSCRIPCION_CAPACITACION
);

// ============================================
// ESTADO DE PAGO DE LA INSCRIPCIÓN (persistido, tabla `capacitacion_inscritos`)
// ============================================

/**
 * Estado de pago de una inscripción — PERSISTIDO (columna `estado_pago`), no
 * derivado: cachea si SUM(capacitacion_pagos.monto activos) cubre o no
 * `monto_obligatorio`. Nunca existe el valor "sin pagos": toda fila de
 * `capacitacion_inscritos` con costo > 0 nace con al menos el pago inicial.
 */
export const ESTADOS_PAGO_INSCRITO_CAPACITACION = {
  PARCIAL: 'PARCIAL',
  CANCELADO: 'CANCELADO',
};

/**
 * Array de estados de pago de inscripción válidos (útil para validators)
 */
export const ESTADOS_PAGO_INSCRITO_CAPACITACION_VALUES = Object.values(
  ESTADOS_PAGO_INSCRITO_CAPACITACION
);

// ============================================
// COMPROMISOS DE PAGO (tabla `capacitacion_compromisos`)
// ============================================

/**
 * Estado del compromiso de pago de una inscripción con saldo parcial.
 * VIGENTE: en plazo | CUMPLIDO: saldo cancelado (a tiempo o tarde, no
 * distingue) | INCUMPLIDO: venció sin cancelar — puramente informativo para
 * reportes administrativos, NUNCA dispara cambios automáticos en
 * `capacitacion_inscritos`.
 */
export const ESTADOS_COMPROMISO_CAPACITACION = {
  VIGENTE: 'VIGENTE',
  CUMPLIDO: 'CUMPLIDO',
  INCUMPLIDO: 'INCUMPLIDO',
};

/**
 * Array de estados de compromiso válidos (útil para validators)
 */
export const ESTADOS_COMPROMISO_CAPACITACION_VALUES = Object.values(
  ESTADOS_COMPROMISO_CAPACITACION
);

// ============================================
// EXTENSIÓN 2026-10-21 (folleto «Curso de Guaraní»)
// ============================================

/** Modalidad del curso (`capacitaciones.modalidad`). */
export const MODALIDADES_CAPACITACION = {
  VIRTUAL: 'VIRTUAL',
  PRESENCIAL: 'PRESENCIAL',
  SEMIPRESENCIAL: 'SEMIPRESENCIAL',
};

export const MODALIDADES_CAPACITACION_VALUES = Object.values(MODALIDADES_CAPACITACION);

/**
 * Concepto de un pago (`capacitacion_pagos.concepto`). Son instituciones distintas:
 * MATRICULA se paga al instituto (secretaría); CURSO se deposita a la entidad certificadora.
 */
export const CONCEPTOS_PAGO_CAPACITACION = {
  MATRICULA: 'MATRICULA',
  CURSO: 'CURSO',
};

export const CONCEPTOS_PAGO_CAPACITACION_VALUES = Object.values(CONCEPTOS_PAGO_CAPACITACION);

/** Estado de pago por concepto (`estado_pago_matricula`, `estado_pago_curso`) y global (`estado_pago`). */
export const ESTADOS_PAGO_CONCEPTO_CAPACITACION = {
  PARCIAL: 'PARCIAL',
  CANCELADO: 'CANCELADO',
};
