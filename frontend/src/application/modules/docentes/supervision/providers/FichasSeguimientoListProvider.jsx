/**
 * Provider: listado de fichas de seguimiento en clase (DOC · Supervisión
 * docente).
 *
 * Ensambla el hook de API (S1, vista 174) con `useServerPaginatedList` en
 * modo `loadAll` (orden/paginado en cliente). Provider DELGADO.
 */

import { useMemo } from 'react';
import { useFichasSeguimientoApi } from '@application-docentes/supervision/hooks/api/useFichasSeguimientoApi';
import { useServerPaginatedList } from '@application/utils';
import { FichasSeguimientoListContext } from '@application-docentes/supervision/context/FichasSeguimientoListContext';

export const FichasSeguimientoListProvider = ({ children }) => {
  const { fetch: fetchFichas } = useFichasSeguimientoApi();

  const { rows, loading, error, searchText, setSearchText, tablePagination, refetch } =
    useServerPaginatedList({
      fetch: fetchFichas,
      loadAll: true,
      buildRequest: ({ page, limit, search }) => ({
        params: { page, limit, search: search || undefined },
      }),
    });

  const value = useMemo(
    () => ({ fichas: rows, loading, error, refetch, searchText, setSearchText, tablePagination }),
    [rows, loading, error, refetch, searchText, setSearchText, tablePagination],
  );

  return (
    <FichasSeguimientoListContext.Provider value={value}>
      {children}
    </FichasSeguimientoListContext.Provider>
  );
};
