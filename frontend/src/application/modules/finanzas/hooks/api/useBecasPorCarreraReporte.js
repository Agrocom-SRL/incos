/**
 * Hook de API: reporte de becas por carrera (módulo Finanzas, read-only).
 *
 * El módulo Finanzas es independiente del legacy `@pagos`/`@application-pagos`:
 * consume la INFRAESTRUCTURA compartida (`PagoAporteRepository`), igual que
 * `useGetPagoById`. El hook OWNS su propio estado (`reporte`/`loading`/`error`)
 * y expone un `getReporte(gestionId)` async (espejo de `getPagoById`), de modo
 * que el provider sea delgado y el efecto no haga `setState` síncrono.
 *
 * Devuelve un OBJETO (no una lista) bajo la clave 'planillaBecas'
 * (dataKey == dataFieldName del backend), ya normalizado por `mapBecasReporte`.
 */

import { useCallback, useState } from 'react';
import pagoAporteRepository from '@implementations/PagoAporteRepository';
import { mapBecasReporte } from '@application-finanzas/mappers/becasReporteMapper';

/** Clave de datos = dataFieldName del backend (objeto del reporte). */
export const BECAS_REPORTE_DATA_KEY = 'planillaBecas';

export const useBecasPorCarreraReporte = () => {
  const [reporte, setReporte] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getReporte = useCallback(async (gestionId = null) => {
    setLoading(true);
    setError(null);

    const result = await pagoAporteRepository.obtenerReporteBecasPorCarrera({ gestionId });

    if (!result?.success) {
      const msg = result?.error || 'Error al cargar el reporte de becas por carrera';
      setReporte(null);
      setError(msg);
      setLoading(false);
      return { success: false, error: msg };
    }

    // El backend anida el objeto bajo `data.planillaBecas`.
    const planillaRaw = result?.data?.[BECAS_REPORTE_DATA_KEY] ?? null;
    const planilla = mapBecasReporte(planillaRaw);

    setReporte(planilla);
    setLoading(false);
    return { success: true, [BECAS_REPORTE_DATA_KEY]: planilla, data: planilla };
  }, []);

  return { reporte, loading, error, getReporte };
};

export default useBecasPorCarreraReporte;
