/**
 * Hook de API: descarga del recibo PDF de una cuota de pago (módulo Finanzas).
 *
 * Módulo independiente del legacy `@pagos`: consume directamente la infraestructura
 * compartida — `PagoAporteRepository.generarRecibo(cuotaId)` (GET .../:id/recibo).
 *
 * El endpoint NO devuelve un blob, sino metadatos del archivo ya materializado en el
 * servidor: `{ filePath, fileName, absolutePath }`. La descarga real se hace con la
 * utilidad compartida `downloadFile(filePath, fileName)` (mismo enfoque que el flujo
 * de recibos del repo: fetch del archivo estático en /uploads → blob → enlace temporal).
 */

import { useCallback, useState } from 'react';
import pagoAporteRepository from '@implementations/PagoAporteRepository';
import { downloadFile } from '@application/utils';

export const useGenerateReciboPago = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  /** id de la cuota cuyo recibo se está descargando (para feedback por fila). */
  const [reciboCuotaId, setReciboCuotaId] = useState(null);

  const generarRecibo = useCallback(async (cuotaIdOrReciboId) => {
    if (cuotaIdOrReciboId == null || cuotaIdOrReciboId === '') {
      const msg = 'ID de la cuota es requerido';
      setError(msg);
      return { success: false, error: msg };
    }

    setLoading(true);
    setError(null);
    setReciboCuotaId(cuotaIdOrReciboId);

    try {
      const result = await pagoAporteRepository.generarRecibo(cuotaIdOrReciboId);
      if (!result?.success) {
        const msg = result?.error || 'Error al generar el recibo';
        setError(msg);
        return { success: false, error: msg };
      }

      const recibo = result.data ?? {};
      if (!recibo.filePath) {
        const msg = 'No se pudo obtener el recibo';
        setError(msg);
        return { success: false, error: msg };
      }

      await downloadFile(recibo.filePath, recibo.fileName || 'recibo_cuota.pdf');
      return { success: true, data: recibo };
    } catch (err) {
      const msg = err?.message || 'Error al descargar el recibo';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
      setReciboCuotaId(null);
    }
  }, []);

  return { generarRecibo, loading, error, reciboCuotaId };
};
