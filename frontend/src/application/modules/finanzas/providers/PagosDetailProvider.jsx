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
import { useUpdatePagoCuota } from '@application-finanzas/hooks/api/useUpdatePagoCuota';
import { useGenerateReciboPago } from '@application-finanzas/hooks/api/useGenerateReciboPago';
import { usePaymentCatalogsApi } from '@application-finanzas/hooks/api/usePaymentCatalogsApi';
import { PagosDetailContext } from '@application-finanzas/context/PagosDetailContext';

export const PagosDetailProvider = ({ children, pagoId }) => {
  const { pago, loading, error, getPagoById, refetch } = useGetPagoById();
  const { eliminarCuota, loading: eliminandoCuota } = useDeletePagoCuota();
  const { actualizarCuota, loading: actualizandoCuota } = useUpdatePagoCuota();
  const { generarRecibo, loading: descargandoRecibo, reciboCuotaId } = useGenerateReciboPago();
  const {
    metodosPago,
    cuentasPago,
    loading: loadingCatalogos,
    error: errorCatalogos,
  } = usePaymentCatalogsApi();

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
      actualizarCuota,
      actualizandoCuota,
      generarRecibo,
      descargandoRecibo,
      reciboCuotaId,
      // Catálogos de pago para el formulario de edición de cuota.
      metodosPago,
      cuentasPago,
      loadingCatalogos,
      errorCatalogos,
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
      actualizarCuota,
      actualizandoCuota,
      generarRecibo,
      descargandoRecibo,
      reciboCuotaId,
      metodosPago,
      cuentasPago,
      loadingCatalogos,
      errorCatalogos,
    ],
  );

  return <PagosDetailContext.Provider value={value}>{children}</PagosDetailContext.Provider>;
};
