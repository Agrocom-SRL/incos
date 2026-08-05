/**
 * Provider: Registro de ingresos unificado (Finanzas) — paginación, búsqueda y
 * orden en servidor.
 *
 * Espejo de `PagosListProvider` (histórico, cabeceras por estudiante): ensambla
 * el hook de API (`useIngresosApi`) con `useServerPaginatedList`. Provider
 * DELGADO: solo ensambla y publica el contrato; sin lógica de negocio.
 */

import { useMemo } from 'react';
import { useIngresosApi } from '@application-finanzas/hooks/api/useIngresosApi';
import { useServerPaginatedList } from '@application/utils';
import { IngresosListContext } from '@application-finanzas/context/IngresosListContext';

export const IngresosListProvider = ({ children }) => {
  const { fetch: fetchIngresos } = useIngresosApi();

  const { rows, loading, error, searchText, setSearchText, tablePagination, refetch } =
    useServerPaginatedList({
      fetch: fetchIngresos,
      buildRequest: ({ page, limit, search, sort }) => ({
        params: {
          page,
          limit,
          search: search || undefined,
          // Orden server-side ya serializado ("campo:ASC"/"campo:DESC"); el backend
          // mapea el campo de la vista al ORDER BY (contrato compartido).
          sort: sort || undefined,
        },
      }),
    });

  const value = useMemo(
    () => ({
      ingresos: rows,
      loading,
      error,
      refetch,
      searchText,
      setSearchText,
      tablePagination,
    }),
    [rows, loading, error, refetch, searchText, setSearchText, tablePagination],
  );

  return <IngresosListContext.Provider value={value}>{children}</IngresosListContext.Provider>;
};

export default IngresosListProvider;
