/**
 * Hook de API: bandeja del docente supervisor autenticado (módulo TIT · P18).
 *
 * El backend resuelve el docente por token (resolveDocenteIdForUsuario);
 * NUNCA se envía docenteId desde el cliente. `dataKey` ('misPasantias')
 * coincide con el `dataFieldName` del backend
 * (ListMisPasantiasSupervisadasUseCase, vista 167 WHERE docente_supervisor_id).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import pasantiaRepository from '@implementations/PasantiaRepository';
import { mapPasantiasList } from '@application-titulacion/pasantias/mappers/pasantiaMapper';

/** Clave de datos = dataFieldName del backend (contrato P18). */
export const MIS_PASANTIAS_DATA_KEY = 'misPasantias';

export const useMisPasantiasApi = () => {
  const [pasantias, setPasantias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /** Sin setState previo al await: apto para dispararse desde el efecto de montaje. */
  const cargar = useCallback(async () => {
    const result = await pasantiaRepository.obtenerMisPasantias();
    if (result?.success) {
      const raw = result.data?.[MIS_PASANTIAS_DATA_KEY] ?? result.data;
      setPasantias(mapPasantiasList(raw));
      setError(null);
    } else {
      setPasantias([]);
      setError(result?.error || 'No se pudieron cargar sus pasantías supervisadas');
    }
    setLoading(false);
    return result;
  }, []);

  /** Recarga manual (handlers): reactiva el spinner antes de volver a pedir. */
  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    return cargar();
  }, [cargar]);

  useEffect(() => {
    // Deferido a microtarea: el efecto no ejecuta setState de forma síncrona.
    Promise.resolve().then(cargar);
  }, [cargar]);

  return useMemo(
    () => ({ pasantias, loading, error, refetch }),
    [pasantias, loading, error, refetch],
  );
};
