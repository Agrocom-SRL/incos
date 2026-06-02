import { useCallback, useEffect, useMemo, useState } from 'react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ofertaPaths } from '../../config/paths.js';
import { gestionLabel } from './ofertaStateShared.js';
import { useOfertaAcademicaApi } from '../api/useOfertaAcademicaApi.js';

export function useOfertaGestionesState() {
  const navigate = useNavigate();
  const { loading: apiLoading, error: apiError, fetchGestiones, marcarGestionVigente } =
    useOfertaAcademicaApi();

  const [gestiones, setGestiones] = useState([]);

  const loadGestiones = useCallback(async () => {
    const res = await fetchGestiones();
    if (!res.success) return;
    const raw = res.data?.gestiones ?? res.data?.managements ?? res.data;
    setGestiones(Array.isArray(raw) ? raw : []);
  }, [fetchGestiones]);

  useEffect(() => {
    loadGestiones();
  }, [loadGestiones]);

  const onMarcarVigente = useCallback(
    async (gestionId) => {
      if (!gestionId) return;
      const res = await marcarGestionVigente(gestionId);
      if (res.success) {
        message.success('Gestión marcada como vigente');
        await loadGestiones();
      }
    },
    [marcarGestionVigente, loadGestiones]
  );

  const onVerPlanes = useCallback(
    (gestionId) => {
      navigate(ofertaPaths.gestionPlanes(gestionId));
    },
    [navigate]
  );

  const pageTitle = 'Gestiones académicas';

  const vigente = useMemo(() => gestiones.find((g) => g.vigente) ?? null, [gestiones]);

  return {
    apiLoading,
    apiError,
    gestiones,
    vigente,
    pageTitle,
    gestionLabel,
    onMarcarVigente,
    onVerPlanes,
    loadGestiones,
    navigateDashboard: useCallback(() => navigate(ofertaPaths.dashboard()), [navigate]),
  };
}
