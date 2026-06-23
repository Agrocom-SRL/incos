/**
 * Provider: reporte de becas por carrera (Finanzas) — read-only.
 *
 * Provider DELGADO (espejo de `PagosDetailProvider`): ensambla el hook de API
 * (`useBecasPorCarreraReporte`, que ya OWNS `reporte`/`loading`/`error`), dispara
 * la carga inicial vía efecto y expone `refetch(gestionId)`. Sin lógica de
 * negocio: la orquestación de UI vive en `useBecasReportePage`.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useBecasPorCarreraReporte } from '@application-finanzas/hooks/api/useBecasPorCarreraReporte';
import { BecasReporteContext } from '@application-finanzas/context/BecasReporteContext';

export const BecasReporteProvider = ({ children }) => {
  const { reporte, loading, error, getReporte } = useBecasPorCarreraReporte();
  const [gestionId, setGestionId] = useState(null);

  useEffect(() => {
    getReporte(gestionId);
  }, [getReporte, gestionId]);

  /** Cambia la gestión consultada y dispara la recarga. */
  const refetch = useCallback((nextGestionId) => {
    setGestionId(nextGestionId ?? null);
  }, []);

  const value = useMemo(
    () => ({ reporte, loading, error, gestionId, refetch }),
    [reporte, loading, error, gestionId, refetch],
  );

  return (
    <BecasReporteContext.Provider value={value}>{children}</BecasReporteContext.Provider>
  );
};

export default BecasReporteProvider;
