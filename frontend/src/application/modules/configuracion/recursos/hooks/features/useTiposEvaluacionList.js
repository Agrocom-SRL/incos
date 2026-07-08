import { useMemo } from 'react';
import { useTiposEvaluacionAdminApi } from '../api/useTiposEvaluacionAdminApi';
import { useToggleEstadoCatalogo } from '@application-shared/hooks';
import { useTableData } from '@molecules';

export const useTiposEvaluacionList = () => {
  const { tiposEvaluacion, loading, error, refetch } = useTiposEvaluacionAdminApi();

  const getSearchFields = useMemo(
    () => (tipo) => [tipo.codigo, tipo.nombre, tipo.descripcion],
    [],
  );

  const { searchText, setSearchText, filteredData } = useTableData(tiposEvaluacion, getSearchFields);

  // Toggle rápido activo/inactivo (columna "Estado" del listado)
  const toggleEstado = useToggleEstadoCatalogo({
    useCaseKey: 'cambiarEstadoTipoEvaluacion',
    entidad: 'el tipo de evaluación',
    refetch,
  });

  return {
    tiposEvaluacion: filteredData,
    loading,
    error,
    refetch,
    searchText,
    setSearchText,
    toggleEstado,
  };
};
