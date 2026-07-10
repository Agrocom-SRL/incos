/**
 * Tab Planes — listado tipo tabla: una fila por carrera con su plan vigente
 * embebido (`record.planVigente`). Mismo patrón de búsqueda cliente que
 * `useCarrerasList`/`useMateriasList` (`useTableData`).
 */

import { useMemo } from 'react';
import { useTableData } from '@molecules';
import { useCarrerasApi } from '../api/useCarrerasApi';
import { usePlanesEstudiosApi } from '../api/usePlanesEstudiosApi';

/**
 * @param {Object} [options]
 * @param {boolean} [options.enabled=true] - Si `false`, no dispara el fetch de
 *   carreras/planes (ej. el tab de Planes no se renderiza por falta de permiso).
 */
export const usePlanesTabPanel = ({ enabled = true } = {}) => {
  const { carreras = [], loading: loadingCarreras } = useCarrerasApi({ autoFetch: enabled });
  const {
    planes = [],
    loading: loadingPlanes,
    error,
    refetch,
  } = usePlanesEstudiosApi({ autoFetch: enabled });

  const planCarreraId = (p) => p.carrera_id ?? p.carreraId;

  /** Solo planes vigentes por carrera (una entrada por carrera en el catálogo). */
  const vigentePlanPorCarrera = useMemo(() => {
    const map = new Map();
    for (const p of planes) {
      const vigente = p.vigente === true || p.vigente === 1;
      if (!vigente) continue;
      map.set(planCarreraId(p), p);
    }
    return map;
  }, [planes]);

  const carrerasConPlan = useMemo(
    () =>
      carreras.map((c) => ({
        ...c,
        planVigente: vigentePlanPorCarrera.get(c.id) ?? null,
      })),
    [carreras, vigentePlanPorCarrera],
  );

  const getSearchFields = useMemo(
    () => (carrera) => [
      carrera.nombre,
      carrera.codigo,
      carrera.planVigente?.nombre_plan,
      carrera.planVigente?.resolucion_ministerial,
    ],
    [],
  );

  const { searchText, setSearchText, filteredData } = useTableData(carrerasConPlan, getSearchFields);

  return {
    carreras: filteredData,
    loading: loadingCarreras || loadingPlanes,
    error,
    refetch,
    searchText,
    setSearchText,
  };
};
