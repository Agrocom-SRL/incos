/**
 * Reajusta los folios de TODOS los paralelos de una gestión, en una sola
 * llamada (POST /v1/libros/gestiones/:gestionId/folios): anula los folios
 * vigentes del libro y los regenera con numeración fresca y correlativa a
 * partir de la nómina actual (botón "Generar todos los folios"). Rechaza
 * entero si el libro tiene folios FIRMADOS (inmutables). Paralelos sin
 * nómina se omiten y quedan en `resumen.omitidos`, no se descartan
 * silenciosamente.
 */

import { useCallback, useState } from 'react';
import { useCasesFactory } from '@container';

export const useGenerarFoliosGestion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generarFoliosGestion = useCallback(async (gestionId, payload = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await useCasesFactory.generarFoliosGestion().ejecutar(gestionId, payload);
      if (!result?.success) {
        const message = result?.error || 'No se pudieron generar los folios de la gestión';
        setError(message);
        return { success: false, error: message };
      }
      return { success: true, data: result.data };
    } catch (err) {
      const message = err?.message || 'Error inesperado al generar los folios de la gestión';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  return { generarFoliosGestion, loading, error };
};

export default useGenerarFoliosGestion;
