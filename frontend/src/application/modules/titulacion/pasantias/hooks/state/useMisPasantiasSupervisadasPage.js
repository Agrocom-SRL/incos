/**
 * Hook de pantalla: bandeja del docente supervisor (TUT · "Mis pasantías
 * supervisadas").
 *
 * Rama docente self del connector (patrón `useMisTutoradosPage`): SIN provider
 * admin — consume directamente P18 (el backend resuelve el docente por
 * token). Ofrece:
 *  - abrir la ficha del trámite (DETALLE),
 *  - registrar un seguimiento rápido (drawer, P16 — seguimiento·CREAR).
 */

import { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App } from 'antd';
import { useMisPasantiasApi } from '@application-titulacion/pasantias/hooks/api/useMisPasantiasApi';
import { useSeguimientosPasantiaApi } from '@application-titulacion/pasantias/hooks/api/useSeguimientosPasantiaApi';
import { createMisPasantiasTableColumns } from '@titulacion/pasantias/config/misPasantiasTableColumns';
import {
  PASANTIAS_LIST_PATH,
  TUT_PASANTIAS_MENU_KEY,
  pasantiaDetallePath,
} from '@application-titulacion/config/paths';

export const useMisPasantiasSupervisadasPage = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { notification } = App.useApp();

  const { pasantias, loading, error, refetch } = useMisPasantiasApi();
  const { guardarSeguimiento } = useSeguimientosPasantiaApi();

  const [searchText, setSearchText] = useState('');

  const pasantiasFiltradas = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return pasantias;
    return pasantias.filter(
      (p) =>
        (p.estudianteNombre || '').toLowerCase().includes(q) ||
        (p.empresaNombre || '').toLowerCase().includes(q) ||
        (p.carreraNombre || '').toLowerCase().includes(q),
    );
  }, [pasantias, searchText]);

  const listNavState = useMemo(
    () => ({
      menuSidebarKey: TUT_PASANTIAS_MENU_KEY,
      returnListPath: pathname || PASANTIAS_LIST_PATH,
    }),
    [pathname],
  );

  const handleVerPasantia = useCallback(
    (pasantia) => {
      navigate(pasantiaDetallePath(pasantia.id), { state: listNavState });
    },
    [navigate, listNavState],
  );

  // ————— Seguimiento rápido (drawer, P16) —————
  const [seguimientoDrawer, setSeguimientoDrawer] = useState({ open: false, pasantia: null });
  const [guardandoSeguimiento, setGuardandoSeguimiento] = useState(false);

  const abrirSeguimiento = useCallback(
    (pasantia) => setSeguimientoDrawer({ open: true, pasantia }),
    [],
  );
  const cerrarSeguimiento = useCallback(
    () => setSeguimientoDrawer({ open: false, pasantia: null }),
    [],
  );

  const handleGuardarSeguimiento = useCallback(
    async (payload) => {
      const pasantiaId = seguimientoDrawer.pasantia?.id;
      if (!pasantiaId) return;
      setGuardandoSeguimiento(true);
      try {
        const result = await guardarSeguimiento(pasantiaId, null, payload);
        if (result?.success) {
          notification.success({
            title: 'Seguimiento registrado',
            description: `Hoja de seguimiento de ${seguimientoDrawer.pasantia.estudianteNombre} actualizada.`,
          });
          cerrarSeguimiento();
          await refetch();
        } else {
          notification.error({
            title: 'No se pudo registrar el seguimiento',
            description: result?.error || 'Intente nuevamente en unos instantes.',
          });
        }
      } finally {
        setGuardandoSeguimiento(false);
      }
    },
    [seguimientoDrawer.pasantia, guardarSeguimiento, notification, cerrarSeguimiento, refetch],
  );

  const tableColumns = useMemo(
    () =>
      createMisPasantiasTableColumns({
        onVerPasantia: handleVerPasantia,
        onRegistrarSeguimiento: abrirSeguimiento,
      }),
    [handleVerPasantia, abrirSeguimiento],
  );

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Titulación' },
      { title: 'Mis pasantías supervisadas' },
    ],
    [],
  );

  const handleSearchChange = useCallback((event) => {
    setSearchText(event.target.value);
  }, []);

  return {
    pasantias: pasantiasFiltradas,
    loading,
    error,
    searchText,
    handleSearchChange,
    tableColumns,
    breadcrumbItems,
    seguimientoDrawer,
    cerrarSeguimiento,
    handleGuardarSeguimiento,
    guardandoSeguimiento,
  };
};
