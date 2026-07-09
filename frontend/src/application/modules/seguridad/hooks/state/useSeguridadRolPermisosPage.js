import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { App } from 'antd';
import { usePermisosCatalogo } from '@/application/modules/seguridad/hooks/state/usePermisosCatalogo';
import { useRolPermisos } from '@/application/modules/seguridad/hooks/state/useRolPermisos';

function errMsg(json) {
  const e = json?.error;
  if (json?.error?.details?.length) {
    return json.error.details.map((d) => d.message).join('. ');
  }
  return typeof e === 'string' ? e : e?.message || 'Error';
}

export const useSeguridadRolPermisosPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const rolId = Number.parseInt(id, 10);
  const [dominioSeleccionado, setDominioSeleccionado] = useState('MATRICULA');
  const { dominios } = usePermisosCatalogo();
  const {
    rol: rolInfo,
    grupos,
    delta,
    loading,
    loadingGrupos,
    saving,
    hayaCambios: hasChanges,
    cargar,
    guardar,
    cancelarCambios,
    toggleAccion,
  } = useRolPermisos();

  const esAdminSistema = rolInfo?.id === 1 || rolInfo?.codigo === 'ADMIN_SISTEMA';

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Seguridad', href: '/seguridad/roles' },
      { title: 'Roles', href: '/seguridad/roles' },
      { title: rolInfo?.nombre || 'Permisos de Rol' },
    ],
    [rolInfo]
  );

  useEffect(() => {
    if (!rolId) return;
    (async () => {
      try {
        await cargar(rolId, dominioSeleccionado);
      } catch (e) {
        message.error(errMsg(e));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- message estable de App.useApp()
  }, [rolId, dominioSeleccionado, cargar]);

  const guardarCambios = useCallback(async () => {
    try {
      await guardar(rolId);
      message.success('Permisos guardados');
    } catch (e) {
      message.error(errMsg(e));
    }
  }, [guardar, rolId, message]);

  const goToRolesList = useCallback(() => {
    navigate('/seguridad/roles');
  }, [navigate]);

  return {
    rolId,
    rolInfo,
    grupos,
    delta,
    dominios,
    loading,
    loadingGrupos,
    saving,
    hasChanges,
    esAdminSistema,
    dominioSeleccionado,
    breadcrumbItems,
    setDominioSeleccionado,
    toggleAccion,
    guardarCambios,
    cancelarCambios,
    goToRolesList,
  };
};
