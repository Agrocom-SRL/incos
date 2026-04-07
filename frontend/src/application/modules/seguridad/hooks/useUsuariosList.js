import { useCallback, useState } from 'react';
import { useCasesFactory } from '@container';

export function useUsuariosList() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });

  const cargar = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await useCasesFactory.listarUsuariosAdmin().ejecutar(params);
      setUsuarios(data.users || []);
      setPagination({
        current: data.pagination?.page ?? params.page ?? 1,
        pageSize: data.pagination?.limit ?? params.limit ?? 20,
        total: data.total ?? 0,
      });
      return data;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { usuarios, loading, error, searchText, setSearchText, pagination, cargar };
}

