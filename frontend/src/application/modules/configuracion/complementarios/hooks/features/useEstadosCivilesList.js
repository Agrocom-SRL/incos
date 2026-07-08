import { useMemo } from 'react';
import { useEstadosCivilesApi } from '../api/useEstadosCivilesApi';
import { useToggleEstadoCatalogo } from './useToggleEstadoCatalogo';
import { useTableData } from '@molecules';

export const useEstadosCivilesList = () => {
  const { estadosCiviles, loading, error, refetch } = useEstadosCivilesApi();

  const getSearchFields = useMemo(
    () => (estadoCivil) => [estadoCivil.nombre, estadoCivil.abreviatura],
    [],
  );

  const { searchText, setSearchText, filteredData } = useTableData(estadosCiviles, getSearchFields);

  // Toggle rápido activo/inactivo (columna "Estado" del listado)
  const toggleEstado = useToggleEstadoCatalogo({
    useCaseKey: 'cambiarEstadoEstadoCivil',
    entidad: 'el estado civil',
    refetch,
  });

  return {
    estadosCiviles: filteredData,
    loading,
    error,
    refetch,
    searchText,
    setSearchText,
    toggleEstado,
  };
};
