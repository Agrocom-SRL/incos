/**
 * Hook de API: ficha de una sesión de reforzamiento (módulo TUT · A5).
 *
 * GET /acompanamiento/sesiones/:id — sesión + participantes[]. `dataKey`
 * ('sesionReforzamiento') coincide con el `dataFieldName` del backend.
 */

import { useCallback, useMemo, useState } from 'react';
import sesionReforzamientoRepository from '@implementations/SesionReforzamientoRepository';
import { mapSesionReforzamientoDetail } from '@application-tutorias/acompanamiento/sesiones/mappers/sesionReforzamientoMapper';

/** Clave de datos = dataFieldName del backend (contrato A5-A8). */
export const SESION_REFORZAMIENTO_DATA_KEY = 'sesionReforzamiento';

export const useGetSesionReforzamiento = () => {
  const [sesion, setSesion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async (id) => {
    if (id == null || id === '') {
      setError('Se requiere el ID de la sesión');
      return { success: false, error: 'Se requiere el ID de la sesión' };
    }
    setLoading(true);
    setError(null);
    const result = await sesionReforzamientoRepository.obtenerPorId(id);
    if (!result?.success) {
      const msg = result?.error || 'No se pudo cargar la sesión de reforzamiento';
      setSesion(null);
      setError(msg);
      setLoading(false);
      return { success: false, error: msg };
    }
    const mapped = mapSesionReforzamientoDetail(
      result.data?.[SESION_REFORZAMIENTO_DATA_KEY] ?? result.data,
    );
    setSesion(mapped);
    setLoading(false);
    return { success: true, data: mapped };
  }, []);

  return useMemo(
    () => ({ sesion, loading, error, cargar, refetch: cargar }),
    [sesion, loading, error, cargar],
  );
};
