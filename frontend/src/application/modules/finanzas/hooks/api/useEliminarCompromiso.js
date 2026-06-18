/**
 * Hook de API: eliminar (soft delete) el compromiso de pago vigente (Finanzas).
 *
 * Consume la INFRAESTRUCTURA compartida — `PagoAporteRepository.eliminarCompromiso`
 * (DELETE /pagos-aportes/compromiso/:id). Recibe el id del compromiso vigente.
 */

import { useCallback, useState } from 'react';
import pagoAporteRepository from '@implementations/PagoAporteRepository';

export const useEliminarCompromiso = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const eliminar = useCallback(async (compromisoId) => {
    const id = Number(compromisoId);
    if (!Number.isFinite(id) || id < 1) {
      const msg = 'El compromiso a eliminar es requerido';
      setError(msg);
      return { success: false, error: msg };
    }

    setLoading(true);
    setError(null);

    const result = await pagoAporteRepository.eliminarCompromiso(id);

    if (!result?.success) {
      const msg = extraerMensajeError(result?.error);
      setError(msg);
      setLoading(false);
      return { success: false, error: msg };
    }

    setLoading(false);
    return { success: true };
  }, []);

  return { eliminar, loading, error };
};

/** Normaliza el error del backend (string u objeto { message }) a texto plano. */
function extraerMensajeError(rawError) {
  if (!rawError) return 'No se pudo eliminar el compromiso de pago';
  if (typeof rawError === 'string') return rawError;
  if (typeof rawError === 'object' && typeof rawError.message === 'string') {
    return rawError.message;
  }
  return 'No se pudo eliminar el compromiso de pago';
}
