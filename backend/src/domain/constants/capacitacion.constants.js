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
 * Estados de la inscripción de un participante a una capacitación
 */
export const ESTADOS_INSCRIPCION_CAPACITACION = {
  INSCRITO: 'INSCRITO',
  RETIRADO: 'RETIRADO',
};

/**
 * Array de estados de inscripción válidos (útil para validators)
 */
export const ESTADOS_INSCRIPCION_CAPACITACION_VALUES = Object.values(
  ESTADOS_INSCRIPCION_CAPACITACION
);

// ============================================
// ESTADO DE PAGO (derivado, no persistido)
// ============================================

/**
 * Estado de pago de una inscripción, derivado de SUM(capacitacion_pagos.monto)
 * vs `capacitaciones.costo`. No se persiste: se calcula en lectura.
 */
export const ESTADOS_PAGO_CAPACITACION = {
  PENDIENTE: 'PENDIENTE',
  PARCIAL: 'PARCIAL',
  PAGADO: 'PAGADO',
};

/**
 * Array de estados de pago derivados (útil para el frontend/filters)
 */
export const ESTADOS_PAGO_CAPACITACION_VALUES = Object.values(ESTADOS_PAGO_CAPACITACION);
