import { useMemo } from 'react';
import { useMateriasApi } from '../api/useMateriasApi';
import { useTableData } from '@molecules';

export const useMateriasList = () => {
  const { materias, loading, error, refetch } = useMateriasApi();

  const getSearchFields = useMemo(
    () => (materia) => [materia.sigla, materia.nombre, materia.clasificacion, materia.tipo],
    [],
  );

  const { searchText, setSearchText, filteredData } = useTableData(materias ?? [], getSearchFields);

  return {
    materias: filteredData,
    materiasTotal: materias?.length ?? 0,
    loading,
    error,
    refetch,
    searchText,
    setSearchText,
  };
};
