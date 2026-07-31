/**
 * Hook de pantalla: listado de fichas de seguimiento en clase (DOC ·
 * docentes.supervision.ficha·LISTAR).
 *
 * Consume el contexto del provider (S1, vista 174), genera columnas,
 * breadcrumb y la navegación a "Registrar ficha".
 */

import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFichasSeguimientoListContext } from '@application-docentes/supervision/hooks/context/useFichasSeguimientoListContext';
import { createFichasSeguimientoTableColumns } from '@docentes/supervision/config/fichasSeguimientoTableColumns';
import {
  SUPERVISION_LIST_PATH,
  DOC_SUPERVISION_MENU_KEY,
  fichaSeguimientoRegistrarPath,
} from '@application-docentes/supervision/config/paths';

export const useFichasSeguimientoListPage = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const {
    fichas = [],
    loading = false,
    error = null,
    searchText = '',
    setSearchText,
    refetch,
    tablePagination,
  } = useFichasSeguimientoListContext();

  const listNavState = useMemo(
    () => ({
      menuSidebarKey: DOC_SUPERVISION_MENU_KEY,
      returnListPath: pathname || SUPERVISION_LIST_PATH,
    }),
    [pathname],
  );

  const tableColumns = useMemo(
    () => createFichasSeguimientoTableColumns({ navigate, listNavState }),
    [navigate, listNavState],
  );

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Docentes' },
      { title: 'Supervisión docente' },
    ],
    [],
  );

  const handleRegistrar = () => {
    navigate(fichaSeguimientoRegistrarPath, { state: listNavState });
  };

  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };

  return {
    fichas,
    loading,
    error,
    searchText,
    handleSearchChange,
    tableColumns,
    breadcrumbItems,
    handleRegistrar,
    tablePagination,
    refetch,
  };
};
