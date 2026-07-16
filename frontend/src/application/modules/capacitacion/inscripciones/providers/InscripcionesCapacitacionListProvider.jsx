/**
 * Provider: lista de inscripciones de capacitación (CAP) — búsqueda en servidor.
 *
 * Espejo de `PagosListProvider`: ensambla el hook de API con
 * `useServerPaginatedList` (modo loadAll) y publica la mutación de eliminación
 * de la tabla. Provider DELGADO: solo ensambla.
 */

import { useMemo } from 'react';
import { useInscripcionesCapacitacionApi } from '@application-capacitacion/inscripciones/hooks/api/useInscripcionesCapacitacionApi';
import { useInscripcionCapacitacionMutations } from '@application-capacitacion/inscripciones/hooks/api/useInscripcionCapacitacionMutations';
import { useServerPaginatedList } from '@application/utils';
import { InscripcionesCapacitacionListContext } from '@application-capacitacion/inscripciones/context/InscripcionesCapacitacionListContext';

export const InscripcionesCapacitacionListProvider = ({ children }) => {
  const { fetch: fetchInscripciones } = useInscripcionesCapacitacionApi();
  const { eliminarInscripcion } = useInscripcionCapacitacionMutations();

  const {
    rows,
    loading,
    error,
    searchText,
    setSearchText,
    tablePagination,
    refetch,
  } = useServerPaginatedList({
    fetch: fetchInscripciones,
    loadAll: true,
    buildRequest: ({ page, limit, search }) => ({
      params: { page, limit, search: search || undefined },
    }),
  });

  const value = useMemo(
    () => ({
      inscripciones: rows,
      loading,
      error,
      refetch,
      searchText,
      setSearchText,
      tablePagination,
      eliminarInscripcion,
    }),
    [rows, loading, error, refetch, searchText, setSearchText, tablePagination, eliminarInscripcion],
  );

  return (
    <InscripcionesCapacitacionListContext.Provider value={value}>
      {children}
    </InscripcionesCapacitacionListContext.Provider>
  );
};
