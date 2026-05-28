/**
 * Tab Planes — sidebar carreras + lista de planes filtrada (SPRINT_1 §6.5).
 */

import { useEffect, useMemo, useState } from 'react';
import { useCarrerasApi } from '../api/useCarrerasApi';
import { usePlanesEstudiosApi } from '../api/usePlanesEstudiosApi';
import { useTableData } from '@molecules';

export const usePlanesTabPanel = () => {
  const { carreras = [], loading: loadingCarreras } = useCarrerasApi();
  const { planes = [], loading: loadingPlanes, error, refetch } = usePlanesEstudiosApi();

  const [selectedCarreraId, setSelectedCarreraId] = useState(null);

  useEffect(() => {
    if (!carreras.length) return;
    if (selectedCarreraId == null || !carreras.some((c) => c.id === selectedCarreraId)) {
      setSelectedCarreraId(carreras[0].id);
    }
  }, [carreras, selectedCarreraId]);

  const planCarreraId = (p) => p.carrera_id ?? p.carreraId;

  const vigentePlanPorCarrera = useMemo(() => {
    const map = new Map();
    for (const p of planes) {
      if (p.vigente) {
        map.set(planCarreraId(p), p);
      }
    }
    return map;
  }, [planes]);

  const planesDeCarrera = useMemo(() => {
    if (!selectedCarreraId) return [];
    return planes
      .filter((p) => planCarreraId(p) === selectedCarreraId)
      .sort((a, b) => {
        const va = a.vigente ? 1 : 0;
        const vb = b.vigente ? 1 : 0;
        if (va !== vb) return vb - va;
        return (a.nombre_plan || '').localeCompare(b.nombre_plan || '');
      });
  }, [planes, selectedCarreraId]);

  const getSearchFields = useMemo(
    () => (plan) => [plan.nombre_plan, plan.resolucion_ministerial].filter(Boolean),
    [],
  );

  const { searchText, setSearchText, filteredData } = useTableData(planesDeCarrera, getSearchFields);

  const carreraSeleccionada = useMemo(
    () => carreras.find((c) => c.id === selectedCarreraId) ?? null,
    [carreras, selectedCarreraId],
  );

  return {
    carreras,
    loadingCarreras,
    selectedCarreraId,
    setSelectedCarreraId,
    vigentePlanPorCarrera,
    planesDeCarrera: filteredData,
    carreraSeleccionada,
    loading: loadingCarreras || loadingPlanes,
    error,
    refetch,
    searchText,
    setSearchText,
  };
};
