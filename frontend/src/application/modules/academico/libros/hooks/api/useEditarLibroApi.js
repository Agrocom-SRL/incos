/**
 * Edita la cabecera del libro, incluido el cierre/reapertura (PATCH /v1/libros/:id).
 *
 * Al cerrar con notas pendientes el backend responde 409 CONFLICT con el
 * desglose en `details.pendientes`; aquí se conserva (`errorDetails`) para que
 * el hook de pantalla abra el modal de cierre forzado sin otra consulta. Al
 * cerrar con éxito, `cierre` resume lo asentado ({ forzado,
 * pendientesAsentados, filasSincronizadas }).
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
        return { success: false, error: message, errorDetails: result?.errorDetails ?? null };
      }
      return { success: true, data: mapLibro(result.data), cierre: result.cierre ?? null };
    } catch (err) {
      const message = err?.message || 'Error inesperado al actualizar el libro de registro';
      setError(message);
      return { success: false, error: message, errorDetails: null };
    } finally {
      setLoading(false);
    }
  }, []);

  return { editarLibro, loading, error };
};

export default useEditarLibroApi;
