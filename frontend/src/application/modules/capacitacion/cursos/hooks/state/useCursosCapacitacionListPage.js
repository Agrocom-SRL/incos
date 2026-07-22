/**
 * Hook de pantalla: listado de cursos de capacitación (CAP · LISTAR).
 *
 * Espejo de `usePagosListPage` (Finanzas): consume el contexto del provider,
 * genera columnas, breadcrumb y handlers (crear, toggle activo con feedback,
 * eliminar) y devuelve props listas para la página "dumb".
 */

import { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App } from 'antd';
import { useCursosCapacitacionListContext } from '@application-capacitacion/cursos/hooks/context/useCursosCapacitacionListContext';
import { useExportarInscritosCapacitacionExcel } from '@application-capacitacion/cursos/hooks/api/useExportarInscritosCapacitacionExcel';
import { createCursosCapacitacionTableColumns } from '@capacitacion/cursos/config/cursosTableColumns';
import {
  CURSOS_CAP_LIST_PATH,
  CAP_CURSOS_MENU_KEY,
  cursoCapRegistrarPath,
} from '@application-capacitacion/config/paths';

export const useCursosCapacitacionListPage = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { message } = App.useApp();
  const [exportandoInscritosId, setExportandoInscritosId] = useState(null);
  const { exportar: exportarInscritos } = useExportarInscritosCapacitacionExcel();

  const {
    cursos = [],
    loading = false,
    error = null,
    searchText = '',
    setSearchText,
    refetch,
    tablePagination,
    cambiarEstadoCurso,
    eliminarCurso,
  } = useCursosCapacitacionListContext();

  const listNavState = useMemo(
    () => ({
      menuSidebarKey: CAP_CURSOS_MENU_KEY,
      returnListPath: pathname || CURSOS_CAP_LIST_PATH,
    }),
    [pathname],
  );

  /** Toggle activo/inactivo (EstadoTogglePill): persiste, da feedback y recarga. */
  const handleToggleEstado = useCallback(
    async (record, nuevoActivo) => {
      const result = await cambiarEstadoCurso(record.id, nuevoActivo);
      if (!result?.success) {
        message.error(result?.error || 'No se pudo cambiar el estado del curso');
        return;
      }
      message.success(
        `Se ${nuevoActivo ? 'activó' : 'desactivó'} el curso «${record.titulo}»`,
      );
      await refetch();
    },
    [cambiarEstadoCurso, refetch, message],
  );

  /** deleteFn de TableActions (la confirmación/feedback los pone TableActions). */
  const handleEliminar = useCallback(
    async (cursoId) => {
      if (!cursoId) return { success: false, error: 'Curso inválido' };
      const result = await eliminarCurso(cursoId);
      return result ?? { success: false, error: 'No se pudo eliminar el curso' };
    },
    [eliminarCurso],
  );

  /** Exporta el listado de inscritos vigentes del curso a Excel. */
  const handleExportarInscritos = useCallback(
    async (record) => {
      setExportandoInscritosId(record.id);
      const result = await exportarInscritos(record.id);
      setExportandoInscritosId(null);
      if (!result?.success) {
        message.error(result?.error || 'No se pudo exportar el listado de inscritos');
      }
    },
    [exportarInscritos, message],
  );

  const tableColumns = useMemo(
    () =>
      createCursosCapacitacionTableColumns({
        navigate,
        listNavState,
        refetch,
        onToggleEstado: handleToggleEstado,
        onExportarInscritos: handleExportarInscritos,
        exportandoInscritosId,
        deleteFn: handleEliminar,
      }),
    [
      navigate,
      listNavState,
      refetch,
      handleToggleEstado,
      handleExportarInscritos,
      exportandoInscritosId,
      handleEliminar,
    ],
  );

  const breadcrumbItems = useMemo(
    () => [{ title: 'Inicio', href: '/' }, { title: 'Capacitación' }, { title: 'Cursos' }],
    [],
  );

  const handleRegistrar = useCallback(() => {
    navigate(cursoCapRegistrarPath, { state: listNavState });
  }, [navigate, listNavState]);

  const handleSearchChange = useCallback(
    (event) => {
      setSearchText(event.target.value);
    },
    [setSearchText],
  );

  return {
    cursos,
    loading,
    error,
    searchText,
    tableColumns,
    breadcrumbItems,
    handleRegistrar,
    handleSearchChange,
    tablePagination,
  };
};
