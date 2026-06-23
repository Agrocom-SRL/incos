/**
 * Provider: reporte de cuentas por cobrar por carrera y paralelo (Finanzas) —
 * read-only.
 *
 * Provider DELGADO (espejo de `BecasReporteProvider`): ensambla el hook de API
 * (`useCuentasPorCobrarReporte`, que ya OWNS `reporte`/`loading`/`error`),
 * dispara la carga inicial vía efecto y expone `refetch(gestionId)`. Sin lógica
 * de negocio: la orquestación de UI vive en `useCuentasPorCobrarPage`.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useCuentasPorCobrarReporte } from '@application-finanzas/hooks/api/useCuentasPorCobrarReporte';
import { CuentasPorCobrarContext } from '@application-finanzas/context/CuentasPorCobrarContext';

export const CuentasPorCobrarProvider = ({ children }) => {
  const { reporte, loading, error, getReporte } = useCuentasPorCobrarReporte();
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
    <CuentasPorCobrarContext.Provider value={value}>
      {children}
    </CuentasPorCobrarContext.Provider>
  );
};

export default CuentasPorCobrarProvider;
