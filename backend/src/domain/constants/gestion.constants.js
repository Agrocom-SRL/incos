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
 * Tipos de gestión académica
 */
export const TIPOS_GESTION = {
  REGULAR: 'REGULAR',
  VERANO: 'VERANO',
  INVIERNO: 'INVIERNO',
  NIVELACION: 'NIVELACION',
  EXTRAORDINARIA: 'EXTRAORDINARIA',
};

/**
 * Array de tipos de gestión válidos (útil para validators)
 */
export const TIPOS_GESTION_VALUES = Object.values(TIPOS_GESTION);

// ============================================
// ACTIVIDADES ACADÉMICAS
// ============================================

/**
 * Tipos de actividad académica
 */
export const TIPOS_ACTIVIDAD = {
  INSCRIPCION: 'INSCRIPCION',
  PLANIFICACION: 'PLANIFICACION',
  ACADEMICA: 'ACADEMICA',
  EVALUACION: 'EVALUACION',
  ADMINISTRATIVA: 'ADMINISTRATIVA',
  FERIADO: 'FERIADO',
  EVENTO_INSTITUCIONAL: 'EVENTO_INSTITUCIONAL',
  FERIA: 'FERIA',
  MODALIDAD_GRADO: 'MODALIDAD_GRADO',
  OTRO: 'OTRO',
};

/**
 * Array de tipos de actividad válidos (útil para validators)
 */
export const TIPOS_ACTIVIDAD_VALUES = Object.values(TIPOS_ACTIVIDAD);

// ============================================
// PERÍODOS ACADÉMICOS
// ============================================

/**
 * Divisiones de período académico
 */
export const DIVISIONES_PERIODO_ACADEMICO = {
  PLANIFICACION: 'PLANIFICACION',
  MENSUAL: 'MENSUAL',
  BIMESTRE: 'BIMESTRE',
  TRIMESTRE: 'TRIMESTRE',
  CUATRIMESTRE: 'CUATRIMESTRE',
  SEMESTRE: 'SEMESTRE',
  CLAUSURA: 'CLAUSURA',
  OTRO: 'OTRO',
};

/**
 * Array de divisiones de período académico válidas (útil para validators)
 */
export const DIVISIONES_PERIODO_ACADEMICO_VALUES = Object.values(DIVISIONES_PERIODO_ACADEMICO);

/**
 * Clave de `configuracion_sistema` que marca el cursado iniciado de una gestión
 * (bandera "clases iniciadas"). Se crea/actualiza al iniciar la gestión.
 * @param {number} gestionId
 * @returns {string}
 */
export const claveCursadoIniciado = (gestionId) => `cursado_iniciado_${gestionId}`;
