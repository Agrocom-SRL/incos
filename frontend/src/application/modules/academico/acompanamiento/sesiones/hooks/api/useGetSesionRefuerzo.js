/**
 * Hook de API: ficha de una sesión de refuerzo (módulo ACA · A5).
 *
 * GET /acompanamiento/sesiones/:id — sesión + estudiantes[]. `dataKey`
 * ('sesionRefuerzo') coincide con el `dataFieldName` del backend.
 */

import { useCallback, useMemo, useState } from 'react';
import sesionRefuerzoRepository from '@implementations/SesionRefuerzoRepository';
import { mapSesionRefuerzoDetail } from '@application-academico/acompanamiento/sesiones/mappers/sesionRefuerzoMapper';

/** Clave de datos = dataFieldName del backend (contrato A5-A8). */
export const SESION_REFUERZO_DATA_KEY = 'sesionRefuerzo';

export const useGetSesionRefuerzo = () => {
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
    const result = await sesionRefuerzoRepository.obtenerPorId(id);
    if (!result?.success) {
      const msg = result?.error || 'No se pudo cargar la sesión de refuerzo';
      setSesion(null);
      setError(msg);
      setLoading(false);
      return { success: false, error: msg };
    }
    const mapped = mapSesionRefuerzoDetail(
      result.data?.[SESION_REFUERZO_DATA_KEY] ?? result.data,
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
