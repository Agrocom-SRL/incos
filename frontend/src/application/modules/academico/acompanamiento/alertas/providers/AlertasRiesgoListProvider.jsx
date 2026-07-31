/**
 * Provider: lista institucional de alertas de riesgo (TUT · Acompañamiento).
 *
 * Ensambla el hook de API (A1, vista 156) con `useServerPaginatedList` en
 * modo `loadAll` (filtros carrera/materia en cliente) y el hook del drawer de
 * detalle por estudiante (A3). Provider DELGADO: solo ensambla.
 */

import { useMemo } from 'react';
import { useAlertasRiesgoApi } from '@application-academico/acompanamiento/alertas/hooks/api/useAlertasRiesgoApi';
import { useGetAlertaEstudiante } from '@application-academico/acompanamiento/alertas/hooks/api/useGetAlertaEstudiante';
import { useServerPaginatedList } from '@application/utils';
import { AlertasRiesgoListContext } from '@application-academico/acompanamiento/alertas/context/AlertasRiesgoListContext';

export const AlertasRiesgoListProvider = ({ children }) => {
  const { fetch: fetchAlertas } = useAlertasRiesgoApi();
  const detalleEstudiante = useGetAlertaEstudiante();

  const {
    rows,
    loading,
    error,
    searchText,
    setSearchText,
    tablePagination,
    refetch,
  } = useServerPaginatedList({
    fetch: fetchAlertas,
    loadAll: true,
    buildRequest: ({ page, limit, search }) => ({
      params: { page, limit, search: search || undefined },
    }),
  });

  const value = useMemo(
    () => ({
      alertas: rows,
      loading,
      error,
      refetch,
      searchText,
      setSearchText,
      tablePagination,
      detalleEstudiante,
    }),
    [rows, loading, error, refetch, searchText, setSearchText, tablePagination, detalleEstudiante],
  );

  return (
    <AlertasRiesgoListContext.Provider value={value}>
      {children}
    </AlertasRiesgoListContext.Provider>
  );
};
