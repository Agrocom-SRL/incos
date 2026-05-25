import { mergePoliticaExtra, parsePoliticaFromRow } from './politicaInstitucionalPayload.js';

/**
 * Cuotas y pesos de bimestre desde el documento de política institucional.
 */
export function obtenerCuotasDesdePolitica(politicaExtra) {
  const p = politicaExtra ?? {};
  return {
    cuotaTeorico: Number(p.cuotaTeorico ?? 30),
    cuotaPractico: Number(p.cuotaPractico ?? 70),
    pesosBimestres: p.pesosBimestres ?? [25, 25, 25, 25],
  };
}

/**
 * Carga la política vigente de una gestión y devuelve cuotas para cálculo de notas.
 */
export async function cargarCuotasPoliticaGestion({
  calificacionRepository,
  evaluationConfigurationRepository,
  gestionId,
}) {
  let gid = gestionId;
  if (!gid) {
    const ctx = await calificacionRepository.obtenerContextoVigente();
    gid = ctx?.gestion_id;
  }
  const row = gid
    ? await evaluationConfigurationRepository.findActiveRowByGestionId(gid)
    : null;
  return obtenerCuotasDesdePolitica(mergePoliticaExtra(parsePoliticaFromRow(row)));
}
