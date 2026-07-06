import { useMemo } from 'react';
import { useIdiomasApi } from '../api/useIdiomasApi';
import { useTableData } from '@molecules';

export const useIdiomasList = () => {
  const { idiomas, loading, error, refetch } = useIdiomasApi();

  const getSearchFields = useMemo(
    () => (idioma) => [idioma.nombre, idioma.codigoIso],
    [],
  );

  const { searchText, setSearchText, filteredData } = useTableData(idiomas, getSearchFields);

  return {
    idiomas: filteredData,
    loading,
    error,
    refetch,
    searchText,
    setSearchText,
  };
};
