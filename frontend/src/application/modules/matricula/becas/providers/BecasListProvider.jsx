/**
 * Provider: becas asignadas — paginación y búsqueda en servidor.
 *
 * Filtro inicial `scholarshipId` (opcional): llega por querystring cuando se
 * navega desde la ficha de la beca del catálogo maestro
 * (`BecaDescuentoDetailPage` → "Ver asignaciones", `?scholarshipId={id}`).
 */

import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBecasAsignadasApi } from '@application-matricula/becas/hooks/api/useBecasAsignadasApi';
// useDeleteBecaAsignada es compartido (también usado por la ficha de admisión): sigue en la raíz de `estudiantes/`.
import { useDeleteBecaAsignada } from '@application-matricula/admision/hooks/api/useDeleteBecaAsignada';
import { useServerPaginatedList, mapNestedListResponse } from '@application/utils';
import { BecasListContext } from '@application-matricula/becas/context/BecasListContext';

export const BecasListProvider = ({ children }) => {
  const { fetch: fetchBecas } = useBecasAsignadasApi();
  const { deleteBecaAsignada: deleteBecaApi, loading: deleting } = useDeleteBecaAsignada();
  const [searchParams] = useSearchParams();
  const scholarshipId = searchParams.get('scholarshipId') || undefined;

  const {
    rows,
    loading,
    error,
    searchText,
    setSearchText,
    tablePagination,
    refetch,
  } = useServerPaginatedList({
    loadAll: true,
    fetch: fetchBecas,
    mapResponse: (raw) => mapNestedListResponse(raw, 'becas'),
    extra: scholarshipId ? { scholarshipId } : null,
    buildRequest: ({ page, limit, search, extra }) => ({
      params: {
        page,
        limit,
        search: search || undefined,
        ...extra,
      },
    }),
  });

  const deleteBeca = useCallback(
    async (becaId) => {
      const result = await deleteBecaApi(becaId);
      if (result.success) await refetch();
      return result;
    },
    [deleteBecaApi, refetch],
  );

  const value = useMemo(
    () => ({
      becas: rows,
      loading: loading || deleting,
      error,
      refetch,
      deleteBeca,
      searchText,
      setSearchText,
      tablePagination,
    }),
    [rows, loading, deleting, error, refetch, deleteBeca, searchText, setSearchText, tablePagination],
  );

  return <BecasListContext.Provider value={value}>{children}</BecasListContext.Provider>;
};
