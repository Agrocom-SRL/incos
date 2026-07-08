import { useMemo } from 'react';
import { useDiscapacidadesApi } from '../api/useDiscapacidadesApi';
import { useToggleEstadoCatalogo } from '@application-shared/hooks';
import { useTableData } from '@molecules';

export const useDiscapacidadesList = () => {
  const { discapacidades, loading, error, refetch } = useDiscapacidadesApi();

  const getSearchFields = useMemo(
    () => (discapacidad) => [discapacidad.nombre, discapacidad.descripcion],
    [],
  );

  const { searchText, setSearchText, filteredData } = useTableData(discapacidades, getSearchFields);

  // Toggle rápido activo/inactivo (columna "Estado" del listado)
  const toggleEstado = useToggleEstadoCatalogo({
    useCaseKey: 'cambiarEstadoDiscapacidad',
    entidad: 'el tipo de discapacidad',
    refetch,
  });

  return {
    discapacidades: filteredData,
    loading,
    error,
    refetch,
    searchText,
    setSearchText,
    toggleEstado,
  };
};
