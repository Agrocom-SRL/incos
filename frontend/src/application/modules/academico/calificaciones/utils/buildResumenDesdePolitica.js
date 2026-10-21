import { sumaPesos } from './politicaPorcentajeUtils.js';

/** Arma props de resumen a partir del objeto política (misma forma que guarda el API). */
export const buildResumenDesdePolitica = (politica) => {
  if (!politica) return null;
  const cuotaTeorico = Number(politica.cuotaTeorico) || 0;
  const cuotaPractico = Number(politica.cuotaPractico) || 0;
  const pesosBimestres = politica.pesosBimestres ?? [25, 25, 25, 25];
  const sumaCuota = politica.sumaCuota ?? cuotaTeorico + cuotaPractico;
  const sumaBimestres = politica.sumaBimestres ?? sumaPesos(pesosBimestres);

  return {
    gestionNombre: politica.gestionNombre,
    configurada: Boolean(politica.configurada),
    cuotaTeorico,
    cuotaPractico,
    pesosBimestres,
    politicaAsistenciaDefault: politica.politicaAsistenciaDefault ?? {},
    notaMinimaAprobacion: politica.notaMinimaAprobacion ?? 61,
    ultimaModificacion: politica.ultimaModificacion ?? null,
    sumaCuota,
    sumaBimestres,
  };
};
