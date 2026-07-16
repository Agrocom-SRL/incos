/**
 * Provider: lista de cursos de capacitación (CAP) — búsqueda en servidor.
 *
 * Espejo de `PagosListProvider` (Finanzas): ensambla el hook de API con
 * `useServerPaginatedList` en modo `loadAll` (universo pequeño: orden y
 * paginación en cliente sobre el dataset completo; la búsqueda sigue siendo
 * server-side con debounce) y publica también las mutaciones de la tabla
 * (toggle activo, eliminar). Provider DELGADO: solo ensambla.
 */

import { useMemo } from 'react';
import { useCursosCapacitacionApi } from '@application-capacitacion/cursos/hooks/api/useCursosCapacitacionApi';
import { useCursoCapacitacionMutations } from '@application-capacitacion/cursos/hooks/api/useCursoCapacitacionMutations';
import { useServerPaginatedList } from '@application/utils';
import { CursosCapacitacionListContext } from '@application-capacitacion/cursos/context/CursosCapacitacionListContext';

export const CursosCapacitacionListProvider = ({ children }) => {
  const { fetch: fetchCursos } = useCursosCapacitacionApi();
  const { cambiarEstadoCurso, eliminarCurso } = useCursoCapacitacionMutations();

  const {
    rows,
    loading,
    error,
    searchText,
    setSearchText,
    tablePagination,
    refetch,
  } = useServerPaginatedList({
    fetch: fetchCursos,
    loadAll: true,
    buildRequest: ({ page, limit, search }) => ({
      params: { page, limit, search: search || undefined },
    }),
  });

  const value = useMemo(
    () => ({
      cursos: rows,
      loading,
      error,
      refetch,
      searchText,
      setSearchText,
      tablePagination,
      cambiarEstadoCurso,
      eliminarCurso,
    }),
    [
      rows,
      loading,
      error,
      refetch,
      searchText,
      setSearchText,
      tablePagination,
      cambiarEstadoCurso,
      eliminarCurso,
    ],
  );

  return (
    <CursosCapacitacionListContext.Provider value={value}>
      {children}
    </CursosCapacitacionListContext.Provider>
  );
};
