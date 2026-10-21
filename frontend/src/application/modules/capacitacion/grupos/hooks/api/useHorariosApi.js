/**
 * Hook de API: lista de horarios de capacitación (módulo CAP).
 *
 * Patrón `useParticipantesApi`: consume `HorarioCapacitacionRepository` y expone
 * `fetch(options)` compatible con `useServerPaginatedList` (búsqueda
 * server-side). `dataKey` ('horarios') coincide con el `dataFieldName` del backend.
 */

import { useCallback, useMemo } from 'react';
import horarioCapacitacionRepository from '@implementations/HorarioCapacitacionRepository';
import { mapHorariosCapacitacionList } from '@application-capacitacion/grupos/mappers/horarioCapacitacionMapper';

/** Clave de datos = dataFieldName del backend. */
export const HORARIOS_DATA_KEY = 'horarios';

export const useHorariosApi = () => {
  const fetch = useCallback(async (options = {}) => {
    const result = await horarioCapacitacionRepository.obtenerTodos(options);

    if (!result?.success) {
      return { success: false, error: result?.error || 'Error al cargar los horarios' };
    }

    const horarios = mapHorariosCapacitacionList(result.data);
    return { success: true, [HORARIOS_DATA_KEY]: horarios, data: horarios, pagination: null };
  }, []);

  return useMemo(() => ({ fetch }), [fetch]);
};
