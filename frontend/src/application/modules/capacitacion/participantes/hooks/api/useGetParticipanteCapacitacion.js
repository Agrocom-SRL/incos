/**
 * Hook de API: ficha de un participante de capacitación (módulo CAP).
 *
 * GET /participantes/:id (gemelo de `useGetCursoCapacitacion`). `dataKey`
 * ('participante') coincide con el `dataFieldName` del backend.
 */

import { useCallback, useMemo, useState } from 'react';
import participanteCapacitacionRepository from '@implementations/ParticipanteCapacitacionRepository';
import { mapParticipante } from '@application-capacitacion/participantes/mappers/participanteMapper';

export const useGetParticipanteCapacitacion = () => {
  const [participante, setParticipante] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async (id) => {
    if (id == null || id === '') {
      setError('Se requiere el ID del participante');
      return { success: false, error: 'Se requiere el ID del participante' };
    }
    setLoading(true);
    setError(null);
    const result = await participanteCapacitacionRepository.obtenerPorId(id);
    if (!result?.success) {
      const msg = result?.error || 'No se pudo cargar el participante';
      setParticipante(null);
      setError(msg);
      setLoading(false);
      return { success: false, error: msg };
    }
    const mapped = mapParticipante(result.data?.participante ?? result.data);
    setParticipante(mapped);
    setLoading(false);
    return { success: true, data: mapped };
  }, []);

  return useMemo(
    () => ({ participante, loading, error, cargar, refetch: cargar }),
    [participante, loading, error, cargar],
  );
};
