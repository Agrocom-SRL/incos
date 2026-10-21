/**
 * Provider: lista de horarios de capacitación (CAP) — búsqueda en servidor.
 *
 * Espejo de `ParticipantesListProvider`: ensambla el hook de API con
 * `useServerPaginatedList` (modo loadAll) y publica la mutación de eliminar.
 * Alta/edición viven en páginas propias (`HorarioFormProvider`). Provider
 * DELGADO: solo ensambla.
 */

import { useMemo } from 'react';
import { useHorariosApi } from '@application-capacitacion/grupos/hooks/api/useHorariosApi';
import { useHorarioMutations } from '@application-capacitacion/grupos/hooks/api/useHorarioMutations';
import { useServerPaginatedList } from '@application/utils';
import { HorariosListContext } from '@application-capacitacion/grupos/context/HorariosListContext';

export const HorariosListProvider = ({ children }) => {
  const { fetch: fetchHorarios } = useHorariosApi();
  const { eliminarHorario } = useHorarioMutations();

  const { rows, loading, error, searchText, setSearchText, tablePagination, refetch } =
    useServerPaginatedList({
      fetch: fetchHorarios,
      loadAll: true,
      buildRequest: ({ search }) => ({ params: { search: search || undefined } }),
    });

  const value = useMemo(
    () => ({
      horarios: rows,
      loading,
      error,
      refetch,
      searchText,
      setSearchText,
      tablePagination,
      eliminarHorario,
    }),
    [rows, loading, error, refetch, searchText, setSearchText, tablePagination, eliminarHorario],
  );

  return <HorariosListContext.Provider value={value}>{children}</HorariosListContext.Provider>;
};
