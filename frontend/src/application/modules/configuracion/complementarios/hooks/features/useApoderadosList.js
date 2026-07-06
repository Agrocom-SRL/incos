import { useMemo } from 'react';
import { useApoderadosApi } from '../api/useApoderadosApi';
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

  return {
    apoderados: filteredData,
    loading,
    error,
    refetch,
    searchText,
    setSearchText,
  };
};
