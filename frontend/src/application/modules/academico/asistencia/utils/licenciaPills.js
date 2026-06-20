/**
 * Mapea motivo y estado de licencia a su clase de pill/dot de color (mismo enfoque que
 * actividadPill del cronograma: StatusPill + clase CSS). CSS en
 * presentation/modules/academico/asistencia/styles/licencias.css.
 */

const MOTIVO_MOD = {
  ENFERMEDAD: 'enfermedad',
  TRABAJO: 'trabajo',
  FAMILIAR: 'familiar',
  VIAJE: 'viaje',
  ACADEMICO: 'academico',
  DEPORTIVO: 'deportivo',
  PERSONAL: 'personal',
  OTRO: 'otro',
};

const ESTADO_MOD = {
  PENDIENTE: 'pendiente',
  APROBADA: 'aprobada',
  RECHAZADA: 'rechazada',
  CANCELADA: 'cancelada',
};

/** Clase de pill de color para el motivo de la licencia. */
export const getMotivoPillClass = (motivo) =>
  `licencia-pill licencia-pill--${MOTIVO_MOD[motivo] ?? 'otro'}`;

/** Clase que tiñe el dot + etiqueta del estado bajo el nombre del estudiante. */
export const getEstadoTextClass = (estado) =>
  `licencia-estado--${ESTADO_MOD[estado] ?? 'pendiente'}`;
