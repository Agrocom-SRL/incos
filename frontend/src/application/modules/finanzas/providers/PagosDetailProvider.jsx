/**
 * Provider: detalle de un pago de aporte (Finanzas) — ficha.
 *
 * Espejo de `DocentesDetailProvider`: provider DELGADO que ensambla los hooks de
 * API (`useGetPagoById` con auto-fetch por id, `useDeletePagoCuota`) y publica el
 * contrato de la ficha. La orquestación de pantalla (breadcrumbs, handlers, volver)
 * vive en `usePagosDetailPage` (hooks/state), no aquí.
 */

import { useCallback, useEffect, useMemo } from 'react';
import { useGetPagoById } from '@application-finanzas/hooks/api/useGetPagoById';
import { useDeletePagoCuota } from '@application-finanzas/hooks/api/useDeletePagoCuota';
import { useGenerateReciboPago } from '@application-finanzas/hooks/api/useGenerateReciboPago';
import { PagosDetailContext } from '@application-finanzas/context/PagosDetailContext';

export const PagosDetailProvider = ({ children, pagoId }) => {
  const { pago, loading, error, getPagoById, refetch } = useGetPagoById();
  const { eliminarCuota, loading: eliminandoCuota } = useDeletePagoCuota();
  const { generarRecibo, loading: descargandoRecibo, reciboCuotaId } = useGenerateReciboPago();

  const id = Number(pagoId);
  const idValido = Number.isFinite(id) && id > 0;

  useEffect(() => {
    if (idValido) {
      getPagoById(id);
    }
  }, [idValido, id, getPagoById]);

  const refetchPago = useCallback(() => {
    if (idValido) {
      return refetch(id);
    }
    return Promise.resolve({ success: false });
  }, [idValido, id, refetch]);

  const value = useMemo(
    () => ({
      pagoId: idValido ? id : null,
      pago,
      loading,
      error,
      refetch: refetchPago,
      eliminarCuota,
      eliminandoCuota,
      generarRecibo,
      descargandoRecibo,
      reciboCuotaId,
    }),
    [
      idValido,
      id,
      pago,
      loading,
      error,
      refetchPago,
      eliminarCuota,
      eliminandoCuota,
      generarRecibo,
      descargandoRecibo,
      reciboCuotaId,
    ],
  );

  return <PagosDetailContext.Provider value={value}>{children}</PagosDetailContext.Provider>;
};
