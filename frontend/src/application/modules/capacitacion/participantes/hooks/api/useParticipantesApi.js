/**
 * Hook de API: lista de participantes de capacitación (módulo CAP).
 *
 * Patrón `usePagosApi`: consume la infraestructura
 * (`ParticipanteCapacitacionRepository.obtenerTodos`) y expone `fetch(options)`
 * compatible con `useServerPaginatedList` (búsqueda por CI/nombre server-side).
 *
 * `dataKey` ('participantes') coincide con el `dataFieldName` del backend
 * (ListParticipantesController).
 */

import { useCallback, useMemo } from 'react';
import participanteCapacitacionRepository from '@implementations/ParticipanteCapacitacionRepository';
import { mapParticipantesList } from '@application-capacitacion/participantes/mappers/participanteMapper';

/** Clave de datos = dataFieldName del backend. */
export const PARTICIPANTES_DATA_KEY = 'participantes';

export const useParticipantesApi = () => {
  const fetch = useCallback(async (options = {}) => {
    const result = await participanteCapacitacionRepository.obtenerTodos(options);

    if (!result?.success) {
      return {
        success: false,
        error: result?.error || 'Error al cargar los participantes',
      };
    }

    const participantes = mapParticipantesList(result.data);

    return {
      success: true,
      [PARTICIPANTES_DATA_KEY]: participantes,
      data: participantes,
      pagination: result.pagination ?? null,
    };
  }, []);

  return useMemo(() => ({ fetch }), [fetch]);
};
