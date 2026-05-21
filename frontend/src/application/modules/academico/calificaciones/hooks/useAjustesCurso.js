/**
 * Ajustes del curso — GET/PUT API.
 */

import { useCallback, useEffect, useState } from 'react';
import CalificacionRepository from '@infrastructure/repositories/CalificacionRepository.js';

export const useAjustesCurso = (asignacionId, abierto) => {
  const [datos, setDatos] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    if (!asignacionId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await CalificacionRepository.obtenerAjustesCurso(asignacionId);
      if (!res.success) {
        setDatos(null);
        setError(res.error || 'No se pudieron cargar los ajustes');
        return;
      }
      setDatos(res.data ?? null);
    } catch (err) {
      setDatos(null);
      setError(err?.message || 'No se pudieron cargar los ajustes');
    } finally {
      setIsLoading(false);
    }
  }, [asignacionId]);

  useEffect(() => {
    if (!abierto || !asignacionId) return;
    cargar();
  }, [abierto, asignacionId, cargar]);

  const guardar = useCallback(
    async (payload) => {
      setIsSaving(true);
      setError(null);
      try {
        const res = await CalificacionRepository.guardarAjustesCurso(asignacionId, payload);
        if (!res.success) {
          throw new Error(res.error || 'No se pudieron guardar los ajustes');
        }
        setDatos(res.data ?? null);
        return res.data;
      } catch (err) {
        setError(err?.message || 'No se pudieron guardar los ajustes');
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [asignacionId],
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
