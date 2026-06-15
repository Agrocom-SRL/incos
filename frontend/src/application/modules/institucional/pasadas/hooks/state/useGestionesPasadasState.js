import { useCallback, useEffect, useMemo, useState } from 'react';
import { App } from 'antd';
import { useNavigate } from 'react-router-dom';
import apiClient from '@api-client';
import { GESTIONES_ENDPOINTS } from '@api/endpoints';
import { handleErrorResponse, handleSuccessResponse } from '@api/responseHandler';
import { ofertaPaths } from '@application-institucional/oferta';
import { useOfertaAcademicaApi } from '@application-institucional/oferta';
import {
  filterGestionesBySearch,
  habilitarTodosPlanesPendientesEnGestion,
} from '@application-institucional/oferta/hooks/state/ofertaStateShared.js';
import { buildGestionesTableColumns } from '@institucional/pasadas/config/gestionesTableColumns';
import { pasadasPaths } from '../../config/paths.js';

import { buildGestionPlanesResumen } from '../../utils/gestionPlanesResumen.js';

async function fetchPlanesResumenGestion(gestionId) {
  try {
    const response = await apiClient.get(GESTIONES_ENDPOINTS.PLANES_HABILITADOS(gestionId));
    const result = handleSuccessResponse(response);
    if (!result.success) {
      return { count: 0, nombresTop: [], restantes: 0 };
    }
    const planes = result.data?.planesHabilitados ?? [];
    return buildGestionPlanesResumen(planes);
  } catch (err) {
    handleErrorResponse(err, 'No se pudieron cargar los planes de la gestión');
    return { count: 0, nombresTop: [], restantes: 0 };
  }
}

export function useGestionesPasadasState() {
  const navigate = useNavigate();
  const { message: messageApi } = App.useApp();
  const {
    loading: apiLoading,
    error: apiError,
    fetchGestiones,
    fetchPlanesHabilitados,
    fetchPlanesVigentesCatalogo,
    habilitarPlan,
  } = useOfertaAcademicaApi();

  const [gestiones, setGestiones] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [planesResumenByGestionId, setPlanesResumenByGestionId] = useState({});
  const [planesResumenLoading, setPlanesResumenLoading] = useState(false);
  const [planesVigentes, setPlanesVigentes] = useState([]);
  const [habilitandoPlanes, setHabilitandoPlanes] = useState(false);

  const loadPlanesResumen = useCallback(async (items) => {
    const list = Array.isArray(items) ? items : [];
    if (!list.length) {
      setPlanesResumenByGestionId({});
      return;
    }
    setPlanesResumenLoading(true);
    try {
      const entries = await Promise.all(
        list.map(async (g) => [g.id, await fetchPlanesResumenGestion(g.id)])
      );
      setPlanesResumenByGestionId(Object.fromEntries(entries));
    } finally {
      setPlanesResumenLoading(false);
    }
  }, []);

  const loadGestiones = useCallback(async () => {
    const res = await fetchGestiones();
    if (!res.success) return;
    const raw = res.data?.gestiones ?? res.data?.managements ?? res.data;
    const items = Array.isArray(raw) ? raw : [];
    setGestiones(items);
    await loadPlanesResumen(items);
  }, [fetchGestiones, loadPlanesResumen]);

  useEffect(() => {
    loadGestiones();
  }, [loadGestiones]);

  const onVerPlanes = useCallback(
    (gestionId) => {
      navigate(ofertaPaths.gestionPlanes(gestionId));
    },
    [navigate]
  );

  const refreshResumenGestion = useCallback(async (gestionId) => {
    const resumen = await fetchPlanesResumenGestion(gestionId);
    setPlanesResumenByGestionId((prev) => ({ ...prev, [gestionId]: resumen }));
  }, []);

  const onHabilitarTodosPlanes = useCallback(
    async (gestionId) => {
      const gestion = gestiones.find((g) => Number(g.id) === Number(gestionId));
      if (!gestion?.vigente) {
        messageApi.info('Solo la gestión vigente admite habilitar planes desde este listado.');
        return;
      }

      setHabilitandoPlanes(true);
      try {
        const result = await habilitarTodosPlanesPendientesEnGestion({
          gestionId,
          habilitarPlan,
          fetchPlanesHabilitados,
          fetchPlanesVigentesCatalogo,
          planesVigentes,
        });

        if (result.catalogo?.length) {
          setPlanesVigentes(result.catalogo);
        }

        if (result.yaCompletos) {
          messageApi.info('Todos los planes vigentes del catálogo ya están habilitados en esta gestión.');
          return;
        }

        if (!result.success && result.error) {
          messageApi.error(result.error);
          return;
        }

        if (result.habilitados > 0) {
          messageApi.success(
            result.errores.length
              ? `Se habilitaron ${result.habilitados} de ${result.total} planes. Revise los que no se vincularon.`
              : `Se habilitaron ${result.habilitados} planes en la gestión.`
          );
          await refreshResumenGestion(gestionId);
        } else if (result.errores.length) {
          messageApi.error('No se pudo habilitar ningún plan en la gestión.');
        }
      } finally {
        setHabilitandoPlanes(false);
      }
    },
    [
      gestiones,
      habilitarPlan,
      fetchPlanesHabilitados,
      fetchPlanesVigentesCatalogo,
      planesVigentes,
      messageApi,
      refreshResumenGestion,
    ]
  );

  const gestionesFiltradas = useMemo(
    () => filterGestionesBySearch(gestiones, searchText),
    [gestiones, searchText]
  );

  const tableColumns = useMemo(
    () =>
      buildGestionesTableColumns({
        onVerPlanes,
        onHabilitarPlan: onHabilitarTodosPlanes,
        planesResumenByGestionId,
        planesResumenLoading,
        habilitandoPlanes,
      }),
    [
      onVerPlanes,
      onHabilitarTodosPlanes,
      planesResumenByGestionId,
      planesResumenLoading,
      habilitandoPlanes,
    ]
  );

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Institucional', href: '/institucional' },
      { title: 'Gestiones pasadas' },
    ],
    []
  );

  const handleSearchChange = useCallback((event) => {
    setSearchText(event.target.value);
  }, []);

  return {
    apiLoading: apiLoading || planesResumenLoading,
    apiError,
    gestiones: gestionesFiltradas,
    searchText,
    tableColumns,
    breadcrumbItems,
    pageTitle: 'Gestiones pasadas',
    handleSearchChange,
    loadGestiones,
    navigateOferta: useCallback(() => navigate(ofertaPaths.dashboard()), [navigate]),
    listPath: pasadasPaths.list(),
    habilitandoPlanes,
  };
}
