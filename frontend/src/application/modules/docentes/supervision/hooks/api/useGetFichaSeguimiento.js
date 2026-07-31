/**
 * Hook de API: ficha completa de seguimiento en clase (módulo DOC ·
 * Supervisión docente, S2).
 *
 * GET /supervision-docente/:id. `dataKey` ('fichaSeguimiento') coincide con
 * el `dataFieldName` del backend.
 */

import { useCallback, useMemo, useState } from 'react';
import fichaSeguimientoRepository from '@implementations/FichaSeguimientoRepository';
import { mapFichaSeguimientoDetail } from '@application-docentes/supervision/mappers/fichaSeguimientoMapper';

/** Clave de datos = dataFieldName del backend (contrato S2-S4). */
export const FICHA_SEGUIMIENTO_DATA_KEY = 'fichaSeguimiento';

export const useGetFichaSeguimiento = () => {
  const [ficha, setFicha] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async (id) => {
    if (id == null || id === '') {
      setError('Se requiere el ID de la ficha');
      return { success: false, error: 'Se requiere el ID de la ficha' };
    }
    setLoading(true);
    setError(null);
    const result = await fichaSeguimientoRepository.obtenerPorId(id);
    if (!result?.success) {
      const msg = result?.error || 'No se pudo cargar la ficha de seguimiento';
      setFicha(null);
      setError(msg);
      setLoading(false);
      return { success: false, error: msg };
    }
    const mapped = mapFichaSeguimientoDetail(result.data?.[FICHA_SEGUIMIENTO_DATA_KEY] ?? result.data);
    setFicha(mapped);
    setLoading(false);
    return { success: true, data: mapped };
  }, []);

  return useMemo(
    () => ({ ficha, loading, error, cargar, refetch: cargar }),
    [ficha, loading, error, cargar],
  );
};
