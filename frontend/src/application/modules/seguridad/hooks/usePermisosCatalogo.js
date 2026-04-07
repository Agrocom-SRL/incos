import { useCallback, useState } from 'react';
import { useCasesFactory } from '@container';

export function usePermisosCatalogo() {
  const [permisosAgrupados, setPermisosAgrupados] = useState({});
  const [loading, setLoading] = useState(false);

  const cargar = useCallback(async (dominio) => {
    setLoading(true);
    try {
      const data = await useCasesFactory.listarPermisosAdmin().ejecutar(dominio);
      setPermisosAgrupados(data || {});
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  return { permisosAgrupados, loading, cargar };
}

