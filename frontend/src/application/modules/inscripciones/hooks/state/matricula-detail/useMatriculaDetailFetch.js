/**
 * Carga de la ficha de matrícula por ID.
 */

import { useEffect, useCallback } from 'react';
import { useGetInscripcionById } from '../../api/useGetInscripcionById';

export const useMatriculaDetailFetch = (inscripcionIdRaw) => {
  const inscripcionId = inscripcionIdRaw != null ? String(inscripcionIdRaw) : null;

  const {
    inscripcion: inscripcionRaw,
    loading,
    error,
    getInscripcionById,
    refetch,
  } = useGetInscripcionById();

  useEffect(() => {
    if (inscripcionId) {
      getInscripcionById(inscripcionId);
    }
  }, [inscripcionId, getInscripcionById]);

  const refetchWithId = useCallback(async () => {
    if (!inscripcionId) return;
    await refetch(inscripcionId);
  }, [inscripcionId, refetch]);

  return {
    inscripcionId,
    inscripcion: inscripcionRaw,
    loading,
    error,
    refetch: refetchWithId,
  };
};
