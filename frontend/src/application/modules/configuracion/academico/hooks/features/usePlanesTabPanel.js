/**
 * Tab Planes — sidebar carreras + plan vigente por carrera (SPRINT_1 §6.5).
 */

import { useEffect, useMemo, useState } from 'react';
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

  const [selectedCarreraId, setSelectedCarreraId] = useState(null);

  useEffect(() => {
    if (!carreras.length) return;
    if (selectedCarreraId == null || !carreras.some((c) => c.id === selectedCarreraId)) {
      setSelectedCarreraId(carreras[0].id);
    }
  }, [carreras, selectedCarreraId]);

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

  const carreraSeleccionada = useMemo(
    () => carreras.find((c) => c.id === selectedCarreraId) ?? null,
    [carreras, selectedCarreraId],
  );

  const planVigente = useMemo(() => {
    if (!selectedCarreraId) return null;
    return vigentePlanPorCarrera.get(selectedCarreraId) ?? null;
  }, [selectedCarreraId, vigentePlanPorCarrera]);

  const carrerasConPlan = useMemo(
    () =>
      carreras.map((c) => ({
        ...c,
        planVigente: vigentePlanPorCarrera.get(c.id) ?? null,
      })),
    [carreras, vigentePlanPorCarrera],
  );

  return {
    carreras: carrerasConPlan,
    loadingCarreras,
    selectedCarreraId,
    setSelectedCarreraId,
    vigentePlanPorCarrera,
    planVigente,
    carreraSeleccionada,
    loading: loadingCarreras || loadingPlanes,
    error,
    refetch,
  };
};
