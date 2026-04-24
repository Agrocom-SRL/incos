import { useCallback, useState } from 'react';
import { useCasesFactory } from '@container';

export function useRolesList() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await useCasesFactory.listarRolesAdmin().ejecutar();
      setRoles(data || []);
      return data;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { roles, loading, error, cargar };
}

