/**
 * Documento JSON de política institucional (configuracion_evaluacion.valor, tipo JSON).
 * Solo administración define y persiste estos valores por gestión.
 */

export const DEFAULT_POLITICA_DOCUMENTO = {
  cuotaTeorico: 30,
  cuotaPractico: 70,
  pesosBimestres: [25, 25, 25, 25],
  notaMinimaAprobacion: 61,
  politicaAsistenciaDefault: {
    politica: 'NO_AFECTA',
    pesoAsistencia: null,
    minimoAsistencia: 75,
    notaReprobada: 51,
  },
};

export function buildPoliticaValorDocumento(mapped) {
  return {
    cuotaTeorico: mapped.cuotaTeorico ?? DEFAULT_POLITICA_DOCUMENTO.cuotaTeorico,
    cuotaPractico: mapped.cuotaPractico ?? DEFAULT_POLITICA_DOCUMENTO.cuotaPractico,
    pesosBimestres: mapped.pesosBimestres ?? DEFAULT_POLITICA_DOCUMENTO.pesosBimestres,
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

function parseJsonPolitica(raw) {
  if (!raw) return null;
  const text = typeof raw === 'string' ? raw.trim() : raw;
  if (typeof text === 'object' && text !== null) return text;
  if (typeof text !== 'string' || !text.startsWith('{')) return null;
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

/** Lee el JSON desde valor o, si falta, desde descripcion (filas antiguas). */
export function parsePoliticaFromRow(row) {
  if (!row) return null;
  return parseJsonPolitica(row.valor) ?? parseJsonPolitica(row.descripcion);
}

export function mergePoliticaExtra(parsed) {
  const base = { ...DEFAULT_POLITICA_DOCUMENTO };
  if (!parsed) return base;

  return {
    cuotaTeorico:
      parsed.cuotaTeorico != null ? Number(parsed.cuotaTeorico) : base.cuotaTeorico,
    cuotaPractico:
      parsed.cuotaPractico != null ? Number(parsed.cuotaPractico) : base.cuotaPractico,
    pesosBimestres: Array.isArray(parsed.pesosBimestres) ? parsed.pesosBimestres : base.pesosBimestres,
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
