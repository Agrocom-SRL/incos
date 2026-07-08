import { useMemo } from 'react';
import { useIdiomasApi } from '../api/useIdiomasApi';
import { useToggleEstadoCatalogo } from '@application-shared/hooks';
import { useTableData } from '@molecules';

export const useIdiomasList = () => {
  const { idiomas, loading, error, refetch } = useIdiomasApi();

  const getSearchFields = useMemo(
    () => (idioma) => [idioma.nombre, idioma.codigoIso],
    [],
  );

  const { searchText, setSearchText, filteredData } = useTableData(idiomas, getSearchFields);

  // Toggle rápido activo/inactivo (columna "Estado" del listado)
  const toggleEstado = useToggleEstadoCatalogo({
    useCaseKey: 'cambiarEstadoIdioma',
    entidad: 'el idioma',
    refetch,
  });

  return {
    idiomas: filteredData,
    loading,
    error,
    refetch,
    searchText,
    setSearchText,
    toggleEstado,
  };
};
