/**
 * Hook de API: lista de cursos de capacitación (módulo CAP).
 *
 * Patrón `usePagosApi` de Finanzas: consume directamente la INFRAESTRUCTURA
 * (`CursoCapacitacionRepository.obtenerTodos`) y expone un `fetch(options)`
 * compatible con `useServerPaginatedList`, con la data ya normalizada.
 *
 * `dataKey` ('cursosCapacitacion') coincide con el `dataFieldName` del backend
 * (ListCursosCapacitacionController, vista 155).
 *
 * El listado administra el catálogo completo (toggle EstadoTogglePill), por lo
 * que SIEMPRE pide `incluirInactivos=true` (mismo criterio que Aulas en CFG).
 */

import { useCallback, useMemo } from 'react';
import cursoCapacitacionRepository from '@implementations/CursoCapacitacionRepository';
import { mapCursosCapacitacionList } from '@application-capacitacion/cursos/mappers/cursoCapacitacionMapper';

/** Clave de datos = dataFieldName del backend. */
export const CURSOS_CAPACITACION_DATA_KEY = 'cursosCapacitacion';

export const useCursosCapacitacionApi = () => {
  const fetch = useCallback(async (options = {}) => {
    const params = { incluirInactivos: 'true', ...(options.params || {}) };
    const result = await cursoCapacitacionRepository.obtenerTodos({ ...options, params });

    if (!result?.success) {
      return {
        success: false,
        error: result?.error || 'Error al cargar los cursos de capacitación',
      };
    }

    const cursos = mapCursosCapacitacionList(result.data);

    return {
      success: true,
      [CURSOS_CAPACITACION_DATA_KEY]: cursos,
      data: cursos,
      pagination: result.pagination ?? null,
    };
  }, []);

  return useMemo(() => ({ fetch }), [fetch]);
};
