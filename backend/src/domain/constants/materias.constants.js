/**
 * Constantes del dominio relacionadas con Materias y Asignaturas
 *
 * Estas constantes son parte del dominio de negocio y pueden ser usadas
 * por entidades, value objects y servicios de dominio relacionados con materias.
 *
 * Nota: TIPOS_MATERIA está definido en configuracion.constants.js
 */

// ============================================
// ASIGNATURAS EN PLAN DE ESTUDIOS
// ============================================

/**
 * Modalidades de asignatura en plan de estudios
 */
export const MODALIDADES_ASIGNATURA = {
  TRONCAL: 'TRONCAL',
  ELECTIVA: 'ELECTIVA',
  REGULAR: 'REGULAR',
};

/**
 * Array de modalidades de asignatura válidas (útil para validators)
 */
export const MODALIDADES_ASIGNATURA_VALUES = Object.values(MODALIDADES_ASIGNATURA);
