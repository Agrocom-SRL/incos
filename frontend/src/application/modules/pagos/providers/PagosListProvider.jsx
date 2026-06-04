/**
 * Provider: lista de pagos — paginación y búsqueda en servidor.
 */

import { useCallback, useMemo } from 'react';
import { usePagosApi, useDeletePagoAporte } from '@application-pagos/hooks';
import { useServerPaginatedList } from '@application/utils';
import { PagosListContext } from '@application-pagos/context/PagosListContext';

export const PagosListProvider = ({ children }) => {
  const { fetch: fetchPagos } = usePagosApi();
  const { deletePagoAporte, loading: deleting } = useDeletePagoAporte();

  const {
    rows,
    loading,
    error,
    searchText,
    setSearchText,
    tablePagination,
    refetch,
  } = useServerPaginatedList({
    fetch: fetchPagos,
    buildRequest: ({ page, limit, search }) => ({
      params: {
        page,
        limit,
        search: search || undefined,
        sort: 'fecha_pago:DESC',
      },
    }),
  });

  const deletePago = useCallback(
    async (pagoId) => {
      const result = await deletePagoAporte(pagoId);
      if (result.success) await refetch();
      return result;
    },
    [deletePagoAporte, refetch],
  );

  const value = useMemo(
    () => ({
      pagos: rows,
      loading: loading || deleting,
      error,
      refetch,
      deletePago,
      searchText,
      setSearchText,
      tablePagination,
    }),
    [rows, loading, deleting, error, refetch, deletePago, searchText, setSearchText, tablePagination],
  );

  return <PagosListContext.Provider value={value}>{children}</PagosListContext.Provider>;
};
