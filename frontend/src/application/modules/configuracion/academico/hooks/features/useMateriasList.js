import { useMemo } from 'react';
import { useMateriasApi } from '../api/useMateriasApi';
import { useTableData } from '@molecules';

export const useMateriasList = () => {
  const { materias, loading, error, refetch } = useMateriasApi();

  const getSearchFields = useMemo(
    () => (materia) => [materia.nombre, materia.codigo, materia.nombreCorto, materia.tipo],
    [],
  );

  const { searchText, setSearchText, filteredData } = useTableData(materias, getSearchFields);

  return {
    materias: filteredData,
    loading,
    error,
    refetch,
    searchText,
    setSearchText,
  };
};
