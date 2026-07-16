/**
 * Hook de API: ficha de un curso de capacitación (módulo CAP).
 *
 * GET /cursos-capacitacion/:id — incluye horarios[] (vista 154, con
 * bloqueEtiqueta/diaOrden) y horarioIds[] para precargar el formulario.
 * `dataKey` ('cursoCapacitacion') coincide con el `dataFieldName` del backend.
 */

import { useCallback, useMemo, useState } from 'react';
import cursoCapacitacionRepository from '@implementations/CursoCapacitacionRepository';
import { mapCursoCapacitacionDetail } from '@application-capacitacion/cursos/mappers/cursoCapacitacionMapper';

export const useGetCursoCapacitacion = () => {
  const [curso, setCurso] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async (id) => {
    if (id == null || id === '') {
      setError('ID del curso es requerido');
      return { success: false, error: 'ID del curso es requerido' };
    }
    setLoading(true);
    setError(null);
    const result = await cursoCapacitacionRepository.obtenerPorId(id);
    if (!result?.success) {
      const msg = result?.error || 'No se pudo cargar el curso de capacitación';
      setCurso(null);
      setError(msg);
      setLoading(false);
      return { success: false, error: msg };
    }
    const mapped = mapCursoCapacitacionDetail(result.data?.cursoCapacitacion ?? result.data);
    setCurso(mapped);
    setLoading(false);
    return { success: true, data: mapped };
  }, []);

  return useMemo(
    () => ({ curso, loading, error, cargar, refetch: cargar }),
    [curso, loading, error, cargar],
  );
};
