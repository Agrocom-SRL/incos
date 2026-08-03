/**
 * Hook de API: detalle de riesgo de un estudiante (módulo ACA · A3).
 *
 * Alimenta el drawer de detalle de la lista de alertas: todas las materias del
 * estudiante en la gestión (filas de la vista 156). `dataKey`
 * ('alertaEstudiante') coincide con el `dataFieldName` del backend.
 */

import { useCallback, useMemo, useState } from 'react';
import alertaRiesgoRepository from '@implementations/AlertaRiesgoRepository';
import { mapAlertaEstudiante } from '@application-academico/acompanamiento/alertas/mappers/alertaRiesgoMapper';

/** Clave de datos = dataFieldName del backend (contrato A3). */
export const ALERTA_ESTUDIANTE_DATA_KEY = 'alertaEstudiante';

export const useGetAlertaEstudiante = () => {
  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async (estudianteId) => {
    if (estudianteId == null) {
      return { success: false, error: 'Se requiere el estudiante' };
    }
    setLoading(true);
    setError(null);
    const result = await alertaRiesgoRepository.obtenerAlertaEstudiante(estudianteId);
    if (result?.success) {
      const raw = result.data?.[ALERTA_ESTUDIANTE_DATA_KEY] ?? result.data;
      setDetalle(mapAlertaEstudiante(raw));
    } else {
      setDetalle(null);
      setError(result?.error || 'No se pudo cargar el detalle del estudiante');
    }
    setLoading(false);
    return result;
  }, []);

  const limpiar = useCallback(() => {
    setDetalle(null);
    setError(null);
  }, []);

  return useMemo(
    () => ({ detalle, loading, error, cargar, limpiar }),
    [detalle, loading, error, cargar, limpiar],
  );
};
