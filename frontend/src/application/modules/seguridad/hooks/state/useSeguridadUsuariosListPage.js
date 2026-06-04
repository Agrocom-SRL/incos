import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { App } from 'antd';
import { useCasesFactory } from '@container';
import { useServerPaginatedList } from '@application/utils/hooks/useServerPaginatedList.js';
import { createUsuariosTableColumns } from '@modules/seguridad/config/usuariosTableColumns.jsx';

function errorMessage(error) {
  return error?.error?.message || error?.message || 'Error';
}

export const useSeguridadUsuariosListPage = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();

  const fetchUsuarios = useCallback(async ({ page, limit, search }) => {
    try {
      const data = await useCasesFactory.listarUsuariosAdmin().ejecutar({
        page,
        limit,
        search: search || undefined,
      });
      return {
        success: true,
        data: data.users || [],
        pagination: data.pagination ?? {
          page,
          limit,
          total: data.total ?? 0,
        },
      };
    } catch (error) {
      message.error(errorMessage(error));
      return { success: false, error: errorMessage(error), data: [] };
    }
  }, [message]);

  const {
    rows: usuarios,
    loading,
    searchText,
    setSearchText,
    tablePagination,
  } = useServerPaginatedList({
    fetch: fetchUsuarios,
    buildRequest: ({ page, limit, search }) => ({ page, limit, search }),
    initialPageSize: 20,
  });

  const breadcrumbItems = useMemo(
    () => [{ title: 'Inicio', href: '/' }, { title: 'Seguridad' }, { title: 'Usuarios' }],
    [],
  );

  const columns = useMemo(() => createUsuariosTableColumns(navigate), [navigate]);

  const handleCreateUsuario = useCallback(() => {
    navigate('/seguridad/usuarios/nuevo');
  }, [navigate]);

  const handleSearchChange = useCallback(
    (event) => {
      setSearchText(event.target.value);
    },
    [setSearchText],
  );

  return {
    usuarios,
    loading,
    searchText,
    columns,
    breadcrumbItems,
    tablePagination,
    handleCreateUsuario,
    handleSearchChange,
  };
};
