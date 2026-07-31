/**
 * Hook de API: lista de proyectos de grado (módulo TUT · T1).
 *
 * Patrón `useCursosCapacitacionApi` (CAP): consume directamente la
 * INFRAESTRUCTURA (`ProyectoGradoRepository.obtenerTodos`) y expone un
 * `fetch(options)` compatible con `useServerPaginatedList`, con la data ya
 * normalizada.
 *
 * `dataKey` ('proyectosGrado') coincide con el `dataFieldName` del backend
 * (ListProyectosGradoUseCase, vista 160).
 */

import { useCallback, useMemo } from 'react';
import proyectoGradoRepository from '@implementations/ProyectoGradoRepository';
import { mapProyectosGradoList } from '@application-titulacion/proyectos-grado/mappers/proyectoGradoMapper';

/** Clave de datos = dataFieldName del backend (contrato T1). */
export const PROYECTOS_GRADO_DATA_KEY = 'proyectosGrado';

export const useProyectosGradoApi = () => {
  const fetch = useCallback(async (options = {}) => {
    const result = await proyectoGradoRepository.obtenerTodos(options);

    if (!result?.success) {
      return {
        success: false,
        error: result?.error || 'Error al cargar los proyectos de grado',
      };
    }

    const raw = result.data?.[PROYECTOS_GRADO_DATA_KEY] ?? result.data;
    const proyectos = mapProyectosGradoList(raw);

    return {
      success: true,
      [PROYECTOS_GRADO_DATA_KEY]: proyectos,
      data: proyectos,
      pagination: result.pagination ?? null,
    };
  }, []);

  return useMemo(() => ({ fetch }), [fetch]);
};
