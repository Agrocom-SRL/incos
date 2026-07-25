/**
 * Provider: lista de sesiones de reforzamiento (TUT · Acompañamiento).
 *
 * Ensambla el hook de API (A4, vista 161) con `useServerPaginatedList` en
 * modo `loadAll` y la mutación de eliminación (A8). Provider DELGADO.
 */

import { useMemo } from 'react';
import { useSesionesReforzamientoApi } from '@application-tutorias/acompanamiento/sesiones/hooks/api/useSesionesReforzamientoApi';
import { useSesionReforzamientoMutations } from '@application-tutorias/acompanamiento/sesiones/hooks/api/useSesionReforzamientoMutations';
import { useServerPaginatedList } from '@application/utils';
import { SesionesListContext } from '@application-tutorias/acompanamiento/sesiones/context/SesionesListContext';

export const SesionesListProvider = ({ children }) => {
  const { fetch: fetchSesiones } = useSesionesReforzamientoApi();
  const { eliminarSesion } = useSesionReforzamientoMutations();

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
