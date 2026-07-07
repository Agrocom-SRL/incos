import { useCallback, useMemo } from 'react';
import { useParalelosCfgApi } from '../api/useParalelosCfgApi';
import { useCarrerasApi } from '@application-configuracion/academico/hooks/api/useCarrerasApi';
import { useTableData } from '@molecules';

export const useParalelosList = () => {
  const { paralelos: rawParalelos = [], loading, error, refetch } = useParalelosCfgApi();
  const { carreras = [] } = useCarrerasApi();

  const carreraMap = useMemo(() => {
    const map = new Map();
    carreras.forEach((c) => map.set(c.id, c));
    return map;
  }, [carreras]);

  const paralelosEnriquecidos = useMemo(
    () =>
      rawParalelos.map((p) => {
        const carrera = carreraMap.get(p.carreraId);
        return {
          ...p,
          carreraNombre: carrera?.nombre ?? p.carreraNombre,
          carreraCodigo: carrera?.codigo ?? p.carreraCodigo,
          carreraColorHex: carrera?.colorHex ?? carrera?.color_hex ?? null,
        };
      }),
    [rawParalelos, carreraMap],
  );

  const getSearchFields = useCallback(
    (p) => [
      p.nombre,
      p.descripcion,
      p.turno,
      p.carreraNombre,
      p.carreraCodigo,
      p.periodoNombre,
      p.periodoNumero != null ? String(p.periodoNumero) : null,
    ],
    [],
  );

  const { searchText, setSearchText, filteredData } = useTableData(paralelosEnriquecidos, getSearchFields);

  return {
    paralelos: filteredData,
    carreras,
    loading,
    error,
    refetch,
    searchText,
    setSearchText,
  };
};
