/**
 * Hook de API: ficha de un horario de capacitación (módulo CAP).
 *
 * GET /cursos-capacitacion/horarios/:id (precarga del formulario de edición).
 * `dataKey` ('horario') coincide con el `dataFieldName` del backend.
 */

import { useCallback, useMemo, useState } from 'react';
import horarioCapacitacionRepository from '@implementations/HorarioCapacitacionRepository';
import { mapHorarioCapacitacion } from '@application-capacitacion/grupos/mappers/horarioCapacitacionMapper';

export const useGetHorarioCapacitacion = () => {
  const [horario, setHorario] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async (id) => {
    if (id == null || id === '') {
      setError('Se requiere el ID del horario');
      return { success: false, error: 'Se requiere el ID del horario' };
    }
    setLoading(true);
    setError(null);
    const result = await horarioCapacitacionRepository.obtenerPorId(id);
    if (!result?.success) {
      const msg = result?.error || 'No se pudo cargar el horario';
      setHorario(null);
      setError(msg);
      setLoading(false);
      return { success: false, error: msg };
    }
    const mapped = mapHorarioCapacitacion(result.data?.horario ?? result.data);
    setHorario(mapped);
    setLoading(false);
    return { success: true, data: mapped };
  }, []);

  return useMemo(() => ({ horario, loading, error, cargar }), [horario, loading, error, cargar]);
};
