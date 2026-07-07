import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { App } from 'antd';
import { usePermiso } from '@/presentation/hooks/usePermiso.js';
import { usePermisosCatalogo } from '@/application/modules/seguridad/hooks/state/usePermisosCatalogo';
import { useUsuarioPermisos } from '@/application/modules/seguridad/hooks/state/useUsuarioPermisos';

function errMsg(json) {
  const e = json?.error;
  if (json?.error?.details?.length) {
    return json.error.details.map((d) => d.message).join('. ');
  }
  return typeof e === 'string' ? e : e?.message || 'Error';
}

function agruparRol(flat) {
  const m = {};
  (flat || []).forEach((row) => {
    const key = row.dominio || 'GENERAL';
    if (!m[key]) m[key] = [];
    m[key].push(row);
  });
  return Object.entries(m).map(([dominio, items]) => ({ dominio, items }));
}

export const useSeguridadUsuarioPermisosPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const uid = Number.parseInt(id, 10);

  const { permisos_rol, overrides, efectivos, loading, cargar, agregarOverride, eliminarOverride } = useUsuarioPermisos();
  const { cargar: cargarCatalogo } = usePermisosCatalogo();
  const puedeEditar = usePermiso('seguridad.rol.gestionar', 'EDITAR');

  const [payloadUsuario, setPayloadUsuario] = useState(null);
  const [permisoOptions, setPermisoOptions] = useState([]);
  const [catalogoCargado, setCatalogoCargado] = useState(false);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [savingOverride, setSavingOverride] = useState(false);

  const esAdminSistema = useMemo(
    () => Number(payloadUsuario?.rol?.id) === 1 || payloadUsuario?.rol?.codigo === 'ADMIN_SISTEMA',
    [payloadUsuario]
  );

  const loadUsuarioPermisos = useCallback(async () => {
    if (!uid) return;
    try {
      const data = await cargar(uid);
      setPayloadUsuario(data?.usuario ?? null);
    } catch (error) {
      message.error(errMsg(error));
    }
  }, [uid, cargar, message]);

  useEffect(() => {
    loadUsuarioPermisos();
  }, [loadUsuarioPermisos]);

  const cargarOpcionesCatalogo = useCallback(async () => {
    if (catalogoCargado) return;
    const grouped = await cargarCatalogo();
    const opts = [];
    Object.keys(grouped)
      .sort()
      .forEach((dom) => {
        (grouped[dom] || []).forEach((p) => {
          opts.push({
            value: p.id,
            label: `[${dom}] ${p.nombre} (${p.codigo})`,
          });
        });
      });
    setPermisoOptions(opts);
    setCatalogoCargado(true);
  }, [cargarCatalogo, catalogoCargado]);

  useEffect(() => {
    if (!overrideOpen || !puedeEditar) return;
    cargarOpcionesCatalogo().catch((error) => {
      message.error(errMsg(error));
    });
  }, [overrideOpen, puedeEditar, cargarOpcionesCatalogo, message]);

  const rolRows = useMemo(() => agruparRol(permisos_rol), [permisos_rol]);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Seguridad', href: '/seguridad/usuarios' },
      { title: 'Usuarios', href: '/seguridad/usuarios' },
      { title: payloadUsuario?.username || `Usuario ${uid}` },
      { title: 'Permisos' },
    ],
    [payloadUsuario, uid]
  );

  const onAddOverride = useCallback(async (values) => {
    setSavingOverride(true);
    try {
      await agregarOverride(uid, values);
      message.success('Ajuste registrado');
      setOverrideOpen(false);
      await loadUsuarioPermisos();
    } catch (error) {
      message.error(errMsg(error));
    } finally {
      setSavingOverride(false);
    }
  }, [agregarOverride, uid, message, loadUsuarioPermisos]);

  // Nota: sin confirmación ni notificación propias — el diálogo de confirmación y el
  // feedback de éxito/error los resuelve TableActions (useTableActionsDelete), que
  // requiere el contrato { success, error? } como retorno.
  const removeOverride = useCallback(async (overrideId) => {
    try {
      await eliminarOverride(uid, overrideId);
      await loadUsuarioPermisos();
      return { success: true };
    } catch (error) {
      return { success: false, error: errMsg(error) };
    }
  }, [uid, eliminarOverride, loadUsuarioPermisos]);

  return {
    uid,
    loading,
    payloadUsuario,
    rolRows,
    overrides,
    efectivos,
    permisoOptions,
    breadcrumbItems,
    puedeEditar,
    esAdminSistema,
    overrideOpen,
    savingOverride,
    setOverrideOpen,
    onAddOverride,
    removeOverride,
    goToUsuarioDetail: () => navigate(`/seguridad/usuarios/${uid}`),
  };
};
