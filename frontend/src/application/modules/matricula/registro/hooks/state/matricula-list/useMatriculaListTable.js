/**
 * Tabla y datos filtrados del listado de matrículas.
 */

import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid } from 'antd';
import { useInscripcionesListContext } from '../../context/useInscripcionesListContext';
import { createInscripcionesTableColumns } from '@matricula/registro/config';

export const useMatriculaListTable = () => {
  const navigate = useNavigate();
  const screens = Grid.useBreakpoint();
  const isSmall = !screens.lg;

  const {
    inscripciones = [],
    loading = false,
    error = null,
    searchText = '',
    setSearchText,
    refetch,
    listFilters,
    setListFilter,
    clearListFilters,
    hasActiveListFilters,
    listFilterOptions,
    paralelosForCarrera,
    tipoInscripcionOptions,
    historialEstadoOptions,
    totalBeforeFilters = 0,
    tablePagination,
    deleteInscripcion,
  } = useInscripcionesListContext();

  const handleNuevaInscripcion = useCallback(() => {
    navigate('/matricula/nueva');
  }, [navigate]);

  const tableColumns = useMemo(
    () => createInscripcionesTableColumns(navigate, refetch, deleteInscripcion, { isSmall }),
    [navigate, refetch, deleteInscripcion, isSmall],
  );

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Inscripciones' },
    ],
    [],
  );

  return {
    isSmall,
    inscripciones,
    loading,
    error,
    searchText,
    setSearchText,
    handleNuevaInscripcion,
    tableColumns,
    breadcrumbItems,
    listFilters,
    setListFilter,
    clearListFilters,
    hasActiveListFilters,
    listFilterOptions,
    paralelosForCarrera,
    tipoInscripcionOptions,
    historialEstadoOptions,
    totalBeforeFilters,
    tablePagination,
  };
};
