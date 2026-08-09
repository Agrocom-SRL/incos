/**
 * Constantes del dominio relacionadas con Evaluaciones
 */

export const COMPONENTES_EVALUACION = {
  TEORICO: 'TEORICO',
  PRACTICO: 'PRACTICO'
};

export const COMPONENTES_EVALUACION_VALUES = Object.values(COMPONENTES_EVALUACION);

/**
 * Código del tipo de evaluación ASISTENCIA (seeder 53). Su columna en el cuaderno
 * la calcula el sistema (round(%asistencia × puntos)); siempre va a componente PRACTICO.
 */
export const TIPO_EVALUACION_ASISTENCIA = 'ASISTENCIA';

/**
 * Estado institucional agregado por gestión × bimestre (vista 114). Gobierna si el
 * docente puede crear actividades y cargar notas en ese bimestre.
 */
export const ESTADOS_INSTITUCIONALES_BIMESTRE = {
  PENDIENTE: 'PENDIENTE',
  EN_CURSO: 'EN_CURSO',
  CERRADO: 'CERRADO'
};

export const ESTADOS_BIMESTRE_MATRICULA = {
  PENDIENTE: 'PENDIENTE',
  EN_CURSO: 'EN_CURSO',
  CERRADO: 'CERRADO',
  REABIERTO: 'REABIERTO'
};

export const ESTADOS_BIMESTRE_MATRICULA_VALUES = Object.values(ESTADOS_BIMESTRE_MATRICULA);

export const ESTADOS_NIVELACION = {
  PROGRAMADA: 'PROGRAMADA',
  EN_CURSO: 'EN_CURSO',
  APROBADA: 'APROBADA',
  REPROBADA: 'REPROBADA',
  CANCELADA: 'CANCELADA'
};

export const ESTADOS_NIVELACION_VALUES = Object.values(ESTADOS_NIVELACION);

/**
 * Máquina de estados de una nivelación (schema 16-nivelaciones.sql):
 * PROGRAMADA → EN_CURSO → APROBADA/REPROBADA/CANCELADA. Se permite saltar
 * EN_CURSO cuando el resultado se registra en un solo paso (mismo patrón que
 * TRANSICIONES_FOLIO en libros.constants.js). Estados finales sin salida.
 */
export const TRANSICIONES_NIVELACION = {
  [ESTADOS_NIVELACION.PROGRAMADA]: [
    ESTADOS_NIVELACION.EN_CURSO,
    ESTADOS_NIVELACION.APROBADA,
    ESTADOS_NIVELACION.REPROBADA,
    ESTADOS_NIVELACION.CANCELADA,
  ],
  [ESTADOS_NIVELACION.EN_CURSO]: [
    ESTADOS_NIVELACION.APROBADA,
    ESTADOS_NIVELACION.REPROBADA,
    ESTADOS_NIVELACION.CANCELADA,
  ],
  [ESTADOS_NIVELACION.APROBADA]: [],
  [ESTADOS_NIVELACION.REPROBADA]: [],
  [ESTADOS_NIVELACION.CANCELADA]: [],
};

/** Estados finales de una nivelación (requieren nota, salvo CANCELADA). */
export const ESTADOS_NIVELACION_FINALES = [
  ESTADOS_NIVELACION.APROBADA,
  ESTADOS_NIVELACION.REPROBADA,
];

export const ESTADOS_ASISTENCIA = {
  PRESENTE: 'PRESENTE',
  AUSENTE: 'AUSENTE',
  TARDANZA: 'TARDANZA'
};

export const ESTADOS_ASISTENCIA_VALUES = Object.values(ESTADOS_ASISTENCIA);

export const ESTADOS_HISTORIAL_PREVIO = {
  APROBADO: 'APROBADO',
  CONVALIDADO: 'CONVALIDADO'
};

export const ESTADOS_HISTORIAL_PREVIO_VALUES = Object.values(ESTADOS_HISTORIAL_PREVIO);

/**
 * Catálogo fijo del verdicto de "Observación del bimestre" en el Centralizador
 * (P3, `bimestres_matricula.observaciones`). Mismos literales que ya usan los
 * exports Excel de Consolidado/Planilla (`ConsolidadoSheetBuilder.js`,
 * `PlanillaCalificacionesSheetBuilder.js`) y que el documento oficial
 * "PLANILLA CENTRALIZADORA DE CALIFICACIONES" — no es un catálogo nuevo, es el
 * mismo verdicto ya usado en otro consumidor. La columna sigue siendo TEXT
 * libre en BD (sin ENUM): el catálogo se valida en el use case, no en schema.
 */
export const VERDICTOS_OBSERVACION_BIMESTRE = {
  APROBADO: 'APROBADO/A',
  REPROBADO: 'REPROBADO/A',
  ABANDONO: 'ABANDONO',
  NO_SE_PRESENTO: 'NO SE PRESENTO'
};

export const VERDICTOS_OBSERVACION_BIMESTRE_VALUES = Object.values(
  VERDICTOS_OBSERVACION_BIMESTRE
);
