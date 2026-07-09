import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { App } from 'antd';
import { useCasesFactory } from '@container';
import { useServerPaginatedList } from '@application/utils/hooks/useServerPaginatedList.js';
import { createUsuariosTableColumns } from '@modules/seguridad/usuarios/config/usuariosTableColumns.jsx';
import { USUARIOS_CATEGORIA_DEFAULT } from '@modules/seguridad/usuarios/config/usuariosCategoriaTabs.jsx';

function errorMessage(error) {
  return error?.error?.message || error?.message || 'Error';
}

export const useSeguridadUsuariosListPage = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();

  // Categoría de rol del tab activo (sistema | estudiante | docente | personal).
  // Vive aquí para que entre al request server-side y refetchee vía `extra`.
  const [categoria, setCategoria] = useState(USUARIOS_CATEGORIA_DEFAULT);

  // Modal "Cambiar estado": acción de fila (ver useSeguridadRolesListPage para el
  // patrón de extraActions). El estado ACTIVO/BLOQUEADO/SUSPENDIDO/RETIRADO con
  // motivo obligatorio no es un toggle simple, por eso vive en un modal disparado
  // desde el listado (ver ficha del usuario para el detalle, ya no dispara aquí).
  const [usuarioEstadoSeleccionado, setUsuarioEstadoSeleccionado] = useState(null);
  const [openEstado, setOpenEstado] = useState(false);
  const [savingEstado, setSavingEstado] = useState(false);

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
    refetch,
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

  const eliminarUsuario = useCallback(
    (id) => useCasesFactory.eliminarUsuarioAdmin().ejecutar(id),
    [],
  );

  const abrirCambiarEstado = useCallback((record) => {
    setUsuarioEstadoSeleccionado(record);
    setOpenEstado(true);
  }, []);

  const estadoInitialValues = useMemo(
    () => ({
      estado: usuarioEstadoSeleccionado?.estado ?? null,
      motivo: usuarioEstadoSeleccionado?.motivo_cambio_estado ?? '',
    }),
    [usuarioEstadoSeleccionado],
  );

  const saveEstado = useCallback(async ({ estado, motivo }) => {
    if (!usuarioEstadoSeleccionado?.id) return;
    setSavingEstado(true);
    try {
      await useCasesFactory
        .cambiarEstadoUsuarioAdmin()
        .ejecutar(usuarioEstadoSeleccionado.id, estado, motivo);
      setOpenEstado(false);
      message.success('Estado actualizado');
      await refetch();
    } catch (error) {
      message.error(errorMessage(error));
    } finally {
      setSavingEstado(false);
    }
  }, [usuarioEstadoSeleccionado, message, refetch]);

  const columns = useMemo(
    () => createUsuariosTableColumns(navigate, { eliminarUsuario, refetch, onCambiarEstado: abrirCambiarEstado }),
    [navigate, eliminarUsuario, refetch, abrirCambiarEstado],
  );

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
    openEstado,
    setOpenEstado,
    savingEstado,
    estadoInitialValues,
    saveEstado,
  };
};
