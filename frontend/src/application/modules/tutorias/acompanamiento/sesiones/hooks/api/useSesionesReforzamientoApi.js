/**
 * Hook de API: lista de sesiones de reforzamiento (módulo TUT · A4).
 *
 * Vista 161. Expone `fetch(options)` compatible con `useServerPaginatedList`
 * en modo loadAll. `dataKey` ('sesionesReforzamiento') coincide con el
 * `dataFieldName` del backend (ListSesionesReforzamientoUseCase).
 */

import { useCallback, useMemo } from 'react';
import sesionReforzamientoRepository from '@implementations/SesionReforzamientoRepository';
import { mapSesionesReforzamientoList } from '@application-tutorias/acompanamiento/sesiones/mappers/sesionReforzamientoMapper';

/** Clave de datos = dataFieldName del backend (contrato A4). */
export const SESIONES_REFORZAMIENTO_DATA_KEY = 'sesionesReforzamiento';

export const useSesionesReforzamientoApi = () => {
  const fetch = useCallback(async (options = {}) => {
    const result = await sesionReforzamientoRepository.obtenerTodos(options);

    if (!result?.success) {
      return {
        success: false,
        error: result?.error || 'Error al cargar las sesiones de reforzamiento',
      };
    }

    const raw = result.data?.[SESIONES_REFORZAMIENTO_DATA_KEY] ?? result.data;
    const sesiones = mapSesionesReforzamientoList(raw);

    return {
      success: true,
      [SESIONES_REFORZAMIENTO_DATA_KEY]: sesiones,
      data: sesiones,
      pagination: result.pagination ?? null,
    };
  }, []);

  return useMemo(() => ({ fetch }), [fetch]);
};
