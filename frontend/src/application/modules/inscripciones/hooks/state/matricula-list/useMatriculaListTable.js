/**
 * Tabla y datos filtrados del listado de matrículas.
 */

import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid } from 'antd';
import { useInscripcionesListContext } from '../../context/useInscripcionesListContext';
import { useInscripcionesContext } from '../../context/useInscripcionesContext';
import { createInscripcionesTableColumns } from '@matricula/config';

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
  } = useInscripcionesListContext();

  let deleteInscripcion = null;
  try {
    const mainContext = useInscripcionesContext();
    deleteInscripcion = mainContext.deleteInscripcion;
  } catch {
    // Contexto principal no disponible
  }

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
  };
};
