import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { App } from 'antd';
import { usePermiso } from '@/presentation/hooks/usePermiso.js';
import { useUsuarioDetail } from '@/application/modules/seguridad/hooks/state/useUsuarioDetail';

function errMsg(json) {
  const e = json?.error;
  if (json?.error?.details?.length) {
    return json.error.details.map((d) => d.message).join('. ');
  }
  return typeof e === 'string' ? e : e?.message || 'Error';
}

export const useSeguridadUsuarioDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { message } = App.useApp();

  const {
    usuario,
    loading,
    cargar,
    cambiarPassword,
  } = useUsuarioDetail();

  const puedeEditar = usePermiso('seguridad.usuario.administrar', 'EDITAR');
  const puedeVerPermisos = usePermiso('seguridad.rol.gestionar', 'LISTAR');

  const [saving, setSaving] = useState(false);
  const [openPass, setOpenPass] = useState(false);

  const uid = Number.parseInt(id, 10);

  const loadUsuario = useCallback(async () => {
    if (!uid) return;
    try {
      await cargar(uid);
    } catch (error) {
      message.error(errMsg(error));
    }
  }, [uid, cargar, message]);

  useEffect(() => {
    loadUsuario();
  }, [loadUsuario]);

  useEffect(() => {
    const action = location.state?.quickAction;
    if (!action || !puedeEditar) return;
    if (action === 'password') setOpenPass(true);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate, puedeEditar]);

  const savePass = useCallback(async (passwordNuevo) => {
    setSaving(true);
    try {
      await cambiarPassword(uid, passwordNuevo);
      setOpenPass(false);
      message.success('Contraseña actualizada');
    } catch (error) {
      message.error(errMsg(error));
    } finally {
      setSaving(false);
    }
  }, [cambiarPassword, uid, message]);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Seguridad', href: '/seguridad/usuarios' },
      { title: 'Usuarios', href: '/seguridad/usuarios' },
      { title: usuario?.username || `Usuario ${uid}` },
    ],
    [usuario, uid]
  );

  return {
    uid,
    usuario,
    loading,
    saving,
    openPass,
    puedeEditar,
    puedeVerPermisos,
    breadcrumbItems,
    setOpenPass,
    savePass,
    goToUsuarioEdit: () =>
      navigate(`/seguridad/usuarios/${uid}/editar`, {
        state:
          usuario?.rol?.codigo === 'ADMIN_SISTEMA'
            ? { editInitialStep: 1 }
            : undefined,
      }),
    goToUsuariosList: () => navigate('/seguridad/usuarios'),
    goToUsuarioPermisos: () => navigate(`/seguridad/usuarios/${uid}/permisos`),
  };
};
