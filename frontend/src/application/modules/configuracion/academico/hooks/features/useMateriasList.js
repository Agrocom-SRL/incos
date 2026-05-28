import { useMemo, useState } from 'react';
import { useMateriasApi } from '../api/useMateriasApi';
import { useTableData } from '@molecules';

export const useMateriasList = () => {
  const { materias, loading, error, refetch } = useMateriasApi();
  const [filterTipo, setFilterTipo] = useState(null);
  const [filterClasificacion, setFilterClasificacion] = useState(null);

  const materiasFiltradasCatalogo = useMemo(() => {
    let list = materias ?? [];
    if (filterTipo) {
      list = list.filter((m) => m.tipo === filterTipo);
    }
    if (filterClasificacion) {
      list = list.filter(
        (m) => (m.clasificacion || '').toUpperCase() === filterClasificacion.toUpperCase(),
      );
    }
    return list;
  }, [materias, filterTipo, filterClasificacion]);

  const clasificacionesDisponibles = useMemo(() => {
    const set = new Set();
    for (const m of materias ?? []) {
      if (m.clasificacion) set.add(m.clasificacion);
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [materias]);

  const getSearchFields = useMemo(
    () => (materia) => [materia.sigla, materia.nombre, materia.clasificacion, materia.tipo],
    [],
  );

  const { searchText, setSearchText, filteredData } = useTableData(
    materiasFiltradasCatalogo,
    getSearchFields,
  );

  return {
    materias: filteredData,
    materiasTotal: materias?.length ?? 0,
    loading,
    error,
    refetch,
    searchText,
    setSearchText,
    filterTipo,
    setFilterTipo,
    filterClasificacion,
    setFilterClasificacion,
    clasificacionesDisponibles,
  };
};
