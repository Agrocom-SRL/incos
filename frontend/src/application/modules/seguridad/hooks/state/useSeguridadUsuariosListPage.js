import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { App } from 'antd';
import { useUsuariosList } from '@/application/modules/seguridad/hooks/state/useUsuariosList';
import { createUsuariosTableColumns } from '@modules/seguridad/config/usuariosTableColumns.jsx';

function errorMessage(error) {
  return error?.error?.message || error?.message || 'Error';
}

export const useSeguridadUsuariosListPage = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { usuarios, loading, searchText, setSearchText, pagination, cargar } = useUsuariosList();

  const breadcrumbItems = useMemo(
    () => [{ title: 'Inicio', href: '/' }, { title: 'Seguridad' }, { title: 'Usuarios' }],
    []
  );

  const columns = useMemo(() => createUsuariosTableColumns(navigate), [navigate]);

  const loadUsuarios = useCallback(
    async (page = 1, limit = 20, query = searchText) => {
      try {
        await cargar({ page, limit, search: query || undefined });
      } catch (error) {
        message.error(errorMessage(error));
      }
    },
    [cargar, message, searchText]
  );

  useEffect(() => {
    loadUsuarios(1, pagination.pageSize, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo carga inicial
  }, []);

  const handleCreateUsuario = useCallback(() => {
    navigate('/seguridad/usuarios/nuevo');
  }, [navigate]);

  const handleSearchChange = useCallback((event) => {
    setSearchText(event.target.value);
  }, [setSearchText]);

  const tablePagination = useMemo(
    () => ({
      ...pagination,
      onChange: (page, pageSize) => loadUsuarios(page, pageSize, searchText),
    }),
    [pagination, loadUsuarios, searchText]
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
