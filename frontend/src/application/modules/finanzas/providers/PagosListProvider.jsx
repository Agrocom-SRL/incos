/**
 * Provider: lista de pagos de aporte (Finanzas) — paginación y búsqueda en servidor.
 *
 * Espejo de `DocentesListProvider`: ensambla el hook de API (`usePagosApi`, sobre
 * la infraestructura compartida) con `useServerPaginatedList`. Provider DELGADO:
 * solo ensambla y publica el contrato; sin lógica de negocio.
 */

import { useMemo } from 'react';
import { usePagosApi } from '@application-finanzas/hooks/api/usePagosApi';
import { useServerPaginatedList } from '@application/utils';
import { PagosListContext } from '@application-finanzas/context/PagosListContext';

export const PagosListProvider = ({ children }) => {
  const { fetch: fetchPagos } = usePagosApi();

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
    buildRequest: ({ page, limit, search, sort }) => ({
      params: {
        page,
        limit,
        search: search || undefined,
        // Orden server-side ya serializado ("campo:ASC"/"campo:DESC"); el backend
        // mapea el campo de vista al ORDER BY (contrato compartido).
        sort: sort || undefined,
      },
    }),
  });

  const value = useMemo(
    () => ({
      pagos: rows,
      loading,
      error,
      refetch,
      searchText,
      setSearchText,
      tablePagination,
    }),
    [rows, loading, error, refetch, searchText, setSearchText, tablePagination],
  );

  return <PagosListContext.Provider value={value}>{children}</PagosListContext.Provider>;
};
