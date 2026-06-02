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
  planCatalogoLabel,
  planesCatalogoPendientesHabilitar,
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
  const [modalHabilitarPlan, setModalHabilitarPlan] = useState(false);
  const [gestionIdHabilitar, setGestionIdHabilitar] = useState(null);
  const [planesVigentes, setPlanesVigentes] = useState([]);
  const [planesPendientesModal, setPlanesPendientesModal] = useState([]);
  const [habilitandoPlan, setHabilitandoPlan] = useState(false);

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

  const onHabilitarPlan = useCallback(
    async (gestionId, planEstudioId) => {
      if (!gestionId || !planEstudioId) return;
      setHabilitandoPlan(true);
      try {
        const res = await habilitarPlan({
          gestion_id: gestionId,
          plan_estudio_id: planEstudioId,
        });
        if (res.success) {
          messageApi.success('Plan habilitado en la gestión');
          setModalHabilitarPlan(false);
          setGestionIdHabilitar(null);
          await refreshResumenGestion(gestionId);
        } else if (res.error) {
          messageApi.error(res.error);
        }
      } finally {
        setHabilitandoPlan(false);
      }
    },
    [habilitarPlan, messageApi, refreshResumenGestion]
  );

  const openHabilitarPlanModal = useCallback(
    async (gestionId) => {
      const gestion = gestiones.find((g) => Number(g.id) === Number(gestionId));
      if (!gestion?.vigente) {
        messageApi.info('Solo la gestión vigente admite habilitar planes desde este listado.');
        return;
      }

      setGestionIdHabilitar(gestionId);

      const [habRes, catRes] = await Promise.all([
        fetchPlanesHabilitados(gestionId),
        planesVigentes.length
          ? Promise.resolve({ success: true, data: { planes_estudios: planesVigentes } })
          : fetchPlanesVigentesCatalogo(),
      ]);

      let catalogo = planesVigentes;
      if (catRes.success) {
        const raw = catRes.data?.planes_estudios ?? catRes.data;
        catalogo = Array.isArray(raw) ? raw : [];
        setPlanesVigentes(catalogo);
      }

      const habilitados = habRes.success ? (habRes.data?.planesHabilitados ?? []) : [];
      const pendientes = planesCatalogoPendientesHabilitar(catalogo, habilitados);

      if (!pendientes.length) {
        messageApi.info('Todos los planes vigentes del catálogo ya están habilitados en esta gestión.');
        setGestionIdHabilitar(null);
        return;
      }

      if (pendientes.length === 1) {
        await onHabilitarPlan(gestionId, pendientes[0].id);
        return;
      }

      setPlanesPendientesModal(pendientes);
      setModalHabilitarPlan(true);
    },
    [
      gestiones,
      planesVigentes,
      fetchPlanesHabilitados,
      fetchPlanesVigentesCatalogo,
      onHabilitarPlan,
      messageApi,
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
        onHabilitarPlan: openHabilitarPlanModal,
        planesResumenByGestionId,
        planesResumenLoading,
      }),
    [onVerPlanes, openHabilitarPlanModal, planesResumenByGestionId, planesResumenLoading]
  );

  const habilitarPlanModalOptions = useMemo(
    () =>
      planesPendientesModal.map((p) => ({
        value: p.id,
        label: planCatalogoLabel(p),
      })),
    [planesPendientesModal]
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
    modalHabilitarPlan,
    setModalHabilitarPlan,
    gestionIdHabilitar,
    habilitarPlanModalOptions,
    habilitandoPlan,
    onHabilitarPlanSeleccion: useCallback(
      (planEstudioId) => {
        if (gestionIdHabilitar != null && planEstudioId != null) {
          onHabilitarPlan(gestionIdHabilitar, planEstudioId);
        }
      },
      [gestionIdHabilitar, onHabilitarPlan]
    ),
  };
}
