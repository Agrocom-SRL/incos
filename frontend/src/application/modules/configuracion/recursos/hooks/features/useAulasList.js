import { useMemo } from 'react';
import { useAulasApi } from '../api/useAulasApi';
import { useTableData } from '@molecules';

export const useAulasList = () => {
  const { aulas, loading, error, refetch } = useAulasApi();

  const getSearchFields = useMemo(
    () => (aula) => [aula.codigo, aula.nombre, aula.categoria, aula.observaciones],
    [],
  );

  const { searchText, setSearchText, filteredData } = useTableData(aulas, getSearchFields);

  return {
    aulas: filteredData,
    loading,
    error,
    refetch,
    searchText,
    setSearchText,
  };
};
