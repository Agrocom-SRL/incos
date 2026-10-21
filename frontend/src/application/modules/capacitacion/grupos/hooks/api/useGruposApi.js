/**
 * Hook de API: listado de solo lectura de grupos de capacitación (módulo CAP).
 *
 * Consume `GrupoCapacitacionRepository` y expone `fetch(options)` compatible con
 * `useServerPaginatedList` (búsqueda y filtros `cursoId`/`estado` server-side).
 * `dataKey` ('grupos') coincide con el `dataFieldName` del backend.
 */

import { useCallback, useMemo } from 'react';
import grupoCapacitacionRepository from '@implementations/GrupoCapacitacionRepository';
import { mapGruposCapacitacionList } from '@application-capacitacion/grupos/mappers/grupoCapacitacionMapper';

/** Clave de datos = dataFieldName del backend. */
export const GRUPOS_DATA_KEY = 'grupos';

export const useGruposApi = () => {
  const fetch = useCallback(async (options = {}) => {
    const result = await grupoCapacitacionRepository.obtenerTodos(options);

    if (!result?.success) {
      return { success: false, error: result?.error || 'Error al cargar los grupos' };
    }

    const grupos = mapGruposCapacitacionList(result.data);
    return { success: true, [GRUPOS_DATA_KEY]: grupos, data: grupos, pagination: null };
  }, []);

  return useMemo(() => ({ fetch }), [fetch]);
};
