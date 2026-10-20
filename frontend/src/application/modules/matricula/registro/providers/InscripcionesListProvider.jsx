/**
 * Provider: listado de matrículas — paginación y búsqueda en servidor (sin cargar todo en RAM).
 */

import { useCallback, useMemo } from 'react';
import { useInscripcionesApi } from '@application-matricula/registro/hooks/api/useInscripcionesApi';
import { useDeleteInscripcion } from '@application-matricula/registro/hooks/api/useDeleteInscripcion';
import { useServerPaginatedList } from '@application/utils';
import { InscripcionesListContext } from '@application-matricula/registro/context/InscripcionesListContext';
import { useMatriculaListFilters } from '@application-matricula/registro/hooks/state/matricula-list/useMatriculaListFilters';

export const InscripcionesListProvider = ({ children }) => {
  const { fetch: fetchInscripciones } = useInscripcionesApi();
  const { deleteInscripcion: deleteInscripcionApi, loading: deleting } = useDeleteInscripcion();

  const {
    filters,
    setFilter,
    clearFilters,
    hasActiveFilters,
    filterOptions,
    paralelosForCarrera,
    tipoInscripcionOptions,
    historialEstadoOptions,
  } = useMatriculaListFilters([]);

  const listQueryExtra = useMemo(
    () => ({
      carrera_id: filters.carreraId ?? undefined,
      paralelo_id: filters.paraleloId ?? undefined,
      periodo_id: filters.periodoId ?? undefined,
      tipo_inscripcion: filters.tipoInscripcion ?? undefined,
      historial_previo_estado: filters.historialPrevioEstado ?? undefined,
    }),
    [filters],
  );

  const {
    rows,
    loading,
    error,
    searchText,
    setSearchText,
    tablePagination,
    refetch,
    pagination,
  } = useServerPaginatedList({
    loadAll: true,
    fetch: fetchInscripciones,
    extra: listQueryExtra,
    buildRequest: ({ page, limit, search, extra }) => ({
      params: {
        page,
        limit,
        search: search || undefined,
        sort: 'fecha_inscripcion:DESC',
        ...extra,
      },
    }),
  });

  const deleteInscripcion = useCallback(
    async (inscripcionId) => {
      const result = await deleteInscripcionApi(inscripcionId);
      if (result.success) await refetch();
      return result;
    },
    [deleteInscripcionApi, refetch],
  );

  const value = useMemo(
    () => ({
      inscripciones: rows,
      loading: loading || deleting,
      error,
      refetch,
      deleteInscripcion,
      searchText,
      setSearchText,
      tablePagination,
      listFilters: filters,
      setListFilter: setFilter,
      clearListFilters: clearFilters,
      hasActiveListFilters: hasActiveFilters,
      listFilterOptions: filterOptions,
      paralelosForCarrera,
      tipoInscripcionOptions,
      historialEstadoOptions,
      totalBeforeFilters: pagination.total,
    }),
    [
      rows,
      loading,
      deleting,
      error,
      refetch,
      deleteInscripcion,
      searchText,
      setSearchText,
      tablePagination,
      filters,
      setFilter,
      clearFilters,
      hasActiveFilters,
      filterOptions,
      paralelosForCarrera,
      tipoInscripcionOptions,
      historialEstadoOptions,
      pagination.total,
    ],
  );

  return <InscripcionesListContext.Provider value={value}>{children}</InscripcionesListContext.Provider>;
};
