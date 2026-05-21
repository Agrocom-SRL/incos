/**
 * Ajustes del curso — carga y guardado vía fake API.
 */

import { useCallback, useEffect, useState } from 'react';
import { calificacionesPendingApi as calificacionesFakeApi } from '../api/calificacionesPendingApi.js';

export const useAjustesCurso = (cursoId, abierto) => {
  const [datos, setDatos] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    if (!cursoId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await calificacionesFakeApi.obtenerAjustesCurso({ cursoId });
      setDatos(data);
    } catch (err) {
      setError(err);
      setDatos(null);
    } finally {
      setIsLoading(false);
    }
  }, [cursoId]);

  useEffect(() => {
    if (abierto && cursoId) cargar();
  }, [abierto, cursoId, cargar]);

  const guardar = useCallback(
    async (cambios) => {
      if (!cursoId) return null;
      setIsSaving(true);
      setError(null);
      try {
        const data = await calificacionesFakeApi.guardarAjustesCurso({
          cursoId,
          cambios,
        });
        setDatos(data);
        return data;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [cursoId],
  );

  return {
    datos,
    isLoading,
    isSaving,
    error,
    recargar: cargar,
    guardar,
  };
};
