/**
 * Estado y datos derivados del detalle de una licencia estudiantil (capa aplicación, sin UI).
 * Mirror de useDocenteDetail: carga por id + navegación de retorno + estado de la decisión
 * (aprobar/rechazar) que la página resuelve con un Modal de confirmación.
 *
 * La carga vive en useLicenciaDetalleApi; la decisión en useLicenciaDecidirApi. La página solo
 * orquesta (incos-frontend-module §3).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLicenciaDetalleApi } from '@application-academico/asistencia/hooks/api/useLicenciaDetalleApi.js';
import { useLicenciaDecidirApi } from '@application-academico/asistencia/hooks/api/useLicenciaDecidirApi.js';
import { ESTADOS_LICENCIA } from '@application-academico/asistencia/utils/licenciasEstados.js';
import { LICENCIAS_PATH } from '@application-academico/asistencia/utils/asistenciaPaths.js';

export const useLicenciaDetalle = (licenciaIdRaw) => {
  const licenciaId = licenciaIdRaw != null ? Number(licenciaIdRaw) : NaN;
  const navigate = useNavigate();
  const location = useLocation();
  const returnListPath = location.state?.returnListPath || LICENCIAS_PATH;
  const menuSidebarKey = location.state?.menuSidebarKey ?? 'ACA-ASI';

  const { licencia, loading, error, fetch, refetch } = useLicenciaDetalleApi();
  const { decidirLicencia, loading: decidiendo } = useLicenciaDecidirApi();

  // Estado del Modal de decisión: { decision: 'APROBAR' | 'RECHAZAR' } | null.
  const [decisionContext, setDecisionContext] = useState(null);

  useEffect(() => {
    if (Number.isFinite(licenciaId) && licenciaId > 0) {
      fetch(licenciaId);
    }
  }, [licenciaId, fetch]);

  const esPendiente = licencia?.estado === ESTADOS_LICENCIA.PENDIENTE;

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Licencias estudiantiles', href: returnListPath },
      { title: 'Detalle de la licencia' },
    ],
    [returnListPath],
  );

  const handleVolver = useCallback(() => {
    navigate(returnListPath, { state: { menuSidebarKey } });
  }, [navigate, returnListPath, menuSidebarKey]);

  const abrirDecision = useCallback((decision) => setDecisionContext({ decision }), []);
  const cerrarDecision = useCallback(() => setDecisionContext(null), []);

  const confirmarDecision = useCallback(
    async (payload) => {
      if (!Number.isFinite(licenciaId) || licenciaId <= 0) return { success: false };
      const result = await decidirLicencia(licenciaId, payload);
      if (result.success) {
        setDecisionContext(null);
        await refetch(licenciaId);
      }
      return result;
    },
    [decidirLicencia, licenciaId, refetch],
  );

  return {
    licenciaId: Number.isFinite(licenciaId) && licenciaId > 0 ? licenciaId : null,
    licencia,
    loading,
    error,
    esPendiente,
    breadcrumbItems,
    returnListPath,
    handleVolver,
    // decisión
    decisionContext,
    abrirDecision,
    cerrarDecision,
    confirmarDecision,
    decidiendo,
  };
};

export default useLicenciaDetalle;
