/**
 * Registra una decisión administrativa ABANDONO/RETIRADO
 * (POST /nivelaciones/decisiones-administrativas). Acción IRREVERSIBLE — el
 * llamador debe envolverla en `Modal.confirm` (regla A5 del documento de
 * diseño), este hook solo ejecuta la mutación.
 */

import { useCallback, useState } from 'react';
import { useCasesFactory } from '@container';

export const useRegistrarDecisionAdministrativa = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const registrarDecision = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const result = await useCasesFactory
        .registrarDecisionAdministrativaNivelacion()
        .ejecutar(payload);
      if (!result?.success) {
        const message = result?.error || 'No se pudo registrar la decisión administrativa';
        setError(message);
        return { success: false, error: message };
      }
      return { success: true, data: result.data };
    } catch (err) {
      const message = err?.message || 'Error inesperado al registrar la decisión administrativa';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  return { registrarDecision, loading, error };
};

export default useRegistrarDecisionAdministrativa;
