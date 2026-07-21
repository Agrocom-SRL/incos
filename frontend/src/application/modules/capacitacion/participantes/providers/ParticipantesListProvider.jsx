/**
 * Provider: lista de participantes de capacitación (CAP) — búsqueda en servidor.
 *
 * Espejo de `PagosListProvider`: ensambla el hook de API con
 * `useServerPaginatedList` (modo loadAll: universo pequeño, búsqueda
 * server-side con debounce). Alta/edición viven en páginas propias
 * (`ParticipanteFormProvider`), no en este provider. Provider DELGADO: solo
 * ensambla.
 */

import { useMemo } from 'react';
import { useParticipantesApi } from '@application-capacitacion/participantes/hooks/api/useParticipantesApi';
import { useServerPaginatedList } from '@application/utils';
import { ParticipantesListContext } from '@application-capacitacion/participantes/context/ParticipantesListContext';

export const ParticipantesListProvider = ({ children }) => {
  const { fetch: fetchParticipantes } = useParticipantesApi();

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
    }),
    [rows, loading, error, refetch, searchText, setSearchText, tablePagination],
  );

  return (
    <ParticipantesListContext.Provider value={value}>{children}</ParticipantesListContext.Provider>
  );
};
