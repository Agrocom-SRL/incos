import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDocentesListContext } from '@application-docentes/hooks/context/useDocentesListContext';
import { docentesListNavigationState } from '@application-docentes/config/docentesNavigation';
import { createDocentesTableColumns } from '@docentes/config/docentesTableColumns';

export const useDocentesListPage = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const {
    docentes = [],
    loading = false,
    error = null,
    searchText = '',
    setSearchText,
    refetch,
    deleteDocente,
    tablePagination,
  } = useDocentesListContext();

  const listNavState = useMemo(() => docentesListNavigationState(pathname), [pathname]);

  const tableColumns = useMemo(
    () =>
      createDocentesTableColumns({
        navigate,
        listNavState,
        refetch,
        deleteDocente,
      }),
    [navigate, listNavState, refetch, deleteDocente],
  );

  const breadcrumbItems = useMemo(
    () => [{ title: 'Inicio', href: '/' }, { title: 'Docentes' }],
    [],
  );

  const handleNuevoDocente = useCallback(() => {
    navigate('/docentes/registrar', { state: listNavState });
  }, [navigate, listNavState]);

  const handleSearchChange = useCallback(
    (event) => {
      setSearchText(event.target.value);
    },
    [setSearchText],
  );

  return {
    docentes,
    loading,
    error,
    searchText,
    tableColumns,
    breadcrumbItems,
    handleNuevoDocente,
    handleSearchChange,
    tablePagination,
  };
};
