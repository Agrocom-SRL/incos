/**
 * Hook de API: listado de fichas de seguimiento en clase (módulo DOC ·
 * Supervisión docente, S1).
 *
 * Vista 174. Expone `fetch(options)` compatible con `useServerPaginatedList`.
 * `dataKey` ('fichasSeguimiento') coincide con el `dataFieldName` del backend
 * (ListFichasSeguimientoUseCase).
 */

import { useCallback, useMemo } from 'react';
import fichaSeguimientoRepository from '@implementations/FichaSeguimientoRepository';
import { mapFichasSeguimientoList } from '@application-docentes/supervision/mappers/fichaSeguimientoMapper';

/** Clave de datos = dataFieldName del backend (contrato S1). */
export const FICHAS_SEGUIMIENTO_DATA_KEY = 'fichasSeguimiento';

export const useFichasSeguimientoApi = () => {
  const fetch = useCallback(async (options = {}) => {
    const result = await fichaSeguimientoRepository.obtenerTodos(options);

    if (!result?.success) {
      return {
        success: false,
        error: result?.error || 'Error al cargar las fichas de seguimiento',
      };
    }

    const raw = result.data?.[FICHAS_SEGUIMIENTO_DATA_KEY] ?? result.data;
    const fichas = mapFichasSeguimientoList(raw);

    return {
      success: true,
      [FICHAS_SEGUIMIENTO_DATA_KEY]: fichas,
      data: fichas,
      pagination: result.pagination ?? null,
    };
  }, []);

  return useMemo(() => ({ fetch }), [fetch]);
};
