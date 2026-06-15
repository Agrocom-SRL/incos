/**
 * Hook: useInscripcionNuevaMateriasByPeriods
 *
 * Single Responsibility: Cargar materias por periodo (y opcionalmente carrera) para el wizard de inscripción.
 *
 * - Acepta selectedPeriodIds (array) y opcionalmente carreraId.
 * - Para cada periodo llama al use case materias con periodo_id (y carrera_id si el backend lo soporta).
 * - Retorna materiasByPeriod: { [periodId]: materias[] }, loading, error.
 * - Usado en Step 2 (Periodo y materias): NUEVO = primer año todas; ANTIGUO = materias por periodo con checkboxes.
 */

import { useState, useEffect, useMemo } from 'react';
import { useCasesFactory } from '@container';
import { normalizeFieldToArray } from '@application/utils';
import { mapMateriasList } from '@application-configuracion/academico/mappers';

export const useInscripcionNuevaMateriasByPeriods = (selectedPeriodIds = [], carreraId = null) => {
  const [materiasByPeriod, setMateriasByPeriod] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ids = Array.isArray(selectedPeriodIds) ? selectedPeriodIds : [];
    if (ids.length === 0) {
      setMateriasByPeriod({});
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const useCaseInstance = useCasesFactory.obtenerTodasMaterias?.();
    if (!useCaseInstance) {
      setError('No disponible');
      setLoading(false);
      return;
    }

    const paramsForPeriod = (periodId) => {
      const params = { periodo_id: periodId };
      if (carreraId != null) params.carrera_id = carreraId;
      return params;
    };

    Promise.all(
      ids.map((periodId) =>
        useCaseInstance.ejecutar({ params: paramsForPeriod(periodId) }).then((result) => ({
          periodId,
          success: result?.success,
          data: result?.data,
        }))
      )
    )
      .then((results) => {
        if (cancelled) return;
        const byPeriod = {};
        results.forEach(({ periodId, success, data }) => {
          const raw = success && data ? normalizeFieldToArray(data, 'materias') : [];
          byPeriod[periodId] = mapMateriasList(raw);
        });
        setMateriasByPeriod(byPeriod);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message || 'Error al cargar materias por periodo');
          setMateriasByPeriod({});
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedPeriodIds?.join(','), carreraId]);

  return useMemo(
    () => ({
      materiasByPeriod,
      loading,
      error,
    }),
    [materiasByPeriod, loading, error]
  );
};
