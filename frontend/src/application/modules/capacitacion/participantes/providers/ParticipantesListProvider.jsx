/**
 * Provider: lista de participantes de capacitación (CAP) — búsqueda en servidor.
 *
 * Espejo de `PagosListProvider`: ensambla el hook de API con
 * `useServerPaginatedList` (modo loadAll: universo pequeño, búsqueda
 * server-side con debounce) y publica la mutación del modal de alta/edición.
 * Provider DELGADO: solo ensambla.
 */

import { useMemo } from 'react';
import { useParticipantesApi } from '@application-capacitacion/participantes/hooks/api/useParticipantesApi';
import { useParticipanteMutations } from '@application-capacitacion/participantes/hooks/api/useParticipanteMutations';
import { useServerPaginatedList } from '@application/utils';
import { ParticipantesListContext } from '@application-capacitacion/participantes/context/ParticipantesListContext';

export const ParticipantesListProvider = ({ children }) => {
  const { fetch: fetchParticipantes } = useParticipantesApi();
  const { saving, guardarParticipante } = useParticipanteMutations();

  const {
    rows,
    loading,
    error,
    searchText,
    setSearchText,
    tablePagination,
    refetch,
  } = useServerPaginatedList({
    fetch: fetchParticipantes,
    loadAll: true,
    buildRequest: ({ page, limit, search }) => ({
      params: { page, limit, search: search || undefined },
    }),
  });

  const value = useMemo(
    () => ({
      participantes: rows,
      loading,
      error,
      refetch,
      searchText,
      setSearchText,
      tablePagination,
      saving,
      guardarParticipante,
    }),
    [
      rows,
      loading,
      error,
      refetch,
      searchText,
      setSearchText,
      tablePagination,
      saving,
      guardarParticipante,
    ],
  );

  return (
    <ParticipantesListContext.Provider value={value}>{children}</ParticipantesListContext.Provider>
  );
};
