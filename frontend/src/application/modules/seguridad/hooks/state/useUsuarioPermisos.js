import { useCallback, useState } from 'react';
import { useCasesFactory } from '@container';

export function useUsuarioPermisos() {
  const [permisos_rol, setPermisosRol] = useState([]);
  const [overrides, setOverrides] = useState([]);
  const [efectivos, setEfectivos] = useState([]);
  const [loading, setLoading] = useState(false);
  // Recarga en segundo plano (post-toggle de una celda de override): NO debe alimentar
  // `loading`, porque `loading` maneja el spinner de página completa (`DetailPageShell`
  // en `UsuarioAccesosPage`) y un click de celda solo debe dar feedback LOCAL en esa celda.
  const [refreshingOverrides, setRefreshingOverrides] = useState(false);

  const cargar = useCallback(async (id, { silent = false } = {}) => {
    if (silent) setRefreshingOverrides(true);
    else setLoading(true);
    try {
      const data = await useCasesFactory.obtenerPermisosUsuarioAdmin().ejecutar(id);
      setPermisosRol(data?.permisos_rol || []);
      setOverrides(data?.overrides || []);
      setEfectivos(data?.efectivos || []);
      return data;
    } finally {
      if (silent) setRefreshingOverrides(false);
      else setLoading(false);
    }
  }, []);

  const agregarOverride = useCallback((usuarioId, data) => useCasesFactory.agregarOverridePermisoAdmin().ejecutar(usuarioId, data), []);
  const eliminarOverride = useCallback((usuarioId, overrideId) => useCasesFactory.eliminarOverridePermisoAdmin().ejecutar(usuarioId, overrideId), []);

  return { permisos_rol, overrides, efectivos, loading, refreshingOverrides, cargar, agregarOverride, eliminarOverride };
}
