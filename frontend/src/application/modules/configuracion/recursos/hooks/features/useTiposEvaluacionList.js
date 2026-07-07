import { useMemo } from 'react';
import { useTiposEvaluacionAdminApi } from '../api/useTiposEvaluacionAdminApi';
import { useTableData } from '@molecules';

export const useTiposEvaluacionList = () => {
  const { tiposEvaluacion, loading, error, refetch } = useTiposEvaluacionAdminApi();

  const getSearchFields = useMemo(
    () => (tipo) => [tipo.codigo, tipo.nombre, tipo.descripcion],
    [],
  );

  const { searchText, setSearchText, filteredData } = useTableData(tiposEvaluacion, getSearchFields);

  return {
    tiposEvaluacion: filteredData,
    loading,
    error,
    refetch,
    searchText,
    setSearchText,
  };
};
