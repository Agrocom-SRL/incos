/**
 * Hook de API: registrar una cuota/abono de aporte académico (módulo Finanzas).
 *
 * Módulo independiente del legacy `@pagos`: consume directamente la INFRAESTRUCTURA
 * compartida — `PagoAporteRepository.registrarPago` (POST /pagos-aportes). El repositorio
 * decide entre JSON o multipart/form-data según venga (o no) un archivo de comprobante
 * (`documentoRespaldo`, instancia de `File`).
 *
 * Recibe un payload ya preparado (campos del backend) desde el hook de pantalla y
 * devuelve `{ registrar, loading, error }`.
 */

import { useCallback, useState } from 'react';
import pagoAporteRepository from '@implementations/PagoAporteRepository';

export const useRegistrarPagoAporte = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * @param {Object} payload - Datos de la cuota ya en los nombres del backend.
   * @param {number} payload.student_id
   * @param {number} payload.amount
   * @param {number} payload.payment_method_id
   * @param {number|null} payload.payment_account_id
   * @param {string} payload.payment_date - YYYY-MM-DD
   * @param {string|null} payload.transaction_number
   * @param {string|null} payload.codigo_comprobante
   * @param {string|null} payload.descripcion
   * @param {File|null} payload.documentoRespaldo - Comprobante opcional.
   */
  const registrar = useCallback(async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const result = await pagoAporteRepository.registrarPago(payload);
      if (!result?.success) {
        const msg = extraerMensajeError(result?.error);
        setError(msg);
        return { success: false, error: msg };
      }
      return { success: true, data: result.data ?? null };
    } catch (err) {
      const msg = err?.message || 'Error inesperado al registrar el pago';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  return { registrar, loading, error };
};

/** Normaliza el error del backend (string u objeto { message }) a texto plano. */
function extraerMensajeError(rawError) {
  if (!rawError) return 'No se pudo registrar el pago';
  if (typeof rawError === 'string') return rawError;
  if (typeof rawError === 'object' && typeof rawError.message === 'string') {
    return rawError.message;
  }
  return 'No se pudo registrar el pago';
}
