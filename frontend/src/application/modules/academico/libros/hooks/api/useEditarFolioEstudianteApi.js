/**
 * Edita ESTADO/OBSERVACIONES de la fila de un estudiante en un folio.
 * PATCH /v1/libros/:id/folios/:folioId/estudiantes/:filaId. Deshabilitado si el
 * folio está FIRMADO (inmutable) o ANULADO (terminal) — lo valida el backend.
 */

import { useCallback, useState } from 'react';
import { useCasesFactory } from '@container';
import { mapFolioEstudiante } from '@application-academico/libros/mappers';

export const useEditarFolioEstudianteApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const editarFolioEstudiante = useCallback(async (id, folioId, filaId, payload) => {
    setLoading(true);
    setError(null);
    try {
      const result = await useCasesFactory
        .editarFolioEstudiante()
        .ejecutar(id, folioId, filaId, payload);
      if (!result?.success) {
        const message = result?.error || 'No se pudo actualizar la fila del folio';
        setError(message);
        return { success: false, error: message };
      }
      return { success: true, data: mapFolioEstudiante(result.data) };
    } catch (err) {
      const message = err?.message || 'Error inesperado al actualizar la fila del folio';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  return { editarFolioEstudiante, loading, error };
};

export default useEditarFolioEstudianteApi;
