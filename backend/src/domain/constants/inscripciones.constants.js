/**
 * Constantes del dominio relacionadas con Inscripciones
 * 
 * Estas constantes son parte del dominio de negocio y pueden ser usadas
 * por entidades, value objects y servicios de dominio relacionados con inscripciones.
 */

// ============================================
// TIPOS DE INSCRIPCIÓN
// ============================================

/**
 * Tipos de inscripción
 */
export const TIPOS_INSCRIPCION = {
  NUEVO: 'NUEVO',
  REINGRESO: 'REINGRESO',
  CONTINUIDAD: 'CONTINUIDAD',
  TRASPASO_ENTRADA: 'TRASPASO_ENTRADA',
  TRANSITABILIDAD_ENTRADA: 'TRANSITABILIDAD_ENTRADA',
};

/**
 * Array de tipos de inscripción válidos (útil para validators)
 */
export const TIPOS_INSCRIPCION_VALUES = Object.values(TIPOS_INSCRIPCION);

// ============================================
// ESTADOS DE MATERIA INSCRITA
// ============================================

/**
 * Estados de una materia inscrita
 */
export const ESTADOS_MATERIA_INSCRITA = {
  INSCRITO: 'INSCRITO',
  CURSANDO: 'CURSANDO',
  APROBADO: 'APROBADO',
  REPROBADO: 'REPROBADO',
  ABANDONO: 'ABANDONO',
  RETIRADO: 'RETIRADO',
};

/**
 * Array de estados de materia inscrita válidos (útil para validators)
 */
export const ESTADOS_MATERIA_INSCRITA_VALUES = Object.values(ESTADOS_MATERIA_INSCRITA);
