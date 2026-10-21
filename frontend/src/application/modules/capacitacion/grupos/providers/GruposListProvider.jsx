/**
 * Provider: tab «Grupos» de solo lectura (CAP) — búsqueda y filtros en servidor.
 *
 * Espejo de `HorariosListProvider`: ensambla `useGruposApi` con
 * `useServerPaginatedList` (modo loadAll). Los filtros `estado` y `cursoId` son
 * `extra` estable (re-fetch al cambiar); las opciones del filtro «Curso» salen de
 * `useCursosFiltroGrupos`. Provider DELGADO: solo ensambla.
 */

import { useMemo, useState } from 'react';
import { useGruposApi } from '@application-capacitacion/grupos/hooks/api/useGruposApi';
import { useCursosFiltroGrupos } from '@application-capacitacion/grupos/hooks/api/useCursosFiltroGrupos';
import { useServerPaginatedList } from '@application/utils';
import { GruposListContext } from '@application-capacitacion/grupos/context/GruposListContext';

export const GruposListProvider = ({ children }) => {
  const { fetch: fetchGrupos } = useGruposApi();
  const cursosFiltro = useCursosFiltroGrupos();
  const [estado, setEstado] = useState(null);
  const [cursoId, setCursoId] = useState(null);

  const extra = useMemo(
    () => ({ estado: estado ?? undefined, cursoId: cursoId ?? undefined }),
    [estado, cursoId],
  );

  const { rows, loading, error, searchText, setSearchText, tablePagination } =
    useServerPaginatedList({
      fetch: fetchGrupos,
      loadAll: true,
      extra,
      buildRequest: ({ search, extra: filtros }) => ({
        params: { search: search || undefined, ...filtros },
      }),
    });

  const value = useMemo(
    () => ({
      grupos: rows,
      loading,
      error,
      searchText,
      setSearchText,
      tablePagination,
      estado,
      setEstado,
      cursoId,
      setCursoId,
      cursosOptions: cursosFiltro.options,
      loadingCursos: cursosFiltro.loading,
    }),
    [rows, loading, error, searchText, setSearchText, tablePagination, estado, cursoId, cursosFiltro],
  );

  return <GruposListContext.Provider value={value}>{children}</GruposListContext.Provider>;
};
