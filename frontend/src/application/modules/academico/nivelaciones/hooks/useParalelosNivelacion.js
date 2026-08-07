/**
 * Estado de pantalla — P1 nivel 1 de Nivelación: paralelos del instituto en
 * gestión vigente, con su conteo de "pendientes de nivelación". Reusa el
 * MISMO dataset compartido de paralelos que Centralizador P1
 * (`useParalelosEstadoApi`) y lo fusiona con
 * `listarNivelacionesPendientesPorParalelo` por `paraleloGestionId` — no
 * reconstruye el listado de paralelos (documento de diseño B1).
 *
 * La página solo compone; toda la orquestación vive aquí (incos-frontend-module §2).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useCasesFactory } from '@container';
import { useParalelosEstadoApi } from '@application-shared/hooks';
import { fusionarPendientesNivelacion } from '../utils/paraleloNivelacion.js';
import { createNivelacionBreadcrumbItems } from '../utils/nivelacionBreadcrumbs.js';

export const useParalelosNivelacion = () => {
  const {
    paralelosEstadoDashboard,
    loading: loadingParalelos,
    error: errorParalelos,
    refetch: refetchParalelos,
  } = useParalelosEstadoApi();

  const [pendientesRows, setPendientesRows] = useState([]);
  const [loadingPendientes, setLoadingPendientes] = useState(true);
  const [errorPendientes, setErrorPendientes] = useState(null);

  const cargarPendientes = useCallback(async () => {
    setLoadingPendientes(true);
    setErrorPendientes(null);
    try {
      const uc = useCasesFactory.listarNivelacionesPendientesPorParalelo();
      const result = await uc.ejecutar();
      if (!result?.success) {
        throw new Error(result?.error || 'No se pudo cargar el conteo de pendientes');
      }
      setPendientesRows(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      setErrorPendientes(err?.message || String(err));
      setPendientesRows([]);
    } finally {
      setLoadingPendientes(false);
    }
  }, []);

  useEffect(() => {
    cargarPendientes();
  }, [cargarPendientes]);

  const paralelos = useMemo(
    () => fusionarPendientesNivelacion(paralelosEstadoDashboard?.paralelos, pendientesRows),
    [paralelosEstadoDashboard, pendientesRows],
  );

  const refetch = useCallback(() => {
    refetchParalelos();
    cargarPendientes();
  }, [refetchParalelos, cargarPendientes]);

  const breadcrumbItems = useMemo(
    () => createNivelacionBreadcrumbItems('ACA-NIV', 'ACA-NIV'),
    [],
  );

  return {
    paralelos,
    isLoading: loadingParalelos || loadingPendientes,
    error: errorParalelos || errorPendientes,
    refetch,
    breadcrumbItems,
  };
};

export default useParalelosNivelacion;
