/**
 * Hook de API: alertas de riesgo pedagógico (módulo ACA · A1).
 *
 * Vista 156 (riesgo calculado con umbral ACOMPANAMIENTO_PEDAGOGICO). Expone
 * `fetch(options)` compatible con `useServerPaginatedList` en modo loadAll.
 * `dataKey` ('alertasRiesgo') coincide con el `dataFieldName` del backend
 * (ListAlertasRiesgoUseCase).
 */

import { useCallback, useMemo } from 'react';
import alertaRiesgoRepository from '@implementations/AlertaRiesgoRepository';
import { mapAlertasRiesgoList } from '@application-academico/acompanamiento/alertas/mappers/alertaRiesgoMapper';

/** Clave de datos = dataFieldName del backend (contrato A1). */
export const ALERTAS_RIESGO_DATA_KEY = 'alertasRiesgo';

export const useAlertasRiesgoApi = () => {
  const fetch = useCallback(async (options = {}) => {
    const result = await alertaRiesgoRepository.obtenerAlertas(options);

    if (!result?.success) {
      return {
        success: false,
        error: result?.error || 'Error al cargar las alertas de riesgo',
      };
    }

    const raw = result.data?.[ALERTAS_RIESGO_DATA_KEY] ?? result.data;
    const alertas = mapAlertasRiesgoList(raw);

    return {
      success: true,
      [ALERTAS_RIESGO_DATA_KEY]: alertas,
      data: alertas,
      pagination: result.pagination ?? null,
    };
  }, []);

  return useMemo(() => ({ fetch }), [fetch]);
};
