/**
 * Hook de pantalla: listado de participantes (CAP · LISTAR).
 *
 * Espejo de `usePagosListPage`: columnas, breadcrumb y búsqueda. Alta, ficha y
 * edición navegan a páginas completas (`/participantes/nuevo`, `/participantes/:id`,
 * `/participantes/:id/editar`), sin modal. Eliminar (soft delete) lo confirma `TableActions`.
 */

import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useParticipantesListContext } from '@application-capacitacion/participantes/hooks/context/useParticipantesListContext';
import { useParticipanteMutations } from '@application-capacitacion/participantes/hooks/api/useParticipanteMutations';
import { createParticipantesTableColumns } from '@capacitacion/participantes/config/participantesTableColumns';
import {
  participanteCapRegistrarPath,
  participanteCapEditarPath,
  participanteCapDetallePath,
  CAP_PARTICIPANTES_MENU_KEY,
} from '@application-capacitacion/config/paths';

export const useParticipantesListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    participantes = [],
    loading = false,
    error = null,
    searchText = '',
    setSearchText,
    tablePagination,
    refetch,
  } = useParticipantesListContext();
  const { eliminarParticipante } = useParticipanteMutations();

  const navigationState = useMemo(
    () => ({ returnListPath: location.pathname, menuSidebarKey: CAP_PARTICIPANTES_MENU_KEY }),
    [location.pathname],
  );

  const handleNuevo = useCallback(() => {
    navigate(participanteCapRegistrarPath, { state: navigationState });
  }, [navigate, navigationState]);

  const handleEditar = useCallback(
    (id) => {
      navigate(participanteCapEditarPath(id), { state: navigationState });
    },
    [navigate, navigationState],
  );

  const handleVer = useCallback(
    (id) => {
      navigate(participanteCapDetallePath(id), { state: navigationState });
    },
    [navigate, navigationState],
  );

  /** deleteFn de TableActions (la confirmación/feedback los pone TableActions). */
  const handleEliminar = useCallback(
    async (participanteId) => {
      if (!participanteId) return { success: false, error: 'Participante inválido' };
      const result = await eliminarParticipante(participanteId);
      return result ?? { success: false, error: 'No se pudo eliminar el participante' };
    },
    [eliminarParticipante],
  );

  const tableColumns = useMemo(
    () =>
      createParticipantesTableColumns({
        onVer: (record) => handleVer(record.id),
        onEditar: (record) => handleEditar(record.id),
        deleteFn: handleEliminar,
        refetch,
      }),
    [handleVer, handleEditar, handleEliminar, refetch],
  );

  const breadcrumbItems = useMemo(
    () => [{ title: 'Inicio', href: '/' }, { title: 'Capacitación' }, { title: 'Participantes' }],
    [],
  );

  const handleSearchChange = useCallback(
    (event) => {
      setSearchText(event.target.value);
    },
    [setSearchText],
  );

  return {
    participantes,
    loading,
    error,
    searchText,
    tableColumns,
    breadcrumbItems,
    handleSearchChange,
    tablePagination,
    handleNuevo,
  };
};
