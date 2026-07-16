/**
 * Hook de pantalla: ficha de un curso de capacitación (CAP · DETALLE).
 *
 * Espejo de `usePagosDetailPage`: orquesta la ficha sobre el contexto del
 * provider (breadcrumbs, volver, editar); la página es "dumb".
 */

import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCursoCapacitacionDetailContext } from '@application-capacitacion/cursos/hooks/context/useCursoCapacitacionDetailContext';
import {
  CURSOS_CAP_LIST_PATH,
  CAP_CURSOS_MENU_KEY,
  cursoCapEditarPath,
} from '@application-capacitacion/config/paths';

export const useCursoCapacitacionDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { cursoId, curso, loading, error, refetch } = useCursoCapacitacionDetailContext();

  const returnListPath = location.state?.returnListPath || CURSOS_CAP_LIST_PATH;
  const menuSidebarKey = location.state?.menuSidebarKey ?? CAP_CURSOS_MENU_KEY;

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Capacitación' },
      { title: 'Cursos', href: returnListPath },
      { title: 'Detalle de curso' },
    ],
    [returnListPath],
  );

  const handleVolver = useCallback(() => {
    navigate(returnListPath, { state: { menuSidebarKey } });
  }, [navigate, returnListPath, menuSidebarKey]);

  const handleEditar = useCallback(() => {
    if (!cursoId) return;
    navigate(cursoCapEditarPath(cursoId), {
      state: { returnListPath, menuSidebarKey },
    });
  }, [navigate, cursoId, returnListPath, menuSidebarKey]);

  return {
    cursoId,
    curso,
    loading,
    error,
    refetch,
    breadcrumbItems,
    handleVolver,
    handleEditar,
  };
};
