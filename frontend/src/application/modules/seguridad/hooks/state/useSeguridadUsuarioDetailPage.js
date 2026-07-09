import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { App } from 'antd';
import { useCasesFactory } from '@container';
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
    cambiarEstado,
    cambiarPassword,
  } = useUsuarioDetail();

  const puedeEditar = usePermiso('seguridad.usuario.administrar', 'EDITAR');
  const puedeVerPermisos = usePermiso('seguridad.rol.gestionar', 'LISTAR');

  const [savingPass, setSavingPass] = useState(false);
  const [savingEstado, setSavingEstado] = useState(false);
  const [openPass, setOpenPass] = useState(false);
  const [openEstado, setOpenEstado] = useState(false);
  const [permisosEfectivosCount, setPermisosEfectivosCount] = useState(0);

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

  // Carga liviana (solo el conteo) para el stat "Permisos efectivos" de la
  // ficha. No trae la grilla completa de permisos_rol/overrides: eso vive en
  // la página de accesos a la que enlaza el botón "Ver accesos".
  useEffect(() => {
    if (!uid || !puedeVerPermisos) {
      setPermisosEfectivosCount(0);
      return;
    }
    let activo = true;
    (async () => {
      try {
        const data = await useCasesFactory.obtenerPermisosUsuarioAdmin().ejecutar(uid);
        if (activo) setPermisosEfectivosCount((data?.efectivos || []).length);
      } catch {
        /* silencioso: el stat cae a 0 si falla esta carga secundaria */
      }
    })();
    return () => {
      activo = false;
    };
  }, [uid, puedeVerPermisos]);

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

  // "Cambiar estado" vive en la ficha (no en el listado): estado es un ENUM de
  // negocio NULL(=activo)|BLOQUEADO|SUSPENDIDO|RETIRADO con motivo obligatorio
  // para los 3 valores restrictivos, no un toggle simple (ver CambiarEstadoUsuarioUseCase).
  const estadoInitialValues = useMemo(
    () => ({
      estado: usuario?.estado ?? null,
      motivo: usuario?.motivo_cambio_estado ?? '',
    }),
    [usuario],
  );

  const saveEstado = useCallback(async ({ estado, motivo }) => {
    if (!uid) return;
    setSavingEstado(true);
    try {
      await cambiarEstado(uid, estado, motivo);
      setOpenEstado(false);
      message.success('Estado actualizado');
      await loadUsuario();
    } catch (error) {
      message.error(errMsg(error));
    } finally {
      setSavingEstado(false);
    }
  }, [cambiarEstado, uid, message, loadUsuario]);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Seguridad', href: '/seguridad/usuarios' },
      { title: usuario?.username || `Usuario ${uid}` },
    ],
    [usuario, uid]
  );

  return {
    uid,
    usuario,
    loading,
    savingPass,
    savingEstado,
    openPass,
    openEstado,
    puedeEditar,
    puedeVerPermisos,
    permisosEfectivosCount,
    estadoInitialValues,
    breadcrumbItems,
    setOpenPass,
    setOpenEstado,
    savePass,
    saveEstado,
    goToUsuarioEdit: () => {
      // Estudiante/Docente: solo credenciales → tab 3 (índice 2). Resto (admin/administrativo): perfil → tab 2 (índice 1).
      const codigo = usuario?.rol?.codigo;
      const editInitialStep = codigo === 'ESTUDIANTE' || codigo === 'DOCENTE' ? 2 : 1;
      navigate(`/seguridad/usuarios/${uid}/editar`, { state: { editInitialStep } });
    },
    goToUsuarioPermisos: () => navigate(`/seguridad/usuarios/${uid}/permisos`),
    goToUsuariosList: () => navigate('/seguridad/usuarios'),
  };
};
