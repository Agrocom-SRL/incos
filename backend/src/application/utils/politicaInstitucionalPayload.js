/**
 * Documento JSON de política institucional (configuracion_evaluacion.valor, tipo JSON).
 */

export const POLITICA_PAYLOAD_VERSION = 2;
export const POLITICA_PAYLOAD_VERSION_LEGACY = 1;

export const ALCANCES_EVALUACION_FINAL = [
  'GESTION',
  'CARRERA',
  'PERIODO',
  'CARRERA_PERIODO',
];

export const DEFAULT_POLITICA_DOCUMENTO = {
  cuotaTeorico: 30,
  cuotaPractico: 70,
  pesosBimestres: [25, 25, 25, 25],
  evaluacionesFinalesReglas: [],
  notaMinimaAprobacion: 61,
  politicaAsistenciaDefault: {
    politica: 'NO_AFECTA',
    pesoAsistencia: null,
    minimoAsistencia: 75,
    notaReprobada: 51,
  },
};

function migrateReglasDesdeFlags(parsed, tiposFinales = []) {
  const flags = parsed?.evaluacionesFinalesHabilitadas;
  if (!flags || typeof flags !== 'object') return [];
  const nombres = Object.fromEntries((tiposFinales ?? []).map((t) => [t.codigo, t.nombre]));
  return Object.entries(flags)
    .filter(([, hab]) => hab === true)
    .map(([codigo]) => ({
      id: `legacy-${codigo}`,
      tipoEvaluacionCodigo: codigo,
      tipoEvaluacionNombre: nombres[codigo] ?? codigo,
      ponderacion: 0,
      alcance: 'GESTION',
      carreraId: null,
      carreraNombre: null,
      periodoId: null,
      periodoNombre: null,
    }));
};

export function buildPoliticaValorDocumento(mapped) {
  return {
    v: POLITICA_PAYLOAD_VERSION,
    cuotaTeorico: mapped.cuotaTeorico ?? DEFAULT_POLITICA_DOCUMENTO.cuotaTeorico,
    cuotaPractico: mapped.cuotaPractico ?? DEFAULT_POLITICA_DOCUMENTO.cuotaPractico,
    pesosBimestres: mapped.pesosBimestres ?? DEFAULT_POLITICA_DOCUMENTO.pesosBimestres,
    evaluacionesFinalesReglas:
      mapped.evaluacionesFinalesReglas ?? DEFAULT_POLITICA_DOCUMENTO.evaluacionesFinalesReglas,
    notaMinimaAprobacion:
      mapped.notaMinimaAprobacion ?? DEFAULT_POLITICA_DOCUMENTO.notaMinimaAprobacion,
    politicaAsistenciaDefault: {
      ...DEFAULT_POLITICA_DOCUMENTO.politicaAsistenciaDefault,
      ...(mapped.politicaAsistenciaDefault ?? {}),
    },
  };
}

export function serializePoliticaValor(documento) {
  return JSON.stringify(buildPoliticaValorDocumento(documento));
}

/** @deprecated usar serializePoliticaValor */
export function serializePoliticaPayload(extra) {
  return serializePoliticaValor(extra);
}

export function parsePoliticaValor(valor) {
  if (!valor) return null;
  const raw = typeof valor === 'string' ? valor.trim() : valor;
  if (typeof raw === 'object' && raw !== null) return raw;
  if (typeof raw !== 'string' || !raw.startsWith('{')) return null;
  try {
    const parsed = JSON.parse(raw);
    if (
      parsed?.v !== POLITICA_PAYLOAD_VERSION &&
      parsed?.v !== POLITICA_PAYLOAD_VERSION_LEGACY
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/** Compat: filas antiguas guardaban JSON en descripcion */
export function parsePoliticaFromRow(row) {
  if (!row) return null;
  const fromValor = parsePoliticaValor(row.valor);
  if (fromValor) return fromValor;
  return parsePoliticaValor(row.descripcion);
}

export function mergePoliticaExtra(parsed, tiposFinales = []) {
  const base = { ...DEFAULT_POLITICA_DOCUMENTO };
  if (!parsed) return base;

  let evaluacionesFinalesReglas = base.evaluacionesFinalesReglas;
  if (Array.isArray(parsed.evaluacionesFinalesReglas)) {
    evaluacionesFinalesReglas = parsed.evaluacionesFinalesReglas;
  } else if (parsed.v === POLITICA_PAYLOAD_VERSION_LEGACY) {
    evaluacionesFinalesReglas = migrateReglasDesdeFlags(parsed, tiposFinales);
  }

  return {
    cuotaTeorico:
      parsed.cuotaTeorico != null
        ? Number(parsed.cuotaTeorico)
        : base.cuotaTeorico,
    cuotaPractico:
      parsed.cuotaPractico != null
        ? Number(parsed.cuotaPractico)
        : base.cuotaPractico,
    pesosBimestres: Array.isArray(parsed.pesosBimestres) ? parsed.pesosBimestres : base.pesosBimestres,
    evaluacionesFinalesReglas,
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
