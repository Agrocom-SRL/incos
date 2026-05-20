import {
  DEFAULT_POLITICA_EXTRA,
  mergePoliticaExtra,
  parsePoliticaPayload,
} from '../utils/politicaInstitucionalPayload.js';

const toNum = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

/**
 * @param {Object} params
 * @param {Object} params.gestion - { id, anio, nombre }
 * @param {Object|null} params.row - fila configuracion_evaluacion
 * @param {Array<{ codigo: string, nombre: string }>} params.tiposFinales
 * @param {string|null} params.updatedByNombre
 */
export function mapPoliticaInstitucionalResponse({ gestion, row, tiposFinales, updatedByNombre = null }) {
  const extra = mergePoliticaExtra(parsePoliticaPayload(row?.descripcion ?? null));
  const flags = extra.evaluacionesFinalesHabilitadas ?? {};

  const evaluacionesFinalesDisponibles = (tiposFinales ?? []).map((t) => ({
    codigo: t.codigo,
    nombre: t.nombre,
    habilitadaInstitucional: flags[t.codigo] === true,
  }));

  const configurada = Boolean(row?.id);

  return {
    gestionId: gestion.id,
    gestionNombre: gestion.nombre ?? String(gestion.anio ?? gestion.id),
    configurada,
    cuotaTeorico: configurada ? toNum(row.cuota_teorico ?? row.cuotaTeorico, 30) : 30,
    cuotaPractico: configurada ? toNum(row.cuota_practico ?? row.cuotaPractico, 70) : 70,
    pesosBimestres: extra.pesosBimestres.map((p) => toNum(p, 0)),
    evaluacionesFinalesDisponibles,
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

  const flags = {};
  (body.evaluacionesFinalesDisponibles ?? []).forEach((e) => {
    if (e?.codigo) flags[e.codigo] = Boolean(e.habilitadaInstitucional);
  });
  (tiposFinales ?? []).forEach((t) => {
    if (!(t.codigo in flags)) flags[t.codigo] = false;
  });

  const pad = body.politicaAsistenciaDefault ?? {};
  const politica = pad.politica ?? DEFAULT_POLITICA_EXTRA.politicaAsistenciaDefault.politica;

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
    evaluacionesFinalesHabilitadas: flags,
    notaMinimaAprobacion: toNum(body.notaMinimaAprobacion, 61),
    politicaAsistenciaDefault,
  };
}
