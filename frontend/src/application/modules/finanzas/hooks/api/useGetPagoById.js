/**
 * Hook de API: detalle de un pago de aporte (módulo Finanzas).
 *
 * El módulo Finanzas es independiente del legacy `@pagos`/`@application-pagos`:
 * NO usa un use case del container, sino que consume directamente la
 * INFRAESTRUCTURA compartida — `PagoAporteRepository`.
 *
 * La ficha combina DOS lecturas de la misma infraestructura:
 *   - `obtenerPorId(id)`            → cabecera + estudiante + gestión (dataFieldName 'pago').
 *   - `obtenerEstadoRegistro(...)`  → total pagado, saldo y `cuotas[]` (el detalle plano
 *     NO trae las cuotas; vienen del estado del aporte, igual que en el flujo legacy).
 *
 * `dataKey` ('pago') coincide con el `dataFieldName` del backend para la cabecera.
 */

import { useCallback, useState } from 'react';
import pagoAporteRepository from '@implementations/PagoAporteRepository';
import {
  mapPagoDetailFromApi,
  mergePagoDetail,
} from '@application-finanzas/mappers/pagosDetailMapper';

/** Clave de datos = dataFieldName del backend para la cabecera. */
export const PAGO_DATA_KEY = 'pago';

export const useGetPagoById = () => {
  const [pago, setPago] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getPagoById = useCallback(async (idRaw) => {
    const id = Number(idRaw);
    if (!Number.isFinite(id) || id <= 0) {
      setPago(null);
      setError('ID del pago es requerido');
      return { success: false, error: 'ID del pago es requerido' };
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Cabecera del pago (estudiante + gestión + montos).
      const detailResult = await pagoAporteRepository.obtenerPorId(id);
      if (!detailResult?.success) {
        const msg = detailResult?.error || 'Error al cargar el pago';
        setPago(null);
        setError(msg);
        return { success: false, error: msg };
      }

      const detail = mapPagoDetailFromApi(detailResult.data?.[PAGO_DATA_KEY] ?? detailResult.data);
      if (!detail) {
        const msg = 'No se encontró información del pago';
        setPago(null);
        setError(msg);
        return { success: false, error: msg };
      }

      // 2. Estado del aporte (total pagado, saldo y cuotas) — best-effort.
      let estado = null;
      if (detail.estudianteId) {
        const estadoResult = await pagoAporteRepository.obtenerEstadoRegistro(
          detail.estudianteId,
          detail.gestionId,
        );
        if (estadoResult?.success) {
          estado = estadoResult.data ?? null;
        }
      }

      const merged = mergePagoDetail(detail, estado);
      setPago(merged);
      return { success: true, [PAGO_DATA_KEY]: merged, data: merged };
    } catch (err) {
      const msg = err?.message || 'Error al cargar el pago';
      setPago(null);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  return { pago, loading, error, getPagoById, refetch: getPagoById };
};
