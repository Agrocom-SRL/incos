/**
 * Hook de pantalla: listado de pagos de aporte (Finanzas).
 *
 * Espejo de `useDocentesListPage`: consume el contexto del provider, genera las
 * columnas, breadcrumb y handlers; devuelve props listas para la página "dumb".
 */

import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePagosListContext } from '@application-finanzas/hooks/context/usePagosListContext';
import { createPagosTableColumns } from '@finanzas/pagos/config/tableColumns';
import { PAGOS_LIST_PATH, pagoRegistrarPath } from '@application-finanzas/config/paths';

const FIN_PAG_MENU_KEY = 'FIN-PAG';

export const usePagosListPage = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const {
    pagos = [],
    loading = false,
    error = null,
    searchText = '',
    setSearchText,
    refetch,
    tablePagination,
  } = usePagosListContext();

  const listNavState = useMemo(
    () => ({
      menuSidebarKey: FIN_PAG_MENU_KEY,
      returnListPath: pathname || PAGOS_LIST_PATH,
    }),
    [pathname],
  );

  const tableColumns = useMemo(
    () =>
      createPagosTableColumns({
        navigate,
        listNavState,
        refetch,
      }),
    [navigate, listNavState, refetch],
  );

  const breadcrumbItems = useMemo(
    () => [{ title: 'Inicio', href: '/' }, { title: 'Finanzas' }, { title: 'Pagos' }],
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
    pagos,
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
