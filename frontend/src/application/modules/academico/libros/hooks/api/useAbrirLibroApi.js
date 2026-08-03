/**
 * Abre un libro de registro (POST /v1/libros). Mutación bajo demanda: no
 * mantiene datos en memoria (el listado se recarga con `refetch` de
 * `useLibrosApi` tras el éxito).
 */

import { useCallback, useState } from 'react';
import { useCasesFactory } from '@container';
import { mapLibro } from '@application-academico/libros/mappers';

export const useAbrirLibroApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const abrirLibro = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const result = await useCasesFactory.abrirLibro().ejecutar(payload);
      if (!result?.success) {
        const message = result?.error || 'No se pudo abrir el libro de registro';
        setError(message);
        return { success: false, error: message };
      }
      return { success: true, data: mapLibro(result.data) };
    } catch (err) {
      const message = err?.message || 'Error inesperado al abrir el libro de registro';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  return { abrirLibro, loading, error };
};

export default useAbrirLibroApi;
