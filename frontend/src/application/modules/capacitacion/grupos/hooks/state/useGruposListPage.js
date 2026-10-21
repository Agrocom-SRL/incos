/**
 * Hook de pantalla: tab «Grupos» (solo lectura, CAP · LISTAR).
 *
 * Columnas, búsqueda y filtros (estado del curso y curso). La única acción de
 * fila es ir a la ficha del curso (permiso `capacitacion.curso DETALLE`).
 */

import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGruposListContext } from '@application-capacitacion/grupos/hooks/context/useGruposListContext';
import { createGruposTableColumns } from '@capacitacion/grupos/config/gruposTableColumns';
import {
  CAP_GRUPOS_MENU_KEY,
  GRUPOS_TAB_GRUPOS,
  cursoCapDetallePath,
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

  const tableColumns = useMemo(
    () => createGruposTableColumns({ onVerCurso: handleVerCurso }),
    [handleVerCurso],
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
