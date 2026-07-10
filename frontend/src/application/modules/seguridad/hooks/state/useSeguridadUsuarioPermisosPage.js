import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { App } from 'antd';
import { useCasesFactory } from '@container';
import { usePermiso } from '@/presentation/hooks/usePermiso.js';
import { usePermisosCatalogo } from '@/application/modules/seguridad/hooks/state/usePermisosCatalogo';
import { useUsuarioPermisos } from '@/application/modules/seguridad/hooks/state/useUsuarioPermisos';
import { useUsuarioDetail } from '@/application/modules/seguridad/hooks/state/useUsuarioDetail';
import { resolverPermisoCodigo } from '@/application/modules/seguridad/hooks/state/useRolPermisos';

function errMsg(json) {
  const e = json?.error;
  if (json?.error?.details?.length) {
    return json.error.details.map((d) => d.message).join('. ');
  }
  return typeof e === 'string' ? e : e?.message || 'Error';
}

export const useSeguridadUsuarioPermisosPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const uid = Number.parseInt(id, 10);

  // `permisos_rol`/`efectivos` (listas planas para tablas) ya no se consumen: la grilla
  // de accesos (`grupos`, ver más abajo) reemplaza esas tablas por dominio; solo
  // `overrides` se necesita, para cruzar cada celda con su GRANT/REVOKE.
  const { overrides, loading, cargar, agregarOverride, eliminarOverride } = useUsuarioPermisos();
  // Perfil completo (incluye `estado`, que `findPermisos` no devuelve) para la
  // `DetailProfileCard` de esta página — mismo hook que usa UsuarioDetailPage, sin
  // endpoint nuevo.
  const {
    usuario: usuarioDetalle,
    loading: loadingUsuarioDetalle,
    cargar: cargarUsuarioDetalle,
  } = useUsuarioDetail();
  const { cargar: cargarCatalogo, dominios } = usePermisosCatalogo();
  // Ver la grilla del rol requiere el mismo permiso que RolPermisosPage (LISTAR); editar
  // (crear/eliminar overrides) requiere EDITAR. Coherente con el backend: GET/POST/DELETE
  // `/usuarios/:id/permisos` y `/roles/:id/permisos-grilla` están protegidos con
  // `seguridad.rol.gestionar` (ver docs/referencia/matriz-permisos-sistema.md).
  const puedeVer = usePermiso('seguridad.rol.gestionar', 'LISTAR');
  const puedeEditar = usePermiso('seguridad.rol.gestionar', 'EDITAR');

  const [payloadUsuario, setPayloadUsuario] = useState(null);
  const [codigoToPermisoId, setCodigoToPermisoId] = useState(() => new Map());
  const [catalogoCargado, setCatalogoCargado] = useState(false);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [savingOverride, setSavingOverride] = useState(false);

  const [dominioSeleccionado, setDominioSeleccionado] = useState('MATRICULA');
  const [grupos, setGrupos] = useState([]);
  const [loadingGrupos, setLoadingGrupos] = useState(false);
  // Error explícito de carga de la grilla del dominio (≠ "el dominio no tiene permisos"):
  // sin esto, un fetch fallido cae en el `Empty` genérico del picker y el usuario lo lee
  // como "este dominio no tiene permisos" en vez de "falló la carga".
  const [errorGrupos, setErrorGrupos] = useState(null);
  const [pendingToggle, setPendingToggle] = useState(null);
  // Celda en curso de alta/baja de override (`${grupoUi}:${rutaSidebar}:${accion}`): da
  // feedback LOCAL (spinner/disabled en esa celda) sin tocar el `loading` global de la
  // página — ver `isCeldaToggling` más abajo.
  const [togglingKey, setTogglingKey] = useState(null);

  // Perfil a mostrar: `usuarioDetalle` (GET /usuarios/:id, trae `estado`) manda; mientras
  // no haya cargado, cae al eco de usuario que ya trae `findPermisos` (mismo shape sin
  // `estado`) para no parpadear en blanco.
  const usuario = usuarioDetalle || payloadUsuario;

  const esAdminSistema = useMemo(
    () => Number(usuario?.rol?.id) === 1 || usuario?.rol?.codigo === 'ADMIN_SISTEMA',
    [usuario]
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

  // Recarga SILENCIOSA de `overrides` tras un toggle de celda (alta o baja de un
  // override individual): usa `cargar(uid, { silent: true })`, que actualiza
  // `refreshingOverrides` en vez de `loading` — así la página entera (profile card,
  // Select de dominio, grilla) no se desmonta con un spinner en cada click de celda. El
  // feedback visual de "esta celda está procesando" lo da `togglingKey` (ver `toggleCelda`).
  const refreshOverridesSilencioso = useCallback(async () => {
    if (!uid) return;
    try {
      const data = await cargar(uid, { silent: true });
      setPayloadUsuario(data?.usuario ?? null);
    } catch (error) {
      message.error(errMsg(error));
    }
  }, [uid, cargar, message]);

  const loadUsuarioDetalle = useCallback(async () => {
    if (!uid) return;
    try {
      await cargarUsuarioDetalle(uid);
    } catch (error) {
      message.error(errMsg(error));
    }
  }, [uid, cargarUsuarioDetalle, message]);

  useEffect(() => {
    loadUsuarioPermisos();
    loadUsuarioDetalle();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al montar/cambiar uid
  }, [uid]);

  // Mapa codigo→permiso_id del catálogo completo. Cárgalo tan pronto se conozca el
  // usuario (no solo al abrir un modal) para que la grilla pueda resolver `permiso_id`
  // desde el primer click de toggle.
  const cargarCodigoToPermisoId = useCallback(async () => {
    if (catalogoCargado) return;
    const grouped = await cargarCatalogo();
    const mapaCodigoId = new Map();
    Object.values(grouped || {}).forEach((entries) => {
      (entries || []).forEach((p) => {
        if (p.codigo != null) mapaCodigoId.set(p.codigo, p.id);
      });
    });
    setCodigoToPermisoId(mapaCodigoId);
    setCatalogoCargado(true);
  }, [cargarCatalogo, catalogoCargado]);

  useEffect(() => {
    if (!puedeEditar || !usuario) return;
    cargarCodigoToPermisoId().catch((error) => {
      message.error(errMsg(error));
    });
  }, [puedeEditar, usuario, cargarCodigoToPermisoId, message]);

  // Grilla de acceso resuelto: reusa el MISMO use case que la grilla de un ROL
  // (`obtenerPermisosGrillaRolAdmin`), pasándole el rol del usuario — el acceso base de
  // un usuario ES la grilla de su rol. Sin endpoint nuevo.
  //
  // Extraído a un callback (en vez de vivir solo dentro del `useEffect`) para poder
  // reintentar manualmente desde la UI (`Alert` de error + botón "Reintentar") cuando el
  // fetch falla — un fallo de carga NO es lo mismo que "este dominio no tiene permisos".
  const rolId = usuario?.rol?.id;
  const cargarGrupos = useCallback(
    async ({ signalRef } = {}) => {
      if (!puedeVer || !rolId || !dominioSeleccionado) {
        setGrupos([]);
        setErrorGrupos(null);
        return;
      }
      setLoadingGrupos(true);
      setErrorGrupos(null);
      try {
        const data = await useCasesFactory
          .obtenerPermisosGrillaRolAdmin()
          .ejecutar(rolId, dominioSeleccionado);
        if (signalRef?.cancelado) return;
        setGrupos(Array.isArray(data) ? data : []);
      } catch (error) {
        if (signalRef?.cancelado) return;
        setGrupos([]);
        setErrorGrupos(errMsg(error));
      } finally {
        if (!signalRef?.cancelado) setLoadingGrupos(false);
      }
    },
    [puedeVer, rolId, dominioSeleccionado]
  );

  useEffect(() => {
    const signalRef = { cancelado: false };
    cargarGrupos({ signalRef });
    return () => {
      signalRef.cancelado = true;
    };
  }, [cargarGrupos]);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Seguridad', href: '/seguridad/usuarios' },
      { title: usuario?.username || `Usuario ${uid}`, href: `/seguridad/usuarios/${uid}` },
      { title: 'Accesos' },
    ],
    [usuario, uid]
  );

  // Clave estable de celda (`grupoUi:rutaSidebar:accion`) — misma composición que el
  // `rowKey` de `AccesosUsuarioDominioPicker` + la acción de columna; identifica qué celda
  // concreta está en curso de alta/baja para `togglingKey`.
  const celdaKey = useCallback((grupo, accion) => `${grupo?.grupoUi}:${grupo?.rutaSidebar || ''}:${accion}`, []);

  const onAddOverride = useCallback(async (values) => {
    const key = pendingToggle ? celdaKey(pendingToggle.grupo, pendingToggle.accion) : null;
    setSavingOverride(true);
    if (key) setTogglingKey(key);
    try {
      await agregarOverride(uid, values);
      message.success('Ajuste registrado');
      setOverrideOpen(false);
      setPendingToggle(null);
      await refreshOverridesSilencioso();
    } catch (error) {
      message.error(errMsg(error));
    } finally {
      setSavingOverride(false);
      setTogglingKey(null);
    }
  }, [agregarOverride, uid, message, refreshOverridesSilencioso, pendingToggle, celdaKey]);

  const cerrarModalOverride = useCallback(() => {
    setOverrideOpen(false);
    setPendingToggle(null);
  }, []);

  // Nota: sin confirmación ni notificación propias — el diálogo de confirmación y el
  // feedback de éxito/error los resuelve TableActions (useTableActionsDelete), que
  // requiere el contrato { success, error? } como retorno.
  const removeOverride = useCallback(async (overrideId) => {
    try {
      await eliminarOverride(uid, overrideId);
      await refreshOverridesSilencioso();
      return { success: true };
    } catch (error) {
      return { success: false, error: errMsg(error) };
    }
  }, [uid, eliminarOverride, refreshOverridesSilencioso]);

  // Busca el override (GRANT/REVOKE) vigente para una celda concreta de la grilla,
  // cruzando `grupo.codigos` (candidatos de permiso del grupo) + `accion` contra
  // `resolverPermisoCodigo`, la misma función pura que usa `useRolPermisos`.
  const buscarOverride = useCallback(
    (grupo, accion) => {
      const codigo = resolverPermisoCodigo(grupo.codigos, accion);
      return (overrides || []).find((o) => o.codigo === codigo && o.accion === accion);
    },
    [overrides]
  );

  // Feedback LOCAL de la celda en curso de alta/baja (punto 1 de la auditoría): la grilla
  // consulta esto por celda para deshabilitarla/mostrar un spinner pequeño, sin depender
  // del `loading` global de la página.
  const isCeldaToggling = useCallback(
    (grupo, accion) => Boolean(togglingKey) && togglingKey === celdaKey(grupo, accion),
    [togglingKey, celdaKey]
  );

  // Estado de 3 vías (+ "ninguno") de una celda: override GRANT/REVOKE manda sobre lo
  // heredado del rol; sin override, heredado si el rol ya lo asignaba.
  const estadoCelda = useCallback(
    (grupo, accion) => {
      const override = buscarOverride(grupo, accion);
      if (override) return override.tipo === 'GRANT' ? 'otorgado' : 'revocado';
      return (grupo.accionesAsignadas || []).includes(accion) ? 'heredado' : 'ninguno';
    },
    [buscarOverride]
  );

  // Click en una celda de la grilla:
  // - Si ya hay override → se elimina directo (sin modal); la celda vuelve a heredado/ninguno.
  // - Si no hay override → se abre el modal de motivo con permiso/acción/tipo ya resueltos
  //   (GRANT si el rol no lo daba, REVOKE si el rol ya lo daba) para crear uno nuevo.
  const toggleCelda = useCallback(
    (grupo, accion) => {
      if (!puedeEditar) return;
      const key = celdaKey(grupo, accion);
      if (togglingKey === key) return; // ya en curso: evita doble click sobre la misma celda
      const existente = buscarOverride(grupo, accion);
      if (existente) {
        setTogglingKey(key);
        removeOverride(existente.id).then((res) => {
          setTogglingKey(null);
          if (res.success) message.success('Ajuste eliminado; se restablece el valor heredado del rol');
          else message.error(res.error);
        });
        return;
      }
      const tipo = (grupo.accionesAsignadas || []).includes(accion) ? 'REVOKE' : 'GRANT';
      const codigo = resolverPermisoCodigo(grupo.codigos, accion);
      const permiso_id = codigoToPermisoId.get(codigo);
      if (permiso_id == null) {
        message.error('No se pudo resolver el permiso para esta acción. Verifique el catálogo.');
        return;
      }
      setPendingToggle({
        grupo,
        accion,
        tipo,
        permiso_id,
        // Solo el nombre amigable del grupo (tabla `grupos_ui`) — la ruta de sidebar cruda
        // (con placeholders tipo `:asignacionId`) no aporta al admin y se veía técnica.
        permisoLabel: grupo.grupoNombre || grupo.grupoUi || '',
      });
      setOverrideOpen(true);
    },
    [puedeEditar, buscarOverride, removeOverride, codigoToPermisoId, message, celdaKey, togglingKey]
  );

  return {
    uid,
    loading: loading || loadingUsuarioDetalle,
    usuario,
    overrides,
    breadcrumbItems,
    puedeVer,
    puedeEditar,
    esAdminSistema,
    overrideOpen,
    savingOverride,
    pendingToggle,
    onCloseOverrideModal: cerrarModalOverride,
    onAddOverride,
    removeOverride,
    dominioSeleccionado,
    setDominioSeleccionado,
    dominios,
    grupos,
    loadingGrupos,
    errorGrupos,
    reintentarGrupos: cargarGrupos,
    estadoCelda,
    overrideDeCelda: buscarOverride,
    toggleCelda,
    isCeldaToggling,
    goToUsuarioDetail: () => navigate(`/seguridad/usuarios/${uid}`),
  };
};
