import { useCallback, useState } from 'react';
import { useCasesFactory } from '@container';

/** Ficha de detalle de un rol (solo lectura): datos básicos + cantidad de permisos. */
export function useRolDetail() {
  const [rol, setRol] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await useCasesFactory.obtenerRolAdmin().ejecutar(id);
      setRol(data);
      return data;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { rol, loading, error, cargar };
}
