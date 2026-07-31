/**
 * Provider: lista de sesiones de refuerzo (TUT · Acompañamiento).
 *
 * Ensambla el hook de API (A4, vista 161) con `useServerPaginatedList` en
 * modo `loadAll` y la mutación de eliminación (A8). Provider DELGADO.
 */

import { useMemo } from 'react';
import { useSesionesRefuerzoApi } from '@application-academico/acompanamiento/sesiones/hooks/api/useSesionesRefuerzoApi';
import { useSesionRefuerzoMutations } from '@application-academico/acompanamiento/sesiones/hooks/api/useSesionRefuerzoMutations';
import { useServerPaginatedList } from '@application/utils';
import { SesionesListContext } from '@application-academico/acompanamiento/sesiones/context/SesionesListContext';

export const SesionesListProvider = ({ children }) => {
  const { fetch: fetchSesiones } = useSesionesRefuerzoApi();
  const { eliminarSesion } = useSesionRefuerzoMutations();

  const {
    rows,
    loading,
    error,
    searchText,
    setSearchText,
    tablePagination,
    refetch,
  } = useServerPaginatedList({
    fetch: fetchSesiones,
    loadAll: true,
    buildRequest: ({ page, limit, search }) => ({
      params: { page, limit, search: search || undefined },
    }),
  });

  const value = useMemo(
    () => ({
      sesiones: rows,
      loading,
      error,
      refetch,
      searchText,
      setSearchText,
      tablePagination,
      eliminarSesion,
    }),
    [rows, loading, error, refetch, searchText, setSearchText, tablePagination, eliminarSesion],
  );

  return <SesionesListContext.Provider value={value}>{children}</SesionesListContext.Provider>;
};
