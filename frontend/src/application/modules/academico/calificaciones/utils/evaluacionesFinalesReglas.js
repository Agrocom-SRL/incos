/** Alcance de una regla de evaluación final institucional. */

export const ALCANCE_EVALUACION_FINAL = {
  GESTION: 'GESTION',
  CARRERA: 'CARRERA',
  PERIODO: 'PERIODO',
  CARRERA_PERIODO: 'CARRERA_PERIODO',
};

export const ALCANCE_EVALUACION_FINAL_OPCIONES = [
  {
    value: ALCANCE_EVALUACION_FINAL.GESTION,
    label: 'Toda la gestión',
    descripcion: 'Aplica a todas las carreras y periodos de la gestión vigente.',
  },
  {
    value: ALCANCE_EVALUACION_FINAL.CARRERA,
    label: 'Una carrera',
    descripcion: 'Solo materias de la carrera seleccionada.',
  },
  {
    value: ALCANCE_EVALUACION_FINAL.PERIODO,
    label: 'Un periodo (año del plan)',
    descripcion: 'Solo inscriptos en ese año académico del plan (ej. 1º, 2º, 3º).',
  },
  {
    value: ALCANCE_EVALUACION_FINAL.CARRERA_PERIODO,
    label: 'Carrera y periodo',
    descripcion: 'Combinación: una carrera y un año del plan (ej. 2º año de Enfermería).',
  },
];

export const etiquetaAlcanceEvaluacionFinal = (alcance) =>
  ALCANCE_EVALUACION_FINAL_OPCIONES.find((o) => o.value === alcance)?.label ?? alcance ?? '—';

export const describeAlcanceRegla = (regla, { carreras = [], periodos = [] } = {}) => {
  const carrera =
    regla.carreraNombre ??
    carreras.find((c) => c.id === regla.carreraId)?.nombre ??
    (regla.carreraId ? `Carrera #${regla.carreraId}` : null);
  const periodo =
    regla.periodoNombre ??
    periodos.find((p) => p.id === regla.periodoId)?.nombre ??
    (regla.periodoId ? `Periodo #${regla.periodoId}` : null);

  switch (regla.alcance) {
    case ALCANCE_EVALUACION_FINAL.CARRERA:
      return carrera ?? 'Carrera';
    case ALCANCE_EVALUACION_FINAL.PERIODO:
      return periodo ?? 'Periodo';
    case ALCANCE_EVALUACION_FINAL.CARRERA_PERIODO:
      return [carrera, periodo].filter(Boolean).join(' · ') || 'Carrera y periodo';
    default:
      return 'Toda la gestión';
  }
};

export const nuevaReglaEvaluacionFinal = ({
  tipoEvaluacionCodigo,
  tipoEvaluacionNombre,
  ponderacion = 10,
  alcance = ALCANCE_EVALUACION_FINAL.GESTION,
  carreraId = null,
  carreraNombre = null,
  periodoId = null,
  periodoNombre = null,
} = {}) => ({
  id: `regla-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  tipoEvaluacionCodigo,
  tipoEvaluacionNombre,
  ponderacion,
  alcance,
  carreraId,
  carreraNombre,
  periodoId,
  periodoNombre,
});
