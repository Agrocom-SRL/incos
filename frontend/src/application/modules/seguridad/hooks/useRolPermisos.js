import { useCallback, useMemo, useRef, useState } from 'react';
import { useCasesFactory } from '@container';

/** @param {Record<string, Array<{ permiso_id: number, codigo: string, acciones?: string[] }>>} permisosPorDominio */
function flatFromPermisosPorDominio(permisosPorDominio) {
  const flat = [];
  Object.values(permisosPorDominio || {}).forEach((entries) => {
    entries.forEach((e) => {
      (e.acciones || []).forEach((accion) => {
        flat.push({ permiso_id: e.permiso_id, accion });
      });
    });
  });
  return flat;
}

/** @param {Record<string, Array<{ permiso_id: number, codigo: string }>>} permisosPorDominio */
function buildCodigoMap(permisosPorDominio) {
  const m = new Map();
  Object.values(permisosPorDominio || {}).forEach((entries) => {
    entries.forEach((e) => {
      if (e.codigo != null) m.set(e.codigo, e.permiso_id);
    });
  });
  return m;
}

/**
 * @param {string[]} codigos
 * @param {string} accion
 */
export function resolverPermisoCodigo(codigos, accion) {
  if (!codigos?.length) return '';
  const has = (sub) => codigos.find((c) => String(c).includes(sub));
  switch (accion) {
    case 'LISTAR':
    case 'DETALLE':
    case 'EXPORTAR':
      return codigos[0];
    case 'CREAR':
      return has('.crear') || codigos[0];
    case 'EDITAR':
    case 'ELIMINAR':
    case 'ACTIVAR':
      return has('.editar') || codigos[0];
    case 'APROBAR':
      return has('.aprobar') || codigos[0];
    case 'GENERAR_PDF':
      return has('.documento') || codigos[0];
    default:
      return codigos[0];
  }
}

function computeEffective(delta, grupo, accion) {
  const k = `${grupo.grupoUi}:${accion}`;
  if (Object.prototype.hasOwnProperty.call(delta, k)) {
    return delta[k].habilitado;
  }
  return (grupo.accionesAsignadas || []).includes(accion);
}

function mergeAsignaciones(baseFlat, deltaObj, codigoMap) {
  const set = new Set(baseFlat.map((a) => `${a.permiso_id}:${a.accion}`));
  Object.values(deltaObj).forEach((ch) => {
    const pid = codigoMap.get(ch.permiso_codigo);
    if (pid == null) return;
    const k = `${pid}:${ch.accion}`;
    if (ch.habilitado) set.add(k);
    else set.delete(k);
  });
  return [...set].map((item) => {
    const [id, ac] = item.split(':');
    return { permiso_id: Number(id), accion: ac };
  });
}

export function useRolPermisos() {
  const ultimoDominioRef = useRef('MATRICULA');
  const [rol, setRol] = useState(null);
  const [grupos, setGrupos] = useState([]);
  const [baseAsignaciones, setBaseAsignaciones] = useState([]);
  const [codigoToPermisoId, setCodigoToPermisoId] = useState(() => new Map());
  const [delta, setDelta] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const hayaCambios = useMemo(() => Object.keys(delta).length > 0, [delta]);

  const aplicarSnapshotCompleto = useCallback((data) => {
    const ppd = data?.permisos_por_dominio ?? {};
    setRol(data?.rol ?? null);
    setBaseAsignaciones(flatFromPermisosPorDominio(ppd));
    setCodigoToPermisoId(buildCodigoMap(ppd));
  }, []);

  const cargar = useCallback(async (rolId, dominio) => {
    if (!rolId || !dominio) return null;
    ultimoDominioRef.current = dominio;
    setLoading(true);
    setDelta({});
    try {
      const [full, grilla] = await Promise.all([
        useCasesFactory.obtenerPermisosRolAdmin().ejecutar(rolId),
        useCasesFactory.obtenerPermisosGrillaRolAdmin().ejecutar(rolId, dominio),
      ]);
      aplicarSnapshotCompleto(full);
      setGrupos(Array.isArray(grilla) ? grilla : []);
      return { full, grilla };
    } finally {
      setLoading(false);
    }
  }, [aplicarSnapshotCompleto]);

  const obtenerDelta = useCallback(() => Object.values(delta), [delta]);

  const toggleAccion = useCallback((grupo, accion) => {
    const key = `${grupo.grupoUi}:${accion}`;
    setDelta((prev) => {
      const currentEffective = computeEffective(prev, grupo, accion);
      const nuevoValor = !currentEffective;
      const serverHad = (grupo.accionesAsignadas || []).includes(accion);
      const next = { ...prev };
      if (nuevoValor === serverHad) {
        delete next[key];
      } else {
        next[key] = {
          permiso_codigo: resolverPermisoCodigo(grupo.codigos, accion),
          accion,
          habilitado: nuevoValor,
        };
      }
      return next;
    });
  }, []);

  const guardar = useCallback(
    async (rolId) => {
      setSaving(true);
      try {
        const merged = mergeAsignaciones(baseAsignaciones, delta, codigoToPermisoId);
        const data = await useCasesFactory
          .actualizarPermisosRolAdmin()
          .ejecutar(rolId, merged);
        aplicarSnapshotCompleto(data);
        setDelta({});
        const dominio = ultimoDominioRef.current;
        if (dominio && rolId) {
          const grilla = await useCasesFactory
            .obtenerPermisosGrillaRolAdmin()
            .ejecutar(rolId, dominio);
          setGrupos(Array.isArray(grilla) ? grilla : []);
        }
        return data;
      } finally {
        setSaving(false);
      }
    },
    [aplicarSnapshotCompleto, baseAsignaciones, codigoToPermisoId, delta]
  );

  const cancelarCambios = useCallback(() => {
    setDelta({});
  }, []);

  return {
    rol,
    grupos,
    delta,
    loading,
    saving,
    hayaCambios,
    cargar,
    guardar,
    cancelarCambios,
    obtenerDelta,
    toggleAccion,
  };
}
