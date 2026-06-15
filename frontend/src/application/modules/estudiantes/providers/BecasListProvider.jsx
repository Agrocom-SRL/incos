/**
 * Provider: becas asignadas — paginación y búsqueda en servidor.
 */

import { useCallback, useMemo } from 'react';
import { useBecasAsignadasApi } from '@application-estudiantes/hooks/api/useBecasAsignadasApi';
import { useDeleteBecaAsignada } from '@application-estudiantes/hooks/api/useDeleteBecaAsignada';
import { useServerPaginatedList, mapNestedListResponse } from '@application/utils';
import { BecasListContext } from '@application-estudiantes/context/BecasListContext';

export const BecasListProvider = ({ children }) => {
  const { fetch: fetchBecas } = useBecasAsignadasApi();
  const { deleteBecaAsignada: deleteBecaApi, loading: deleting } = useDeleteBecaAsignada();

  const {
    rows,
    loading,
    error,
    searchText,
    setSearchText,
    tablePagination,
    refetch,
  } = useServerPaginatedList({
    fetch: fetchBecas,
    mapResponse: (raw) => mapNestedListResponse(raw, 'becas'),
    buildRequest: ({ page, limit, search }) => ({
      params: {
        page,
        limit,
        search: search || undefined,
      },
    }),
  });

  const deleteBeca = useCallback(
    async (becaId) => {
      const result = await deleteBecaApi(becaId);
      if (result.success) await refetch();
      return result;
    },
    [deleteBecaApi, refetch],
  );

  const value = useMemo(
    () => ({
      becas: rows,
      loading: loading || deleting,
      error,
      refetch,
      deleteBeca,
      searchText,
      setSearchText,
      tablePagination,
    }),
    [rows, loading, deleting, error, refetch, deleteBeca, searchText, setSearchText, tablePagination],
  );

  return <BecasListContext.Provider value={value}>{children}</BecasListContext.Provider>;
};
