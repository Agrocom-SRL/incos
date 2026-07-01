import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { App } from 'antd';
import { usePermiso } from '@/presentation/hooks/usePermiso.js';
import { useUsuarioDetail } from '@/application/modules/seguridad/hooks/state/useUsuarioDetail';
import { useRolesList } from '@/application/modules/seguridad/hooks/state/useRolesList';

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

  const [savingPass, setSavingPass] = useState(false);
  const [savingAccion, setSavingAccion] = useState(false);
  const [openPass, setOpenPass] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openEstado, setOpenEstado] = useState(false);

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
    setSavingPass(true);
    try {
      await cambiarPassword(uid, passwordNuevo);
      setOpenPass(false);
      message.success('Contraseña actualizada');
    } catch (error) {
      message.error(errMsg(error));
    } finally {
      setSavingPass(false);
    }
  }, [cambiarPassword, uid, message]);

  // Catálogo de roles solo si el usuario puede gestionarlos (evita 403). Si no,
  // el Select del modal cae al rol actual y el PUT lo mantiene sin cambios.
  const openEditModal = useCallback(async () => {
    setOpenEdit(true);
    if (puedeVerPermisos && !roles.length) {
      try {
        await cargarRoles();
      } catch {
        /* silencioso: el Select usa el rol actual como única opción */
      }
    }
  }, [puedeVerPermisos, roles.length, cargarRoles]);

  const saveEdit = useCallback(async (values) => {
    setSavingAccion(true);
    try {
      await actualizar(uid, values);
      setOpenEdit(false);
      message.success('Datos del usuario actualizados');
      await loadUsuario();
    } catch (error) {
      message.error(errMsg(error));
    } finally {
      setSavingAccion(false);
    }
  }, [actualizar, uid, message, loadUsuario]);

  const saveEstado = useCallback(async ({ estado, motivo }) => {
    setSavingAccion(true);
    try {
      await cambiarEstado(uid, estado, motivo);
      setOpenEstado(false);
      message.success('Estado actualizado');
      await loadUsuario();
    } catch (error) {
      message.error(errMsg(error));
    } finally {
      setSavingAccion(false);
    }
  }, [cambiarEstado, uid, message, loadUsuario]);

  const rolesParaSelect = useMemo(() => {
    if (roles?.length) return roles;
    if (usuario?.rol) {
      return [{ id: usuario.rol.id, nombre: usuario.rol.nombre, codigo: usuario.rol.codigo }];
    }
    return [];
  }, [roles, usuario]);

  const editInitialValues = useMemo(
    () => ({
      username: usuario?.username,
      rol_id: usuario?.rol?.id,
      foto_url: usuario?.foto_url || '',
    }),
    [usuario]
  );

  const estadoInitialValues = useMemo(
    () => ({ estado: usuario?.estado ?? null, motivo: usuario?.motivo_cambio_estado ?? '' }),
    [usuario]
  );

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
    savingPass,
    savingAccion,
    openPass,
    openEdit,
    openEstado,
    puedeEditar,
    puedeVerPermisos,
    rolesParaSelect,
    editInitialValues,
    estadoInitialValues,
    breadcrumbItems,
    setOpenPass,
    setOpenEdit,
    setOpenEstado,
    openEditModal,
    savePass,
    saveEdit,
    saveEstado,
    goToUsuarioEdit: () => {
      // Estudiante/Docente: solo credenciales → tab 3 (índice 2). Resto (admin/administrativo): perfil → tab 2 (índice 1).
      const codigo = usuario?.rol?.codigo;
      const editInitialStep = codigo === 'ESTUDIANTE' || codigo === 'DOCENTE' ? 2 : 1;
      navigate(`/seguridad/usuarios/${uid}/editar`, { state: { editInitialStep } });
    },
    goToUsuariosList: () => navigate('/seguridad/usuarios'),
  };
};
