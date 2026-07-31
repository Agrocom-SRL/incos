/**
 * Hook de API: lista de sesiones de refuerzo (módulo TUT · A4).
 *
 * Vista 161. Expone `fetch(options)` compatible con `useServerPaginatedList`
 * en modo loadAll. `dataKey` ('sesionesRefuerzo') coincide con el
 * `dataFieldName` del backend (ListSesionesRefuerzoUseCase).
 */

import { useCallback, useMemo } from 'react';
import sesionRefuerzoRepository from '@implementations/SesionRefuerzoRepository';
import { mapSesionesRefuerzoList } from '@application-academico/acompanamiento/sesiones/mappers/sesionRefuerzoMapper';

/** Clave de datos = dataFieldName del backend (contrato A4). */
export const SESIONES_REFUERZO_DATA_KEY = 'sesionesRefuerzo';

export const useSesionesRefuerzoApi = () => {
  const fetch = useCallback(async (options = {}) => {
    const result = await sesionRefuerzoRepository.obtenerTodos(options);

    if (!result?.success) {
      return {
        success: false,
        error: result?.error || 'Error al cargar las sesiones de refuerzo',
      };
    }

    const raw = result.data?.[SESIONES_REFUERZO_DATA_KEY] ?? result.data;
    const sesiones = mapSesionesRefuerzoList(raw);

    return {
      success: true,
      [SESIONES_REFUERZO_DATA_KEY]: sesiones,
      data: sesiones,
      pagination: result.pagination ?? null,
    };
  }, []);

  return useMemo(() => ({ fetch }), [fetch]);
};
