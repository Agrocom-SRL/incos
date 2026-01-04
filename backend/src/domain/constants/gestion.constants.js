/**
 * Constantes del dominio relacionadas con Gestiones Académicas
 * 
 * Estas constantes son parte del dominio de negocio y pueden ser usadas
 * por entidades, value objects y servicios de dominio relacionados con gestiones.
 */

// ============================================
// GESTIONES ACADÉMICAS
// ============================================

/**
 * Tipos de etapas de gestión
 */
export const TIPOS_ETAPA_GESTION = {
  PRE_INSCRIPCION: 'PRE_INSCRIPCION',
  INSCRIPCIONES: 'INSCRIPCIONES',
  CLASES: 'CLASES',
  EVALUACIONES: 'EVALUACIONES',
  EXAMENES: 'EXAMENES',
  ENTREGA_NOTAS: 'ENTREGA_NOTAS',
  CIERRE_ADMINISTRATIVO: 'CIERRE_ADMINISTRATIVO',
  OTRO: 'OTRO',
};

/**
 * Array de tipos de etapa válidos (útil para validators)
 */
export const TIPOS_ETAPA_GESTION_VALUES = Object.values(TIPOS_ETAPA_GESTION);

