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

/** Opciones del modal institucional (sin carrera+periodo: el docente ajusta por curso). */
export const ALCANCE_EVALUACION_FINAL_OPCIONES_MODAL = ALCANCE_EVALUACION_FINAL_OPCIONES.filter(
  (o) => o.value !== ALCANCE_EVALUACION_FINAL.CARRERA_PERIODO,
);

/**
 * Años del plan compartidos por todas las carreras (1º, 2º, 3º), sin duplicar por plan de estudios.
 */
export const dedupePeriodosPlan = (periodos = []) => {
  const byNumero = new Map();
  for (const p of periodos) {
    const numero = p.numero ?? p.number;
    if (numero == null) continue;
    const prev = byNumero.get(numero);
    if (!prev || p.id < prev.id) byNumero.set(numero, p);
  }
  return [...byNumero.values()].sort(
    (a, b) => (a.numero ?? a.number ?? 0) - (b.numero ?? b.number ?? 0),
  );
};

/** Id canónico del selector (primer periodo con ese número de año). */
export const periodoIdParaSelector = (periodoId, periodos = []) => {
  if (periodoId == null) return undefined;
  const sel = periodos.find((p) => p.id === periodoId);
  if (!sel) return periodoId;
  const numero = sel.numero ?? sel.number;
  if (numero == null) return periodoId;
  return dedupePeriodosPlan(periodos).find((u) => (u.numero ?? u.number) === numero)?.id ?? periodoId;
};

export const nombrePeriodoRegla = (regla, periodos = []) => {
  if (regla?.periodoNombre) return regla.periodoNombre;
  const sel = periodos.find((p) => p.id === regla?.periodoId);
  if (sel?.nombre) return sel.nombre;
  if (sel) {
    const numero = sel.numero ?? sel.number;
    const canon = dedupePeriodosPlan(periodos).find((u) => (u.numero ?? u.number) === numero);
    if (canon?.nombre) return canon.nombre;
  }
  return regla?.periodoId != null ? `Año #${regla.periodoId}` : null;
};

export const etiquetaAlcanceEvaluacionFinal = (alcance) =>
  ALCANCE_EVALUACION_FINAL_OPCIONES.find((o) => o.value === alcance)?.label ?? alcance ?? '—';

export const describeAlcanceRegla = (regla, { carreras = [], periodos = [] } = {}) => {
  const carrera =
    regla.carreraNombre ??
    carreras.find((c) => c.id === regla.carreraId)?.nombre ??
    (regla.carreraId ? `Carrera #${regla.carreraId}` : null);
  const periodo = nombrePeriodoRegla(regla, periodos);

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
