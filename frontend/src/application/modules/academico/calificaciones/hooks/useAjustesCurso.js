/**
 * Ajustes del curso — pendiente de endpoint backend (sin fake-api).
 */

import { useCallback, useEffect, useState } from 'react';

const MENSAJE =
  'Los ajustes del curso se conectarán al backend junto con el cuaderno (Fase 2-bis).';

export const useAjustesCurso = (cursoId, abierto) => {
  const [datos, setDatos] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!abierto || !cursoId) return;
    setIsLoading(true);
    setError(MENSAJE);
    setDatos(null);
    setIsLoading(false);
  }, [abierto, cursoId]);

  const guardar = useCallback(async () => {
    setError(MENSAJE);
    throw new Error(MENSAJE);
  }, []);

  return {
    datos,
    isLoading,
    isSaving,
    error,
    recargar: () => setError(MENSAJE),
    guardar,
  };
};
