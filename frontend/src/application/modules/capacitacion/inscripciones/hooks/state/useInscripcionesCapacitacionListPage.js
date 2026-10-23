/**
 * Hook de pantalla: listado de inscripciones de capacitación (CAP · LISTAR).
 *
 * Espejo de `usePagosListPage`: columnas (participante + curso + pago +
 * estado), breadcrumb y handlers (inscribir, eliminar). La página es "dumb".
 */

import { useCallback, useMemo, useState } from 'react';
import { App } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { useInscripcionesCapacitacionListContext } from '@application-capacitacion/inscripciones/hooks/context/useInscripcionesCapacitacionListContext';
import { useInscripcionRequisitosRapido } from '@application-capacitacion/inscripciones/hooks/state/useInscripcionRequisitosRapido';
import { createInscripcionesCapTableColumns } from '@capacitacion/inscripciones/config/inscripcionesTableColumns';
import {
  INSCRIPCIONES_CAP_LIST_PATH,
  CAP_INSCRIPCIONES_MENU_KEY,
  inscripcionCapInscribirPath,
} from '@application-capacitacion/config/paths';

export const useInscripcionesCapacitacionListPage = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { message } = App.useApp();

  const {
    inscripciones = [],
    loading = false,
    error = null,
    searchText = '',
    setSearchText,
    refetch,
    tablePagination,
    eliminarInscripcion,
    descargarFormularioPdf,
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

  /** Descarga el formulario PDF de una fila (feedback con message; el permiso lo valida TableActions). */
  const handleDescargarFormulario = useCallback(
    async (inscripcionId) => {
      const hide = message.loading('Generando formulario de inscripción…', 0);
      try {
        const result = await descargarFormularioPdf(inscripcionId);
        if (!result?.success) {
          message.error(result?.error || 'No se pudo descargar el formulario de inscripción');
        }
      } finally {
        hide();
      }
    },
    [descargarFormularioPdf, message],
  );

  // Acceso rápido a requisitos: la fila abre un modal (sin pasar por «Editar inscripción»).
  const [requisitosInscripcionId, setRequisitosInscripcionId] = useState(null);
  const handleCerrarRequisitos = useCallback(() => setRequisitosInscripcionId(null), []);
  const requisitosRapido = useInscripcionRequisitosRapido({
    inscripcionId: requisitosInscripcionId,
    onGuardado: refetch,
    onCerrar: handleCerrarRequisitos,
  });

  const tableColumns = useMemo(
    () =>
      createInscripcionesCapTableColumns({
        navigate,
        listNavState,
        refetch,
        deleteFn: handleEliminar,
        onDescargarFormulario: handleDescargarFormulario,
        onGestionarRequisitos: setRequisitosInscripcionId,
      }),
    [navigate, listNavState, refetch, handleEliminar, handleDescargarFormulario],
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
    requisitosRapido,
    handleCerrarRequisitos,
  };
};
