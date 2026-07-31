/**
 * Genera los folios de un paralelo del libro (POST /v1/libros/:id/folios).
 * El backend asigna `numeroFolio` correlativo por gestión — el front NO calcula
 * ni sugiere este número, solo muestra el resultado.
 */

import { useCallback, useState } from 'react';
import { useCasesFactory } from '@container';
import { mapFoliosList } from '@application-academico/libros/mappers';

export const useGenerarFolios = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generarFolios = useCallback(async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      const result = await useCasesFactory.generarFoliosParalelo().ejecutar(id, payload);
      if (!result?.success) {
        const message = result?.error || 'No se pudieron generar los folios del paralelo';
        setError(message);
        return { success: false, error: message };
      }
      return { success: true, data: mapFoliosList(result.data) };
    } catch (err) {
      const message = err?.message || 'Error inesperado al generar los folios del paralelo';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  return { generarFolios, loading, error };
};

export default useGenerarFolios;
