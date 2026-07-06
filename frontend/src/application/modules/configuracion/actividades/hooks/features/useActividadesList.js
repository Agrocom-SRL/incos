import { useMemo } from 'react';
import { useActividadesApi } from '../api/useActividadesApi';
import { useTableData } from '@molecules';

export const useActividadesList = () => {
  const { actividades, loading, error, refetch } = useActividadesApi();

  const getSearchFields = useMemo(
    () => (actividad) => [actividad.nombre, actividad.descripcion, actividad.icono],
    [],
  );

  const { searchText, setSearchText, filteredData } = useTableData(actividades, getSearchFields);

  return {
    actividades: filteredData,
    loading,
    error,
    refetch,
    searchText,
    setSearchText,
  };
};
