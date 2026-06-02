import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@api-client';
import { GESTIONES_ENDPOINTS } from '@api/endpoints';
import { handleErrorResponse, handleSuccessResponse } from '@api/responseHandler';
import { ofertaPaths } from '@application-institucional/oferta';
import { useOfertaAcademicaApi } from '@application-institucional/oferta';
import { filterGestionesBySearch } from '@application-institucional/oferta/hooks/state/ofertaStateShared.js';
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
  const { loading: apiLoading, error: apiError, fetchGestiones } = useOfertaAcademicaApi();

  const [gestiones, setGestiones] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [planesResumenByGestionId, setPlanesResumenByGestionId] = useState({});
  const [planesResumenLoading, setPlanesResumenLoading] = useState(false);

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

  const gestionesFiltradas = useMemo(
    () => filterGestionesBySearch(gestiones, searchText),
    [gestiones, searchText]
  );

  const tableColumns = useMemo(
    () =>
      buildGestionesTableColumns({
        onVerPlanes,
        planesResumenByGestionId,
        planesResumenLoading,
      }),
    [onVerPlanes, planesResumenByGestionId, planesResumenLoading]
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
  };
}
