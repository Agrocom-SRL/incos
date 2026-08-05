/**
 * Hook de pantalla: Registro de ingresos unificado (Finanzas · FIN-PAG · LISTAR).
 *
 * Espejo de `usePagosListPage` (histórico, cabeceras por estudiante): consume
 * el contexto del provider, genera columnas, breadcrumb y handlers; devuelve
 * props listas para la página "dumb".
 */

import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useIngresosListContext } from '@application-finanzas/hooks/context/useIngresosListContext';
import { createIngresosTableColumns } from '@finanzas/pagos/config/ingresosTableColumns';
import { PAGOS_LIST_PATH, pagoRegistrarPath } from '@application-finanzas/config/paths';

const FIN_PAG_MENU_KEY = 'FIN-PAG';

export const useIngresosListPage = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const {
    ingresos = [],
    loading = false,
    error = null,
    searchText = '',
    setSearchText,
    tablePagination,
  } = useIngresosListContext();

  const listNavState = useMemo(
    () => ({
      menuSidebarKey: FIN_PAG_MENU_KEY,
      returnListPath: pathname || PAGOS_LIST_PATH,
    }),
    [pathname],
  );

  const tableColumns = useMemo(
    () => createIngresosTableColumns({ navigate, listNavState }),
    [navigate, listNavState],
  );

  const breadcrumbItems = useMemo(
    () => [{ title: 'Inicio', href: '/' }, { title: 'Finanzas' }, { title: 'Registro de ingresos' }],
    [],
  );

  const handleRegistrar = useCallback(() => {
    navigate(pagoRegistrarPath, { state: listNavState });
  }, [navigate, listNavState]);

  const handleSearchChange = useCallback(
    (event) => {
      setSearchText(event.target.value);
    },
    [setSearchText],
  );

  return {
    ingresos,
    loading,
    error,
    searchText,
    tableColumns,
    breadcrumbItems,
    handleRegistrar,
    handleSearchChange,
    tablePagination,
  };
};

export default useIngresosListPage;
