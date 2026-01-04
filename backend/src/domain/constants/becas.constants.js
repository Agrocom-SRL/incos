/**
 * Constantes del dominio relacionadas con Becas y Descuentos
 * 
 * Estas constantes son parte del dominio de negocio y pueden ser usadas
 * por entidades, value objects y servicios de dominio relacionados con becas.
 */

// ============================================
// BECAS Y DESCUENTOS
// ============================================

/**
 * Estados de becas
 */
export const ESTADOS_BECAS = {
  PENDIENTE: 'PENDIENTE',
  ACTIVA: 'ACTIVA',
  FINALIZADA: 'FINALIZADA',
  RECHAZADA: 'RECHAZADA',
};

/**
 * Array de estados de becas válidos (útil para validators)
 */
export const ESTADOS_BECAS_VALUES = Object.values(ESTADOS_BECAS);

/**
 * Tipos de asignación automática de becas
 */
export const TIPOS_BECA_AUTOMATICA = {
  PROMEDIO_90: 'PROMEDIO_90',
  MANUAL: 'MANUAL',
};

/**
 * Array de tipos de beca automática válidos (útil para validators)
 */
export const TIPOS_BECA_AUTOMATICA_VALUES = Object.values(TIPOS_BECA_AUTOMATICA);

/**
 * Promedio mínimo para beca automática
 */
export const PROMEDIO_MINIMO_BECA_AUTOMATICA = 90;

