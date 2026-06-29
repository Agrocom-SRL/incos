import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { App } from 'antd';
import { useCasesFactory } from '@container';
import { useServerPaginatedList } from '@application/utils/hooks/useServerPaginatedList.js';
import { createUsuariosTableColumns } from '@modules/seguridad/config/usuariosTableColumns.jsx';
import { USUARIOS_CATEGORIA_DEFAULT } from '@modules/seguridad/config/usuariosCategoriaTabs.jsx';

function errorMessage(error) {
  return error?.error?.message || error?.message || 'Error';
}

export const useSeguridadUsuariosListPage = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();

  // Categoría de rol del tab activo (sistema | estudiante | docente | personal).
  // Vive aquí para que entre al request server-side y refetchee vía `extra`.
  const [categoria, setCategoria] = useState(USUARIOS_CATEGORIA_DEFAULT);

  const fetchUsuarios = useCallback(async ({ page, limit, search, categoria: cat }) => {
    try {
      const data = await useCasesFactory.listarUsuariosAdmin().ejecutar({
        page,
        limit,
        search: search || undefined,
        categoria: cat || undefined,
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

  // `extra` es el canal estable de filtros de useServerPaginatedList: al cambiar
  // su clave (extraKey) refetchea desde la página 1 (cambio de tab de categoría).
  const listExtra = useMemo(() => ({ categoria }), [categoria]);

  const {
    rows: usuarios,
    loading,
    searchText,
    setSearchText,
    tablePagination,
  } = useServerPaginatedList({
    fetch: fetchUsuarios,
    buildRequest: ({ page, limit, search, extra }) => ({
      page,
      limit,
      search,
      categoria: extra?.categoria,
    }),
    extra: listExtra,
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
    categoria,
    setCategoria,
    handleCreateUsuario,
    handleSearchChange,
  };
};
