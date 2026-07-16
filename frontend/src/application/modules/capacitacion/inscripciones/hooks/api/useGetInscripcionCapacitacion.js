/**
 * Hook de API: ficha de una inscripción de capacitación (módulo CAP).
 *
 * GET /inscripciones-capacitacion/:id — participante + curso + historial de
 * pagos. `dataKey` ('inscripcionCapacitacion') coincide con el `dataFieldName`
 * del backend.
 */

import { useCallback, useMemo, useState } from 'react';
import inscripcionCapacitacionRepository from '@implementations/InscripcionCapacitacionRepository';
import { mapInscripcionCapacitacionDetail } from '@application-capacitacion/inscripciones/mappers/inscripcionCapacitacionMapper';

export const useGetInscripcionCapacitacion = () => {
  const [inscripcion, setInscripcion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async (id) => {
    if (id == null || id === '') {
      setError('ID de la inscripción es requerido');
      return { success: false, error: 'ID de la inscripción es requerido' };
    }
    setLoading(true);
    setError(null);
    const result = await inscripcionCapacitacionRepository.obtenerPorId(id);
    if (!result?.success) {
      const msg = result?.error || 'No se pudo cargar la inscripción';
      setInscripcion(null);
      setError(msg);
      setLoading(false);
      return { success: false, error: msg };
    }
    const mapped = mapInscripcionCapacitacionDetail(
      result.data?.inscripcionCapacitacion ?? result.data,
    );
    setInscripcion(mapped);
    setLoading(false);
    return { success: true, data: mapped };
  }, []);

  return useMemo(
    () => ({ inscripcion, loading, error, cargar, refetch: cargar }),
    [inscripcion, loading, error, cargar],
  );
};
