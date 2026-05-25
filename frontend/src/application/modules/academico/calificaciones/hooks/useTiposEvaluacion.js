/**
 * Catálogo de tipos de evaluación bimestrales (API GET /calificaciones/tipos-evaluacion).
 */

import { useCallback, useEffect, useState } from 'react';
import { useCasesFactory } from '@container';

let cacheTipos = null;

export const useTiposEvaluacion = () => {
  const [tipos, setTipos] = useState(() => cacheTipos ?? null);
  const [isLoading, setIsLoading] = useState(cacheTipos == null);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    if (cacheTipos) {
      setTipos(cacheTipos);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const uc = useCasesFactory.obtenerTiposEvaluacion();
      const result = await uc.ejecutar({ params: { limite: 100 } });
      if (!result?.success) {
        setTipos([]);
        setError(result?.error || 'No se pudo cargar tipos de evaluación');
        return;
      }
      const data = result.data ?? [];
      cacheTipos = data;
      setTipos(data);
    } catch (err) {
      setError(err?.message || 'Error al cargar tipos');
      setTipos([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { tipos: tipos ?? [], isLoading, error, refetch: cargar };
};
