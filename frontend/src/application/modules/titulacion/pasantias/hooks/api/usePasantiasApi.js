/**
 * Hook de API: lista de trámites de pasantía (módulo TUT · P1).
 *
 * Patrón `useProyectosGradoApi` (TUT · Titulación): consume directamente la
 * INFRAESTRUCTURA (`PasantiaRepository.obtenerTodos`) y expone un
 * `fetch(options)` compatible con `useServerPaginatedList`, con la data ya
 * normalizada.
 *
 * `dataKey` ('pasantias') coincide con el `dataFieldName` del backend
 * (ListPasantiasUseCase, vista 167).
 */

import { useCallback, useMemo } from 'react';
import pasantiaRepository from '@implementations/PasantiaRepository';
import { mapPasantiasList } from '@application-tutorias/pasantias/mappers/pasantiaMapper';

/** Clave de datos = dataFieldName del backend (contrato P1). */
export const PASANTIAS_DATA_KEY = 'pasantias';

export const usePasantiasApi = () => {
  const fetch = useCallback(async (options = {}) => {
    const result = await pasantiaRepository.obtenerTodos(options);

    if (!result?.success) {
      return {
        success: false,
        error: result?.error || 'Error al cargar los trámites de pasantía',
      };
    }

    const raw = result.data?.[PASANTIAS_DATA_KEY] ?? result.data;
    const pasantias = mapPasantiasList(raw);

    return {
      success: true,
      [PASANTIAS_DATA_KEY]: pasantias,
      data: pasantias,
      pagination: result.pagination ?? null,
    };
  }, []);

  return useMemo(() => ({ fetch }), [fetch]);
};
