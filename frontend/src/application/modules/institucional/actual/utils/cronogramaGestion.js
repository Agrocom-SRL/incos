/**
 * Mapea el payload de `GET /calificaciones/gestion-cronograma` a la forma de
 * presentación del organismo CronogramaGestion (secciones por periodo + próximas
 * actividades). Reutiliza el formateo de fechas de bimestresTimeline.
 */

import { formatRangoFechas, formatFechaCorta } from './bimestresTimeline.js';

/** tipo (catálogo `actividades`) → color de Tag (antd preset) + etiqueta legible. */
export const TIPO_META = {
  INSCRIPCION: { color: 'geekblue', label: 'Inscripción' },
  PLANIFICACION: { color: 'cyan', label: 'Planificación' },
  ACADEMICA: { color: 'blue', label: 'Académica' },
  EVALUACION: { color: 'gold', label: 'Evaluación' },
  ADMINISTRATIVA: { color: 'default', label: 'Administrativa' },
  FERIADO: { color: 'red', label: 'Feriado' },
  EVENTO_INSTITUCIONAL: { color: 'purple', label: 'Evento' },
  FERIA: { color: 'magenta', label: 'Feria' },
  MODALIDAD_GRADO: { color: 'volcano', label: 'Modalidad de grado' },
  OTRO: { color: 'default', label: 'Actividad' },
};

export function tipoMeta(tipo) {
  return TIPO_META[tipo] ?? TIPO_META.OTRO;
}

/** estado de actividad → color del punto del Timeline antd. */
const ESTADO_DOT = { pasada: 'gray', vigente: 'blue', futura: 'green' };

export function estadoDot(estado) {
  return ESTADO_DOT[estado] ?? 'gray';
}

/** Mapea una actividad del backend a la forma de presentación. */
export function mapActividadView(a = {}) {
  return {
    ...a,
    tipoMeta: tipoMeta(a.tipo),
    rango: a.fechaFin
      ? formatRangoFechas(a.fechaInicio, a.fechaFin)
      : formatFechaCorta(a.fechaInicio),
    esRango: Boolean(a.fechaFin),
  };
}

/**
 * Construye las secciones del cronograma a partir del payload del endpoint.
 * @returns {{ periodos: Array, proximas: Array }}
 */
export function buildCronograma(payload) {
  const periodos = (payload?.periodos ?? []).map((p) => ({
    ...p,
    rango: formatRangoFechas(p.fechaInicio, p.fechaFin),
    actividades: (p.actividades ?? []).map(mapActividadView),
    totalActividades: (p.actividades ?? []).length,
  }));
  const proximas = (payload?.proximasActividades ?? []).map(mapActividadView);
  return { periodos, proximas };
}
