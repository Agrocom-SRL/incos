/**
 * Catálogo para política institucional: tipos MATERIA_COMPLETA, carreras y periodos.
 * Misma lógica que catálogos de referencia (GET list + cache por sesión).
 */

import { useCallback, useEffect, useState } from 'react';
import { useCasesFactory } from '@container';

export const usePoliticaCatalogo = () => {
  const [catalogo, setCatalogo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [tiposResult, catalogoResult] = await Promise.all([
        useCasesFactory.obtenerTiposEvaluacion().ejecutar({
          params: { ambito: 'MATERIA_COMPLETA', limite: 100 },
        }),
        useCasesFactory.obtenerPoliticaCatalogo().ejecutar(),
      ]);

      if (!tiposResult?.success) {
        setCatalogo(null);
        setError(tiposResult?.error || 'No se pudo cargar tipos de evaluación');
        return;
      }
      if (!catalogoResult?.success) {
        setCatalogo(null);
        setError(catalogoResult?.error || 'No se pudo cargar el catálogo');
        return;
      }

      const base = catalogoResult.data ?? {};
      setCatalogo({
        tiposEvaluacionFinales: (tiposResult.data ?? []).map((t) => ({
          id: t.id,
          codigo: t.codigo,
          nombre: t.nombre,
        })),
        carreras: base.carreras ?? [],
        periodosPlan: base.periodosPlan ?? [],
      });
    } catch (err) {
      setCatalogo(null);
      setError(err?.message || 'Error al cargar catálogo');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return {
    catalogo,
    isLoading,
    error,
    refetch: cargar,
  };
};
