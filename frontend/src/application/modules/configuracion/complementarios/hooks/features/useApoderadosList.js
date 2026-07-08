import { useMemo } from 'react';
import { useApoderadosApi } from '../api/useApoderadosApi';
import { useToggleEstadoCatalogo } from '@application-shared/hooks';
import { useTableData } from '@molecules';

export const useApoderadosList = () => {
  const { tiposParentesco, loading, error, refetch } = useApoderadosApi();

  const getSearchFields = useMemo(
    () => (apoderado) => [apoderado.nombre, apoderado.descripcion],
    [],
  );

  const { searchText, setSearchText, filteredData } = useTableData(
    tiposParentesco,
    getSearchFields,
  );

  // Toggle rápido activo/inactivo (columna "Estado" del listado)
  const toggleEstado = useToggleEstadoCatalogo({
    useCaseKey: 'cambiarEstadoTipoParentesco',
    entidad: 'el tipo de parentesco',
    refetch,
  });

  return {
    apoderados: filteredData,
    loading,
    error,
    refetch,
    searchText,
    setSearchText,
    toggleEstado,
  };
};
