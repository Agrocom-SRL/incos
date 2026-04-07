import { useCallback, useState } from 'react';
import { useCasesFactory } from '@container';

export function useUsuarioPermisos() {
  const [permisos_rol, setPermisosRol] = useState([]);
  const [overrides, setOverrides] = useState([]);
  const [efectivos, setEfectivos] = useState([]);
  const [loading, setLoading] = useState(false);

  const cargar = useCallback(async (id) => {
    setLoading(true);
    try {
      const data = await useCasesFactory.obtenerPermisosUsuarioAdmin().ejecutar(id);
      setPermisosRol(data?.permisos_rol || []);
      setOverrides(data?.overrides || []);
      setEfectivos(data?.efectivos || []);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const agregarOverride = useCallback((usuarioId, data) => useCasesFactory.agregarOverridePermisoAdmin().ejecutar(usuarioId, data), []);
  const eliminarOverride = useCallback((usuarioId, overrideId) => useCasesFactory.eliminarOverridePermisoAdmin().ejecutar(usuarioId, overrideId), []);

  return { permisos_rol, overrides, efectivos, loading, cargar, agregarOverride, eliminarOverride };
}

