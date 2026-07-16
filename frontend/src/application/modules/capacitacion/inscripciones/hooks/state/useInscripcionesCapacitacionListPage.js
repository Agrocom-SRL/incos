/**
 * Hook de pantalla: listado de inscripciones de capacitación (CAP · LISTAR).
 *
 * Espejo de `usePagosListPage`: columnas (participante + curso + estado de
 * pago), breadcrumb y handlers (inscribir, eliminar). La página es "dumb".
 */

import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useInscripcionesCapacitacionListContext } from '@application-capacitacion/inscripciones/hooks/context/useInscripcionesCapacitacionListContext';
import { createInscripcionesCapTableColumns } from '@capacitacion/inscripciones/config/inscripcionesTableColumns';
import {
  INSCRIPCIONES_CAP_LIST_PATH,
  CAP_INSCRIPCIONES_MENU_KEY,
  inscripcionCapInscribirPath,
} from '@application-capacitacion/config/paths';

export const useInscripcionesCapacitacionListPage = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const {
    inscripciones = [],
    loading = false,
    error = null,
    searchText = '',
    setSearchText,
    refetch,
    tablePagination,
    eliminarInscripcion,
  } = useInscripcionesCapacitacionListContext();

  const listNavState = useMemo(
    () => ({
      menuSidebarKey: CAP_INSCRIPCIONES_MENU_KEY,
      returnListPath: pathname || INSCRIPCIONES_CAP_LIST_PATH,
    }),
    [pathname],
  );

  /** deleteFn de TableActions (confirmación/feedback/refetch los pone TableActions). */
  const handleEliminar = useCallback(
    async (inscripcionId) => {
      if (!inscripcionId) return { success: false, error: 'Inscripción inválida' };
      const result = await eliminarInscripcion(inscripcionId);
      return result ?? { success: false, error: 'No se pudo eliminar la inscripción' };
    },
    [eliminarInscripcion],
  );

  const tableColumns = useMemo(
    () =>
      createInscripcionesCapTableColumns({
        navigate,
        listNavState,
        refetch,
        deleteFn: handleEliminar,
      }),
    [navigate, listNavState, refetch, handleEliminar],
  );

  const breadcrumbItems = useMemo(
    () => [{ title: 'Inicio', href: '/' }, { title: 'Capacitación' }, { title: 'Inscripciones' }],
    [],
  );

  const handleInscribir = useCallback(() => {
    navigate(inscripcionCapInscribirPath, { state: listNavState });
  }, [navigate, listNavState]);

  const handleSearchChange = useCallback(
    (event) => {
      setSearchText(event.target.value);
    },
    [setSearchText],
  );

  return {
    inscripciones,
    loading,
    error,
    searchText,
    tableColumns,
    breadcrumbItems,
    handleInscribir,
    handleSearchChange,
    tablePagination,
  };
};
