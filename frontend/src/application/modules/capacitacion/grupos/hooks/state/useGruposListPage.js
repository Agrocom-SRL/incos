/**
 * Hook de pantalla: tab «Grupos» (CAP · LISTAR).
 *
 * Columnas, búsqueda y filtros (estado del curso y curso). Acciones de fila: ir a la ficha
 * del curso (permiso `capacitacion.curso DETALLE`) y editar el grupo, que abre el formulario
 * de su curso directo en el paso «Grupos y horarios» (permiso `capacitacion.curso EDITAR`):
 * el grupo es parte del curso y no tiene formulario propio.
 */

import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGruposListContext } from '@application-capacitacion/grupos/hooks/context/useGruposListContext';
import { createGruposTableColumns } from '@capacitacion/grupos/config/gruposTableColumns';
import {
  CAP_GRUPOS_MENU_KEY,
  GRUPOS_TAB_GRUPOS,
  CURSO_FORM_STEP_GRUPOS,
  cursoCapDetallePath,
  cursoCapEditarPath,
  grupoCapTabPath,
} from '@application-capacitacion/config/paths';

export const useGruposListPage = () => {
  const navigate = useNavigate();

  const {
    grupos = [],
    loading = false,
    error = null,
    searchText = '',
    setSearchText,
    tablePagination,
    estado,
    setEstado,
    cursoId,
    setCursoId,
    cursosOptions = [],
    loadingCursos = false,
  } = useGruposListContext();

  const handleVerCurso = useCallback(
    (record) =>
      navigate(cursoCapDetallePath(record.cursoId), {
        state: { returnListPath: grupoCapTabPath(GRUPOS_TAB_GRUPOS), menuSidebarKey: CAP_GRUPOS_MENU_KEY },
      }),
    [navigate],
  );

  /** Editar un grupo = abrir el formulario de su curso directo en «Grupos y horarios» (paso 2). */
  const handleEditarGrupo = useCallback(
    (record) =>
      navigate(cursoCapEditarPath(record.cursoId), {
        state: {
          returnListPath: grupoCapTabPath(GRUPOS_TAB_GRUPOS),
          menuSidebarKey: CAP_GRUPOS_MENU_KEY,
          initialStep: CURSO_FORM_STEP_GRUPOS,
        },
      }),
    [navigate],
  );

  const tableColumns = useMemo(
    () => createGruposTableColumns({ onVerCurso: handleVerCurso, onEditarGrupo: handleEditarGrupo }),
    [handleVerCurso, handleEditarGrupo],
  );

  const handleSearchChange = useCallback(
    (event) => setSearchText(event.target.value),
    [setSearchText],
  );

  return {
    grupos,
    loading,
    error,
    searchText,
    tableColumns,
    handleSearchChange,
    tablePagination,
    estado,
    setEstado,
    cursoId,
    setCursoId,
    cursosOptions,
    loadingCursos,
  };
};
