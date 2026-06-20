/**
 * Hook de API: actualizar una cuota de pago (módulo Finanzas).
 *
 * Módulo independiente del legacy `@pagos`: consume directamente la infraestructura
 * compartida — `PagoAporteRepository.actualizarCuota(cuotaId, payload)`
 * (PUT /api/v1/pagos-aportes/cuotas/:id). El payload usa los nombres EXACTOS del
 * validator del backend (`updatePaymentCuotaValidator`): amount, payment_method_id,
 * payment_account_id, payment_date, transaction_number, codigo_comprobante, descripcion.
 */

import { useCallback, useState } from 'react';
import pagoAporteRepository from '@implementations/PagoAporteRepository';

export const useUpdatePagoCuota = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const actualizarCuota = useCallback(async (cuotaId, payload) => {
    if (cuotaId == null || cuotaId === '') {
      const msg = 'ID de la cuota es requerido';
      setError(msg);
      return { success: false, error: msg };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await pagoAporteRepository.actualizarCuota(cuotaId, payload);
      if (!result?.success) {
        const msg = result?.error || 'No se pudo actualizar la cuota';
        setError(msg);
        return { success: false, error: msg };
      }
      return { success: true, data: result.data };
    } catch (err) {
      const msg = err?.message || 'Error al actualizar la cuota';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  return { actualizarCuota, loading, error };
};
