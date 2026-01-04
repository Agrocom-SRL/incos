/**
 * Constantes del dominio relacionadas con Licencias
 * 
 * Estas constantes son parte del dominio de negocio y pueden ser usadas
 * por entidades, value objects y servicios de dominio relacionados con licencias.
 */

// ============================================
// LICENCIAS
// ============================================

/**
 * Motivos de licencias estudiantiles
 */
export const MOTIVOS_LICENCIAS = {
  ENFERMEDAD: 'ENFERMEDAD',
  TRABAJO: 'TRABAJO',
  FAMILIAR: 'FAMILIAR',
  VIAJE: 'VIAJE',
  ACADEMICO: 'ACADEMICO',
  DEPORTIVO: 'DEPORTIVO',
  PERSONAL: 'PERSONAL',
  OTRO: 'OTRO',
};

/**
 * Array de motivos de licencias válidos (útil para validators)
 */
export const MOTIVOS_LICENCIAS_VALUES = Object.values(MOTIVOS_LICENCIAS);

/**
 * Estados de licencias
 */
export const ESTADOS_LICENCIAS = {
  PENDIENTE: 'PENDIENTE',
  APROBADA: 'APROBADA',
  RECHAZADA: 'RECHAZADA',
  CANCELADA: 'CANCELADA',
};

/**
 * Array de estados de licencias válidos (útil para validators)
 */
export const ESTADOS_LICENCIAS_VALUES = Object.values(ESTADOS_LICENCIAS);

