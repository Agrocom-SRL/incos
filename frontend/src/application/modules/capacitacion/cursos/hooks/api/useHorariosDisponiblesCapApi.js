/**
 * Hook de API: disponibilidad de bloques de horario por aula (módulo CAP).
 *
 * GET /cursos-capacitacion/horarios-disponibles?aulaId=&excludeCursoId= — los
 * 60 bloques `horarios` (tipo_horario='CLASES') del aula, con `ocupado` si ya
 * los usa un paralelo académico u otro curso de capacitación. Sin `aulaId` no
 * hay consulta posible: se limpia el estado local sin llamar al backend.
 */

import { useCallback, useMemo, useState } from 'react';
import cursoCapacitacionRepository from '@implementations/CursoCapacitacionRepository';
import { mapHorariosDisponibles } from '@application-capacitacion/cursos/mappers/cursoCapacitacionMapper';

export const useHorariosDisponiblesCapApi = () => {
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargarHorariosDisponibles = useCallback(async (aulaId, excludeCursoId) => {
    if (aulaId == null || aulaId === '') {
      setHorarios([]);
      setError(null);
      return { success: true, data: [] };
    }
    setLoading(true);
    setError(null);
    const result = await cursoCapacitacionRepository.obtenerHorariosDisponibles({
      aulaId,
      excludeCursoId,
    });
    if (!result?.success) {
      const msg = result?.error || 'No se pudieron cargar los horarios disponibles';
      setHorarios([]);
      setError(msg);
      setLoading(false);
      return { success: false, error: msg };
    }
    const mapped = mapHorariosDisponibles(result.data?.horarios ?? result.data);
    setHorarios(mapped);
    setLoading(false);
    return { success: true, data: mapped };
  }, []);

  return useMemo(
    () => ({ horarios, loading, error, cargarHorariosDisponibles }),
    [horarios, loading, error, cargarHorariosDisponibles],
  );
};
