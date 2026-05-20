/**
 * Catálogo de tipos de evaluación (API GET /calificaciones/tipos-evaluacion).
 */

import { useCallback, useEffect, useState } from 'react';
import { useCasesFactory } from '@container';

const cacheByAmbito = new Map();

export const useTiposEvaluacion = ({ ambito = 'BIMESTRE' } = {}) => {
  const [tipos, setTipos] = useState(() => cacheByAmbito.get(ambito) ?? null);
  const [isLoading, setIsLoading] = useState(!cacheByAmbito.has(ambito));
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    if (cacheByAmbito.has(ambito)) {
      setTipos(cacheByAmbito.get(ambito));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const uc = useCasesFactory.obtenerTiposEvaluacion();
      const result = await uc.ejecutar({ params: { ambito, limite: 100 } });
      if (!result?.success) {
        setTipos([]);
        setError(result?.error || 'No se pudo cargar tipos de evaluación');
        return;
      }
      const data = result.data ?? [];
      cacheByAmbito.set(ambito, data);
      setTipos(data);
    } catch (err) {
      setError(err?.message || 'Error al cargar tipos');
      setTipos([]);
    } finally {
      setIsLoading(false);
    }
  }, [ambito]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { tipos: tipos ?? [], isLoading, error, refetch: cargar };
};
