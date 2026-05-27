import { useMemo } from 'react';
import { useCarrerasApi } from '../api/useCarrerasApi';
import { useTableData } from '@molecules';

export const useCarrerasList = () => {
  const { carreras, loading, error, refetch } = useCarrerasApi();

  const getSearchFields = useMemo(
    () => (carrera) => [carrera.nombre, carrera.codigo, carrera.tituloOtorgado],
    [],
  );

  const { searchText, setSearchText, filteredData } = useTableData(carreras, getSearchFields);

  return {
    carreras: filteredData,
    loading,
    error,
    refetch,
    searchText,
    setSearchText,
  };
};
