import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { App } from 'antd';
import { usePermiso } from '@/presentation/hooks/usePermiso.js';
import { useRolesList } from '@/application/modules/seguridad/hooks/state/useRolesList';
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
    actualizar,
    cambiarEstado,
    cambiarPassword,
  } = useUsuarioDetail();
  const { roles, cargar: cargarRoles } = useRolesList();

  const puedeEditar = usePermiso('seguridad.usuario.administrar', 'EDITAR');
  const puedeVerPermisos = usePermiso('seguridad.rol.gestionar', 'LISTAR');

  const [saving, setSaving] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openEstado, setOpenEstado] = useState(false);
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
    const run = async () => {
      await cargarRoles();
    };
    run();
  }, [cargarRoles]);

  useEffect(() => {
    const action = location.state?.quickAction;
    if (!action || !puedeEditar) return;
    if (action === 'edit') setOpenEdit(true);
    if (action === 'estado') setOpenEstado(true);
    if (action === 'password') setOpenPass(true);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate, puedeEditar]);

  const saveBasic = useCallback(async (values) => {
    setSaving(true);
    try {
      await actualizar(uid, values);
      message.success('Actualizado');
      setOpenEdit(false);
      await loadUsuario();
    } catch (error) {
      message.error(errMsg(error));
    } finally {
      setSaving(false);
    }
  }, [actualizar, uid, message, loadUsuario]);

  const saveEstado = useCallback(async (values) => {
    setSaving(true);
    try {
      await cambiarEstado(uid, values.estado, values.motivo);
      message.success('Estado actualizado');
      setOpenEstado(false);
      await loadUsuario();
    } catch (error) {
      message.error(errMsg(error));
    } finally {
      setSaving(false);
    }
  }, [cambiarEstado, uid, message, loadUsuario]);

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
    roles,
    loading,
    saving,
    openEdit,
    openEstado,
    openPass,
    puedeEditar,
    puedeVerPermisos,
    breadcrumbItems,
    setOpenEdit,
    setOpenEstado,
    setOpenPass,
    saveBasic,
    saveEstado,
    savePass,
    goToUsuariosList: () => navigate('/seguridad/usuarios'),
    goToUsuarioPermisos: () => navigate(`/seguridad/usuarios/${uid}/permisos`),
  };
};
