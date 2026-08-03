/**
 * Cambia el estado de un folio: BORRADOR → IMPRESO → FIRMADO / ANULADO.
 * PATCH /v1/libros/:id/folios/:folioId/estado. Permiso `academico.libro` · APROBAR.
 */

import { useCallback, useState } from 'react';
import { useCasesFactory } from '@container';
import { mapFolio } from '@application-academico/libros/mappers';

export const useCambiarEstadoFolioApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cambiarEstadoFolio = useCallback(async (id, folioId, payload) => {
    setLoading(true);
    setError(null);
    try {
      const result = await useCasesFactory.cambiarEstadoFolio().ejecutar(id, folioId, payload);
      if (!result?.success) {
        const message = result?.error || 'No se pudo cambiar el estado del folio';
        setError(message);
        return { success: false, error: message };
      }
      return { success: true, data: mapFolio(result.data) };
    } catch (err) {
      const message = err?.message || 'Error inesperado al cambiar el estado del folio';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  return { cambiarEstadoFolio, loading, error };
};

export default useCambiarEstadoFolioApi;
