import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { App } from 'antd';
import { useCasesFactory } from '@container';
import { usePermiso } from '@/presentation/hooks/usePermiso.js';
import { useServerPaginatedList } from '@application/utils/hooks/useServerPaginatedList.js';
import { useRolDetail } from '@/application/modules/seguridad/hooks/state/useRolDetail';

function errMsg(json) {
  const e = json?.error;
  if (json?.error?.details?.length) {
    return json.error.details.map((d) => d.message).join('. ');
  }
  return typeof e === 'string' ? e : e?.message || 'Error';
}

/**
 * Ficha de detalle de un rol (solo lectura): datos básicos + cantidad de
 * permisos (tab Información) y usuarios que tienen ese rol, paginados
 * server-side (tab Usuarios). El editor de permisos (`RolPermisosPage`) es
 * una pantalla aparte, gestionada desde el botón "Gestionar permisos".
 */
export const useSeguridadRolDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { message } = App.useApp();

  const rolId = Number.parseInt(id, 10);

  const { rol, loading, cargar } = useRolDetail();

  // Ver el detalle no habilita editar permisos: el botón "Gestionar permisos"
  // exige EDITAR, el mismo permiso que gatea RolPermisosPage.
  const puedeGestionarPermisos = usePermiso('seguridad.rol.gestionar', 'EDITAR');

  useEffect(() => {
    if (!rolId) return;
    cargar(rolId).catch((error) => message.error(errMsg(error)));
  }, [rolId, cargar, message]);

  const fetchUsuarios = useCallback(
    async ({ page, limit, search }) => {
      try {
        const data = await useCasesFactory.listarUsuariosPorRolAdmin().ejecutar(rolId, {
          page,
          limit,
          search: search || undefined,
        });
        return {
          success: true,
          data: data.usuarios || [],
          pagination: data.pagination ?? { page, limit, total: data.total ?? 0 },
        };
      } catch (error) {
        message.error(errMsg(error));
        return { success: false, error: errMsg(error), data: [] };
      }
    },
    [rolId, message]
  );

  const {
    rows: usuarios,
    loading: loadingUsuarios,
    error: errorUsuarios,
    searchText,
    setSearchText,
    tablePagination,
    refetch: refetchUsuarios,
  } = useServerPaginatedList({
    fetch: fetchUsuarios,
    buildRequest: ({ page, limit, search }) => ({ page, limit, search }),
    enabled: Boolean(rolId),
    initialPageSize: 20,
  });

  const handleSearchChange = useCallback(
    (event) => setSearchText(event.target.value),
    [setSearchText]
  );

  // Breadcrumb de 4 niveles sin duplicar: cada nivel apunta a algo distinto
  // (landing de Seguridad ≠ listado de Roles ≠ ficha actual, sin href).
  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Seguridad', href: '/seguridad' },
      { title: 'Roles', href: '/seguridad/roles' },
      { title: rol?.nombre || `Rol ${rolId}` },
    ],
    [rol, rolId]
  );

  const goToRolesList = useCallback(() => navigate('/seguridad/roles'), [navigate]);

  const goToUsuarioDetail = useCallback(
    (usuarioId) => navigate(`/seguridad/usuarios/${usuarioId}`),
    [navigate]
  );

  const goToGestionarPermisos = useCallback(
    () => navigate(`/seguridad/roles/${rolId}/permisos`),
    [navigate, rolId]
  );

  return {
    rolId,
    rol,
    loading,
    breadcrumbItems,
    puedeGestionarPermisos,
    usuarios,
    loadingUsuarios,
    errorUsuarios,
    refetchUsuarios,
    searchText,
    handleSearchChange,
    tablePagination,
    goToRolesList,
    goToUsuarioDetail,
    goToGestionarPermisos,
  };
};
