/**
 * Hook de API: reporte de cuentas por cobrar por carrera y paralelo
 * (módulo Finanzas, read-only).
 *
 * El módulo Finanzas es independiente del legacy `@pagos`/`@application-pagos`:
 * consume la INFRAESTRUCTURA compartida (`PagoAporteRepository`), igual que
 * `useBecasPorCarreraReporte`. El hook OWNS su propio estado
 * (`reporte`/`loading`/`error`) y expone un `getReporte(gestionId)` async, de
 * modo que el provider sea delgado y el efecto no haga `setState` síncrono.
 *
 * Devuelve un OBJETO (no una lista) bajo la clave 'cuentasPorCobrar'
 * (dataKey == dataFieldName del backend), ya normalizado por `mapCuentasPorCobrar`.
 */

import { useCallback, useState } from 'react';
import pagoAporteRepository from '@implementations/PagoAporteRepository';
import { mapCuentasPorCobrar } from '@application-finanzas/mappers/cuentasPorCobrarMapper';

/** Clave de datos = dataFieldName del backend (objeto del reporte). */
export const CUENTAS_POR_COBRAR_DATA_KEY = 'cuentasPorCobrar';

export const useCuentasPorCobrarReporte = () => {
  const [reporte, setReporte] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getReporte = useCallback(async (gestionId = null) => {
    setLoading(true);
    setError(null);

    const result = await pagoAporteRepository.obtenerReporteCuentasPorCobrar({ gestionId });

    if (!result?.success) {
      const msg = result?.error || 'Error al cargar el reporte de cuentas por cobrar';
      setReporte(null);
      setError(msg);
      setLoading(false);
      return { success: false, error: msg };
    }

    // El backend anida el objeto bajo `data.cuentasPorCobrar`.
    const planillaRaw = result?.data?.[CUENTAS_POR_COBRAR_DATA_KEY] ?? null;
    const planilla = mapCuentasPorCobrar(planillaRaw);

    setReporte(planilla);
    setLoading(false);
    return { success: true, [CUENTAS_POR_COBRAR_DATA_KEY]: planilla, data: planilla };
  }, []);

  return { reporte, loading, error, getReporte };
};

export default useCuentasPorCobrarReporte;
