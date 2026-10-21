/**
 * Hook de pantalla: tab «Horarios» de Grupos (CAP · LISTAR).
 *
 * Espejo de `useParticipantesListPage` + eliminar de `useCursosCapacitacionListPage`:
 * columnas y búsqueda. El alta la dispara el header del tab (`useGruposPage`);
 * la edición navega a su página completa (`/grupos/horarios/:id/editar`).
 * `deleteFn` de TableActions devuelve el motivo del backend (409 si algún
 * curso lo usa).
 */

import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHorariosListContext } from '@application-capacitacion/grupos/hooks/context/useHorariosListContext';
import { createHorariosTableColumns } from '@capacitacion/grupos/config/horariosTableColumns';
import { horariosNavigationState } from '@application-capacitacion/grupos/config/gruposNavigation';
import { horarioCapEditarPath } from '@application-capacitacion/config/paths';

export const useHorariosListPage = () => {
  const navigate = useNavigate();

  const {
    horarios = [],
    loading = false,
    error = null,
    searchText = '',
    setSearchText,
    tablePagination,
    refetch,
    eliminarHorario,
  } = useHorariosListContext();

  const handleEditar = useCallback(
    (id) => navigate(horarioCapEditarPath(id), { state: horariosNavigationState() }),
    [navigate],
  );

  const handleEliminar = useCallback(
    async (horarioId) => {
      if (!horarioId) return { success: false, error: 'Horario inválido' };
      const result = await eliminarHorario(horarioId);
      return result ?? { success: false, error: 'No se pudo eliminar el horario' };
    },
    [eliminarHorario],
  );

  const tableColumns = useMemo(
    () =>
      createHorariosTableColumns({
        onEditar: (record) => handleEditar(record.id),
        deleteFn: handleEliminar,
        refetch,
      }),
    [handleEditar, handleEliminar, refetch],
  );

  const handleSearchChange = useCallback(
    (event) => setSearchText(event.target.value),
    [setSearchText],
  );

  return {
    horarios,
    loading,
    error,
    searchText,
    tableColumns,
    handleSearchChange,
    tablePagination,
  };
};
