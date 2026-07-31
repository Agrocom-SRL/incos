/**
 * Hook de pantalla: listado de sesiones de refuerzo (TUT · sesion·LISTAR).
 *
 * Consume el contexto del provider (A4), aplica el filtro de estado en
 * cliente, genera columnas, breadcrumb y handlers (programar, eliminar).
 */

import { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSesionesListContext } from '@application-academico/acompanamiento/sesiones/hooks/context/useSesionesListContext';
import { createSesionesTableColumns } from '@academico/acompanamiento/sesiones/config/sesionesTableColumns';
import { ESTADOS_SESION, formatEstadoSesion } from '@application-academico/acompanamiento/utils/acompanamientoPills';
import {
  SESIONES_LIST_PATH,
  TUT_SESIONES_MENU_KEY,
  sesionProgramarPath,
} from '@application-academico/acompanamiento/config/paths';

export const useSesionesListPage = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const {
    sesiones = [],
    loading = false,
    error = null,
    searchText = '',
    setSearchText,
    refetch,
    tablePagination,
    eliminarSesion,
  } = useSesionesListContext();

  const [estado, setEstado] = useState(null);

  const sesionesFiltradas = useMemo(
    () => sesiones.filter((s) => estado == null || s.estado === estado),
    [sesiones, estado],
  );

  const estadoOptions = useMemo(
    () => ESTADOS_SESION.map((e) => ({ value: e, label: formatEstadoSesion(e) })),
    [],
  );

  const listNavState = useMemo(
    () => ({
      menuSidebarKey: TUT_SESIONES_MENU_KEY,
      returnListPath: pathname || SESIONES_LIST_PATH,
    }),
    [pathname],
  );

  /** deleteFn de TableActions (la confirmación/feedback los pone TableActions). */
  const handleEliminar = useCallback(
    async (sesionId) => {
      if (!sesionId) return { success: false, error: 'Sesión inválida' };
      const result = await eliminarSesion(sesionId);
      return result ?? { success: false, error: 'No se pudo eliminar la sesión' };
    },
    [eliminarSesion],
  );

  const tableColumns = useMemo(
    () =>
      createSesionesTableColumns({
        navigate,
        listNavState,
        refetch,
        deleteFn: handleEliminar,
      }),
    [navigate, listNavState, refetch, handleEliminar],
  );

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Académico' },
      { title: 'Sesiones de refuerzo' },
    ],
    [],
  );

  const handleProgramar = useCallback(() => {
    navigate(sesionProgramarPath, { state: listNavState });
  }, [navigate, listNavState]);

  const handleSearchChange = useCallback(
    (event) => {
      setSearchText(event.target.value);
    },
    [setSearchText],
  );

  return {
    sesiones: sesionesFiltradas,
    loading,
    error,
    searchText,
    handleSearchChange,
    estado,
    setEstado,
    estadoOptions,
    tableColumns,
    breadcrumbItems,
    handleProgramar,
    tablePagination,
  };
};
