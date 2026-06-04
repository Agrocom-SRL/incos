/**
 * Provider: lista de docentes — paginación y búsqueda en servidor.
 */

import { useCallback, useMemo } from 'react';
import { useDocentesApi } from '@application-docentes/hooks/api/useDocentesApi';
import { useServerPaginatedList } from '@application/utils';
import { DocentesListContext } from '@application-docentes/context/DocentesListContext';
import docenteRepository from '@implementations/DocenteRepository';

export const DocentesListProvider = ({ children }) => {
  const { fetch: fetchDocentes } = useDocentesApi();

  const {
    rows,
    loading,
    error,
    searchText,
    setSearchText,
    tablePagination,
    refetch,
  } = useServerPaginatedList({
    fetch: fetchDocentes,
    buildRequest: ({ page, limit, search }) => ({
      params: {
        page,
        limit,
        search: search || undefined,
        incluir_estadisticas: 'false',
      },
    }),
  });

  const deleteDocente = useCallback(async (id) => {
    const result = await docenteRepository.eliminar(id);
    if (result?.success) await refetch();
    return result;
  }, [refetch]);

  const value = useMemo(
    () => ({
      docentes: rows,
      loading,
      error,
      refetch,
      searchText,
      setSearchText,
      tablePagination,
      deleteDocente,
    }),
    [rows, loading, error, refetch, searchText, setSearchText, tablePagination, deleteDocente],
  );

  return <DocentesListContext.Provider value={value}>{children}</DocentesListContext.Provider>;
};
