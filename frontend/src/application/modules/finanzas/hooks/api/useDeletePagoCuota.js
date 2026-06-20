/**
 * Hook de API: eliminar una cuota de pago (módulo Finanzas).
 *
 * Módulo independiente del legacy `@pagos`: consume directamente la infraestructura
 * compartida — `PagoAporteRepository.eliminarCuota(cuotaId)` (DELETE .../cuotas/:id).
 */

import { useCallback, useState } from 'react';
import pagoAporteRepository from '@implementations/PagoAporteRepository';

export const useDeletePagoCuota = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const eliminarCuota = useCallback(async (cuotaId) => {
    if (cuotaId == null || cuotaId === '') {
      const msg = 'ID de la cuota es requerido';
      setError(msg);
      return { success: false, error: msg };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await pagoAporteRepository.eliminarCuota(cuotaId);
      if (!result?.success) {
        const msg = result?.error || 'No se pudo eliminar la cuota';
        setError(msg);
        return { success: false, error: msg };
      }
      return { success: true };
    } catch (err) {
      const msg = err?.message || 'Error al eliminar la cuota';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  return { eliminarCuota, loading, error };
};
