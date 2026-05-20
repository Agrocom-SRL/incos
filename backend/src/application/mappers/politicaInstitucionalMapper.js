import {
  ALCANCES_EVALUACION_FINAL,
  DEFAULT_POLITICA_DOCUMENTO,
  mergePoliticaExtra,
  parsePoliticaFromRow,
} from '../utils/politicaInstitucionalPayload.js';

const toNum = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const normalizarRegla = (regla, tiposFinales) => {
  const codigo = regla?.tipoEvaluacionCodigo ?? regla?.codigo;
  if (!codigo) return null;
  const tipo = (tiposFinales ?? []).find((t) => t.codigo === codigo);
  const alcance = ALCANCES_EVALUACION_FINAL.includes(regla?.alcance)
    ? regla.alcance
    : 'GESTION';

  return {
    id: regla.id ?? `regla-${codigo}`,
    tipoEvaluacionCodigo: codigo,
    tipoEvaluacionNombre: regla.tipoEvaluacionNombre ?? tipo?.nombre ?? codigo,
    ponderacion: toNum(regla.ponderacion, 0),
    alcance,
    carreraId:
      alcance === 'CARRERA' || alcance === 'CARRERA_PERIODO'
        ? regla.carreraId != null
          ? Number(regla.carreraId)
          : null
        : null,
    carreraNombre: regla.carreraNombre ?? null,
    periodoId:
      alcance === 'PERIODO' || alcance === 'CARRERA_PERIODO'
        ? regla.periodoId != null
          ? Number(regla.periodoId)
          : null
        : null,
    periodoNombre: regla.periodoNombre ?? null,
  };
};

/**
 * @param {Object} params
 * @param {Object} params.gestion - { id, anio, nombre }
 * @param {Object|null} params.row - fila configuracion_evaluacion
 * @param {Array<{ codigo: string, nombre: string }>} params.tiposFinales
 * @param {string|null} params.updatedByNombre
 */
export function mapPoliticaInstitucionalResponse({ gestion, row, tiposFinales, updatedByNombre = null }) {
  const extra = mergePoliticaExtra(parsePoliticaFromRow(row), tiposFinales);

  const evaluacionesFinalesReglas = (extra.evaluacionesFinalesReglas ?? [])
    .map((r) => normalizarRegla(r, tiposFinales))
    .filter(Boolean);

  const configurada = Boolean(row?.id);

  return {
    gestionId: gestion.id,
    gestionNombre: gestion.nombre ?? String(gestion.anio ?? gestion.id),
    configurada,
    cuotaTeorico: configurada ? toNum(extra.cuotaTeorico, 30) : 30,
    cuotaPractico: configurada ? toNum(extra.cuotaPractico, 70) : 70,
    pesosBimestres: extra.pesosBimestres.map((p) => toNum(p, 0)),
    evaluacionesFinalesReglas,
    politicaAsistenciaDefault: { ...extra.politicaAsistenciaDefault },
    notaMinimaAprobacion: toNum(extra.notaMinimaAprobacion, 61),
    ultimaModificacion: configurada
      ? {
          updatedAt: row.updated_at ?? row.updatedAt ?? null,
          updatedByNombre: updatedByNombre ?? null,
        }
      : null,
  };
}

export function mapPoliticaFromRequestBody(body, tiposFinales) {
  const cuotaTeorico = toNum(body.cuotaTeorico, 0);
  const cuotaPractico = toNum(body.cuotaPractico, 0);
  const pesosBimestres = (body.pesosBimestres ?? []).map((p) => toNum(p, 0));

  const evaluacionesFinalesReglas = (body.evaluacionesFinalesReglas ?? [])
    .map((r) => normalizarRegla(r, tiposFinales))
    .filter(Boolean);

  const codigosValidos = new Set((tiposFinales ?? []).map((t) => t.codigo));
  for (const regla of evaluacionesFinalesReglas) {
    if (!codigosValidos.has(regla.tipoEvaluacionCodigo)) {
      const err = new Error(`Tipo de evaluación inválido: ${regla.tipoEvaluacionCodigo}`);
      err.statusCode = 400;
      throw err;
    }
    if (regla.ponderacion <= 0 || regla.ponderacion > 100) {
      const err = new Error('La ponderación de cada evaluación final debe estar entre 0 y 100');
      err.statusCode = 400;
      throw err;
    }
    if (
      (regla.alcance === 'CARRERA' || regla.alcance === 'CARRERA_PERIODO') &&
      !regla.carreraId
    ) {
      const err = new Error('Seleccioná la carrera para la regla de evaluación final');
      err.statusCode = 400;
      throw err;
    }
    if (
      (regla.alcance === 'PERIODO' || regla.alcance === 'CARRERA_PERIODO') &&
      !regla.periodoId
    ) {
      const err = new Error('Seleccioná el periodo para la regla de evaluación final');
      err.statusCode = 400;
      throw err;
    }
  }

  const pad = body.politicaAsistenciaDefault ?? {};
  const politica = pad.politica ?? DEFAULT_POLITICA_DOCUMENTO.politicaAsistenciaDefault.politica;

  const politicaAsistenciaDefault = {
    politica,
    pesoAsistencia: politica === 'COMPUTA_NOTA' ? toNum(pad.pesoAsistencia, null) : null,
    minimoAsistencia:
      politica === 'CAUSA_REPROBACION' ? toNum(pad.minimoAsistencia, null) : null,
    notaReprobada: politica === 'CAUSA_REPROBACION' ? toNum(pad.notaReprobada, null) : null,
  };

  return {
    cuotaTeorico,
    cuotaPractico,
    pesosBimestres,
    evaluacionesFinalesReglas,
    notaMinimaAprobacion: toNum(body.notaMinimaAprobacion, 61),
    politicaAsistenciaDefault,
  };
}

export function mapCatalogoPolitica({ tiposFinales, carreras, periodos }) {
  return {
    tiposEvaluacionFinales: tiposFinales ?? [],
    carreras: (carreras ?? []).map((c) => ({
      id: c.id,
      codigo: c.code ?? c.codigo ?? null,
      nombre: c.name ?? c.nombre ?? String(c.id),
    })),
    periodosPlan: (periodos ?? []).map((p) => ({
      id: p.id,
      nombre: p.name ?? p.nombre ?? String(p.id),
      numero: p.number ?? p.numero ?? null,
    })),
  };
}
