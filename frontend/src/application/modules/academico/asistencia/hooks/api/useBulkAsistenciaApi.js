/**
 * Persistencia del lote de la planilla (upsert de sesiones + marcas sparse).
 * Mutación imperativa: `guardar(asignacionId, { dias })`.
 */
import { useCallback, useState } from 'react';
import { useCasesFactory } from '@container';

export const useBulkAsistenciaApi = () => {
  const [guardando, setGuardando] = useState(false);

  const guardar = useCallback(async (asignacionId, { dias } = {}) => {
    setGuardando(true);
    try {
      const uc = useCasesFactory.guardarPlanillaAsistencia();
      return await uc.ejecutar(asignacionId, { dias });
    } finally {
      setGuardando(false);
    }
  }, []);

  return { guardar, guardando };
};
