/**
 * Hook de API: lista de inscripciones de capacitación (módulo CAP).
 *
 * Patrón `usePagosApi`: consume la infraestructura
 * (`InscripcionCapacitacionRepository.obtenerTodos`) y expone `fetch(options)`
 * compatible con `useServerPaginatedList`.
 *
 * `dataKey` ('inscripcionesCapacitacion') coincide con el `dataFieldName` del
 * backend (ListInscripcionesCapacitacionController: participante + curso +
 * totalPagado/saldo/estadoPago derivados).
 */

import { useCallback, useMemo } from 'react';
import inscripcionCapacitacionRepository from '@implementations/InscripcionCapacitacionRepository';
import { mapInscripcionesCapacitacionList } from '@application-capacitacion/inscripciones/mappers/inscripcionCapacitacionMapper';

/** Clave de datos = dataFieldName del backend. */
export const INSCRIPCIONES_CAPACITACION_DATA_KEY = 'inscripcionesCapacitacion';

export const useInscripcionesCapacitacionApi = () => {
  const fetch = useCallback(async (options = {}) => {
    const result = await inscripcionCapacitacionRepository.obtenerTodos(options);

    if (!result?.success) {
      return {
        success: false,
        error: result?.error || 'Error al cargar las inscripciones',
      };
    }

    const inscripciones = mapInscripcionesCapacitacionList(result.data);

    return {
      success: true,
      [INSCRIPCIONES_CAPACITACION_DATA_KEY]: inscripciones,
      data: inscripciones,
      pagination: result.pagination ?? null,
    };
  }, []);

  return useMemo(() => ({ fetch }), [fetch]);
};
