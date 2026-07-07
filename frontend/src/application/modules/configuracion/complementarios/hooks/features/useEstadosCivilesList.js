import { useMemo } from 'react';
import { useEstadosCivilesApi } from '../api/useEstadosCivilesApi';
import { useTableData } from '@molecules';

export const useEstadosCivilesList = () => {
  const { estadosCiviles, loading, error, refetch } = useEstadosCivilesApi();

  const getSearchFields = useMemo(
    () => (estadoCivil) => [estadoCivil.nombre, estadoCivil.abreviatura],
    [],
  );

  const { searchText, setSearchText, filteredData } = useTableData(estadosCiviles, getSearchFields);

  return {
    estadosCiviles: filteredData,
    loading,
    error,
    refetch,
    searchText,
    setSearchText,
  };
};
