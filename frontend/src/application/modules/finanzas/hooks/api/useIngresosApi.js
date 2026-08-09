/**
 * Hook de API: Registro de ingresos unificado (módulo Finanzas).
 *
 * El módulo Finanzas es independiente del legacy `@pagos`/`@application-pagos`:
 * NO usa un use case del container, sino que consume directamente la
 * INFRAESTRUCTURA compartida (capa de datos) — `IngresoRepository.obtenerTodos`
 * (mismo criterio que `usePagosApi`).
 *
 * Expone un `fetch(options)` compatible con `useServerPaginatedList`: recibe
 * `{ params }`, devuelve `{ success, data, pagination, error }` con la data ya
 * normalizada por `mapIngresosList`. `dataKey` ('data') coincide EXACTO con el
 * `dataFieldName` del backend (GET /api/v1/ingresos → { data: [...] }).
 */

import { useCallback, useMemo } from 'react';
import ingresoRepository from '@implementations/IngresoRepository';
import { mapIngresosList } from '@application-finanzas/mappers/ingresosListMapper';

/** Clave de datos = dataFieldName del backend. */
export const INGRESOS_DATA_KEY = 'data';

export const useIngresosApi = () => {
  const fetch = useCallback(async (options = {}) => {
    const result = await ingresoRepository.obtenerTodos(options);

    if (!result?.success) {
      return {
        success: false,
        error: result?.error || 'Error al cargar el registro de ingresos',
      };
    }

    const ingresos = mapIngresosList(result.data);

    return {
      success: true,
      [INGRESOS_DATA_KEY]: ingresos,
      data: ingresos,
      pagination: result.pagination ?? null,
    };
  }, []);

  return useMemo(() => ({ fetch }), [fetch]);
};

export default useIngresosApi;
