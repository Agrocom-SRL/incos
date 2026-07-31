/**
 * Hook de API: alumnos en riesgo de los cursos del docente autenticado
 * (módulo TUT · A2).
 *
 * El backend resuelve el docente por token (resolveDocenteIdForUsuario);
 * NUNCA se envía docenteId. `dataKey` ('misAlumnosEnRiesgo') coincide con el
 * `dataFieldName` del backend (ListMisAlertasRiesgoDocenteUseCase).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import alertaRiesgoRepository from '@implementations/AlertaRiesgoRepository';
import { mapAlertasRiesgoList } from '@application-academico/acompanamiento/alertas/mappers/alertaRiesgoMapper';

/** Clave de datos = dataFieldName del backend (contrato A2). */
export const MIS_ALUMNOS_EN_RIESGO_DATA_KEY = 'misAlumnosEnRiesgo';

export const useMisAlumnosEnRiesgoApi = ({ autoFetch = true } = {}) => {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await alertaRiesgoRepository.obtenerMisAlumnos();
    if (result?.success) {
      const raw = result.data?.[MIS_ALUMNOS_EN_RIESGO_DATA_KEY] ?? result.data;
      setAlertas(mapAlertasRiesgoList(raw));
    } else {
      setAlertas([]);
      setError(result?.error || 'No se pudieron cargar sus alumnos en riesgo');
    }
    setLoading(false);
    return result;
  }, []);

  useEffect(() => {
    if (autoFetch) cargar();
  }, [autoFetch, cargar]);

  return useMemo(
    () => ({ alertas, loading, error, refetch: cargar, cargar }),
    [alertas, loading, error, cargar],
  );
};
