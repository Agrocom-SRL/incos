import { useMemo } from 'react';
import { mapParaleloToCardModel } from '../../utils/ofertaParaleloCardModel.js';

/**
 * View-models de tarjetas paralelo para la grilla de gestión de planes.
 */
export function useOfertaParaleloCardModels(paralelos, coberturaByParaleloId, { soloConsulta = false } = {}) {
  return useMemo(
    () =>
      (paralelos ?? []).map((pg) =>
        mapParaleloToCardModel(pg, coberturaByParaleloId?.[pg.id], { soloConsulta })
      ),
    [paralelos, coberturaByParaleloId, soloConsulta]
  );
}
