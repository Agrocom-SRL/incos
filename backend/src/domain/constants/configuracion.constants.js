/**
 * Constantes del dominio relacionadas con Configuración
 *
 * Estas constantes son parte del dominio de negocio y pueden ser usadas
 * por entidades, value objects y servicios de dominio relacionados con configuración.
 */

// ============================================
// MATERIAS Y CURSOS
// ============================================

/**
 * Tipos de materia según su naturaleza
 */
export const TIPOS_MATERIA = {
  TEORICA: 'TEORICA',
  PRACTICA: 'PRACTICA',
  TEORICA_PRACTICA: 'TEORICA_PRACTICA',
};

/**
 * Array de tipos de materia válidos (útil para validators)
 */
export const TIPOS_MATERIA_VALUES = Object.values(TIPOS_MATERIA);
