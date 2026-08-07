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
 *
 * IMPORTANTE:
 * REINGRESO y CONTINUIDAD ya no existen como valores separados.
 * Ambos casos ahora se representan como ANTIGUO.
 */
export const TIPOS_INSCRIPCION = {
    NUEVO: 'NUEVO',
    ANTIGUO: 'ANTIGUO',
    TRASPASO: 'TRASPASO',
    TRANSITABILIDAD: 'TRANSITABILIDAD',
};

/**
 * Array de tipos de inscripción válidos
 */
export const TIPOS_INSCRIPCION_VALUES = Object.values(TIPOS_INSCRIPCION);

// ============================================
// ESTADOS DE MATERIA INSCRITA / MATRICULADA
// ============================================

/**
 * Estados consolidados de una materia matriculada.
 *
 * Estos estados viven en matriculas_materia.estado.
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
 * Array de estados de materia inscrita válidos
 */
export const ESTADOS_MATERIA_INSCRITA_VALUES = Object.values(
    ESTADOS_MATERIA_INSCRITA
);

// ============================================
// TIPOS DE ESTADO HISTORIAL MATRÍCULA
// ============================================

/**
 * Tipos de sucesos especiales del historial de una matrícula de materia.
 *
 * Estos estados viven en historial_matricula.tipo_estado.
 */
// domain/constants/inscripciones.constants.js

export const TIPOS_ESTADO_HISTORIAL_MATRICULA = Object.freeze({
    NIVELACION_1RA: 'NIVELACION_1RA',
    NIVELACION_2DA: 'NIVELACION_2DA',
    PRUEBA_EXCEPCIONAL: 'PRUEBA_EXCEPCIONAL',
    RECUPERATORIO_ANUAL: 'RECUPERATORIO_ANUAL',
    VENCIDA: 'VENCIDA',
    CHOQUE_HORARIO: 'CHOQUE_HORARIO',
    PRE_REQUISITO: 'PRE_REQUISITO',
    NO_LLEVA_POR_VOLUNTAD: 'NO_LLEVA_POR_VOLUNTAD',
    HOMOLOGACION: 'HOMOLOGACION',
    REINCORPORACION: 'REINCORPORACION',
    LLEVA_EN_GESTION: 'LLEVA_EN_GESTION',
    ARTICULO_18: 'ARTICULO_18',
    ABANDONO: 'ABANDONO',
    RETIRADO: 'RETIRADO',
    OTRO: 'OTRO',
});

/**
 * Array de tipos de historial de matrícula válidos
 */
export const TIPOS_ESTADO_HISTORIAL_MATRICULA_VALUES = Object.freeze(
    Object.values(TIPOS_ESTADO_HISTORIAL_MATRICULA)
);

/**
 * Subconjunto "intento académico" de TIPOS_ESTADO_HISTORIAL_MATRICULA (examen
 * de nivelación/recuperatorio — ver SubjectEnrollmentHistory.isAcademicAttempt()).
 * Usado por ProgramarNivelacionUseCase y su validador HTTP.
 */
export const TIPOS_INTENTO_ACADEMICO_VALUES = Object.freeze([
    TIPOS_ESTADO_HISTORIAL_MATRICULA.NIVELACION_1RA,
    TIPOS_ESTADO_HISTORIAL_MATRICULA.NIVELACION_2DA,
    TIPOS_ESTADO_HISTORIAL_MATRICULA.PRUEBA_EXCEPCIONAL,
    TIPOS_ESTADO_HISTORIAL_MATRICULA.RECUPERATORIO_ANUAL,
    TIPOS_ESTADO_HISTORIAL_MATRICULA.ARTICULO_18,
]);

/**
 * Subconjunto "decisión administrativa" (ABANDONO/RETIRADO — ver
 * SubjectEnrollmentHistory.isAdministrativeGradeState()). Usado por
 * RegistrarDecisionAdministrativaUseCase y su validador HTTP.
 */
export const TIPOS_DECISION_ADMINISTRATIVA_VALUES = Object.freeze([
    TIPOS_ESTADO_HISTORIAL_MATRICULA.ABANDONO,
    TIPOS_ESTADO_HISTORIAL_MATRICULA.RETIRADO,
]);
