/**
 * Edita la cabecera del libro, incluido el cierre/reapertura (PATCH /v1/libros/:id).
 */

import { useCallback, useState } from 'react';
import { useCasesFactory } from '@container';
import { mapLibro } from '@application-academico/libros/mappers';

export const useEditarLibroApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const editarLibro = useCallback(async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      const result = await useCasesFactory.editarLibro().ejecutar(id, payload);
      if (!result?.success) {
        const message = result?.error || 'No se pudo actualizar el libro de registro';
        setError(message);
        return { success: false, error: message };
      }
      return { success: true, data: mapLibro(result.data) };
    } catch (err) {
      const message = err?.message || 'Error inesperado al actualizar el libro de registro';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  return { editarLibro, loading, error };
};

export default useEditarLibroApi;
