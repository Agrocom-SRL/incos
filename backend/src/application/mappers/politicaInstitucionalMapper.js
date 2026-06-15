import {
  DEFAULT_POLITICA_DOCUMENTO,
  mergePoliticaExtra,
  parsePoliticaFromRow,
} from '../utils/politicaInstitucionalPayload.js';

const toNum = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

/**
 * @param {Object} params
 * @param {Object} params.gestion - { id, anio, nombre }
 * @param {Object|null} params.row - fila configuracion_evaluacion
 * @param {string|null} params.updatedByNombre
 */
export function mapPoliticaInstitucionalResponse({ gestion, row, updatedByNombre = null }) {
  const extra = mergePoliticaExtra(parsePoliticaFromRow(row));

  const configurada = Boolean(row?.id);

  return {
    gestionId: gestion.id,
    gestionNombre: gestion.nombre ?? String(gestion.anio ?? gestion.id),
    configurada,
    cuotaTeorico: configurada ? toNum(extra.cuotaTeorico, 30) : 30,
    cuotaPractico: configurada ? toNum(extra.cuotaPractico, 70) : 70,
    pesosBimestres: extra.pesosBimestres.map((p) => toNum(p, 0)),
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

export function mapPoliticaFromRequestBody(body) {
  const cuotaTeorico = toNum(body.cuotaTeorico, 0);
  const cuotaPractico = toNum(body.cuotaPractico, 0);
  const pesosBimestres = (body.pesosBimestres ?? []).map((p) => toNum(p, 0));

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
    notaMinimaAprobacion: toNum(body.notaMinimaAprobacion, 61),
    politicaAsistenciaDefault,
  };
}

export function mapCatalogoPolitica({ carreras, periodos }) {
  return {
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
