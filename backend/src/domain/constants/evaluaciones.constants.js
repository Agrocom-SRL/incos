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
