/**
 * Payload extendido de política institucional en configuracion_evaluacion.descripcion (JSON).
 * Las cuotas viven en columnas cuota_teorico / cuota_practico (schema 13-evaluaciones).
 */

export const POLITICA_PAYLOAD_VERSION = 1;

export const DEFAULT_POLITICA_EXTRA = {
  pesosBimestres: [25, 25, 25, 25],
  evaluacionesFinalesHabilitadas: {},
  notaMinimaAprobacion: 61,
  politicaAsistenciaDefault: {
    politica: 'NO_AFECTA',
    pesoAsistencia: null,
    minimoAsistencia: 75,
    notaReprobada: 51,
  },
};

export function serializePoliticaPayload(extra) {
  return JSON.stringify({
    v: POLITICA_PAYLOAD_VERSION,
    pesosBimestres: extra.pesosBimestres ?? DEFAULT_POLITICA_EXTRA.pesosBimestres,
    evaluacionesFinalesHabilitadas:
      extra.evaluacionesFinalesHabilitadas ?? DEFAULT_POLITICA_EXTRA.evaluacionesFinalesHabilitadas,
    notaMinimaAprobacion:
      extra.notaMinimaAprobacion ?? DEFAULT_POLITICA_EXTRA.notaMinimaAprobacion,
    politicaAsistenciaDefault: {
      ...DEFAULT_POLITICA_EXTRA.politicaAsistenciaDefault,
      ...(extra.politicaAsistenciaDefault ?? {}),
    },
  });
}

export function parsePoliticaPayload(descripcion) {
  if (!descripcion || typeof descripcion !== 'string') return null;
  const trimmed = descripcion.trim();
  if (!trimmed.startsWith('{')) return null;
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed?.v !== POLITICA_PAYLOAD_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function mergePoliticaExtra(parsed) {
  const base = { ...DEFAULT_POLITICA_EXTRA };
  if (!parsed) return base;
  return {
    pesosBimestres: Array.isArray(parsed.pesosBimestres) ? parsed.pesosBimestres : base.pesosBimestres,
    evaluacionesFinalesHabilitadas:
      parsed.evaluacionesFinalesHabilitadas && typeof parsed.evaluacionesFinalesHabilitadas === 'object'
        ? parsed.evaluacionesFinalesHabilitadas
        : base.evaluacionesFinalesHabilitadas,
    notaMinimaAprobacion:
      parsed.notaMinimaAprobacion != null
        ? Number(parsed.notaMinimaAprobacion)
        : base.notaMinimaAprobacion,
    politicaAsistenciaDefault: {
      ...base.politicaAsistenciaDefault,
      ...(parsed.politicaAsistenciaDefault ?? {}),
    },
  };
}
