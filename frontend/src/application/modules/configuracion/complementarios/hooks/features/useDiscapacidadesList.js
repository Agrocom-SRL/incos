import { useMemo } from 'react';
import { useDiscapacidadesApi } from '../api/useDiscapacidadesApi';
import { useTableData } from '@molecules';

export const useDiscapacidadesList = () => {
  const { discapacidades, loading, error, refetch } = useDiscapacidadesApi();

  const getSearchFields = useMemo(
    () => (discapacidad) => [discapacidad.nombre, discapacidad.descripcion],
    [],
  );

  const { searchText, setSearchText, filteredData } = useTableData(discapacidades, getSearchFields);

  return {
    discapacidades: filteredData,
    loading,
    error,
    refetch,
    searchText,
    setSearchText,
  };
};
