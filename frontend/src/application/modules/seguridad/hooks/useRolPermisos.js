import { useCallback, useMemo, useState } from 'react';
import { useCasesFactory } from '@container';

export function useRolPermisos() {
  const [rol, setRol] = useState(null);
  const [permisosAgrupados, setPermisosAgrupados] = useState({});
  const [asignaciones, setAsignaciones] = useState([]);
  const [baseAsignaciones, setBaseAsignaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const hayaCambios = useMemo(() => JSON.stringify(asignaciones) !== JSON.stringify(baseAsignaciones), [asignaciones, baseAsignaciones]);

  const cargar = useCallback(async (rolId) => {
    setLoading(true);
    try {
      const data = await useCasesFactory.obtenerPermisosRolAdmin().ejecutar(rolId);
      setRol(data?.rol ?? null);
      setPermisosAgrupados(data?.permisos_por_dominio ?? {});
      const flat = [];
      Object.values(data?.permisos_por_dominio || {}).forEach((entries) => {
        entries.forEach((e) => (e.acciones || []).forEach((accion) => flat.push({ permiso_id: e.permiso_id, accion })));
      });
      setAsignaciones(flat);
      setBaseAsignaciones(flat);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const togglePermiso = useCallback((permisoId, accion, checked) => {
    setAsignaciones((prev) => {
      const key = `${permisoId}:${accion}`;
      const next = new Set(prev.map((a) => `${a.permiso_id}:${a.accion}`));
      if (checked) next.add(key);
      else next.delete(key);
      return [...next].map((item) => {
        const [id, ac] = item.split(':');
        return { permiso_id: Number(id), accion: ac };
      });
    });
  }, []);

  const guardar = useCallback(async (rolId) => {
    setSaving(true);
    try {
      const data = await useCasesFactory.actualizarPermisosRolAdmin().ejecutar(rolId, asignaciones);
      setPermisosAgrupados(data?.permisos_por_dominio ?? {});
      setBaseAsignaciones(asignaciones);
      return data;
    } finally {
      setSaving(false);
    }
  }, [asignaciones]);

  const cancelarCambios = useCallback(() => {
    setAsignaciones(baseAsignaciones);
  }, [baseAsignaciones]);

  return {
    rol,
    permisosAgrupados,
    loading,
    saving,
    hayaCambios,
    asignaciones,
    setAsignaciones,
    cargar,
    togglePermiso,
    guardar,
    cancelarCambios,
  };
}

