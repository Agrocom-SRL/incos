/**
 * Constantes del dominio relacionadas con Docentes y Personal
 * 
 * Estas constantes son parte del dominio de negocio y pueden ser usadas
 * por entidades, value objects y servicios de dominio relacionados con docentes.
 */

// ============================================
// DOCENTES
// ============================================

/**
 * Niveles académicos
 */
export const NIVELES_ACADEMICOS = {
  ESTUDIANTE: 'ESTUDIANTE',
  TECNICO: 'TECNICO',
  LICENCIATURA: 'LICENCIATURA',
  MAESTRIA: 'MAESTRIA',
  DOCTORADO: 'DOCTORADO',
};

/**
 * Array de niveles académicos válidos (útil para validators)
 */
export const NIVELES_ACADEMICOS_VALUES = Object.values(NIVELES_ACADEMICOS);

/**
 * Niveles académicos para personal (sin ESTUDIANTE)
 * Útil para validaciones en Rector, Director, Teacher
 */
export const NIVELES_ACADEMICOS_PERSONAL_VALUES = NIVELES_ACADEMICOS_VALUES.filter(
  (level) => level !== 'ESTUDIANTE'
);

/**
 * Tipos de contrato
 */
export const TIPOS_CONTRATO = {
  PLANTA: 'PLANTA',
  CONTRATO: 'CONTRATO',
  HORARIO: 'HORARIO',
  CONSULTOR: 'CONSULTOR',
  EVENTUAL: 'EVENTUAL',
  TEMPORAL: 'TEMPORAL',
  INDEFINIDO: 'INDEFINIDO',
};

/**
 * Array de tipos de contrato válidos (útil para validators)
 */
export const TIPOS_CONTRATO_VALUES = Object.values(TIPOS_CONTRATO);

/**
 * Tipos de contrato para docentes (subconjunto de TIPOS_CONTRATO)
 */
export const TIPOS_CONTRATO_DOCENTE = {
  PLANTA: 'PLANTA',
  CONTRATO: 'CONTRATO',
  HORARIO: 'HORARIO',
  CONSULTOR: 'CONSULTOR',
};

/**
 * Array de tipos de contrato para docentes válidos (útil para validators)
 */
export const TIPOS_CONTRATO_DOCENTE_VALUES = Object.values(TIPOS_CONTRATO_DOCENTE);

/**
 * Tipos de contrato para secretarias (subconjunto de TIPOS_CONTRATO)
 */
export const TIPOS_CONTRATO_SECRETARIA = {
  EVENTUAL: 'EVENTUAL',
  TEMPORAL: 'TEMPORAL',
  INDEFINIDO: 'INDEFINIDO',
};

/**
 * Array de tipos de contrato para secretarias válidos (útil para validators)
 */
export const TIPOS_CONTRATO_SECRETARIA_VALUES = Object.values(TIPOS_CONTRATO_SECRETARIA);

/**
 * Estados laborales
 */
export const ESTADOS_LABORALES = {
  ACTIVO: 'ACTIVO',
  LICENCIA: 'LICENCIA',
  RETIRADO: 'RETIRADO',
  SUSPENDIDO: 'SUSPENDIDO',
};

/**
 * Array de estados laborales válidos (útil para validators)
 */
export const ESTADOS_LABORALES_VALUES = Object.values(ESTADOS_LABORALES);

/**
 * Estados de asignaciones de docentes
 */
export const ESTADOS_ASIGNACION_DOCENTE = {
  PROPUESTA: 'PROPUESTA',
  APROBADA: 'APROBADA',
  ABIERTA: 'ABIERTA',
  CERRADA: 'CERRADA',
  CANCELADA: 'CANCELADA',
};

/**
 * Array de estados de asignación válidos (útil para validators)
 */
export const ESTADOS_ASIGNACION_DOCENTE_VALUES = Object.values(ESTADOS_ASIGNACION_DOCENTE);

/**
 * Tipos de director
 */
export const TIPOS_DIRECTOR = {
  ACADEMICO: 'ACADEMICO',
  ADMINISTRATIVO: 'ADMINISTRATIVO',
};

/**
 * Array de tipos de director válidos (útil para validators)
 */
export const TIPOS_DIRECTOR_VALUES = Object.values(TIPOS_DIRECTOR);

/**
 * Tipos de secretaria
 */
export const TIPOS_SECRETARIA = {
  ACADEMICA: 'ACADEMICA',
  ADMINISTRATIVA: 'ADMINISTRATIVA',
};

/**
 * Array de tipos de secretaria válidos (útil para validators)
 */
export const TIPOS_SECRETARIA_VALUES = Object.values(TIPOS_SECRETARIA);

/** Carga docente — defaults alineados al schema (data real 2026). */
export const DEFAULT_MAX_HORAS_SEMANA_DOCENTE = 20;
export const DEFAULT_MAX_HORAS_MES_DOCENTE = 80;
/** Equivalencia mensual usada al sumar horas semanales de asignaciones. */
export const SEMANAS_EQUIVALENTES_MES_CARGA_DOCENTE = 4;

/** Formato válido de color en horarios (#RRGGBB). */
export const DOCENTE_COLOR_HEX_REGEX = /^#[0-9A-F]{6}$/i;

/**
 * Paleta institucional para asignación de color docente (16 tonos HSL distribuidos).
 * Usada por GET colores-sugeridos y validación de unicidad.
 */
export const DOCENTE_COLOR_PALETTE = [
  '#E6194B',
  '#3CB44B',
  '#FFE119',
  '#4363D8',
  '#F58231',
  '#911EB4',
  '#42D4F4',
  '#F032E6',
  '#BFEF45',
  '#469990',
  '#DCBEFF',
  '#9A6324',
  '#FABED4',
  '#800000',
  '#AAFFC3',
  '#808080',
];

