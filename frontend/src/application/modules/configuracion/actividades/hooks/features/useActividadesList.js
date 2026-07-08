import { useMemo } from 'react';
import { useActividadesApi } from '../api/useActividadesApi';
import { useToggleEstadoCatalogo } from '@application-shared/hooks';
import { useTableData } from '@molecules';

export const useActividadesList = () => {
  const { actividades, loading, error, refetch } = useActividadesApi();

  const getSearchFields = useMemo(
    () => (actividad) => [actividad.nombre, actividad.descripcion, actividad.icono],
    [],
  );

  const { searchText, setSearchText, filteredData } = useTableData(actividades, getSearchFields);

  // Toggle rápido activo/inactivo (columna "Estado" del listado)
  const toggleEstado = useToggleEstadoCatalogo({
    useCaseKey: 'cambiarEstadoActividad',
    entidad: 'la actividad',
    refetch,
  });

  return {
    actividades: filteredData,
    loading,
    error,
    refetch,
    searchText,
    setSearchText,
    toggleEstado,
  };
};
