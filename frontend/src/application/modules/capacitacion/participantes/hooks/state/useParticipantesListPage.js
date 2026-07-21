/**
 * Hook de pantalla: listado de participantes (CAP · LISTAR).
 *
 * Espejo de `usePagosListPage`: columnas, breadcrumb y búsqueda. Alta y
 * edición navegan a páginas completas (`/participantes/nuevo`,
 * `/participantes/:id/editar`), sin modal.
 */

import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useParticipantesListContext } from '@application-capacitacion/participantes/hooks/context/useParticipantesListContext';
import { createParticipantesTableColumns } from '@capacitacion/participantes/config/participantesTableColumns';
import {
  participanteCapRegistrarPath,
  participanteCapEditarPath,
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
  } = useParticipantesListContext();

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

  const tableColumns = useMemo(
    () => createParticipantesTableColumns({ onEditar: (record) => handleEditar(record.id) }),
    [handleEditar],
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
