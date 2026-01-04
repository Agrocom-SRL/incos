/**
 * Constantes del dominio relacionadas con Cursos
 * 
 * Estas constantes son parte del dominio de negocio y pueden ser usadas
 * por entidades, value objects y servicios de dominio relacionados con cursos.
 */

// ============================================
// CURSOS
// ============================================

/**
 * Estados de cursos
 */
export const ESTADOS_CURSOS = {
  PROPUESTO: 'PROPUESTO',
  APROBADO: 'APROBADO',
  CANCELADO: 'CANCELADO',
};

/**
 * Array de estados de cursos válidos (útil para validators)
 */
export const ESTADOS_CURSOS_VALUES = Object.values(ESTADOS_CURSOS);

// ============================================
// HORARIOS
// ============================================

/**
 * Días de la semana
 */
export const DIAS_SEMANA = {
  LUNES: 'LUNES',
  MARTES: 'MARTES',
  MIERCOLES: 'MIERCOLES',
  JUEVES: 'JUEVES',
  VIERNES: 'VIERNES',
  SABADO: 'SABADO',
  DOMINGO: 'DOMINGO',
};

/**
 * Array de días de la semana válidos (útil para validators)
 */
export const DIAS_SEMANA_VALUES = Object.values(DIAS_SEMANA);

