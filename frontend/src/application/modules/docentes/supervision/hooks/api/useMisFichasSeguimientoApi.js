/**
 * Hook de API: fichas de seguimiento de los cursos del docente autenticado
 * (módulo DOC · Supervisión docente, S5 — portal del docente).
 *
 * El backend resuelve el docente por token (`resolveDocenteIdForUsuario`);
 * NUNCA se envía un docenteId (anti-IDOR). `dataKey` ('fichasSeguimiento')
 * coincide con el `dataFieldName` del backend
 * (ListMisFichasSeguimientoDocenteUseCase). `autoFetch=false` por defecto:
 * la carga la dispara la pantalla/tab que lo consume (lazy).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import fichaSeguimientoRepository from '@implementations/FichaSeguimientoRepository';
import { mapFichasSeguimientoList } from '@application-docentes/supervision/mappers/fichaSeguimientoMapper';

/** Clave de datos = dataFieldName del backend (contrato S5). */
export const MIS_FICHAS_SEGUIMIENTO_DATA_KEY = 'fichasSeguimiento';

export const useMisFichasSeguimientoApi = ({ autoFetch = false } = {}) => {
  const [fichas, setFichas] = useState([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);
  const [cargado, setCargado] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await fichaSeguimientoRepository.obtenerMisFichas();
    if (result?.success) {
      const raw = result.data?.[MIS_FICHAS_SEGUIMIENTO_DATA_KEY] ?? result.data;
      setFichas(mapFichasSeguimientoList(raw));
    } else {
      setFichas([]);
      setError(result?.error || 'No se pudieron cargar sus fichas de seguimiento');
    }
    setCargado(true);
    setLoading(false);
    return result;
  }, []);

  useEffect(() => {
    if (autoFetch) cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo en el montaje cuando autoFetch
  }, [autoFetch]);

  return useMemo(
    () => ({ fichas, loading, error, cargado, refetch: cargar, cargar }),
    [fichas, loading, error, cargado, cargar],
  );
};
