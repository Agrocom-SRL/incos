/**
 * Hook de API: lista de pagos de aporte (módulo Finanzas).
 *
 * El módulo Finanzas es independiente del legacy `@pagos`/`@application-pagos`:
 * NO usa un use case del container, sino que consume directamente la
 * INFRAESTRUCTURA compartida (capa de datos) — `PagoAporteRepository.obtenerTodos`.
 *
 * Expone un `fetch(options)` compatible con `useServerPaginatedList`:
 * recibe `{ params }`, devuelve `{ success, data, pagination, error }` con la
 * data ya normalizada por `mapPagosList`. `dataKey` ('pagos') coincide con el
 * `dataFieldName` del backend (vista_pago_aporte_listado).
 */

import { useCallback, useMemo } from 'react';
import pagoAporteRepository from '@implementations/PagoAporteRepository';
import { mapPagosList } from '@application-finanzas/mappers/pagosListMapper';

/** Clave de datos = dataFieldName del backend. */
export const PAGOS_DATA_KEY = 'pagos';

export const usePagosApi = () => {
  const fetch = useCallback(async (options = {}) => {
    const result = await pagoAporteRepository.obtenerTodos(options);

    if (!result?.success) {
      return {
        success: false,
        error: result?.error || 'Error al cargar los pagos',
      };
    }

    const pagos = mapPagosList(result.data);

    return {
      success: true,
      [PAGOS_DATA_KEY]: pagos,
      data: pagos,
      pagination: result.pagination ?? null,
    };
  }, []);

  return useMemo(() => ({ fetch }), [fetch]);
};
