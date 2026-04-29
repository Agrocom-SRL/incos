import { useCallback, useState } from 'react';
import { useCasesFactory } from '@container';

export function useUsuarioDetail() {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await useCasesFactory.obtenerUsuarioAdmin().ejecutar(id);
      setUsuario(data);
      return data;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const crear = useCallback((data) => useCasesFactory.crearUsuarioAdmin().ejecutar(data), []);
  const actualizar = useCallback((id, data) => useCasesFactory.actualizarUsuarioAdmin().ejecutar(id, data), []);
  const cambiarEstado = useCallback((id, estado, motivo) => useCasesFactory.cambiarEstadoUsuarioAdmin().ejecutar(id, estado, motivo), []);
  const cambiarPassword = useCallback((id, passwordNuevo) => useCasesFactory.cambiarPasswordUsuarioAdmin().ejecutar(id, passwordNuevo), []);

  return { usuario, loading, error, cargar, crear, actualizar, cambiarEstado, cambiarPassword };
}
