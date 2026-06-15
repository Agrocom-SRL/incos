/**
 * Mapea tipo de actividad y estado a etiqueta + clase de pill (mismo enfoque que
 * los badges de materias: StatusPill + clase CSS). CSS en
 * presentation/.../actual/styles/cronograma.css.
 */

const TIPO_META = {
  INSCRIPCION: { label: 'Inscripción', mod: 'inscripcion' },
  PLANIFICACION: { label: 'Planificación', mod: 'planificacion' },
  ACADEMICA: { label: 'Académica', mod: 'academica' },
  EVALUACION: { label: 'Evaluación', mod: 'evaluacion' },
  ADMINISTRATIVA: { label: 'Administrativa', mod: 'administrativa' },
  FERIADO: { label: 'Feriado', mod: 'feriado' },
  EVENTO_INSTITUCIONAL: { label: 'Evento', mod: 'evento' },
  FERIA: { label: 'Feria', mod: 'feria' },
  MODALIDAD_GRADO: { label: 'Modalidad de grado', mod: 'modalidad' },
  OTRO: { label: 'Actividad', mod: 'otro' },
};

const ESTADO_META = {
  pasada: { label: 'Pasada', mod: 'pasada' },
  vigente: { label: 'Vigente', mod: 'vigente' },
  futura: { label: 'Futura', mod: 'futura' },
};

export const getActividadTipoLabel = (tipo) => (TIPO_META[tipo] ?? TIPO_META.OTRO).label;
export const getActividadTipoPillClass = (tipo) =>
  `cronograma-pill cronograma-pill--${(TIPO_META[tipo] ?? TIPO_META.OTRO).mod}`;

export const getActividadEstadoLabel = (estado) => (ESTADO_META[estado] ?? ESTADO_META.futura).label;
export const getActividadEstadoPillClass = (estado) =>
  `cronograma-pill cronograma-pill--${(ESTADO_META[estado] ?? ESTADO_META.futura).mod}`;

/** Punto de color (dot) que identifica el tipo bajo el nombre de la actividad. */
export const getActividadTipoDotClass = (tipo) =>
  `cronograma-dot cronograma-dot--${(TIPO_META[tipo] ?? TIPO_META.OTRO).mod}`;

/** Clase que tiñe el texto del tipo (dot + etiqueta) con el color del tipo. */
export const getActividadTipoTextClass = (tipo) =>
  `cronograma-tipo--${(TIPO_META[tipo] ?? TIPO_META.OTRO).mod}`;

/** Opciones de tipo para selects/filtros. */
export const TIPO_ACTIVIDAD_OPTIONS = Object.entries(TIPO_META).map(([value, meta]) => ({
  value,
  label: meta.label,
}));
