/**
 * Hook de API: resuelve el ID del estudiante AUTENTICADO (portal del estudiante).
 *
 * Usado por la rama ESTUDIANTE del ítem Historial: el estudiante no ve selector,
 * se redirige a su propio historial. El backend resuelve al estudiante desde el
 * token en `GET /estudiantes/mis-datos` (no se confía en un id del cliente),
 * y de ahí se toma `student.id` para construir la ruta de detalle.
 */

import { useCallback, useEffect, useState } from 'react';
import EstudianteRepository from '@infrastructure/repositories/EstudianteRepository.js';

export const useMiEstudianteId = () => {
  const [estudianteId, setEstudianteId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await EstudianteRepository.obtenerMisDatos();
      const id = result?.success ? result.data?.student?.id ?? null : null;
      if (!id) {
        setEstudianteId(null);
        setError(result?.error || 'No se pudo identificar tu registro de estudiante');
        return;
      }
      setEstudianteId(id);
    } catch (err) {
      setEstudianteId(null);
      setError(err?.message || 'No se pudo identificar tu registro de estudiante');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { estudianteId, loading, error, refetch: cargar };
};

export default useMiEstudianteId;
