/**
 * Hook de API: resuelve el ID del docente AUTENTICADO (portal del docente).
 *
 * Usado por la rama DOCENTE del ítem Docentes ("Mi ficha"): el docente no ve el
 * listado, se redirige a su propia ficha. El backend resuelve al docente desde
 * el token en `GET /docentes/mis-datos` (no se confía en un id del cliente),
 * y de ahí se toma `id` para construir la ruta de detalle.
 */

import { useCallback, useEffect, useState } from 'react';
import DocenteRepository from '@infrastructure/repositories/DocenteRepository.js';

export const useMiDocenteId = () => {
  const [docenteId, setDocenteId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await DocenteRepository.obtenerMisDatos();
      const id = result?.success ? result.data?.id ?? null : null;
      if (!id) {
        setDocenteId(null);
        setError(result?.error || 'No se pudo identificar su registro de docente');
        return;
      }
      setDocenteId(id);
    } catch (err) {
      setDocenteId(null);
      setError(err?.message || 'No se pudo identificar su registro de docente');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { docenteId, loading, error, refetch: cargar };
};

export default useMiDocenteId;
