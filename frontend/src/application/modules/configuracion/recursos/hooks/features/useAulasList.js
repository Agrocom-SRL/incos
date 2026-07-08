import { useMemo } from 'react';
import { useAulasApi } from '../api/useAulasApi';
import { useToggleEstadoCatalogo } from '@application-shared/hooks';
import { useTableData } from '@molecules';

export const useAulasList = () => {
  const { aulas, loading, error, refetch } = useAulasApi();

  const getSearchFields = useMemo(
    () => (aula) => [aula.codigo, aula.nombre, aula.categoria, aula.observaciones],
    [],
  );

  const { searchText, setSearchText, filteredData } = useTableData(aulas, getSearchFields);

  // Toggle rápido activo/inactivo (columna "Estado" del listado)
  const toggleEstado = useToggleEstadoCatalogo({
    useCaseKey: 'cambiarEstadoAula',
    entidad: 'el aula',
    refetch,
  });

  return {
    aulas: filteredData,
    loading,
    error,
    refetch,
    searchText,
    setSearchText,
    toggleEstado,
  };
};
