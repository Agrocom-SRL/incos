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

// ============================================
// TURNOS
// ============================================

/**
 * Turnos horarios
 */
export const TURNOS = {
  MAÑANA: 'MAÑANA',
  TARDE: 'TARDE',
  NOCHE: 'NOCHE',
};

/**
 * Array de turnos válidos (útil para validators)
 */
export const TURNOS_VALUES = Object.values(TURNOS);

// ============================================
// CATEGORÍAS DE AULAS
// ============================================

/**
 * Categorías de aulas/espacios físicos
 */
export const CATEGORIAS_AULA = {
  LABORATORIO: 'LABORATORIO',
  AULA: 'AULA',
  TALLER: 'TALLER',
  AUDITORIO: 'AUDITORIO',
};

/**
 * Array de categorías de aulas válidas (útil para validators)
 */
export const CATEGORIAS_AULA_VALUES = Object.values(CATEGORIAS_AULA);

// ============================================
// TIPOS DE HORARIOS
// ============================================

/**
 * Tipos de horarios/bloques horarios
 */
export const TIPOS_HORARIO = {
  CLASES: 'CLASES',
  EVENTOS: 'EVENTOS',
  FERIADOS: 'FERIADOS',
  CAPACITACION: 'CAPACITACION',
};

/**
 * Array de tipos de horarios válidos (útil para validators)
 */
export const TIPOS_HORARIO_VALUES = Object.values(TIPOS_HORARIO);

// ============================================
// ESTADOS DE GESTIÓN PLAN
// ============================================

/**
 * Estados de habilitación de planes de estudio por gestión
 */
export const ESTADOS_GESTION_PLAN = {
  PROPUESTO: 'PROPUESTO',
  APROBADO: 'APROBADO',
  VIGENTE: 'VIGENTE',
  CERRADO: 'CERRADO',
  CANCELADO: 'CANCELADO',
};

/**
 * Array de estados de gestión plan válidos (útil para validators)
 */
export const ESTADOS_GESTION_PLAN_VALUES = Object.values(ESTADOS_GESTION_PLAN);
