/**
 * Provider: lista de trámites de pasantía (TIT · Pasantías).
 *
 * Espejo de `ProyectosGradoListProvider` (TIT · Titulación): ensambla el hook
 * de API con `useServerPaginatedList` en modo `loadAll` (universo pequeño:
 * orden, filtros y paginación en cliente; búsqueda server-side con debounce)
 * y publica la mutación de la tabla (eliminar). Provider DELGADO: solo
 * ensambla.
 */

import { useMemo } from 'react';
import { usePasantiasApi } from '@application-titulacion/pasantias/hooks/api/usePasantiasApi';
import { usePasantiaMutations } from '@application-titulacion/pasantias/hooks/api/usePasantiaMutations';
import { useServerPaginatedList } from '@application/utils';
import { PasantiasListContext } from '@application-titulacion/pasantias/context/PasantiasListContext';

export const PasantiasListProvider = ({ children }) => {
  const { fetch: fetchPasantias } = usePasantiasApi();
  const { eliminarPasantia } = usePasantiaMutations();

  const {
    rows,
    loading,
    error,
    searchText,
    setSearchText,
    tablePagination,
    refetch,
  } = useServerPaginatedList({
    fetch: fetchPasantias,
    loadAll: true,
    buildRequest: ({ page, limit, search }) => ({
      params: { page, limit, search: search || undefined },
    }),
  });

  const value = useMemo(
    () => ({
      pasantias: rows,
      loading,
      error,
      refetch,
      searchText,
      setSearchText,
      tablePagination,
      eliminarPasantia,
    }),
    [rows, loading, error, refetch, searchText, setSearchText, tablePagination, eliminarPasantia],
  );

  return <PasantiasListContext.Provider value={value}>{children}</PasantiasListContext.Provider>;
};
